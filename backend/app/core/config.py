from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "sqlite:///./app.db"
    SECRET_KEY: str = (
        "cfe5c41e9f057ff9808833d25287581139172d1caf0f715d56fa32b58714bb5d"
    )
    JWT_SECRET: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_NUMBERS: bool = True
    PASSWORD_REQUIRE_SPECIAL: bool = True

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    ADMIN_API_KEY: str = ""
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    FRONTEND_URL: str = ""
    BACKEND_CORS_ORIGINS: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RESEND_API_KEY: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 25
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    NODE_ENV: str = "development"
    ENABLE_DEMO_LOGIN: bool | None = None

    @property
    def signing_secret(self) -> str:
        return self.JWT_SECRET or self.SECRET_KEY

    @property
    def cors_origins(self) -> list[str]:
        origins = [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL)
        if not origins and str(self.NODE_ENV).strip().lower() != "production":
            origins.extend([
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001",
            ])
        return list(dict.fromkeys(origins))

    @property
    def demo_login_enabled(self) -> bool:
        if self.ENABLE_DEMO_LOGIN is None:
            return True
        if isinstance(self.ENABLE_DEMO_LOGIN, bool):
            return self.ENABLE_DEMO_LOGIN
        return str(self.ENABLE_DEMO_LOGIN).strip().lower() in {"1", "true", "yes", "on"}


settings = Settings()
