'use client';

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

type Benefit = {
  _id: string;
  name: string;
  amount: number;
  terms?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    terms: "",
  });

  async function loadBenefits() {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<Benefit[]>(
        `${API_BASE}/payroll-configuration/benefits`
      );
      setBenefits(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load benefits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBenefits();
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amount = Number(form.amount);
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (Number.isNaN(amount) || amount < 0) {
      setError("Amount must be a number ≥ 0.");
      return;
    }

    try {
      setCreating(true);
      await axios.post(`${API_BASE}/payroll-configuration/benefits`, {
        name: form.name,
        amount,
        terms: form.terms || undefined,
        // status will default to draft via schema
      });

      setForm({ name: "", amount: "", terms: "" });
      await loadBenefits();
    } catch (err) {
      console.error(err);
      setError("Failed to create benefit (name must be unique).");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Termination & resignation benefits</h1>
        <p className="text-sm text-gray-400">
          Configure end-of-service gratuity and other benefits granted on termination or resignation.
        </p>
    </div>

      {/* Creation form */}
      <form
        onSubmit={handleCreate}
        className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-4 items-end"
      >
        <div className="flex flex-col min-w-[200px]">
          <label className="text-xs mb-1 text-gray-300">Benefit name</label>
          <input
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            placeholder="End of Service Gratuity"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs mb-1 text-gray-300">Amount</label>
          <input
            type="number"
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.amount}
            onChange={(e) => updateField("amount", e.target.value)}
          />
        </div>

        <div className="flex-1 min-w-[220px] flex flex-col">
          <label className="text-xs mb-1 text-gray-300">Terms (optional)</label>
          <input
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            placeholder="e.g. payable after 5 years of service"
            value={form.terms}
            onChange={(e) => updateField("terms", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium disabled:opacity-60"
        >
          {creating ? "Saving…" : "Add benefit"}
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-300 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Table list */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-200">
            Existing benefits
          </h2>
          {loading && (
            <span className="text-xs text-gray-400">Loading…</span>
          )}
        </div>

        {benefits.length === 0 && !loading ? (
          <div className="p-4 text-sm text-gray-500">
            No termination benefits configured yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Terms</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {benefits.map((b) => (
                <tr key={b._id} className="border-t border-gray-800">
                  <td className="px-4 py-2">{b.name}</td>
                  <td className="px-4 py-2">{b.amount}</td>
                  <td className="px-4 py-2">
                    {b.terms || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-4 py-2 capitalize">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
