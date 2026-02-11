export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Balance {
  provider: string;
  currency: string;
  amount: number;
  updatedAt: string;
}

export interface FxQuote {
  id: string;
  corridor: string;
  sourceCurrency: string;
  targetCurrency: string;
  midRate: number;
  fetchedAt: string;
}

export interface Payout {
  id: string;
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
  status: 'Draft' | 'Approved' | 'Sent' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
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

export interface DashboardSummary {
  totalsByCurrency: { currency: string; total: number }[];
  totalsByProvider: { provider: string; currency: string; total: number }[];
  payoutsByStatus: { status: string; count: number }[];
  payoutAmountsByStatus: { status: string; currency: string; total: number }[];
}

export interface DashboardData {
  summary: DashboardSummary;
  recentPayouts: {
    id: string;
    beneficiaryName: string;
    corridor: string;
    sourceAmount: number;
    sourceCurrency: string;
    status: string;
    provider: string;
    createdAt: string;
    createdBy: string;
  }[];
}
