"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OffersService, CreateOfferDto } from '@/services/offers.service';
import { ApplicationsService, Application } from '@/services/applications.service';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateOfferPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);

    const [formData, setFormData] = useState({
        applicationId: '',
        candidateId: '', // Ideally auto-filled from application
        role: '',
        grossSalary: '',
        signingBonus: '',
        content: '',
        benefits: ''
    });

    useEffect(() => {
        // Load applications to select from (ideally only those in Interview stage, but all for now)
        ApplicationsService.findAll().then(setApplications).catch(console.error);
    }, []);

    const handleAppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const appId = e.target.value;
        const app = applications.find(a => a._id === appId);
        setFormData(prev => ({
            ...prev,
            applicationId: appId,
            candidateId: app ? app.candidateId : '',
            // Try to set role from requisition if populated
            role: app && typeof app.requisitionId === 'object' && app.requisitionId ? (app.requisitionId as any).title : ''
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dto: CreateOfferDto = {
                applicationId: formData.applicationId,
                candidateId: formData.candidateId,
                role: formData.role,
                grossSalary: Number(formData.grossSalary),
                signingBonus: formData.signingBonus ? Number(formData.signingBonus) : undefined,
                content: formData.content,
                benefits: formData.benefits.split(',').map(s => s.trim()).filter(Boolean),
            };

            await OffersService.create(dto);
            router.push('/recruitment/offers');
        } catch (error) {
            console.error("Failed to create offer", error);
            alert("Failed to create offer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/recruitment/offers" className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Create Offer</h1>
                    <p className="text-neutral-500 text-sm">Draft an employment offer for a candidate.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
                <div className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Application Selection (Source) */}
                        <div>
                            <label htmlFor="applicationId" className="block text-sm font-medium text-neutral-700 mb-1">Application Source</label>
                            <select
                                id="applicationId"
                                name="applicationId"
                                required
                                value={formData.applicationId}
                                onChange={handleAppChange}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            >
                                <option value="">Select Application...</option>
                                {applications.map(app => (
                                    <option key={app._id} value={app._id}>
                                        {app.candidateId} - {typeof app.requisitionId === 'object' && app.requisitionId ? (app.requisitionId as any).title : 'Job'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="candidateId" className="block text-sm font-medium text-neutral-700 mb-1">Candidate ID</label>
                            <input
                                type="text"
                                id="candidateId"
                                name="candidateId"
                                required
                                readOnly
                                value={formData.candidateId}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500 focus:outline-none cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-1">Role Title</label>
                            <input
                                type="text"
                                id="role"
                                name="role"
                                required
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="grossSalary" className="block text-sm font-medium text-neutral-700 mb-1">Gross Salary</label>
                            <input
                                type="number"
                                id="grossSalary"
                                name="grossSalary"
                                required
                                value={formData.grossSalary}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g. 80000"
                            />
                        </div>

                        <div>
                            <label htmlFor="signingBonus" className="block text-sm font-medium text-neutral-700 mb-1">Signing Bonus (Optional)</label>
                            <input
                                type="number"
                                id="signingBonus"
                                name="signingBonus"
                                value={formData.signingBonus}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g. 5000"
                            />
                        </div>

                        <div>
                            <label htmlFor="benefits" className="block text-sm font-medium text-neutral-700 mb-1">Benefits (Comma separated)</label>
                            <input
                                type="text"
                                id="benefits"
                                name="benefits"
                                value={formData.benefits}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Health, Dental, Stock Options"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-1">Offer Letter Content</label>
                        <textarea
                            id="content"
                            name="content"
                            required
                            rows={6}
                            value={formData.content}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
                            placeholder="Dear Candidate, we are pleased to offer you..."
                        />
                    </div>

                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
                    >
                        {loading ? <span>Saving...</span> : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Create Offer</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
