import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const balances = await prisma.balance.findMany({
      orderBy: [{ provider: 'asc' }, { currency: 'asc' }],
    });
    
    const grouped = balances.reduce((acc, balance) => {
      if (!acc[balance.provider]) {
        acc[balance.provider] = [];
      }
      acc[balance.provider].push({
        currency: balance.currency,
        amount: Number(balance.amount),
        updatedAt: balance.updatedAt,
      });
      return acc;
    }, {} as Record<string, Array<{ currency: string; amount: number; updatedAt: Date }>>);

    res.json({
      balances: grouped,
      raw: balances.map(b => ({
        ...b,
        amount: Number(b.amount),
      })),
    });
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const balances = await prisma.balance.findMany();
    res.json({
      message: 'Balances refreshed',
      count: balances.length,
      balances: balances.map(b => ({ ...b, amount: Number(b.amount) })),
    });
  } catch (error) {
    console.error('Error refreshing balances:', error);
    res.status(500).json({ error: 'Failed to refresh balances' });
  }
});

router.get('/by-currency', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const totals = await prisma.balance.groupBy({
      by: ['currency'],
      _sum: { amount: true },
    });
    res.json({
      totals: totals.map(t => ({
        currency: t.currency,
        total: Number(t._sum.amount) || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching currency totals:', error);
    res.status(500).json({ error: 'Failed to fetch currency totals' });
  }
});

export default router;
