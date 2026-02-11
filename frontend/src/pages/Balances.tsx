import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Balance } from '../types';

const formatCurrency = (amount: number, currency: string) => {
  const decimals = (currency === 'CLP' || currency === 'COP') ? 0 : 2;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

const providerColors: Record<string, string> = {
  Global66: 'bg-blue-500',
  Bitso: 'bg-orange-500',
  Wise: 'bg-green-500',
  'Bank-CL': 'bg-purple-500',
};

export default function Balances() {
  const [balances, setBalances] = useState<Record<string, Balance[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchBalances = async () => {
    try {
      const { balances } = await api.getBalances();
      setBalances(balances);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.refreshBalances();
      await fetchBalances();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh balances');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Balances</h1>
          <p className="text-gray-600 mt-1">Account balances across all providers</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {refreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Refreshing...
            </>
          ) : (
            <>🔄 Refresh Balances</>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(balances).map(([provider, providerBalances]) => (
          <div key={provider} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className={`${providerColors[provider] || 'bg-gray-500'} px-6 py-4`}>
              <h2 className="text-lg font-semibold text-white">{provider}</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Currency</th>
                    <th className="pb-3 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {providerBalances.map((balance) => (
                    <tr key={balance.currency} className="border-b border-gray-50 last:border-0">
                      <td className="py-3">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                            {balance.currency}
                          </span>
                          <span className="font-medium text-gray-900">{balance.currency}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(balance.amount, balance.currency)}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Updated {new Date(balance.updatedAt).toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(balances).length === 0 && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No balances found</p>
        </div>
      )}
    </div>
  );
}
