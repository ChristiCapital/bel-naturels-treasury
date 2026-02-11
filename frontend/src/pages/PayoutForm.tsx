import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { PayoutInput, FxQuote } from '../types';

const corridors = [
  { value: 'USD->CLP', source: 'USD', target: 'CLP' },
  { value: 'USD->MXN', source: 'USD', target: 'MXN' },
  { value: 'USD->COP', source: 'USD', target: 'COP' },
  { value: 'USD->BRL', source: 'USD', target: 'BRL' },
];

const providers = ['Global66', 'Bitso', 'Wise', 'Bank-CL'];
const statuses = ['Draft', 'Approved', 'Sent', 'Completed', 'Cancelled'];

export default function PayoutForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [quotes, setQuotes] = useState<FxQuote[]>([]);

  const [form, setForm] = useState<PayoutInput>({
    beneficiaryName: '',
    beneficiaryBank: '',
    beneficiaryAcct: '',
    corridor: 'USD->CLP',
    sourceCurrency: 'USD',
    targetCurrency: 'CLP',
    sourceAmount: 0,
    targetAmount: undefined,
    exchangeRate: undefined,
    provider: 'Global66',
    status: 'Draft',
    notes: '',
  });

  const [existingStatus, setExistingStatus] = useState<string>('');

  useEffect(() => {
    api.getFxQuotes().then(({ quotes }) => setQuotes(quotes)).catch(console.error);

    if (isEdit && id) {
      api.getPayout(id)
        .then(({ payout }) => {
          setForm({
            beneficiaryName: payout.beneficiaryName,
            beneficiaryBank: payout.beneficiaryBank || '',
            beneficiaryAcct: payout.beneficiaryAcct || '',
            corridor: payout.corridor,
            sourceCurrency: payout.sourceCurrency,
            targetCurrency: payout.targetCurrency,
            sourceAmount: payout.sourceAmount,
            targetAmount: payout.targetAmount,
            exchangeRate: payout.exchangeRate,
            provider: payout.provider,
            status: payout.status,
            notes: payout.notes || '',
          });
          setExistingStatus(payout.status);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleCorridorChange = (corridor: string) => {
    const selected = corridors.find((c) => c.value === corridor);
    if (selected) {
      const quote = quotes.find(
        (q) => q.sourceCurrency === selected.source && q.targetCurrency === selected.target
      );
      setForm((prev) => ({
        ...prev,
        corridor,
        sourceCurrency: selected.source,
        targetCurrency: selected.target,
        exchangeRate: quote?.midRate,
        targetAmount: quote && prev.sourceAmount ? prev.sourceAmount * quote.midRate : undefined,
      }));
    }
  };

  const handleAmountChange = (amount: number) => {
    setForm((prev) => ({
      ...prev,
      sourceAmount: amount,
      targetAmount: prev.exchangeRate ? amount * prev.exchangeRate : undefined,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const data: PayoutInput = {
        ...form,
        sourceAmount: Number(form.sourceAmount),
        targetAmount: form.targetAmount ? Number(form.targetAmount) : undefined,
        exchangeRate: form.exchangeRate ? Number(form.exchangeRate) : undefined,
      };

      if (isEdit && id) {
        await api.updatePayout(id, data);
      } else {
        await api.createPayout(data);
      }
      navigate('/payouts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payout');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this payout?')) return;
    
    try {
      await api.deletePayout(id);
      navigate('/payouts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payout');
    }
  };

  const isReadOnly = ['Completed', 'Cancelled'].includes(existingStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Payout' : 'New Payout'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Update payout details' : 'Create a new payout instruction'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {isReadOnly && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          This payout is {existingStatus.toLowerCase()} and cannot be modified.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Name *</label>
            <input
              type="text"
              value={form.beneficiaryName}
              onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
              required
              disabled={isReadOnly}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
              placeholder="Supplier name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Bank</label>
              <input
                type="text"
                value={form.beneficiaryBank}
                onChange={(e) => setForm({ ...form, beneficiaryBank: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
                placeholder="Bank name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                value={form.beneficiaryAcct}
                onChange={(e) => setForm({ ...form, beneficiaryAcct: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
                placeholder="Account number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Corridor *</label>
              <select
                value={form.corridor}
                onChange={(e) => handleCorridorChange(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
              >
                {corridors.map((c) => (
                  <option key={c.value} value={c.value}>{c.value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
              >
                {providers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({form.sourceCurrency}) *</label>
              <input
                type="number"
                value={form.sourceAmount || ''}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                required
                min="0"
                step="0.01"
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
              <input
                type="text"
                value={form.exchangeRate?.toLocaleString() || '-'}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target ({form.targetCurrency})</label>
              <input
                type="text"
                value={form.targetAmount?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '-'}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              disabled={isReadOnly}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100 resize-none"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {isEdit && existingStatus === 'Draft' && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/payouts')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : isEdit ? 'Update Payout' : 'Create Payout'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
