import os
import logging
import base64
import requests
import struct
import wave
import io
from typing import Optional, Dict
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Gemini API configuration
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"
GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts"

def get_api_key():
    """Get the Gemini API key from environment variables"""
    return os.getenv("GEMINI_API_KEY")

def convert_pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, sample_width: int = 2) -> bytes:
    """
    Convert raw PCM data to WAV format

    Args:
        pcm_data: Raw PCM audio data
        sample_rate: Sample rate in Hz (default: 24000 for Gemini)
        channels: Number of audio channels (default: 1 for mono)
        sample_width: Sample width in bytes (default: 2 for 16-bit)

    Returns:
        WAV formatted audio data as bytes
    """
    # Create a BytesIO buffer to write WAV data
    wav_buffer = io.BytesIO()

    # Create a wave file writer
    with wave.open(wav_buffer, 'wb') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(sample_width)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)

    # Get the WAV data
    wav_data = wav_buffer.getvalue()
    wav_buffer.close()

    logger.info(f"Converted PCM data ({len(pcm_data)} bytes) to WAV format ({len(wav_data)} bytes)")
    return wav_data

class VoiceName(str, Enum):
    """Available Gemini TTS voices"""
    ZEPHYR = "Zephyr"  # Bright
    PUCK = "Puck"  # Upbeat
    CHARON = "Charon"  # Informative
    KORE = "Kore"  # Firm
    FENRIR = "Fenrir"  # Excitable
    LEDA = "Leda"  # Youthful
    ORUS = "Orus"  # Firm
    AOEDE = "Aoede"  # Breezy
    CALLIRHOE = "Callirhoe"  # Easy-going
    AUTONOE = "Autonoe"  # Bright
    ENCELADUS = "Enceladus"  # Breathy
    IAPETUS = "Iapetus"  # Clear
    UMBRIEL = "Umbriel"  # Easy-going
    ALGIEBA = "Algieba"  # Smooth
    DESPINA = "Despina"  # Smooth
    ERINOME = "Erinome"  # Clear
    ALGENIB = "Algenib"  # Gravelly
    RASALGETHI = "Rasalgethi"  # Informative
    LAOMEDEIA = "Laomedeia"  # Upbeat
    ACHERNAR = "Achernar"  # Soft
    ALNILAM = "Alnilam"  # Firm
    SCHEDAR = "Schedar"  # Even
    GACRUX = "Gacrux"  # Mature
    PULCHERRIMA = "Pulcherrima"  # Forward
    ACHIRD = "Achird"  # Friendly
    ZUBENELGENUBI = "Zubenelgenubi"  # Casual
    VINDEMIATRIX = "Vindemiatrix"  # Gentle
    SADACHBIA = "Sadachbia"  # Lively
    SADALTAGER = "Sadaltager"  # Knowledgeable
    SULAFAR = "Sulafar"  # Warm

# Voice descriptions for UI display
VOICE_DESCRIPTIONS = {
    "Zephyr": "Bright",
    "Puck": "Upbeat",
    "Charon": "Informative",
    "Kore": "Firm",
    "Fenrir": "Excitable",
    "Leda": "Youthful",
    "Orus": "Firm",
    "Aoede": "Breezy",
    "Callirhoe": "Easy-going",
    "Autonoe": "Bright",
    "Enceladus": "Breathy",
    "Iapetus": "Clear",
    "Umbriel": "Easy-going",
    "Algieba": "Smooth",
    "Despina": "Smooth",
    "Erinome": "Clear",
    "Algenib": "Gravelly",
    "Rasalgethi": "Informative",
    "Laomedeia": "Upbeat",
    "Achernar": "Soft",
    "Alnilam": "Firm",
    "Schedar": "Even",
    "Gacrux": "Mature",
    "Pulcherrima": "Forward",
    "Achird": "Friendly",
    "Zubenelgenubi": "Casual",
    "Vindemiatrix": "Gentle",
    "Sadachbia": "Lively",
    "Sadaltager": "Knowledgeable",
    "Sulafar": "Warm"
}

def get_all_voices() -> Dict[str, str]:
    """Return all available voices with their descriptions"""
    return VOICE_DESCRIPTIONS

