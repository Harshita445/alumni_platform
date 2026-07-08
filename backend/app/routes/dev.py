import os
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from threading import Timer

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, hash_password, hash_refresh_token
from app.database import SessionLocal, get_db
from app.models.availability import Availability
from app.models.booking import Booking, BookingStatus
from app.models.mentorship_service import MentorshipService
from app.models.notification import Notification
from app.models.payments import MentorPayoutSettings, Payment, PaymentStatus, Payout
from app.models.profile import Profile
from app.models.review import Review
from app.models.saved_alumni import SavedAlumni
from app.models.user import User
from app.services.community_service import _POSTS

router = APIRouter(prefix="/api/dev", tags=["Development"])
demo_router = APIRouter(prefix="/api/demo", tags=["Demo"])

DEMO_STUDENT_EMAIL = "student-demo@alumly.demo"
DEMO_ALUMNI_EMAIL = "alumni-demo@alumly.demo"

ALUMNI_SEED = [
    ("Rahul Sharma", DEMO_ALUMNI_EMAIL, "Google", "Senior Software Engineer", 2019, ["System Design", "Backend", "Career Guidance"]),
    ("Priya Mehta", "demo.priya@alumly.local", "Microsoft", "Product Manager", 2020, ["Product Management", "AI", "Roadmapping"]),
    ("Aman Verma", "demo.aman@alumly.local", "Adobe", "Design Engineer", 2018, ["Frontend", "Design Systems", "Resume Review"]),
    ("Neha Bansal", "demo.neha@alumly.local", "Amazon", "Software Development Engineer", 2021, ["DSA", "Distributed Systems"]),
    ("Karan Malhotra", "demo.karan@alumly.local", "Atlassian", "Engineering Manager", 2017, ["Leadership", "Engineering Management"]),
    ("Isha Arora", "demo.isha@alumly.local", "Goldman Sachs", "Quant Analyst", 2019, ["Finance", "Data Science"]),
    ("Rohan Kapoor", "demo.rohan@alumly.local", "Uber", "Mobile Engineer", 2020, ["Android", "System Design"]),
    ("Simran Kaur", "demo.simran@alumly.local", "Google", "AI Engineer", 2018, ["Machine Learning", "MLOps"]),
    ("Arjun Singh", "demo.arjun@alumly.local", "Microsoft", "Cloud Architect", 2016, ["Azure", "Cloud Architecture"]),
    ("Meera Nair", "demo.meera@alumly.local", "Adobe", "UX Research Lead", 2015, ["UX Research", "Product Strategy"]),
    ("Dev Patel", "demo.dev@alumly.local", "Amazon", "Data Engineer", 2021, ["Data Engineering", "SQL"]),
    ("Ananya Rao", "demo.ananya@alumly.local", "Atlassian", "Frontend Engineer", 2022, ["React", "Frontend"]),
    ("Vikram Sethi", "demo.vikram@alumly.local", "Goldman Sachs", "Vice President", 2014, ["FinTech", "Leadership"]),
    ("Tanya Gill", "demo.tanya@alumly.local", "Uber", "Product Designer", 2019, ["Portfolio Review", "Design"]),
    ("Kabir Khanna", "demo.kabir@alumly.local", "Google", "Developer Relations Engineer", 2017, ["Open Source", "Communication"]),
    ("Sanya Chopra", "demo.sanya@alumly.local", "Microsoft", "Security Engineer", 2020, ["Cybersecurity", "Cloud Security"]),
    ("Nikhil Jain", "demo.nikhil@alumly.local", "Adobe", "Machine Learning Engineer", 2018, ["AI", "Recommendation Systems"]),
    ("Aditi Sen", "demo.aditi@alumly.local", "Amazon", "Program Manager", 2016, ["Program Management", "Operations"]),
    ("Yash Gupta", "demo.yash@alumly.local", "Atlassian", "Site Reliability Engineer", 2019, ["SRE", "DevOps"]),
    ("Ritika Anand", "demo.ritika@alumly.local", "Goldman Sachs", "Software Engineer", 2021, ["Backend", "Interview Prep"]),
]


