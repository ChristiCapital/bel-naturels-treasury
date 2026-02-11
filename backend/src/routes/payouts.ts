import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

const payoutCreateSchema = z.object({
  beneficiaryName: z.string().min(1, 'Beneficiary name is required'),
  beneficiaryBank: z.string().optional(),
  beneficiaryAcct: z.string().optional(),
  corridor: z.string().min(1, 'Corridor is required'),
  sourceCurrency: z.string().length(3, 'Source currency must be 3 characters'),
  targetCurrency: z.string().length(3, 'Target currency must be 3 characters'),
  sourceAmount: z.number().positive('Amount must be positive'),
  targetAmount: z.number().positive().optional(),
  exchangeRate: z.number().positive().optional(),
  provider: z.enum(['Global66', 'Bitso', 'Wise', 'Bank-CL']),
  status: z.enum(['Draft', 'Approved', 'Sent', 'Completed', 'Cancelled']).default('Draft'),
  notes: z.string().optional(),
});

const payoutUpdateSchema = payoutCreateSchema.partial();

router.use(authenticateToken);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { status, provider } = req.query;

    const where: Record<string, string> = {};
    if (status && typeof status === 'string') where.status = status;
    if (provider && typeof provider === 'string') where.provider = provider;

    const payouts = await prisma.payout.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      payouts: payouts.map(p => ({
        ...p,
        sourceAmount: Number(p.sourceAmount),
        targetAmount: p.targetAmount ? Number(p.targetAmount) : null,
        exchangeRate: p.exchangeRate ? Number(p.exchangeRate) : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const payout = await prisma.payout.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!payout) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    res.json({
      payout: {
        ...payout,
        sourceAmount: Number(payout.sourceAmount),
        targetAmount: payout.targetAmount ? Number(payout.targetAmount) : null,
        exchangeRate: payout.exchangeRate ? Number(payout.exchangeRate) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching payout:', error);
    res.status(500).json({ error: 'Failed to fetch payout' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const data = payoutCreateSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const payout = await prisma.payout.create({
      data: {
        ...data,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Payout created successfully',
      payout: {
        ...payout,
        sourceAmount: Number(payout.sourceAmount),
        targetAmount: payout.targetAmount ? Number(payout.targetAmount) : null,
        exchangeRate: payout.exchangeRate ? Number(payout.exchangeRate) : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating payout:', error);
    res.status(500).json({ error: 'Failed to create payout' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;
    const data = payoutUpdateSchema.parse(req.body);

    const existing = await prisma.payout.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    if (['Completed', 'Cancelled'].includes(existing.status)) {
      return res.status(400).json({ error: 'Cannot modify completed or cancelled payouts' });
    }

    const payout = await prisma.payout.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      message: 'Payout updated successfully',
      payout: {
        ...payout,
        sourceAmount: Number(payout.sourceAmount),
        targetAmount: payout.targetAmount ? Number(payout.targetAmount) : null,
        exchangeRate: payout.exchangeRate ? Number(payout.exchangeRate) : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating payout:', error);
    res.status(500).json({ error: 'Failed to update payout' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma;
    const { id } = req.params;

    const existing = await prisma.payout.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    if (existing.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft payouts can be deleted' });
    }

    await prisma.payout.delete({ where: { id } });

    res.json({ message: 'Payout deleted successfully' });
  } catch (error) {
    console.error('Error deleting payout:', error);
    res.status(500).json({ error: 'Failed to delete payout' });
  }
});

export default router;
