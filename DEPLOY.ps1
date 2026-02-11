# Bel Naturels Treasury - One-Click Deploy Script
# Run this in PowerShell from the project root

Write-Host "=== Bel Naturels Treasury Cloud Deploy ===" -ForegroundColor Green

# Step 1: Init git
git init
git add -A
git commit -m "Initial commit - Bel Naturels Treasury"

# Step 2: Create GitHub repo (requires GitHub CLI: winget install GitHub.cli)
gh auth login
gh repo create bel-naturels-treasury --public --source=. --push

# Step 3: Deploy Backend to Render
Write-Host "`n=== BACKEND: Go to https://render.com ===" -ForegroundColor Cyan
Write-Host "1. Sign up / Log in at render.com"
Write-Host "2. New > Web Service > Connect your GitHub repo"
Write-Host "3. Root Directory: backend"
Write-Host "4. Build Command: npm install && npx prisma generate && npm run build"
Write-Host "5. Start Command: npx prisma migrate deploy && node dist/index.js"
Write-Host "6. Add PostgreSQL database (free tier)"
Write-Host "7. Set env vars: JWT_SECRET=bel-naturels-prod-secret-2024, FRONTEND_URL=<your-vercel-url>"

# Step 4: Deploy Frontend to Vercel
Write-Host "`n=== FRONTEND: Go to https://vercel.com ===" -ForegroundColor Cyan
Write-Host "1. Sign up / Log in at vercel.com"
Write-Host "2. Import your GitHub repo"
Write-Host "3. Root Directory: frontend"
Write-Host "4. Set env var: VITE_API_URL=<your-render-backend-url>/api"

# Step 5: Seed the database
Write-Host "`n=== After both are deployed ===" -ForegroundColor Yellow
Write-Host "Run in the backend directory with the production DATABASE_URL:"
Write-Host "  DATABASE_URL=<render-db-url> npx prisma db seed"

Write-Host "`n=== Demo Credentials ===" -ForegroundColor Green
Write-Host "Admin: admin@belnaturels.com / admin123"
Write-Host "Staff: operations@belnaturels.com / staff123"
