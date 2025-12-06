"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        requisitionId: '',
        openings: 1,
        location: '',
        hiringManagerId: '657483920192837465' // Placeholder ID
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/recruitment/jobs', formData);
            router.push('/recruitment/jobs');
        } catch (error) {
            console.error("Failed to create job", error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Create New Job</h2>
                <p className="text-muted-foreground mt-2">Open a new position for hiring.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Requisition ID</label>
                            <Input
                                placeholder="e.g. ENG-2024-001"
                                value={formData.requisitionId}
                                onChange={(e) => setFormData({ ...formData, requisitionId: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Openings</label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.openings}
                                    onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input
                                    placeholder="e.g. New York, Remote"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create Job</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
