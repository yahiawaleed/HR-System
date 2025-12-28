'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function MyPayslipsPage() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.employeeId) {
      fetchPayslips();
    } else if (user && !user.employeeId) {
        // If user is loaded but has no employeeId (e.g. admin without profile), stop loading
        setLoading(false);
    }
  }, [user]);

  const fetchPayslips = async () => {
    try {
      const response = await api.get(`/payroll-tracking/payslips/employee/${user.employeeId}`);
      setPayslips(response.data);
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading payslips...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Payslips</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {payslips.length === 0 ? (
            <li className="p-4 text-center text-gray-500">No payslips found.</li>
          ) : (
            payslips.map((payslip) => (
              <li key={payslip._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Payroll Run: {payslip.payrollRunId}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {payslip.paymentStatus}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Net Pay: {payslip.netPay}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Gross: {payslip.totalGrossSalary}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
