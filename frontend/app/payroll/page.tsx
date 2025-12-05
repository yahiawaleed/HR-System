'use client';

export default function PayrollPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + New Payroll Run
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuration</h2>
          <p className="text-gray-600 text-sm mb-4">
            Manage pay grades, tax rules, and benefits configuration.
          </p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Configure →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Processing</h2>
          <p className="text-gray-600 text-sm mb-4">
            Initiate and process payroll runs for employees.
          </p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Process →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Reports</h2>
          <p className="text-gray-600 text-sm mb-4">
            Generate payroll reports and analytics.
          </p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Reports →
          </button>
        </div>
      </div>
    </div>
  );
}

