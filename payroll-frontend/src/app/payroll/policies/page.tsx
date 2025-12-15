'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type PolicyType =
  | 'Deduction'
  | 'Allowance'
  | 'Benefit'
  | 'Misconduct'
  | 'Leave';

type Applicability =
  | 'All Employees'
  | 'Full Time Employees'
  | 'Part Time Employees'
  | 'Contractors';

interface Policy {
  _id: string;
  policyName: string;
  policyType: PolicyType;
  description: string;
  effectiveDate: string;
  applicability: Applicability;
  status: string;
  ruleDefinition: {
    percentage: number;
    fixedAmount: number;
    thresholdAmount: number;
  };
  createdAt?: string;
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyName, setPolicyName] = useState('');
  const [policyType, setPolicyType] = useState<PolicyType>('Deduction');
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(''); // YYYY-MM-DD
  const [applicability, setApplicability] =
    useState<Applicability>('All Employees');
  const [percentage, setPercentage] = useState<number | ''>('');
  const [fixedAmount, setFixedAmount] = useState<number | ''>('');
  const [thresholdAmount, setThresholdAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      setError(null);
      const res = await api.get<Policy[]>('/payroll-configuration/policies');
      setPolicies(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load policies');
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !policyName ||
      !description ||
      !effectiveDate ||
      percentage === '' ||
      fixedAmount === '' ||
      thresholdAmount === '' ||
      Number(percentage) < 0 ||
      Number(percentage) > 100 ||
      Number(fixedAmount) < 0 ||
      Number(thresholdAmount) < 1
    ) {
      setError(
        'All fields are required. Percentage 0–100, fixed ≥ 0, threshold ≥ 1.',
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post('/payroll-configuration/policies', {
        policyName,
        policyType,
        description,
        effectiveDate, // string; backend will parse as Date
        applicability,
        ruleDefinition: {
          percentage: Number(percentage),
          fixedAmount: Number(fixedAmount),
          thresholdAmount: Number(thresholdAmount),
        },
      });

      setPolicyName('');
      setDescription('');
      setEffectiveDate('');
      setApplicability('All Employees');
      setPercentage('');
      setFixedAmount('');
      setThresholdAmount('');
      await fetchPolicies();
    } catch (err) {
      console.error(err);
      setError('Error creating policy');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      setError(null);

      await api.patch(
        `/payroll-configuration/policies/${id}/status`,
        null,
        { params: { status } },
      );

      await fetchPolicies();
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
          Payroll Policies
        </h1>
        <p className="text-sm text-slate-600">
          Define company rules for deductions, allowances, and benefits.
        </p>
      </header>

      <section className="bg-white rounded-xl shadow p-4 md:p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create new policy</h2>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 md:grid-cols-2 items-start"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Policy name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              placeholder="e.g. Late Attendance Deduction"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Policy type
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value as PolicyType)}
            >
              <option value="Deduction">Deduction</option>
              <option value="Allowance">Allowance</option>
              <option value="Benefit">Benefit</option>
              <option value="Misconduct">Misconduct</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Effective date
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Applicability
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
              value={applicability}
              onChange={(e) =>
                setApplicability(e.target.value as Applicability)
              }
            >
              <option value="All Employees">All Employees</option>
              <option value="Full Time Employees">
                Full Time Employees
              </option>
              <option value="Part Time Employees">
                Part Time Employees
              </option>
              <option value="Contractors">Contractors</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain when and how this policy is applied."
            />
          </div>

          {/* Rule definition */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Percentage (%)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={percentage}
              onChange={(e) =>
                setPercentage(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              placeholder="e.g. 10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Fixed amount
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={fixedAmount}
              onChange={(e) =>
                setFixedAmount(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              placeholder="e.g. 500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Threshold amount
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={thresholdAmount}
              onChange={(e) =>
                setThresholdAmount(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              placeholder="e.g. 3 days, 1000 EGP..."
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <section className="bg-white rounded-xl shadow p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Existing policies</h2>
          <button
            onClick={fetchPolicies}
            disabled={loading}
            className="text-sm text-sky-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {policies.length === 0 ? (
          <p className="text-sm text-slate-600">
            No policies found. Create one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border-b px-3 py-2 text-left">Name</th>
                  <th className="border-b px-3 py-2 text-left">Type</th>
                  <th className="border-b px-3 py-2 text-left">Rate / Fixed</th>
                  <th className="border-b px-3 py-2 text-left">
                    Threshold
                  </th>
                  <th className="border-b px-3 py-2 text-left">
                    Applicability
                  </th>
                  <th className="border-b px-3 py-2 text-left">Status</th>
                  <th className="border-b px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="border-b px-3 py-2">{p.policyName}</td>
                    <td className="border-b px-3 py-2">{p.policyType}</td>
                    <td className="border-b px-3 py-2">
                      {p.ruleDefinition.percentage}% /{' '}
                      {p.ruleDefinition.fixedAmount}
                    </td>
                    <td className="border-b px-3 py-2">
                      {p.ruleDefinition.thresholdAmount}
                    </td>
                    <td className="border-b px-3 py-2">
                      {p.applicability}
                    </td>
                    <td className="border-b px-3 py-2 capitalize">
                      {p.status}
                    </td>
                    <td className="border-b px-3 py-2 space-x-2">
                      <button
                        onClick={() =>
                          handleChangeStatus(p._id, 'approved')
                        }
                        disabled={loading || p.status === 'approved'}
                        className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleChangeStatus(p._id, 'archived')
                        }
                        disabled={loading || p.status === 'archived'}
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
