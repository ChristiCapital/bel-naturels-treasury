import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface DashboardData {
  summary: {
    totalsByCurrency: { currency: string; total: number }[];
    totalsByProvider: { provider: string; currency: string; total: number }[];
    payoutsByStatus: { status: string; count: number }[];
  };
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

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ' + currency;
};

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Approved: 'bg-blue-100 text-blue-800',
  Sent: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Dashboard: Fetching data...');
    api.getDashboard()
      .then((result) => {
        console.log('Dashboard: Data received', result);
        setData(result);
      })
      .catch((err) => {
        console.error('Dashboard: Error', err);
        setError(err.message || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error loading dashboard: {error}
      </div>
    );
  }

  if (!data) {
    return <div className="p-4 text-gray-600">No data available</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Treasury overview for Bel Naturels Spa</p>
      </div>

      {/* Currency Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {data.summary.totalsByCurrency.map((item) => (
          <div key={item.currency} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm font-medium text-gray-500">Total {item.currency}</div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatCurrency(item.total, item.currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Payout Status */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Draft', 'Approved', 'Sent', 'Completed', 'Cancelled'].map((status) => {
            const item = data.summary.payoutsByStatus.find((p) => p.status === status);
            return (
              <div key={status} className="bg-white rounded-xl border border-gray-200 p-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                  {status}
                </span>
                <p className="text-2xl font-bold text-gray-900 mt-2">{item?.count || 0}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Payouts</h2>
          <Link to="/payouts" className="text-sm text-green-600 hover:text-green-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {data.recentPayouts.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No payouts yet</p>
          ) : (
            data.recentPayouts.map((payout) => (
              <Link
                key={payout.id}
                to={`/payouts/${payout.id}`}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded"
              >
                <div>
                  <p className="font-medium text-gray-900">{payout.beneficiaryName}</p>
                  <p className="text-xs text-gray-500">
                    {payout.corridor} via {payout.provider}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(payout.sourceAmount, payout.sourceCurrency)}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[payout.status] || 'bg-gray-100 text-gray-800'}`}>
                    {payout.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-3">
        <Link
          to="/payouts/new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
        >
          + New Payout
        </Link>
        <Link
          to="/balances"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
        >
          View Balances
        </Link>
        <Link
          to="/fx-quotes"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
        >
          Check FX Rates
        </Link>
      </div>
    </div>
  );
}
