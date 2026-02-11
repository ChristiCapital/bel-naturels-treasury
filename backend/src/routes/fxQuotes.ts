import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const quotes = await prisma.fxQuote.findMany({
      orderBy: [{ sourceCurrency: 'asc' }, { targetCurrency: 'asc' }],
    });
    
    res.json({
      quotes: quotes.map(q => ({
        id: q.id,
        corridor: `${q.sourceCurrency}→${q.targetCurrency}`,
        sourceCurrency: q.sourceCurrency,
        targetCurrency: q.targetCurrency,
        midRate: Number(q.midRate),
        fetchedAt: q.fetchedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching FX quotes:', error);
    res.status(500).json({ error: 'Failed to fetch FX quotes' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const quotes = await prisma.fxQuote.findMany();
    res.json({
      message: 'FX quotes refreshed',
      count: quotes.length,
      quotes: quotes.map(q => ({ ...q, midRate: Number(q.midRate) })),
    });
  } catch (error) {
    console.error('Error refreshing FX quotes:', error);
    res.status(500).json({ error: 'Failed to refresh FX quotes' });
  }
});

router.get('/:source/:target', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { source, target } = req.params;
    
    const quote = await prisma.fxQuote.findUnique({
      where: {
        sourceCurrency_targetCurrency: {
          sourceCurrency: source.toUpperCase(),
          targetCurrency: target.toUpperCase(),
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({
      corridor: `${quote.sourceCurrency}→${quote.targetCurrency}`,
      sourceCurrency: quote.sourceCurrency,
      targetCurrency: quote.targetCurrency,
      midRate: Number(quote.midRate),
      fetchedAt: quote.fetchedAt,
    });
  } catch (error) {
    console.error('Error fetching specific quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

export default router;
