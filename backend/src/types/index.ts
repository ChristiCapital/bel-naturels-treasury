import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface BalanceData {
  provider: string;
  currency: string;
  amount: number;
}

export interface FxQuoteData {
  sourceCurrency: string;
  targetCurrency: string;
  midRate: number;
  fetchedAt: Date;
}

export interface PayoutInput {
  beneficiaryName: string;
  beneficiaryBank?: string;
  beneficiaryAcct?: string;
  corridor: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount?: number;
  exchangeRate?: number;
  provider: string;
  status?: string;
  notes?: string;
}

export interface ProviderService {
  getBalances(): Promise<BalanceData[]>;
  getFxQuotes?(): Promise<FxQuoteData[]>;
}
