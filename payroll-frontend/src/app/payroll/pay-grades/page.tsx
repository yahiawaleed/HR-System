'use client';

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

type PayGrade = {
  _id: string;
  grade: string;
  baseSalary: number;
  grossSalary: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function PayGradesPage() {
  const [grades, setGrades] = useState<PayGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    grade: "",
    baseSalary: "",
    grossSalary: "",
  });

  async function loadGrades() {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<PayGrade[]>(
        `${API_BASE}/payroll-configuration/pay-grades`
      );
      setGrades(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pay grades.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrades();
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const baseSalary = Number(form.baseSalary);
    const grossSalary = Number(form.grossSalary);

    if (!form.grade.trim()) {
      setError("Grade is required.");
      return;
    }
    if (
      Number.isNaN(baseSalary) ||
      Number.isNaN(grossSalary) ||
      baseSalary < 6000 ||
      grossSalary < 6000
    ) {
      setError("Base and gross salary must be numbers ≥ 6000.");
      return;
    }

    try {
      setSaving(true);
      await axios.post(`${API_BASE}/payroll-configuration/pay-grades`, {
        grade: form.grade,
        baseSalary,
        grossSalary,
        // status will default to draft in the schema
      });

      setForm({ grade: "", baseSalary: "", grossSalary: "" });
      await loadGrades();
    } catch (err) {
      console.error(err);
      setError("Failed to create pay grade (grade must be unique).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pay grades</h1>
        <p className="text-sm text-gray-400">
          Define salary grades such as Junior TA, Mid TA, Senior TA with base and gross salary.
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-4 items-end"
      >
        <div className="flex flex-col min-w-[220px]">
          <label className="text-xs mb-1 text-gray-300">Grade (unique)</label>
          <input
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            placeholder="Junior TA"
            value={form.grade}
            onChange={(e) => updateField("grade", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label className="text-xs mb-1 text-gray-300">Base salary (≥ 6000)</label>
          <input
            type="number"
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.baseSalary}
            onChange={(e) => updateField("baseSalary", e.target.value)}
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label className="text-xs mb-1 text-gray-300">Gross salary (≥ 6000)</label>
          <input
            type="number"
            className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
            value={form.grossSalary}
            onChange={(e) => updateField("grossSalary", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add grade"}
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
            Existing pay grades
          </h2>
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
        </div>

        {grades.length === 0 && !loading ? (
          <div className="p-4 text-sm text-gray-500">
            No pay grades configured yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-2 text-left">Grade</th>
                <th className="px-4 py-2 text-left">Base salary</th>
                <th className="px-4 py-2 text-left">Gross salary</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g._id} className="border-t border-gray-800">
                  <td className="px-4 py-2">{g.grade}</td>
                  <td className="px-4 py-2">{g.baseSalary}</td>
                  <td className="px-4 py-2">{g.grossSalary}</td>
                  <td className="px-4 py-2 capitalize">{g.status}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {g.createdAt
                      ? new Date(g.createdAt).toLocaleString()
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