def _require_demo_mode() -> None:
    if not settings.demo_login_enabled:
        raise HTTPException(status_code=403, detail="Demo login is disabled.")


def _require_admin_access(admin_key: str | None) -> None:
    if not settings.ADMIN_API_KEY:
        raise HTTPException(status_code=500, detail="Admin verification is not configured")
    if admin_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Admin access required")


def _issue_token_pair(user: User) -> dict[str, str]:
    access_token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    refresh_token = create_refresh_token()
    user.refresh_token_hash = hash_refresh_token(refresh_token)
    user.last_login = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


def _user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "display_name": user.display_name,
        "verification_status": "verified" if user.is_verified else "pending",
        "onboarding_step": 5 if user.onboarding_completed else 0,
        "is_demo": bool(user.is_demo),
    }


def _upsert_user(db: Session, email: str, role: str, name: str) -> User:
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    password = (
        "StudentDemo123!"
        if email.lower() == DEMO_STUDENT_EMAIL
        else "AlumniDemo123!"
        if email.lower() == DEMO_ALUMNI_EMAIL
        else "DemoPass123!"
    )
    if user is None:
        user = User(email=email, role=role, auth_provider="demo", hashed_password=hash_password(password))
        db.add(user)
        db.flush()

    user.role = role
    user.display_name = name
    user.auth_provider = "demo"
    user.hashed_password = hash_password(password)
    user.is_verified = True
    user.is_demo = True
    user.is_pending_verification = False
    user.verification_status = "approved"
    user.onboarding_completed = True
    return user


def _upsert_profile(db: Session, user: User, **values) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile is None:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.flush()

    for key, value in values.items():
        setattr(profile, key, value)
    return profile


def _clear_demo_activity(db: Session, user_ids: list[int]) -> None:
    if not user_ids:
        return

    booking_ids = [
        row[0]
        for row in db.query(Booking.id)
        .filter((Booking.student_id.in_(user_ids)) | (Booking.alumni_id.in_(user_ids)))
        .all()
    ]
    if booking_ids:
        payment_ids = [row[0] for row in db.query(Payment.id).filter(Payment.booking_id.in_(booking_ids)).all()]
        if payment_ids:
            db.query(Payout).filter(Payout.payment_id.in_(payment_ids)).delete(synchronize_session=False)
        db.query(Payment).filter(Payment.booking_id.in_(booking_ids)).delete(synchronize_session=False)
        db.query(Review).filter(Review.booking_id.in_(booking_ids)).delete(synchronize_session=False)
        db.query(Notification).filter(Notification.booking_id.in_(booking_ids)).delete(synchronize_session=False)
        db.query(Booking).filter(Booking.id.in_(booking_ids)).delete(synchronize_session=False)

    db.query(SavedAlumni).filter(SavedAlumni.student_id.in_(user_ids)).delete(synchronize_session=False)
    db.query(Availability).filter(Availability.alumni_id.in_(user_ids)).delete(synchronize_session=False)
    db.query(MentorshipService).filter(MentorshipService.alumni_id.in_(user_ids)).delete(synchronize_session=False)
    db.query(MentorPayoutSettings).filter(MentorPayoutSettings.mentor_id.in_(user_ids)).delete(synchronize_session=False)
    db.query(Notification).filter(Notification.user_id.in_(user_ids)).delete(synchronize_session=False)


def _add_booking(
    db: Session,
    student_id: int,
    alumni_id: int,
    days_from_now: int,
    hour: int,
    session_type: str,
    status: BookingStatus,
    message: str,
    meeting_link: str | None = None,
) -> Booking:
    booking = Booking(
        student_id=student_id,
        alumni_id=alumni_id,
        session_type=session_type,
        date=date.today() + timedelta(days=days_from_now),
        time=time(hour, 0),
        status=status.value,
        message=message,
        timezone="Asia/Kolkata",
        meeting_link=meeting_link if status in {BookingStatus.CONFIRMED, BookingStatus.COMPLETED} else None,
        status_history=[
            {"status": "pending", "changed_at": datetime.utcnow().isoformat(), "note": "Demo request submitted"},
            {"status": status.value, "changed_at": datetime.utcnow().isoformat(), "note": "Demo data seeded"},
        ],
    )
    db.add(booking)
    db.flush()
    return booking


