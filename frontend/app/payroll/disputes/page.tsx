'use client';

import { useState, useEffect } from 'react';
import { payrollService } from '@/services/payrollService';

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        reason: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await payrollService.getDisputes();
            setDisputes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await payrollService.createDispute({
                ...formData,
                payrollId: 'dummy-payroll-id', // TODO: Allow selection of specific payslip/payroll
            });
            alert('Dispute raised successfully');
            setShowForm(false);
            loadData();
        } catch (error) {
            alert('Failed to raise dispute');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Disputes</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    {showForm ? 'Cancel' : 'Raise Dispute'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
                    <h2 className="text-lg font-medium mb-4">Raise a Salary Dispute</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Reason / Description</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows={4}
                                placeholder="Describe the discrepancy in your salary..."
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                            Submit Dispute
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : disputes.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No active disputes.</td></tr>
                        ) : (
                            disputes.map((dispute) => (
                                <tr key={dispute._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(dispute.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{dispute.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${dispute.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                                                dispute.status.includes('RESOLVED') ? 'bg-green-100 text-green-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {dispute.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{dispute.resolutionNotes || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
