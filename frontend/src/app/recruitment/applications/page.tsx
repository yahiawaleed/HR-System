"use client";

import { useEffect, useState } from 'react';
import { ApplicationsService, Application } from '@/services/applications.service';
import Link from 'next/link';
import { Plus, Users, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const data = await ApplicationsService.findAll();
            setApplications(data);
        } catch (error) {
            console.error("Failed to load applications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await ApplicationsService.updateStatus(id, newStatus);
            loadApplications(); // Reload to refresh data
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading applications...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Applications</h1>
                    <p className="text-neutral-500 mt-1">Track and manage candidate applications.</p>
                </div>
                <Link href="/recruitment/applications/create" className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    <span>New Application</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Candidate</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Applied For</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {applications.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                                    <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                                    No applications found.
                                </td>
                            </tr>
                        ) : (
                            applications.map((app) => (
                                <tr key={app._id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                {app.candidateId ? app.candidateId.substring(0, 2).toUpperCase() : '??'}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-neutral-900">{app.candidateId}</div>
                                                <div className="text-sm text-neutral-500">Resume: {app.resumeUrl || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-neutral-900">
                                            {typeof app.requisitionId === 'object' && app.requisitionId ? app.requisitionId.title : app.requisitionId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'HIRED' ? 'bg-green-100 text-green-800' :
                                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            {app.status !== 'HIRED' && (
                                                <button onClick={() => handleStatusUpdate(app._id, 'HIRED')} className="text-green-600 hover:text-green-900" title="Mark as Hired">
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                            {app.status !== 'REJECTED' && (
                                                <button onClick={() => handleStatusUpdate(app._id, 'REJECTED')} className="text-red-600 hover:text-red-900" title="Reject">
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
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
