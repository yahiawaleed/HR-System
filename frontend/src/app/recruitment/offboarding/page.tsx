"use client";

import { useEffect, useState } from 'react';
import { UserMinus } from 'lucide-react';

// Mock Data for Employees
const MOCK_EMPLOYEES = [
    { id: '1', name: 'John Doe', department: 'Engineering', role: 'Senior Developer' },
    { id: '2', name: 'Jane Smith', department: 'HR', role: 'Recruiter' },
    { id: '3', name: 'Alice Johnson', department: 'Marketing', role: 'Manager' },
];

export default function OffboardingPage() {
    // Simulating loading state
    const [loading, setLoading] = useState(false);

    const handleOffboard = (employeeName: string) => {
        alert(`${employeeName} offboarded.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Offboarding</h1>
                    <p className="text-neutral-500 mt-1">Manage employee exits.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Employee</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Department</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {MOCK_EMPLOYEES.map((employee) => (
                            <tr key={employee.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                                            {employee.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-neutral-900">{employee.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {employee.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {employee.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleOffboard(employee.name)}
                                        className="inline-flex items-center space-x-1 text-red-600 hover:text-red-900 font-medium"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                        <span>Offboard</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
