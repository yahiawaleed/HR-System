'use client';

import { useEffect, useState } from "react";
import axios from "axios";

type InsuranceBracket = {
  _id: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  employeeRate: number;
  employerRate: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE = "http://localhost:3000";

export default function InsuranceBracketsPage() {
  const [brackets, setBrackets] = useState<InsuranceBracket[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    minSalary: "",
    maxSalary: "",
    employeeRate: "",
    employerRate: "",
  });

  async function loadBrackets() {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<InsuranceBracket[]>(
        `${API_BASE}/payroll-configuration/insurance-brackets`
      );
      setBrackets(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load insurance brackets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBrackets();
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const minSalary = Number(form.minSalary);
    const maxSalary = Number(form.maxSalary);
    const employeeRate = Number(form.employeeRate);
    const employerRate = Number(form.employerRate);

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (Number.isNaN(minSalary) || Number.isNaN(maxSalary)) {
      setError("Min and Max salary must be numbers.");
      return;
    }
    if (minSalary > maxSalary) {
      setError("Min salary cannot be greater than Max salary.");
      return;
    }
    if (
      Number.isNaN(employeeRate) ||
      Number.isNaN(employerRate) ||
      employeeRate < 0 ||
      employerRate < 0 ||
      employeeRate > 100 ||
      employerRate > 100
    ) {
      setError("Rates must be between 0 and 100.");
      return;
    }

    try {
      setSaving(true);
      await axios.post(`${API_BASE}/payroll-configuration/insurance-brackets`, {
        name: form.name,
        minSalary,
        maxSalary,
        employeeRate,
        employerRate,
      });

      setForm({
        name: "",
        minSalary: "",
        maxSalary: "",
        employeeRate: "",
        employerRate: "",
      });

      await loadBrackets();
    } catch (err) {
      console.error(err);
      setError("Failed to create insurance bracket (name must be unique).");
    } finally {
      setSaving(false);
    }
  }

  // --- APPROVE ---
  async function handleApprove(id: string) {
    try {
      setActionLoadingId(id);
      await axios.patch(
        `${API_BASE}/payroll-configuration/insurance-brackets/${id}/approve`,
        { approvedBy: "hr-manager" }
      );
      await loadBrackets();
    } catch (err) {
      console.error(err);
      setError("Failed to approve bracket.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // --- REJECT ---
  async function handleReject(id: string) {
    try {
      setActionLoadingId(id);
      await axios.patch(
        `${API_BASE}/payroll-configuration/insurance-brackets/${id}/reject`,
        { approvedBy: "hr-manager" }
      );
      await loadBrackets();
    } catch (err) {
      console.error(err);
      setError("Failed to reject bracket.");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Insurance Rules</h1>
        <p className="text-sm text-gray-400">
          Configure social insurance contributions, including employee and employer shares.
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-4 items-end"
      >
        <div className="flex flex-col min-w-[180px]">
          <label className="text-xs mb-1 text-gray-300">Name</label>
          <input
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs mb-1 text-gray-300">Min salary</label>
          <input
            type="number"
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.minSalary}
            onChange={(e) => updateField("minSalary", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs mb-1 text-gray-300">Max salary</label>
          <input
            type="number"
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.maxSalary}
            onChange={(e) => updateField("maxSalary", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs mb-1 text-gray-300">Employee %</label>
          <input
            type="number"
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.employeeRate}
            onChange={(e) => updateField("employeeRate", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs mb-1 text-gray-300">Employer %</label>
          <input
            type="number"
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.employerRate}
            onChange={(e) => updateField("employerRate", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add bracket"}
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
            Existing Insurance Rules
          </h2>
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
        </div>

        {brackets.length === 0 && !loading ? (
          <div className="p-4 text-sm text-gray-500">No brackets configured yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Min Salary</th>
                <th className="px-4 py-2 text-left">Max Salary</th>
                <th className="px-4 py-2 text-left">Employee %</th>
                <th className="px-4 py-2 text-left">Employer %</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {brackets.map((b) => (
                <tr key={b._id} className="border-t border-gray-800">
                  <td className="px-4 py-2">{b.name}</td>
                  <td className="px-4 py-2">{b.minSalary}</td>
                  <td className="px-4 py-2">{b.maxSalary}</td>
                  <td className="px-4 py-2">{b.employeeRate}%</td>
                  <td className="px-4 py-2">{b.employerRate}%</td>
                  <td className="px-4 py-2 capitalize">{b.status}</td>

                  {/* ACTION BUTTONS */}
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-green-600 text-white text-xs disabled:opacity-60"
                        disabled={actionLoadingId === b._id}
                        onClick={() => handleApprove(b._id)}
                      >
                        {actionLoadingId === b._id ? "Working…" : "Approve"}
                      </button>

                      <button
                        className="px-3 py-1 rounded bg-red-600 text-white text-xs disabled:opacity-60"
                        disabled={actionLoadingId === b._id}
                        onClick={() => handleReject(b._id)}
                      >
                        {actionLoadingId === b._id ? "Working…" : "Reject"}
                      </button>
                    </div>
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