def _add_payment(db: Session, booking: Booking, amount: Decimal, status: PaymentStatus = PaymentStatus.COMPLETED) -> Payment:
    platform_fee = (amount * Decimal("0.10")).quantize(Decimal("1.00"))
    payment = Payment(
        booking_id=booking.id,
        student_id=booking.student_id,
        mentor_id=booking.alumni_id,
        gross_amount=amount,
        platform_fee=platform_fee,
        mentor_amount=amount - platform_fee,
        currency="INR",
        status=status.value,
        gateway="mock",
        gateway_order_id=f"order_demo_{booking.id:03d}",
        gateway_payment_id=f"pay_demo_{booking.id:03d}",
        transfer_id=f"trf_demo_{booking.id:03d}" if status in {PaymentStatus.COMPLETED, PaymentStatus.PAID_OUT} else None,
    )
    db.add(payment)
    db.flush()
    return payment


def _seed_community(student: User, alumni: User) -> None:
    _POSTS[:] = [
        {
            "id": 101,
            "title": "Pinned: Placement prep sprint starts this Friday",
            "body": "Join the weekly prep circle for mock interviews, resume reviews, and peer accountability.",
            "category": "announcement",
            "author_id": alumni.id,
            "author_name": "Rahul Sharma",
            "created_at": datetime.utcnow().isoformat(),
            "comments": [{"author": "Harshita Kumar", "role": "student", "content": "Excited for the mock interview track."}],
            "reactions": {"likes": [student.id]},
        },
        {
            "id": 102,
            "title": "How should I prepare for AI product roles?",
            "body": "I am comfortable with Python and ML basics, but want to understand product thinking.",
            "category": "question",
            "author_id": student.id,
            "author_name": "Harshita Kumar",
            "created_at": datetime.utcnow().isoformat(),
            "comments": [{"author": "Rahul Sharma", "role": "alumni", "content": "Start with user problems, metrics, and trade-offs before model choice."}],
            "reactions": {"likes": [alumni.id]},
        },
        {
            "id": 103,
            "title": "Referral-ready resume checklist",
            "body": "A concise checklist for impact bullets, project links, and role-specific keywords.",
            "category": "opportunity",
            "author_id": alumni.id,
            "author_name": "Rahul Sharma",
            "created_at": datetime.utcnow().isoformat(),
            "comments": [],
            "reactions": {"likes": [student.id]},
        },
    ]


