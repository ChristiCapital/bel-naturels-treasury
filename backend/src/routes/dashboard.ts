import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;

    const currencyTotals = await prisma.balance.groupBy({
      by: ['currency'],
      _sum: { amount: true },
    });

    const providerTotals = await prisma.balance.groupBy({
      by: ['provider', 'currency'],
      _sum: { amount: true },
    });

    const payoutCounts = await prisma.payout.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const recentPayouts = await prisma.payout.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    const payoutAmounts = await prisma.payout.groupBy({
      by: ['status', 'sourceCurrency'],
      _sum: { sourceAmount: true },
    });

    res.json({
      summary: {
        totalsByCurrency: currencyTotals.map(t => ({
          currency: t.currency,
          total: Number(t._sum.amount) || 0,
        })),
        totalsByProvider: providerTotals.map(t => ({
          provider: t.provider,
          currency: t.currency,
          total: Number(t._sum.amount) || 0,
        })),
        payoutsByStatus: payoutCounts.map(p => ({
          status: p.status,
          count: p._count.id,
        })),
        payoutAmountsByStatus: payoutAmounts.map(p => ({
          status: p.status,
          currency: p.sourceCurrency,
          total: Number(p._sum.sourceAmount) || 0,
        })),
      },
      recentPayouts: recentPayouts.map(p => ({
        id: p.id,
        beneficiaryName: p.beneficiaryName,
        corridor: p.corridor,
        sourceAmount: Number(p.sourceAmount),
        sourceCurrency: p.sourceCurrency,
        status: p.status,
        provider: p.provider,
        createdAt: p.createdAt,
        createdBy: p.createdBy.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
