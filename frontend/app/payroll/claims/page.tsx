'use client';

import { useState, useEffect } from 'react';
import { payrollService } from '@/services/payrollService';

export default function ClaimsPage() {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        description: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await payrollService.getClaims();
            setClaims(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load claims:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await payrollService.createClaim({
                ...formData,
                amount: Number(formData.amount),
                payrollId: 'dummy-id', // TODO: User needs to select a payroll run or context
                employeeId: 'current-user-id', // Backend should extract from token
            });
            alert('Claim submitted successfully');
            setShowForm(false);
            loadData();
        } catch (error) {
            alert('Failed to submit claim');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : '+ New Claim'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
                    <h2 className="text-lg font-medium mb-4">Submit New Claim</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="expense">Expense Reimbursement</option>
                                <option value="allowance">Allowance Request</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows={3}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            Submit Claim
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : claims.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No claims found.</td></tr>
                        ) : (
                            claims.map((claim) => (
                                <tr key={claim._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(claim.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{claim.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${claim.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${claim.status.includes('APPROVED') ? 'bg-green-100 text-green-800' :
                                                claim.status.includes('REJECTED') ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {claim.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
