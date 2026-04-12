import boto3
import os
from botocore.config import Config

# Load from env
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")
R2_ENDPOINT = os.getenv("R2_ENDPOINT")
R2_BUCKET = os.getenv("R2_BUCKET", "pretalkme-media")

r2_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    config=Config(signature_version="s3v4"),
)

async def download_from_r2(url: str) -> bytes:
    """Download file from R2 bucket. Expects a key or a full R2 URL."""
    key = url.split("/")[-1] # Simplistic key extraction
    response = r2_client.get_object(Bucket=R2_BUCKET, Key=key)
    return response["Body"].read()

async def upload_to_r2(data: bytes, key: str, content_type: str = "audio/ogg") -> str:
    """Upload bytes to R2 and return the public URL."""
    r2_client.put_object(
        Bucket=R2_BUCKET,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    # Construct public URL (this depends on the R2_PUBLIC_URL env)
    public_base = os.getenv("R2_PUBLIC_URL", R2_ENDPOINT)
    return f"{public_base}/{key}"
