"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobsService, CreateJobDto } from '@/services/jobs.service';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        description: '',
        qualifications: '',
        skills: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dto: CreateJobDto = {
                title: formData.title,
                department: formData.department,
                description: formData.description,
                qualifications: formData.qualifications.split(',').map(s => s.trim()).filter(Boolean),
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
            };

            await JobsService.create(dto);
            router.push('/recruitment/jobs');
        } catch (error) {
            console.error("Failed to create job", error);
            alert("Failed to create job. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/recruitment/jobs" className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Create New Job</h1>
                    <p className="text-neutral-500 text-sm">Define requirements and details for a new open position.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">Job Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
                                placeholder="e.g. Senior Software Engineer"
                            />
                        </div>
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-neutral-700 mb-1">Department</label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                required
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
                                placeholder="e.g. Engineering"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
                            placeholder="Detailed description of the role and responsibilities..."
                        />
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="qualifications" className="block text-sm font-medium text-neutral-700 mb-1">Qualifications <span className="text-neutral-400 font-normal">(Comma separated)</span></label>
                            <input
                                type="text"
                                id="qualifications"
                                name="qualifications"
                                value={formData.qualifications}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
                                placeholder="BS in CS, 3+ years experience, etc."
                            />
                        </div>
                        <div>
                            <label htmlFor="skills" className="block text-sm font-medium text-neutral-700 mb-1">Required Skills <span className="text-neutral-400 font-normal">(Comma separated)</span></label>
                            <input
                                type="text"
                                id="skills"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
                                placeholder="React, Node.js, TypeScript, etc."
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span>Creating...</span>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Create Job</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
