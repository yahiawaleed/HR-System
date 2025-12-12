'use client';

import { useState, useEffect } from 'react';
import { payrollService } from '@/services/payrollService';

export default function ConfigurationPage() {
    const [payGrades, setPayGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await payrollService.getPayGrades();
            setPayGrades(data);
        } catch (error) {
            console.error('Failed to load pay grades:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Payroll Configuration</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Pay Grades</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="space-y-2">
                        {payGrades.length === 0 ? (
                            <p className="text-gray-500">No pay grades configured.</p>
                        ) : (
                            <ul>
                                {payGrades.map((pg: any) => (
                                    <li key={pg._id} className="border-b py-2">{pg.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
