"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Application } from "@/types";

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await api.get('/recruitment/applications');
                setApplications(res.data);
            } catch (error) {
                console.error("Failed to fetch applications", error);
            }
        };
        fetchApps();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Applications</h2>
                    <p className="text-muted-foreground mt-2">Track candidate applications.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {applications.length === 0 ? (
                    <Card className="text-center py-12">
                        <p className="text-muted-foreground">No active applications found.</p>
                    </Card>
                ) : (
                    applications.map((app) => (
                        <Card key={app._id} className="hover:bg-slate-900/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <div>
                                    <CardTitle className="text-lg text-white">Application ID: {app._id}</CardTitle>
                                    <p className="text-sm text-slate-400 mt-1">Status: <span className="text-indigo-400 capitalize">{app.status}</span></p>
                                </div>
                                <Button variant="secondary" size="sm">Details</Button>
                            </CardHeader>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
