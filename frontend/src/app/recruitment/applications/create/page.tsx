"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationsService, CreateApplicationDto } from '@/services/applications.service';
import { JobsService, Job } from '@/services/jobs.service';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateApplicationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);

    const [formData, setFormData] = useState({
        candidateId: '',
        requisitionId: '',
        resumeUrl: '',
        assignedHr: ''
    });

    useEffect(() => {
        JobsService.findAll().then(setJobs).catch(console.error);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dto: CreateApplicationDto = {
                candidateId: formData.candidateId,
                requisitionId: formData.requisitionId,
                resumeUrl: formData.resumeUrl,
                assignedHr: formData.assignedHr
            };

            await ApplicationsService.create(dto);
            router.push('/recruitment/applications');
        } catch (error) {
            console.error("Failed to create application", error);
            alert("Failed to submit application. Please check the inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/recruitment/applications" className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">New Application</h1>
                    <p className="text-neutral-500 text-sm">Manually record a candidate application.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
                <div className="space-y-6">

                    {/* Job Selection */}
                    <div>
                        <label htmlFor="requisitionId" className="block text-sm font-medium text-neutral-700 mb-1">Applying For (Job)</label>
                        <select
                            id="requisitionId"
                            name="requisitionId"
                            required
                            value={formData.requisitionId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="">Select a job...</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title} - {job.department}</option>
                            ))}
                        </select>
                    </div>

                    {/* Candidate Info */}
                    <div>
                        <label htmlFor="candidateId" className="block text-sm font-medium text-neutral-700 mb-1">Candidate ID / Name</label>
                        <input
                            type="text"
                            id="candidateId"
                            name="candidateId"
                            required
                            value={formData.candidateId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
                            placeholder="Full Name or System ID"
                        />
                    </div>


                    <div>
                        <label htmlFor="resumeUrl" className="block text-sm font-medium text-neutral-700 mb-1">Resume Link (Optional)</label>
                        <input
                            type="text"
                            id="resumeUrl"
                            name="resumeUrl"
                            value={formData.resumeUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label htmlFor="assignedHr" className="block text-sm font-medium text-neutral-700 mb-1">Assigned HR (Optional)</label>
                        <input
                            type="text"
                            id="assignedHr"
                            name="assignedHr"
                            value={formData.assignedHr}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
                            placeholder="HR Name"
                        />
                    </div>

                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
                    >
                        {loading ? <span>Submitting...</span> : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Submit Application</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
