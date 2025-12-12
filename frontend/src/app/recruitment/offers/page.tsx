"use client";

import { useEffect, useState } from 'react';
import { OffersService, Offer } from '@/services/offers.service';
import Link from 'next/link';
import { Plus, DollarSign, CheckCircle } from 'lucide-react';

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            const data = await OffersService.findAll();
            setOffers(data);
        } catch (error) {
            console.error("Failed to load offers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id: string) => {
        if (!confirm("Are you sure you want to accept this offer on behalf of the candidate?")) return;
        try {
            await OffersService.accept(id);
            alert("Offer Accepted!");
            loadOffers();
        } catch (error) {
            console.error("Failed to accept offer", error);
            alert("Failed to accept offer");
        }
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading offers...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Offers</h1>
                    <p className="text-neutral-500 mt-1">Manage job offers.</p>
                </div>
                <Link href="/recruitment/offers/create" className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    <span>Create Offer</span>
                </Link>
            </div>

            <div className="grid gap-4">
                {offers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-neutral-300">
                        <DollarSign className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-neutral-900">No offers found</h3>
                        <p className="text-neutral-500">Create a new offer to get started.</p>
                    </div>
                ) : (
                    offers.map((offer) => (
                        <div key={offer._id} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900">{offer.role || 'Role'}</h3>
                                <p className="text-sm text-neutral-500">Candidate ID: {offer.candidateId}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-600">
                                    <span className="font-medium text-green-600">${offer.grossSalary.toLocaleString()}</span>
                                    <span>Status: <strong className="uppercase">{offer.finalStatus}</strong></span>
                                    <span>Applicant: <strong className="uppercase">{offer.applicantResponse}</strong></span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                {offer.applicantResponse !== 'ACCEPTED' && (
                                    <button onClick={() => handleAccept(offer._id)} className="flex items-center space-x-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors border border-green-200">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Accept (Manual)</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
