import os

import cloudinary
import cloudinary.uploader

from app.core.config import settings


def initialize_cloudinary() -> None:
    cloud_name = settings.CLOUDINARY_CLOUD_NAME or os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = settings.CLOUDINARY_API_KEY or os.getenv("CLOUDINARY_API_KEY")
    api_secret = settings.CLOUDINARY_API_SECRET or os.getenv("CLOUDINARY_API_SECRET")

    if not cloud_name or not api_key or not api_secret:
        raise RuntimeError("Cloudinary credentials are not configured")

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
