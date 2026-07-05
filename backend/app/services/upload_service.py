from __future__ import annotations

import mimetypes
from typing import BinaryIO

from fastapi import HTTPException, UploadFile, status

from app.config.cloudinary import initialize_cloudinary
from app.models.user import UserRole

try:
    initialize_cloudinary()
except RuntimeError:
    pass


SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
SUPPORTED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
SUPPORTED_RESUME_TYPES = {"application/pdf"}
SUPPORTED_RESUME_EXTENSIONS = {"pdf"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024


class CloudinaryUploadService:
    def __init__(self) -> None:
        self._initialized = False

    def ensure_initialized(self) -> None:
        if self._initialized:
            return
        initialize_cloudinary()
        self._initialized = True

    def _validate_upload(self, file: UploadFile, allowed_types: set[str], max_size: int, allowed_extensions: set[str]) -> None:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Please choose a file to upload")

        extension = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        content_type = (file.content_type or "").lower()
        if content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        if content_type.startswith("application/") and content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Executable files are not allowed")

        if content_type.startswith("text/") or content_type.startswith("script/") or content_type.endswith("php"):
            raise HTTPException(status_code=400, detail="Executable files are not allowed")

        if file.size is not None and file.size > max_size:
            raise HTTPException(status_code=413, detail=f"File size exceeds the {max_size // (1024 * 1024)} MB limit")

    def _get_mime_from_filename(self, filename: str) -> str:
        guessed, _ = mimetypes.guess_type(filename)
        return guessed or ""

    def upload_profile_picture(self, file: UploadFile, user_role: str, previous_public_id: str | None = None) -> dict[str, str | None]:
        self.ensure_initialized()
        self._validate_upload(file, SUPPORTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, SUPPORTED_IMAGE_EXTENSIONS)

        content_type = self._get_mime_from_filename(file.filename or "")
        if content_type and content_type not in SUPPORTED_IMAGE_TYPES:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        folder = "alumni/profile-pictures" if user_role == UserRole.ALUMNI.value else "students/profile-pictures"
        result = self._upload_to_cloudinary(
            file=file,
            folder=folder,
            resource_type="image",
            options={
                "folder": folder,
                "quality": "auto",
                "fetch_format": "auto",
                "overwrite": True,
                "resource_type": "image",
            },
        )

        if previous_public_id:
            self._delete_from_cloudinary(previous_public_id, resource_type="image")

        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
        }

    def upload_resume(self, file: UploadFile, user_role: str, previous_public_id: str | None = None) -> dict[str, str | None]:
        self.ensure_initialized()
        self._validate_upload(file, SUPPORTED_RESUME_TYPES, MAX_RESUME_SIZE_BYTES, SUPPORTED_RESUME_EXTENSIONS)

        folder = "alumni/resumes" if user_role == UserRole.ALUMNI.value else "students/resumes"
        result = self._upload_to_cloudinary(
            file=file,
            folder=folder,
            resource_type="raw",
            options={
                "folder": folder,
                "resource_type": "raw",
                "overwrite": True,
            },
        )

        if previous_public_id:
            self._delete_from_cloudinary(previous_public_id, resource_type="raw")

        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
        }

    def _upload_to_cloudinary(self, file: UploadFile, folder: str, resource_type: str, options: dict) -> dict:
        from cloudinary.uploader import upload

        if file.file is None:
            raise HTTPException(status_code=400, detail="Unable to read uploaded file")

        file.file.seek(0)
        upload_result = upload(
            file.file,
            folder=folder,
            resource_type=resource_type,
            **options,
        )
        file.file.seek(0)
        return upload_result

    def _delete_from_cloudinary(self, public_id: str, resource_type: str) -> None:
        from cloudinary.uploader import destroy

        destroy(public_id, resource_type=resource_type)
