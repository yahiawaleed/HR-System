"use client";

import { useEffect, useState } from 'react';
import { ApplicationsService, Application } from '@/services/applications.service';
import { Users, UserPlus } from 'lucide-react';

export default function OnboardingPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ideally filter for status = HIRED, but showing all for demo
        ApplicationsService.findAll().then(setApplications).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleOnboard = (app: Application) => {
        // Simple flyout/alert as requested
        alert(`Onboarding process started for Candidate ${app.candidateId}`);
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading candidates...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Onboarding</h1>
                    <p className="text-neutral-500 mt-1">Initiate onboarding for hired candidates.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Candidate</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {applications.map((app) => (
                            <tr key={app._id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            {app.candidateId.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-neutral-900">{app.candidateId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'HIRED' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                                        }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleOnboard(app)}
                                        className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-900 font-medium"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Onboard</span>
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