def seed_demo_data(db: Session) -> dict[str, User]:
    student = _upsert_user(db, DEMO_STUDENT_EMAIL, "student", "Harshita Kumar")
    alumni_users: dict[str, User] = {}
    for name, email, company, designation, graduation_year, expertise in ALUMNI_SEED:
        user = _upsert_user(db, email, "alumni", name)
        alumni_users[email] = user
        _upsert_profile(
            db,
            user,
            full_name=name,
            branch="Computer Engineering",
            graduation_year=graduation_year,
            company=company,
            designation=designation,
            bio=f"{designation} at {company}. Helps students with {', '.join(expertise[:2])}.",
            linkedin_url=f"https://linkedin.com/in/{name.lower().replace(' ', '-')}",
            expertise=expertise,
            mentorship_services=["Career Guidance", "Mock Interview", "Resume Review"],
            skills=expertise,
        )

    rahul = alumni_users[DEMO_ALUMNI_EMAIL]
    priya = alumni_users["demo.priya@alumly.local"]

    _clear_demo_activity(db, [student.id, *[user.id for user in alumni_users.values()]])

    _upsert_profile(
        db,
        student,
        full_name="Harshita Kumar",
        branch="Computer Engineering",
        graduation_year=2027,
        career_interests=["Software Engineering", "AI", "Product Management"],
        target_companies=["Google", "Microsoft", "Adobe"],
        desired_roles=["Software Engineer", "AI Product Manager"],
        skills=["Python", "React", "Machine Learning", "Data Structures"],
        goals="Crack product-minded software engineering interviews and build AI projects.",
    )

    db.add(MentorPayoutSettings(mentor_id=rahul.id, method="UPI", upi_id="rahul.demo@upi", account_holder="Rahul Sharma", verified="verified"))
    for day in range(5):
        db.add(Availability(alumni_id=rahul.id, day_of_week=day, start_time=time(17, 0), end_time=time(21, 0)))
    for service_type, price in [("Career Guidance", 499), ("Mock Interview", 799), ("Resume Review", None)]:
        db.add(MentorshipService(alumni_id=rahul.id, service_type=service_type, price=price, is_enabled=True, currency="INR"))

    for idx, user in enumerate(alumni_users.values()):
        if user.id != rahul.id:
            db.add(Availability(alumni_id=user.id, day_of_week=idx % 5, start_time=time(16, 0), end_time=time(19, 0)))
            db.add(MentorshipService(alumni_id=user.id, service_type="Career Guidance", price=399 + (idx % 5) * 100, is_enabled=True, currency="INR"))

    saved_targets = list(alumni_users.values())[0:5]
    for target in saved_targets:
        db.add(SavedAlumni(student_id=student.id, alumni_id=target.id))

    confirmed = _add_booking(db, student.id, rahul.id, 2, 18, "Career Guidance", BookingStatus.CONFIRMED, "Discuss Google interview prep.", "https://meet.google.com/demo-session-001")
    pending = _add_booking(db, student.id, priya.id, 4, 17, "Product Management", BookingStatus.PENDING, "Need help framing AI projects for PM interviews.")
    _add_payment(db, confirmed, Decimal("499"), PaymentStatus.COMPLETED)

    completed_comments = [
        "Rahul gave clear, practical feedback on my backend project.",
        "The mock interview helped me structure stronger answers.",
        "Great resume suggestions with examples I could apply immediately.",
    ]
    for idx, comment in enumerate(completed_comments):
        booking = _add_booking(db, student.id, rahul.id, -idx - 3, 18, "Mock Interview", BookingStatus.COMPLETED, "Completed demo session.", f"https://meet.google.com/demo-completed-{idx + 1:03d}")
        _add_payment(db, booking, Decimal("799"), PaymentStatus.PAID_OUT)
        db.add(Review(booking_id=booking.id, student_id=student.id, alumni_id=rahul.id, rating=5 if idx < 2 else 4, comment=comment))

    cancelled = _add_booking(db, student.id, alumni_users["demo.aman@alumly.local"].id, -1, 16, "Resume Review", BookingStatus.CANCELLED, "Cancelled due to schedule conflict.")
    upcoming_paid = _add_booking(db, student.id, alumni_users["demo.neha@alumly.local"].id, 6, 19, "Mock Interview", BookingStatus.CONFIRMED, "Practice DSA and behavioral questions.", "https://meet.google.com/demo-session-002")
    _add_payment(db, upcoming_paid, Decimal("699"), PaymentStatus.COMPLETED)

    for offset, name in enumerate(["Ananya Rao", "Isha Arora", "Kabir Khanna"]):
        mentor = next(user for user in alumni_users.values() if user.display_name == name)
        session = _add_booking(db, mentor.id, rahul.id, offset + 1, 17 + offset, "Career Guidance", BookingStatus.CONFIRMED, "Demo alumni upcoming session.", f"https://meet.google.com/demo-mentor-{offset + 1:03d}")
        _add_payment(db, session, Decimal("499"), PaymentStatus.COMPLETED)

    for idx in range(4):
        requester = list(alumni_users.values())[idx + 6]
        _add_booking(db, requester.id, rahul.id, idx + 3, 15 + idx, "Mock Interview", BookingStatus.PENDING, "Incoming demo mentor request.")

    for idx in range(24):
        requester = list(alumni_users.values())[(idx % (len(alumni_users) - 1)) + 1]
        booking = _add_booking(db, requester.id, rahul.id, -idx - 7, 10 + (idx % 8), "Career Guidance", BookingStatus.COMPLETED, "Historic mentor session.", f"https://meet.google.com/demo-history-{idx + 1:03d}")
        _add_payment(db, booking, Decimal("499"), PaymentStatus.PAID_OUT)
        if idx < 8:
            db.add(Review(booking_id=booking.id, student_id=requester.id, alumni_id=rahul.id, rating=5 if idx != 3 else 4, comment=["Insightful and actionable.", "Very patient mentor.", "Excellent interview tips.", "Helped me choose the right roadmap."][idx % 4]))

    for message, is_read in [
        ("Session confirmed with Rahul Sharma for Career Guidance.", False),
        ("Community reply from Rahul Sharma on your AI product roles question.", False),
        ("Payment successful for your upcoming mock interview.", False),
        ("Session reminder: Career Guidance starts tomorrow.", True),
        ("New review received for your completed session.", False),
    ]:
        db.add(Notification(user_id=student.id, booking_id=confirmed.id, message=message, is_read=is_read))

    for message in [
        "New booking request from Simran Kaur.",
        "Payment released for mock interview session.",
        "Review received: Excellent interview tips.",
        "You have 4 pending mentorship requests.",
    ]:
        db.add(Notification(user_id=rahul.id, message=message, is_read=False))

    _seed_community(student, rahul)
    db.commit()
    db.refresh(student)
    db.refresh(rahul)
    return {"student": student, "alumni": rahul}


