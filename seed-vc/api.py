import logging
import os
import uuid
import shutil
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict

from fastapi import Depends, FastAPI, Header, HTTPException, UploadFile, File
from fastapi.security import APIKeyHeader
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Import Gemini TTS API
from gemini_api import generate_tts, generate_multi_speaker_tts, get_all_voices

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
API_KEY = os.getenv("API_KEY", "default-api-key-for-development")  # Set default for development

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
        logger.warning(f"Invalid API key provided: {token}, expected: {API_KEY}")
        raise HTTPException(status_code=401, detail="Invalid API key")

    return token


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Gemini TTS API...")
    try:
        os.environ['GEMINI_API_KEY'] = 'AIzaSyAHiWh6x3aDyvCfa8Zo9AXAuJEh1G0aqpU'
        # Check if Gemini API key is set
        if not os.getenv("GEMINI_API_KEY"):
            logger.warning("GEMINI_API_KEY environment variable not set")
        else:
            logger.info("Gemini TTS API ready")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

    yield

    logger.info("Shutting down Gemini TTS API")

app = FastAPI(title="Voice API", lifespan=lifespan)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving audio files
app.mount("/files", StaticFiles(directory=".", html=True), name="files")

# Get all available voices from Gemini API
AVAILABLE_VOICES = get_all_voices()


class TextToSpeechRequest(BaseModel):
    text: str
    voice: str

class SpeechToTextRequest(BaseModel):
    audio_key: str

class MultiSpeakerRequest(BaseModel):
    text: str
    speakers: Dict[str, str]  # Map of speaker name to voice name


@app.post("/upload", dependencies=[Depends(verify_api_key)])
async def upload_audio(file: UploadFile = File(...)):
    """Upload an audio file and return a key for later reference"""
    try:
        # Generate a unique filename
        audio_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".wav"
        filename = f"{audio_id}{file_extension}"

        # Create full path
        upload_path = UPLOAD_DIR / filename

        # Save the file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return the key that can be used for voice conversion
        s3_key = f"{UPLOADS_PREFIX}/{filename}"

        return {
            "s3_key": s3_key
        }
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Error uploading file")


@app.post("/tts", dependencies=[Depends(verify_api_key)])
async def text_to_speech(request: TextToSpeechRequest):
    """Convert text to speech using Gemini TTS"""
    try:
        logger.info(f"Received TTS request - Text: '{request.text[:50]}...', Voice: '{request.voice}'")

        # Validate voice
        if request.voice not in AVAILABLE_VOICES:
            logger.error(f"Voice '{request.voice}' not in available voices: {list(AVAILABLE_VOICES.keys())}")
            raise HTTPException(
                status_code=400,
                detail=f"Voice not supported. Choose from: {', '.join(AVAILABLE_VOICES.keys())}"
            )

        logger.info(f"Converting text to speech using voice: {request.voice}")

        # Generate audio using Gemini TTS
        audio_data = generate_tts(request.text, request.voice)

        if not audio_data:
            logger.error("generate_tts returned None - check Gemini API logs")
            raise HTTPException(status_code=500, detail="Failed to generate audio")

        logger.info(f"Generated audio data of size: {len(audio_data)} bytes")

        # Generate a unique filename for output
        audio_id = str(uuid.uuid4())
        output_filename = f"{audio_id}.wav"
        output_path = OUTPUT_DIR / output_filename

        # Save the audio data to a file
        with open(output_path, "wb") as f:
            f.write(audio_data)

        logger.info(f"Saved audio file to: {output_path}")

        # Create a key for the output file (similar to S3 key format)
        output_key = f"{OUTPUTS_PREFIX}/{output_filename}"

        # Generate a URL for accessing the file using the new audio endpoint
        file_url = f"{BASE_URL}/audio/{output_filename}"

        logger.info(f"Returning audio URL: {file_url}")

        return {
            "audio_url": file_url,
            "s3_key": output_key
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in text-to-speech conversion: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error in text-to-speech conversion: {str(e)}")


@app.post("/multi-speaker", dependencies=[Depends(verify_api_key)])
async def multi_speaker_tts(request: MultiSpeakerRequest):
    """Convert text to multi-speaker speech using Gemini TTS"""
    try:
        # Validate voices
        for speaker, voice in request.speakers.items():
            if voice not in AVAILABLE_VOICES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Voice '{voice}' for speaker '{speaker}' not supported. Choose from: {', '.join(AVAILABLE_VOICES.keys())}"
                )

        logger.info(f"Converting text to multi-speaker speech")

        # Generate audio using Gemini TTS
        audio_data = generate_multi_speaker_tts(request.text, request.speakers)

        if not audio_data:
            raise HTTPException(status_code=500, detail="Failed to generate audio")

        # Generate a unique filename for output
        audio_id = str(uuid.uuid4())
        output_filename = f"{audio_id}.wav"
        output_path = OUTPUT_DIR / output_filename

        # Save the audio data to a file
        with open(output_path, "wb") as f:
            f.write(audio_data)

        # Create a key for the output file (similar to S3 key format)
        output_key = f"{OUTPUTS_PREFIX}/{output_filename}"

        # Generate a URL for accessing the file using the new audio endpoint
        file_url = f"{BASE_URL}/audio/{output_filename}"

        return {
            "audio_url": file_url,
            "s3_key": output_key
        }
    except Exception as e:
        logger.error(f"Error in multi-speaker conversion: {e}")
        raise HTTPException(status_code=500, detail=f"Error in multi-speaker conversion: {str(e)}")


@app.get("/voices", dependencies=[Depends(verify_api_key)])
async def list_voices():
    """Get all available voices with their descriptions"""
    return {"voices": AVAILABLE_VOICES}


@app.get("/health", dependencies=[Depends(verify_api_key)])
async def health_check():
    """Check if the API is healthy"""
    if os.getenv("GEMINI_API_KEY"):
        return {"status": "healthy", "api": "ready"}
    return {"status": "unhealthy", "api": "not configured"}


@app.get("/audio/{filename}")
async def serve_audio_file(filename: str):
    """Serve audio files with proper CORS headers and MIME type"""
    try:
        # Check if file exists in outputs directory
        file_path = OUTPUT_DIR / filename
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Audio file not found")

        # Return the file with proper headers
        return FileResponse(
            path=file_path,
            media_type="audio/wav",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "*",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except Exception as e:
        logger.error(f"Error serving audio file: {e}")
        raise HTTPException(status_code=500, detail="Error serving audio file")


@app.get("/file/{file_key}", dependencies=[Depends(verify_api_key)])
async def get_file_url(file_key: str):
    """Get a URL for a file by its key"""
    try:
        if file_key.startswith(UPLOADS_PREFIX):
            filename = file_key.split("/")[-1]
            file_path = UPLOAD_DIR / filename
            prefix = "uploads"
        elif file_key.startswith(OUTPUTS_PREFIX):
            filename = file_key.split("/")[-1]
            file_path = OUTPUT_DIR / filename
            prefix = "outputs"
        else:
            raise HTTPException(status_code=400, detail="Invalid file key format")

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        # Generate a URL for accessing the file
        file_url = f"{BASE_URL}/files/{prefix}/{filename}"

        return {
            "url": file_url,
            "expires_in": 3600  # Simulate S3 presigned URL expiration
        }
    except Exception as e:
        logger.error(f"Error getting file URL: {e}")
        raise HTTPException(status_code=500, detail="Error getting file URL")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
