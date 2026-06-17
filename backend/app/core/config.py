from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./alumni.db"

    SECRET_KEY: str = (
        "cfe5c41e9f057ff9808833d25287581139172d1caf0f715d56fa32b58714bb5d"
    )

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"


settings = Settings()