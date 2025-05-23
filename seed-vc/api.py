import logging
import os
import uuid
import shutil
from contextlib import asynccontextmanager
from pathlib import Path
import soundfile as sf

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException, UploadFile, File
from fastapi.security import APIKeyHeader
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from inference import load_models, process_voice_conversion

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
models = None
API_KEY = os.getenv("API_KEY")

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

# Local storage paths
UPLOAD_DIR = Path("./uploads")
OUTPUT_DIR = Path("./outputs")
UPLOADS_PREFIX = "seed-vc-audio-uploads"
OUTPUTS_PREFIX = "seedvc-outputs"

# Create directories if they don't exist
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Base URL for accessing files
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


async def verify_api_key(authorization: str = Header(None)):
    if not authorization:
        logger.warning("No API key provided")
        raise HTTPException(status_code=401, detail="API key is missing")

    if authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    else:
        token = authorization

    if token != API_KEY:
        logger.warning("Invalid API key provided")
        raise HTTPException(status_code=401, detail="Invalid API key")

    return token


@asynccontextmanager
async def lifespan(app: FastAPI):
    global models
    logger.info("Loading Seed-VC model...")
    try:
        models = load_models()

        logger.info("Seed-VC model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

    yield

    logger.info("Shutting down Seed-VC API")

app = FastAPI(title="Seed-VC API",
              lifespan=lifespan)

TARGET_VOICES = {
    "andreas": "examples/reference/andreas1.wav",
    "woman": "examples/reference/s1p1.wav",
    "trump": "examples/reference/trump_0.wav",
}


class VoiceConversionRequest(BaseModel):
    source_audio_key: str
    target_voice: str


@app.post("/convert", dependencies=[Depends(verify_api_key)])
async def generate_speech(request: VoiceConversionRequest, background_tasks: BackgroundTasks):
    if not models:
        raise HTTPException(status_code=500, detail="Model not loaded")

    if request.target_voice not in TARGET_VOICES:
        raise HTTPException(
            status_code=400, detail=f"Target voice not supported. Choose from: {', '.join(TARGET_VOICES.keys())}")

    try:
        target_audio_path = TARGET_VOICES[request.target_voice]
        logger.info(
            f"Converting voice: {request.source_audio_key} to {request.target_voice}")

        # Generate a unique filename
        audio_id = str(uuid.uuid4())
        output_filename = f"{audio_id}.wav"
        local_path = f"/tmp/{output_filename}"

        logger.info("Downloading source audio")
        source_temp = NamedTemporaryFile(delete=False, suffix=".wav")
        try:
            s3_client.download_fileobj(
                S3_BUCKET, Key=request.source_audio_key, Fileobj=source_temp)
            source_temp.close()
        except Exception as e:
            os.unlink(source_temp.name)
            raise HTTPException(
                status_code=404, detail="Source audio not found")

        vc_wave, sr = process_voice_conversion(
            models=models, source=source_temp.name, target_name=target_audio_path, output=None)

        os.unlink(source_temp.name)

        torchaudio.save(local_path, vc_wave, sr)

        # Upload to S3
        s3_key = f"{S3_PREFIX}/{output_filename}"
        s3_client.upload_file(local_path, S3_BUCKET, s3_key)

        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET, 'Key': s3_key},
            ExpiresIn=3600
        )

        background_tasks.add_task(os.remove, local_path)

        return {
            "audio_url": presigned_url,
            "s3_key": s3_key
        }
    except Exception as e:
        logger.error(f"Error in voice conversion: {e}")
        raise HTTPException(
            status_code=500, detail="Error in voice conversion")


@app.get("/voices", dependencies=[Depends(verify_api_key)])
async def list_voices():
    return {"voices": list(TARGET_VOICES.keys())}


@app.get("/health", dependencies=[Depends(verify_api_key)])
async def health_check():
    if models:
        return {"status": "healthy", "model": "loaded"}
    return {"status": "unhealthy", "model": "not loaded"}
