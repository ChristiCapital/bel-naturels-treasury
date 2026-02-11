import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import balancesRoutes from './routes/balances.js';
import fxQuotesRoutes from './routes/fxQuotes.js';
import payoutsRoutes from './routes/payouts.js';
import dashboardRoutes from './routes/dashboard.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.locals.prisma = prisma;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Bel Naturels Treasury API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/balances', balancesRoutes);
app.use('/api/fx-quotes', fxQuotesRoutes);
app.use('/api/payouts', payoutsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Bel Naturels Treasury API running on http://localhost:${PORT}`);
});

export default app;
