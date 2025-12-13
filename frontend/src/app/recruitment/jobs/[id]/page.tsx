"use client";

import { useEffect, useState } from 'react';
import { JobsService, Job } from '@/services/jobs.service';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailsPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            JobsService.findById(id).then(setJob).catch(error => {
                console.error("Failed to load job", error);
                alert("Job not found");
                router.push('/recruitment/jobs');
            }).finally(() => setLoading(false));
        }
    }, [id, router]);

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading job details...</div>;
    if (!job) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/recruitment/jobs" className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">{job.title}</h1>
                    <p className="text-neutral-500 text-sm">{job.department}</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Description</h3>
                        <p className="text-neutral-600 whitespace-pre-wrap">{job.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Qualifications</h3>
                            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                                {job.qualifications?.length ? job.qualifications.map((q, i) => <li key={i}>{q}</li>) : <li>No qualifications listed</li>}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((s, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
