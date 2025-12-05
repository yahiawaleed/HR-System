'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

export default function PerformancePage() {
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const response = await apiClient.get('/performance/appraisals');
      setAppraisals(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch appraisals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
        <div className="space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            + New Cycle
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + New Template
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appraisal Cycles</h2>
          <p className="text-gray-600">Manage and track performance appraisal cycles.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Templates</h2>
          <p className="text-gray-600">Create and manage appraisal templates.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appraisals</h2>
        </div>
        <div className="p-6">
          {appraisals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appraisals found</p>
          ) : (
            <div className="space-y-4">
              {appraisals.map((appraisal) => (
                <div key={appraisal._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {typeof appraisal.employeeId === 'object' && appraisal.employeeId
                          ? `${appraisal.employeeId.firstName} ${appraisal.employeeId.lastName}`
                          : 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Status: {appraisal.status} | Rating: {appraisal.overallRating || 'N/A'}
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

