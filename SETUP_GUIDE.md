# Bel Naturels Treasury - Live Demo Setup Guide

Complete step-by-step instructions for setting up the demo.

## Prerequisites
- Node.js 18+ and npm
- Docker Desktop (running)

---

## STEP 1: Start PostgreSQL with Docker

```bash
docker run -d \
  --name belnaturels-postgres \
  -e POSTGRES_USER=belnaturels \
  -e POSTGRES_PASSWORD=treasury2024 \
  -e POSTGRES_DB=treasury \
  -p 5432:5432 \
  postgres:15-alpine
```

**Windows PowerShell:**
```powershell
docker run -d --name belnaturels-postgres -e POSTGRES_USER=belnaturels -e POSTGRES_PASSWORD=treasury2024 -e POSTGRES_DB=treasury -p 5432:5432 postgres:15-alpine
```

---

## STEP 2: Backend Setup

Create `backend/.env`:
```
DATABASE_URL="postgresql://belnaturels:treasury2024@localhost:5432/treasury?schema=public"
JWT_SECRET="bel-naturels-demo-secret-key-2024"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

Run:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

---

## STEP 3: Frontend Setup (new terminal)

```bash
cd frontend
npm install
npm run dev
```

---

## STEP 4: Test

- Frontend: http://localhost:5173
- Login: admin@belnaturels.com / admin123

---

## PRE-DEMO CHECKLIST

- [ ] Docker running + postgres container up
- [ ] Backend running on :3001
- [ ] Frontend running on :5173
- [ ] Login works
- [ ] All 4 pages load with data
