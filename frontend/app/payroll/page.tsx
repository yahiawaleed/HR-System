'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { payrollService } from '@/services/payrollService';

export default function PayrollPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNewRun = async () => {
    if (!confirm('Start a new payroll run for the current month?')) return;

    setLoading(true);
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await payrollService.initiatePayroll(start, end);
      alert('Payroll run initiated successfully!');
      // router.push('/dashboard/payroll/runs'); // TODO: Redirect to runs list when page exists
    } catch (error: any) {
      alert('Failed to initiate payroll: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <button
          onClick={handleNewRun}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : '+ New Payroll Run'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuration</h2>
          <p className="text-gray-600 text-sm mb-4">
            Manage pay grades, tax rules, and benefits configuration.
          </p>
          <Link
            href="/payroll/configuration"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block"
          >
            Configure →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Processing</h2>
          <p className="text-gray-600 text-sm mb-4">
            Initiate and process payroll runs for employees.
          </p>
          <Link
            href="/payroll/processing"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block"
          >
            Process →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Reports</h2>
          <p className="text-gray-600 text-sm mb-4">
            Generate payroll reports and analytics.
          </p>
          <Link
            href="/payroll/reports"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block"
          >
            View Reports →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">My Claims</h2>
          <p className="text-gray-600 text-sm mb-4">
            Submit expense claims and track reimbursement status.
          </p>
          <Link
            href="/payroll/claims"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block"
          >
            Manage Claims →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">My Disputes</h2>
          <p className="text-gray-600 text-sm mb-4">
            Raise issues regarding your salary or payslips.
          </p>
          <Link
            href="/payroll/disputes"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block"
          >
            View Disputes →
          </Link>
        </div>
      </div>
    </div>
  );
}
