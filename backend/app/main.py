from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


ensure_schema()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Alumni Network API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"message": "API is running"}


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

