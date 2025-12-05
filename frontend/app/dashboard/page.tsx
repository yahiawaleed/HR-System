'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { Employee, Payslip, Claim, Dispute } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    payslips: 0,
    pendingClaims: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesRes, departmentsRes, payslipsRes, claimsRes] = await Promise.all([
          apiClient.get('/employees').catch(() => ({ data: [] })),
          apiClient.get('/departments').catch(() => ({ data: [] })),
          apiClient.get('/payslips').catch(() => ({ data: [] })),
          apiClient.get('/claims').catch(() => ({ data: [] })),
        ]);

        setStats({
          employees: employeesRes.data?.length || 0,
          departments: departmentsRes.data?.length || 0,
          payslips: payslipsRes.data?.length || 0,
          pendingClaims: claimsRes.data?.filter((c: Claim) => c.status === 'pending')?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Employees', value: stats.employees, icon: '👥', color: 'bg-blue-500' },
    { title: 'Departments', value: stats.departments, icon: '🏢', color: 'bg-green-500' },
    { title: 'Payslips', value: stats.payslips, icon: '📄', color: 'bg-yellow-500' },
    { title: 'Pending Claims', value: stats.pendingClaims, icon: '📝', color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} rounded-full p-4`}>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to HR Management System</h2>
        <p className="text-gray-600">
          Use the sidebar to navigate to different modules. You can manage employees, departments,
          positions, performance appraisals, payroll, and more.
        </p>
      </div>
    </div>
  );
}

