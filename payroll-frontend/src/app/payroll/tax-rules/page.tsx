'use client';

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

type TaxRule = {
  _id: string;
  code?: string;
  name: string;
  bracketFrom?: number;
  bracketTo?: number;
  rate: number;
  description?: string;
  status: string;
  createdAt?: string;
};

export default function TaxRulesPage() {
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ keep numbers as strings in inputs
  const [form, setForm] = useState({
    code: "",
    name: "",
    bracketFrom: "0",
    bracketTo: "0",
    rate: "0",          // ✅ WAS "" -> this fixes NaN/validation
    description: "",
  });

  async function loadRules() {
    try {
      setLoading(true);
      const res = await axios.get<TaxRule[]>(
        `${API_BASE}/payroll-configuration/tax-rules`
      );
      setRules(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tax rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  function setField(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      bracketFrom: Number(form.bracketFrom),
      bracketTo: Number(form.bracketTo),
      rate: Number(form.rate),
      description: form.description.trim() || undefined,
    };

    // ✅ validations
    if (!payload.code) return setError("Code is required.");
    if (!payload.name) return setError("Name is required.");

    if (!Number.isFinite(payload.bracketFrom)) return setError("Bracket From is not a valid number.");
    if (!Number.isFinite(payload.bracketTo)) return setError("Bracket To is not a valid number.");
    if (!Number.isFinite(payload.rate)) return setError("Rate is not a valid number.");

    if (payload.bracketFrom < 0) return setError("Bracket From must be ≥ 0.");
    if (payload.bracketTo < 0) return setError("Bracket To must be ≥ 0.");
    if (payload.rate < 0) return setError("Rate must be ≥ 0.");

    if (payload.bracketTo !== 0 && payload.bracketFrom >= payload.bracketTo) {
      return setError("Bracket From must be < Bracket To (unless Bracket To is 0).");
    }

    try {
      setSaving(true);

      console.log("SENDING PAYLOAD:", payload); // ✅ check browser console
      await axios.post(`${API_BASE}/payroll-configuration/tax-rules`, payload);

      setForm({
        code: "",
        name: "",
        bracketFrom: "0",
        bracketTo: "0",
        rate: "0",
        description: "",
      });

      await loadRules();
    } catch (err: any) {
      console.error("AXIOS ERROR:", err?.response?.data || err);
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(" | ") : (msg || "Failed to save tax rule."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tax Rules</h1>
        <p className="text-sm text-gray-400">Define tax brackets and rates.</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-4 items-end"
      >
        <div className="flex flex-col min-w-[160px]">
          <label className="text-xs mb-1 text-gray-300">Code *</label>
          <input
            required
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.code}
            onChange={(e) => setField("code", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[220px]">
          <label className="text-xs mb-1 text-gray-300">Name *</label>
          <input
            required
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label className="text-xs mb-1 text-gray-300">Bracket From *</label>
          <input
            required
            type="number"
            min={0}
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.bracketFrom}
            onChange={(e) => setField("bracketFrom", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[200px]">
          <label className="text-xs mb-1 text-gray-300">Bracket To (0 = No limit) *</label>
          <input
            required
            type="number"
            min={0}
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.bracketTo}
            onChange={(e) => setField("bracketTo", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs mb-1 text-gray-300">Rate % *</label>
          <input
            required
            type="number"
            min={0}
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.rate}
            onChange={(e) => setField("rate", e.target.value)}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-[260px]">
          <label className="text-xs mb-1 text-gray-300">Description</label>
          <input
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Tax Rule"}
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-300 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-200">Existing Tax Rules</h2>
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
        </div>

        {rules.length === 0 && !loading ? (
          <div className="p-4 text-sm text-gray-500">No tax rules configured yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">From</th>
                <th className="px-4 py-2 text-left">To</th>
                <th className="px-4 py-2 text-left">Rate</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r._id} className="border-t border-gray-800">
                  <td className="px-4 py-2">{r.code ?? "—"}</td>
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2">{r.bracketFrom ?? "—"}</td>
                  <td className="px-4 py-2">
                    {r.bracketTo == null ? "—" : (r.bracketTo === 0 ? "No limit" : r.bracketTo)}
                  </td>
                  <td className="px-4 py-2">{r.rate}%</td>
                  <td className="px-4 py-2 capitalize">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
