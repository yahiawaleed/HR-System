'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Allowance {
  _id: string;
  name: string;
  amount: number;
  status: string;
  createdAt?: string;
}

export default function AllowancesPage() {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllowances = async () => {
    try {
      setError(null);
      const res = await api.get<Allowance[]>('/payroll-configuration/allowances');
      setAllowances(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load allowances');
    }
  };

  useEffect(() => {
    fetchAllowances();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount === '' || Number(amount) < 0) {
      setError('Please enter a valid name and non-negative amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/payroll-configuration/allowances', {
        name,
        amount: Number(amount),
      });
      setName('');
      setAmount('');
      await fetchAllowances();
    } catch (err) {
      console.error(err);
      setError('Error creating allowance');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.patch(
        `/payroll-configuration/allowances/${id}/status`,
        null,
        { params: { status } },
      );
      await fetchAllowances();
    } catch (err) {
      console.error(err);
      setError('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Allowances
        </h1>
        <p className="text-sm text-slate-600">
          Create and manage fixed allowances (Housing, Transport, etc.).
        </p>
      </header>

      <section className="bg-white rounded-xl shadow p-4 md:p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create new allowance</h2>
        <form
          onSubmit={handleCreate}
          className="flex flex-col md:flex-row gap-4 items-start md:items-end"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Housing Allowance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Amount
            </label>
            <input
              type="number"
              className="mt-1 w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="2000"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Create'}
          </button>
        </form>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <section className="bg-white rounded-xl shadow p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Existing allowances</h2>
          <button
            onClick={fetchAllowances}
            disabled={loading}
            className="text-sm text-sky-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {allowances.length === 0 ? (
          <p className="text-sm text-slate-600">
            No allowances found. Create one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border-b px-3 py-2 text-left">Name</th>
                  <th className="border-b px-3 py-2 text-left">Amount</th>
                  <th className="border-b px-3 py-2 text-left">Status</th>
                  <th className="border-b px-3 py-2 text-left">Created</th>
                  <th className="border-b px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allowances.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50">
                    <td className="border-b px-3 py-2">{a.name}</td>
                    <td className="border-b px-3 py-2">{a.amount}</td>
                    <td className="border-b px-3 py-2 capitalize">
                      {a.status}
                    </td>
                    <td className="border-b px-3 py-2">
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="border-b px-3 py-2 space-x-2">
                      <button
                        onClick={() => handleChangeStatus(a._id, 'approved')}
                        disabled={loading || a.status === 'approved'}
                        className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleChangeStatus(a._id, 'archived')}
                        disabled={loading || a.status === 'archived'}
                        className="rounded-md bg-slate-600 px-3 py-1 text-xs text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
