# Deployment guide

## 1. Prerequisites

- GitHub repository
- Vercel account for the frontend
- Render account for the backend
- PostgreSQL database (Neon or Supabase)
- Cloudinary account
- Razorpay account
- Resend account (optional)

## 2. Environment variables

Set these in Vercel for the frontend:

- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_RAZORPAY_KEY
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

Set these in Render for the backend:

- DATABASE_URL
- JWT_SECRET
- SECRET_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- RESEND_API_KEY
- FRONTEND_URL

## 3. Database migrations

Render will start the backend with the existing SQLAlchemy schema initializer; for a managed database, run:

```bash
cd backend
alembic upgrade head
```

## 4. Deploy

1. Push the repository to GitHub.
2. Import the frontend project in Vercel and point it at the frontend folder.
3. Import the backend project in Render and point it at the backend folder or use render.yaml.
4. Enable automatic deploys for pushes to main.

## 5. Production troubleshooting

- Confirm the backend health endpoint returns ok.
- Confirm the frontend can reach the backend via NEXT_PUBLIC_API_URL.
- Confirm Cloudinary uploads return a secure URL.
- Confirm the database URL uses PostgreSQL.