def generate_tts(text: str, voice_name: str) -> Optional[bytes]:
    """
    Generate text-to-speech audio using Gemini API

    Args:
        text: The text to convert to speech
        voice_name: The name of the voice to use

    Returns:
        Audio data as bytes or None if generation failed
    """
    logger.info(f"generate_tts called with voice: '{voice_name}', text length: {len(text)}")

    api_key = get_api_key()
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable not set")
        return None

    logger.info(f"Using Gemini API key: {api_key[:10]}...")

    # Validate voice name
    valid_voices = [v.value for v in VoiceName]
    logger.info(f"Valid voices: {valid_voices}")

    if voice_name not in valid_voices:
        logger.error(f"Invalid voice name: '{voice_name}'. Valid voices: {valid_voices}")
        return None

    # Prepare the request payload
    url = f"{GEMINI_API_URL}/{GEMINI_TTS_MODEL}:generateContent?key={api_key}"

    payload = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": voice_name
                    }
                }
            }
        }
    }

    try:
        logger.info(f"Making request to Gemini API: {url}")
        logger.info(f"Payload: {payload}")

        response = requests.post(url, json=payload)
        logger.info(f"Response status code: {response.status_code}")

        response.raise_for_status()

        # Extract audio data from response
        response_json = response.json()
        logger.info(f"Response JSON keys: {list(response_json.keys())}")

        if "candidates" in response_json and len(response_json["candidates"]) > 0:
            candidate = response_json["candidates"][0]
            logger.info(f"Candidate keys: {list(candidate.keys())}")

            if "content" in candidate and "parts" in candidate["content"]:
                parts = candidate["content"]["parts"]
                logger.info(f"Found {len(parts)} parts in response")

                if len(parts) > 0 and "inlineData" in parts[0]:
                    inline_data = parts[0]["inlineData"]
                    logger.info(f"Inline data keys: {list(inline_data.keys())}")

                    if "mimeType" in inline_data:
                        logger.info(f"Audio MIME type: {inline_data['mimeType']}")

                    if "data" in inline_data:
                        # Decode base64 audio data
                        raw_audio_data = base64.b64decode(inline_data["data"])
                        logger.info(f"Successfully decoded raw audio data: {len(raw_audio_data)} bytes")
                        logger.info(f"First 20 bytes: {[hex(b) for b in raw_audio_data[:20]]}")

                        # Convert raw PCM to WAV format
                        wav_audio_data = convert_pcm_to_wav(raw_audio_data)
                        return wav_audio_data

        logger.error(f"Failed to extract audio data from response: {response_json}")
        return None

    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error generating TTS: {e}")
        logger.error(f"Response content: {response.text if 'response' in locals() else 'No response'}")
        return None
    except Exception as e:
        logger.error(f"Error generating TTS: {e}")
        return None

def generate_multi_speaker_tts(text: str, speakers: Dict[str, str]) -> Optional[bytes]:
    """
    Generate multi-speaker text-to-speech audio using Gemini API

    Args:
        text: The text to convert to speech (with speaker annotations)
        speakers: Dictionary mapping speaker names to voice names

    Returns:
        Audio data as bytes or None if generation failed
    """
    api_key = get_api_key()
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable not set")
        return None

    # Validate voice names
    valid_voices = [v.value for v in VoiceName]
    for speaker, voice in speakers.items():
        if voice not in valid_voices:
            logger.error(f"Invalid voice name for speaker {speaker}: {voice}")
            return None

    # Prepare the request payload
    url = f"{GEMINI_API_URL}/{GEMINI_TTS_MODEL}:generateContent?key={api_key}"

    # Create speaker voice configs
    speaker_voice_configs = []
    for speaker, voice in speakers.items():
        speaker_voice_configs.append({
            "speaker": speaker,
            "voiceConfig": {
                "prebuiltVoiceConfig": {
                    "voiceName": voice
                }
            }
        })

    payload = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "multiSpeakerVoiceConfig": {
                    "speakerVoiceConfigs": speaker_voice_configs
                }
            }
        }
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()

        # Extract audio data from response
        response_json = response.json()

        if "candidates" in response_json and len(response_json["candidates"]) > 0:
            candidate = response_json["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                parts = candidate["content"]["parts"]
                if len(parts) > 0 and "inlineData" in parts[0]:
                    inline_data = parts[0]["inlineData"]
                    if "data" in inline_data:
                        # Decode base64 audio data
                        raw_audio_data = base64.b64decode(inline_data["data"])
                        logger.info(f"Successfully decoded raw multi-speaker audio data: {len(raw_audio_data)} bytes")

                        # Convert raw PCM to WAV format
                        wav_audio_data = convert_pcm_to_wav(raw_audio_data)
                        return wav_audio_data

        logger.error(f"Failed to extract audio data from response: {response_json}")
        return None

    except Exception as e:
        logger.error(f"Error generating multi-speaker TTS: {e}")
        return None
