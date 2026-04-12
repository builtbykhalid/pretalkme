import os
import aiohttp
import asyncio
from utils.r2 import upload_to_r2
import time

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

async def generate_and_upload_tts(text: str, tenant_id: str, voice_id: str = "rachel", language: str = "fr") -> str:
    """
    Generates audio, converts to ogg (logic placeholder) and uploads to R2.
    Returns the public URL.
    """
    audio_data = await _fetch_elevenlabs(text, voice_id)
    if not audio_data:
        return None

    # In a production environment with ffmpeg installed:
    # audio_data = await convert_to_ogg(audio_data)

    filename = f"tts/{tenant_id}/{int(time.time())}.mp3" # For now keeping mp3 or assuming ogg
    public_url = await upload_to_r2(audio_data, filename, content_type="audio/mpeg")
    
    return public_url

async def _fetch_elevenlabs(text: str, voice_id: str) -> bytes:
    if not ELEVENLABS_API_KEY:
        return None

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Accept": "audio/mpeg",
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as response:
            if response.status == 200:
                return await response.read()
            return None
