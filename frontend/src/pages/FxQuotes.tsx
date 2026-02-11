import { useState, useEffect } from 'react';
import api from '../services/api';
import type { FxQuote } from '../types';

export default function FxQuotes() {
  const [quotes, setQuotes] = useState<FxQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchQuotes = async () => {
    try {
      const { quotes } = await api.getFxQuotes();
      setQuotes(quotes);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch FX quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.refreshFxQuotes();
      await fetchQuotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh FX quotes');
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
          <h1 className="text-2xl font-bold text-gray-900">FX Quotes</h1>
          <p className="text-gray-600 mt-1">Mid-market exchange rates</p>
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
            <>🔄 Refresh Rates</>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quotes.map((quote) => (
          <div key={quote.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{quote.corridor}</span>
              <span className="text-2xl">💱</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {quote.midRate.toLocaleString(undefined, { 
                minimumFractionDigits: quote.targetCurrency === 'BRL' ? 4 : 2,
                maximumFractionDigits: quote.targetCurrency === 'BRL' ? 4 : 2 
              })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              1 {quote.sourceCurrency} = {quote.midRate.toLocaleString()} {quote.targetCurrency}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Rate Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">Corridor</th>
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium">Target</th>
                <th className="px-6 py-3 font-medium text-right">Mid Rate</th>
                <th className="px-6 py-3 font-medium text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{quote.corridor}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {quote.sourceCurrency}
                      </span>
                      {quote.sourceCurrency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {quote.targetCurrency}
                      </span>
                      {quote.targetCurrency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-gray-900">
                      {quote.midRate.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {new Date(quote.fetchedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {quotes.length === 0 && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No FX quotes found</p>
        </div>
      )}
    </div>
  );
}
