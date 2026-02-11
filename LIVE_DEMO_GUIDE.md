# Bel Naturels Treasury - Complete Live Demo Setup Guide

## OVERVIEW
This guide walks you through setting up the treasury app from scratch on a fresh dev machine.

**Tech Stack:** Node.js + Express + Prisma + PostgreSQL (backend) | React + Vite + Tailwind (frontend)

---

## PREREQUISITES CHECKLIST
Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Docker Desktop installed and RUNNING

---

## STEP 1: START POSTGRESQL WITH DOCKER

Open your terminal and run:

```bash
# Pull and start PostgreSQL container
docker run -d \
  --name belnaturels-postgres \
  -e POSTGRES_USER=belnaturels \
  -e POSTGRES_PASSWORD=treasury2024 \
  -e POSTGRES_DB=treasury \
  -p 5432:5432 \
  postgres:15-alpine

# Verify it's running
docker ps | grep belnaturels-postgres
```

**Windows PowerShell version:**
```powershell
docker run -d --name belnaturels-postgres -e POSTGRES_USER=belnaturels -e POSTGRES_PASSWORD=treasury2024 -e POSTGRES_DB=treasury -p 5432:5432 postgres:15-alpine

docker ps
```

**Expected output:** You should see `belnaturels-postgres` in the list with status "Up"

---

## STEP 2: NAVIGATE TO PROJECT FOLDER

```bash
cd ~/Desktop/bel-naturels-treasury
# Or on Windows:
cd C:\Users\prov3\OneDrive\Desktop\bel-naturels-treasury
```

---

## STEP 3: BACKEND SETUP

### 3.1 Verify .env file exists
The `.env` file should already be in `backend/` with these contents:
```
DATABASE_URL="postgresql://belnaturels:treasury2024@localhost:5432/treasury?schema=public"
JWT_SECRET="bel-naturels-demo-secret-key-2024"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### 3.2 Install dependencies and setup database
```bash
cd backend

# Install npm packages
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Seed demo data
npm run db:seed
```

**Expected seed output:**
```
🌱 Seeding database for Bel Naturels Spa Treasury...
✅ Created admin user: admin@belnaturels.com
✅ Created staff user: operations@belnaturels.com
✅ Created 12 balance records
✅ Created 4 FX quote records
✅ Created 4 payout records
🎉 Database seeding completed!
```

### 3.3 Start backend server
```bash
npm run dev
```

**Expected output:**
```
🚀 Bel Naturels Treasury API running on http://localhost:3001
```

**Keep this terminal open!**

---

## STEP 4: FRONTEND SETUP (NEW TERMINAL)

Open a **new terminal window/tab**:

```bash
cd ~/Desktop/bel-naturels-treasury/frontend
# Or on Windows:
cd C:\Users\prov3\OneDrive\Desktop\bel-naturels-treasury\frontend

# Install npm packages
npm install

# Start development server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal open!**

---

## STEP 5: VERIFY THE APP

### 5.1 Open in browser
Navigate to: **http://localhost:5173**

### 5.2 Login with demo credentials

| Role  | Email                      | Password   |
|-------|----------------------------|------------|
| Admin | admin@belnaturels.com      | admin123   |
| Staff | operations@belnaturels.com | staff123   |

### 5.3 Verify each page loads with data

| Page       | What you should see                                      |
|------------|----------------------------------------------------------|
| Dashboard  | Balance totals (USD, CLP, MXN, etc), payout status counts, recent payouts |
| Balances   | 4 provider cards (Global66, Bitso, Wise, Bank-CL) with currency balances |
| FX Quotes  | 4 exchange rate cards (USD→CLP, USD→MXN, USD→COP, USD→BRL) |
| Payouts    | 4 sample payouts with various statuses (Draft, Approved, Sent, Completed) |

### 5.4 Test creating a new payout
1. Click "+ New Payout" button
2. Fill in: Beneficiary Name = "Test Supplier"
3. Select corridor: USD→CLP
4. Select provider: Global66
5. Enter amount: 1000
6. Click "Create Payout"
7. Verify it appears in the Payouts list

---

## QUICK REFERENCE URLS

| Service      | URL                           |
|--------------|-------------------------------|
| Frontend     | http://localhost:5173         |
| Backend API  | http://localhost:3001         |
| Health Check | http://localhost:3001/api/health |

---

## TROUBLESHOOTING

### "Connection refused" on backend
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# If not running, start it
docker start belnaturels-postgres

# Check container logs
docker logs belnaturels-postgres
```

### "Port 5432 already in use"
```bash
# Stop existing PostgreSQL
docker stop belnaturels-postgres
docker rm belnaturels-postgres

# Or use a different port:
docker run -d --name belnaturels-postgres -e POSTGRES_USER=belnaturels -e POSTGRES_PASSWORD=treasury2024 -e POSTGRES_DB=treasury -p 5433:5432 postgres:15-alpine
# Then update DATABASE_URL in .env to use port 5433
```

### "Port 3001 already in use"
```bash
# Find and kill process
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Or change PORT in backend/.env
```

### Prisma migration fails
```bash
# Reset database and try again
npx prisma migrate reset --force
npm run db:seed
```

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in backend/.env matches frontend URL

---

## PRE-DEMO CHECKLIST (2 minutes before meeting)

Run through this checklist:

- [ ] **Docker Desktop is running**
  ```bash
  docker ps
  ```

- [ ] **PostgreSQL container is up**
  ```bash
  docker ps | grep belnaturels-postgres
  ```

- [ ] **Backend terminal shows:** `🚀 Bel Naturels Treasury API running on http://localhost:3001`

- [ ] **Frontend terminal shows:** `http://localhost:5173`

- [ ] **Browser open to:** http://localhost:5173

- [ ] **Test login works** with admin@belnaturels.com / admin123

- [ ] **Dashboard loads** with balance cards and recent payouts

- [ ] **Balances page** shows 4 providers with balances

- [ ] **FX Quotes page** shows 4 currency pairs

- [ ] **Payouts page** shows 4 sample payouts

- [ ] **Create new payout** button works

---

## QUICK START COMMANDS (Copy-Paste Ready)

### Terminal 1: Start Database
```bash
docker start belnaturels-postgres || docker run -d --name belnaturels-postgres -e POSTGRES_USER=belnaturels -e POSTGRES_PASSWORD=treasury2024 -e POSTGRES_DB=treasury -p 5432:5432 postgres:15-alpine
```

### Terminal 2: Start Backend
```bash
cd ~/Desktop/bel-naturels-treasury/backend && npm run dev
```

### Terminal 3: Start Frontend
```bash
cd ~/Desktop/bel-naturels-treasury/frontend && npm run dev
```

---

## CLEANUP AFTER DEMO

```bash
# Stop servers (Ctrl+C in each terminal)

# Stop Docker container
docker stop belnaturels-postgres

# Remove container (optional)
docker rm belnaturels-postgres
```

---

## DEMO TALKING POINTS

1. **Dashboard Overview** - "Here we see a unified view of all our treasury balances across providers, plus payout status and recent activity."

2. **Multi-Provider Balances** - "We integrate with Global66, Bitso, Wise, and Bank-CL, showing real-time balances in multiple currencies."

3. **FX Rates** - "Live mid-market rates for our key corridors - USD to Chilean Pesos, Mexican Pesos, Colombian Pesos, and Brazilian Real."

4. **Payout Workflow** - "Full lifecycle management from Draft → Approved → Sent → Completed, with audit trail."

5. **Create Payout Demo** - "Let me show you how easy it is to create a new payout instruction..."
