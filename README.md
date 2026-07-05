# Alumly

Alumly is a mentorship platform for students and alumni.

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

## Database migrations

```bash
cd backend
alembic upgrade head
```

## Deployment

- Frontend: deploy the frontend folder on Vercel.
- Backend: deploy the backend folder on Render using the included render.yaml.
- Database: use PostgreSQL (Neon/Supabase) and set DATABASE_URL.
- Storage: configure Cloudinary and Razorpay secrets in the deployment platform.