def _schedule_demo_reset() -> None:
    if os.getenv("PYTEST_CURRENT_TEST") or str(settings.NODE_ENV).lower() == "test":
        return

    timer = Timer(60 * 60 * 6, _run_demo_reset_job)
    timer.daemon = True
    timer.start()


def _run_demo_reset_job() -> None:
    try:
        db = SessionLocal()
        seed_demo_data(db)
        db.commit()
        db.close()
    except Exception:
        pass
    finally:
        _schedule_demo_reset()


_schedule_demo_reset()


def _login_as(role: str, db: Session):
    _require_demo_mode()
    email = DEMO_STUDENT_EMAIL if role == "student" else DEMO_ALUMNI_EMAIL
    name = "Harshita Kumar" if role == "student" else "Rahul Sharma"
    user = _upsert_user(db, email, role, name)
    _upsert_profile(
        db,
        user,
        full_name=name,
        branch="Computer Engineering",
        graduation_year=2027 if role == "student" else 2019,
        company="Google" if role == "alumni" else None,
        designation="Senior Software Engineer" if role == "alumni" else None,
        bio="Demo alumni mentor for career guidance and interview prep." if role == "alumni" else None,
        expertise=["System Design", "Backend", "Career Guidance"] if role == "alumni" else [],
        mentorship_services=["Career Guidance", "Mock Interview", "Resume Review"] if role == "alumni" else [],
        skills=["Python", "React", "Machine Learning", "Data Structures"] if role == "student" else ["System Design", "Backend", "Career Guidance"],
        career_interests=["Software Engineering", "AI", "Product Management"] if role == "student" else [],
        goals="Explore mentorship and prepare for interviews." if role == "student" else None,
    )
    token_data = _issue_token_pair(user)
    db.commit()
    db.refresh(user)
    return {**token_data, "role": user.role, "user": _user_payload(user)}


@router.post("/login/student")
def login_demo_student(db: Session = Depends(get_db)):
    return _login_as("student", db)


@router.post("/login/alumni")
def login_demo_alumni(db: Session = Depends(get_db)):
    return _login_as("alumni", db)


def _reset_demo_data(admin_key: str | None, db: Session) -> dict:
    _require_demo_mode()
    _require_admin_access(admin_key)
    users = seed_demo_data(db)
    return {"message": "Demo data reset.", "student": _user_payload(users["student"]), "alumni": _user_payload(users["alumni"])}


@router.post("/reset-demo-data")
def reset_demo_data(
    admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
    db: Session = Depends(get_db),
):
    return _reset_demo_data(admin_key, db)


@demo_router.post("/reset")
def reset_demo_data_alias(
    admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
    db: Session = Depends(get_db),
):
    return _reset_demo_data(admin_key, db)
