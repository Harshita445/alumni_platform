from fastapi import FastAPI

from app.database import Base, engine

import app.models.user
import app.models.profile
import app.models.booking
import app.models.saved_alumni
import app.models.notification
import app.models.review

from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.bookings import router as bookings_router
from app.routes.alumni import router as alumni_router
from app.routes.saved import router as saved_router
from app.routes.reviews import router as reviews_router
from app.routes.dashboard import router as dashboard_router
from app.routes.notifications import router as notifications_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Alumni Network API",
    version="1.0.0",
)


@app.get("/")
def health_check():
    return {"message": "API is running"}


app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(bookings_router)
app.include_router(alumni_router)
app.include_router(saved_router)
app.include_router(reviews_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)

