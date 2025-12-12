'use client';

import { useState, useEffect } from 'react';
import { payrollService } from '@/services/payrollService';

export default function ProcessingPage() {
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await payrollService.getAll();
            // Backend currently returns { message: ... } object, or array if implemented
            setRuns(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load runs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Payroll Processing</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Active Runs</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="space-y-2">
                        {runs.length === 0 ? (
                            <p className="text-gray-500">No active payroll runs.</p>
                        ) : (
                            <ul>
                                {runs.map((run: any) => (
                                    <li key={run._id} className="border-b py-2">
                                        {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
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
