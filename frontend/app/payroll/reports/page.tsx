'use client';

import { useState, useEffect } from 'react';
import { payrollService } from '@/services/payrollService';

export default function ReportsPage() {
    const [payslips, setPayslips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await payrollService.getPayslips();
            setPayslips(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load payslips:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Payroll Reports</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Recent Payslips</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="space-y-2">
                        {payslips.length === 0 ? (
                            <p className="text-gray-500">No payslips found.</p>
                        ) : (
                            <ul>
                                {payslips.map((ps: any) => (
                                    <li key={ps._id} className="border-b py-2">
                                        Payslip for {ps.employeeName} - {new Date(ps.createdAt).toLocaleDateString()}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
