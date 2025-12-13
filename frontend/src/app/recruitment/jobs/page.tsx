"use client";

import { useEffect, useState } from 'react';
import { JobsService, Job } from '@/services/jobs.service';
import Link from 'next/link';
import { Plus, Briefcase, MapPin, Clock } from 'lucide-react';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const data = await JobsService.findAll();
            setJobs(data);
        } catch (error) {
            console.error("Failed to load jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job?")) return;
        try {
            await JobsService.delete(id);
            setJobs(prev => prev.filter(j => j._id !== id));
        } catch (error) {
            console.error("Failed to delete job", error);
            alert("Failed to delete job");
        }
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading jobs...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Jobs</h1>
                    <p className="text-neutral-500 mt-1">Manage open positions and requisitions.</p>
                </div>
                <Link href="/recruitment/jobs/create" className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    <span>Create Job</span>
                </Link>
            </div>

            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-neutral-300">
                        <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-neutral-900">No jobs found</h3>
                        <p className="text-neutral-500">Get started by creating a new job position.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job._id} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-500">
                                        <span className="flex items-center space-x-1 bg-neutral-100 px-2.5 py-1 rounded-md text-neutral-600">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            <span>{job.department}</span>
                                        </span>
                                        {/* Status badge - Assuming status exists, defaulting if not */}
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${job.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-200' :
                                            job.status === 'CLOSED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-neutral-50 text-neutral-700 border-neutral-200'
                                            }`}>
                                            {job.status || 'DRAFT'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Link href={`/recruitment/jobs/${job._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                        View
                                    </Link>
                                    <button onClick={() => handleDelete(job._id)} className="text-sm font-medium text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <p className="mt-4 text-neutral-600 line-clamp-2">{job.description}</p>

                            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                                <span className="text-xs text-neutral-400">ID: {job._id}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
