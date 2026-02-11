import type { User, Balance, FxQuote, Payout, PayoutInput, DashboardData } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  async getDashboard(): Promise<DashboardData> {
    return this.request('/dashboard');
  }

  async getBalances(): Promise<{ balances: Record<string, Balance[]>; raw: Balance[] }> {
    return this.request('/balances');
  }

  async refreshBalances(): Promise<{ message: string; count: number }> {
    return this.request('/balances/refresh', { method: 'POST' });
  }

  async getFxQuotes(): Promise<{ quotes: FxQuote[] }> {
    return this.request('/fx-quotes');
  }

  async refreshFxQuotes(): Promise<{ message: string; count: number }> {
    return this.request('/fx-quotes/refresh', { method: 'POST' });
  }

  async getPayouts(filters?: { status?: string; provider?: string }): Promise<{ payouts: Payout[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.provider) params.set('provider', filters.provider);
    const query = params.toString();
    return this.request(`/payouts${query ? `?${query}` : ''}`);
  }

  async getPayout(id: string): Promise<{ payout: Payout }> {
    return this.request(`/payouts/${id}`);
  }

  async createPayout(data: PayoutInput): Promise<{ message: string; payout: Payout }> {
    return this.request('/payouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayout(id: string, data: Partial<PayoutInput>): Promise<{ message: string; payout: Payout }> {
    return this.request(`/payouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayout(id: string): Promise<{ message: string }> {
    return this.request(`/payouts/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();
export default api;
