// src/app/(protected)/payroll-config/pay-types/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/apiClient'; // whatever you use

type PayType = {
  _id: string;
  type: string;
  amount: number;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
};

export default function PayTypesPage() {
  const [payTypes, setPayTypes] = useState<PayType[]>([]);
  const [type, setType] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const fetchPayTypes = async () => {
    const res = await axios.get<PayType[]>('/payroll-configuration/pay-types');
    setPayTypes(res.data);
  };

  useEffect(() => {
    fetchPayTypes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || amount === '') return;

    setLoading(true);
    try {
      await axios.post('/payroll-configuration/pay-types', {
        type,
        amount: Number(amount),
      });
      setType('');
      setAmount('');
      await fetchPayTypes();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pay Types</h1>
        <p className="text-sm text-muted-foreground">
          Define how employees are paid (monthly, hourly, etc.). These are used in pay grades and payroll calculations.
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-4 rounded-xl border p-4"
      >
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Type name</label>
          <input
            className="rounded-md border px-3 py-2 bg-background"
            placeholder="Monthly, Hourly, Commission..."
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Base amount</label>
          <input
            type="number"
            className="rounded-md border px-3 py-2 bg-background"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md px-4 py-2 text-sm font-medium border"
        >
          {loading ? 'Saving...' : 'Add Pay Type'}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {payTypes.map((pt) => (
              <tr key={pt._id} className="border-t">
                <td className="px-4 py-2">{pt.type}</td>
                <td className="px-4 py-2">{pt.amount.toLocaleString()}</td>
                <td className="px-4 py-2">{pt.status}</td>
              </tr>
            ))}

            {payTypes.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-4 text-center text-muted-foreground"
                >
                  No pay types configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
