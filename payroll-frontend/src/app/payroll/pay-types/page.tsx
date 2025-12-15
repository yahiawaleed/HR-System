'use client';

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

type PayType = {
  _id: string;
  type: string;
  amount: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function PayTypesPage() {
  const [payTypes, setPayTypes] = useState<PayType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "",
    amount: "",
  });

  async function loadPayTypes() {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<PayType[]>(
        `${API_BASE}/payroll-configuration/pay-types`
      );
      setPayTypes(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pay types.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayTypes();
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amount = Number(form.amount);

    if (!form.type.trim()) {
      setError("Type is required.");
      return;
    }
    if (Number.isNaN(amount) || amount < 6000) {
      setError("Amount must be a number ≥ 6000.");
      return;
    }

    try {
      setSaving(true);
      await axios.post(`${API_BASE}/payroll-configuration/pay-types`, {
        type: form.type,
        amount,
        // status: defaults to draft on the backend
      });

      setForm({ type: "", amount: "" });
      await loadPayTypes();
    } catch (err) {
      console.error(err);
      setError("Failed to create pay type (type must be unique).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pay types</h1>
        <p className="text-sm text-gray-400">
          Define the different recurring pay types used in payroll runs (e.g. MONTHLY_SALARY).
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-4 items-end"
      >
        <div className="flex flex-col min-w-[200px]">
          <label className="text-xs mb-1 text-gray-300">Type (unique)</label>
          <input
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            placeholder="MONTHLY_SALARY"
            value={form.type}
            onChange={(e) => updateField("type", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label className="text-xs mb-1 text-gray-300">Amount (≥ 6000)</label>
          <input
            type="number"
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.amount}
            onChange={(e) => updateField("amount", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add pay type"}
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-300 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-200">
            Existing pay types
          </h2>
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
        </div>

        {payTypes.length === 0 && !loading ? (
          <div className="p-4 text-sm text-gray-500">No pay types configured yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {payTypes.map((pt) => (
                <tr key={pt._id} className="border-t border-gray-800">
                  <td className="px-4 py-2">{pt.type}</td>
                  <td className="px-4 py-2">{pt.amount}</td>
                  <td className="px-4 py-2 capitalize">{pt.status}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {pt.createdAt
                      ? new Date(pt.createdAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
