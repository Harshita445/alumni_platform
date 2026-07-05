import logging
from collections import defaultdict
from contextlib import asynccontextmanager
from time import time

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.database import Base, engine, ensure_schema

import app.models.user
import app.models.profile
import app.models.booking
import app.models.availability
import app.models.saved_alumni
import app.models.notification
import app.models.review
import app.models.mentorship_service
import app.models.payments

from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.bookings import router as bookings_router
from app.routes.availability import router as availability_router
from app.routes.alumni import router as alumni_router
from app.routes.community import router as community_router
from app.routes.saved import router as saved_router
from app.routes.reviews import router as reviews_router
from app.routes.dashboard import router as dashboard_router
from app.routes.notifications import router as notifications_router
from app.routes.mentorship_services import router as mentorship_services_router
from app.routes.payments import router as payments_router
from app.routes.uploads import router as uploads_router


logger = logging.getLogger("alumly")
logging.basicConfig(level=logging.INFO)

ensure_schema()
Base.metadata.create_all(bind=engine)

request_counts: dict[tuple[str, str], list[float]] = defaultdict(list)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Alumly API")
    yield
    engine.dispose()
    logger.info("Shutting down Alumly API")


app = FastAPI(
    title="Alumni Network API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
    return response


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time()
    window = request_counts[(client_ip, request.url.path)]
    window[:] = [stamp for stamp in window if now - stamp < 60]
    if len(window) >= 120:
        return Response(status_code=429, content="Too Many Requests")
    window.append(now)
    return await call_next(request)


@app.get("/")
def health_check():
    return {"message": "API is running"}


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/version")
def version():
    return {"version": "1.0.0"}


@app.get("/status")
def status():
    return {"status": "ok", "version": "1.0.0"}


app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(bookings_router)
app.include_router(availability_router)
app.include_router(alumni_router)
app.include_router(saved_router)
app.include_router(reviews_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)
app.include_router(community_router)
app.include_router(mentorship_services_router)
app.include_router(payments_router)
app.include_router(uploads_router)

