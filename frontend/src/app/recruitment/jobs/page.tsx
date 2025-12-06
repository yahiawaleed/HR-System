"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Job } from "@/types";

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get('/recruitment/jobs');
                setJobs(res.data);
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Job Requisitions</h2>
                    <p className="text-muted-foreground mt-2">Manage open positions and hiring needs.</p>
                </div>
                <Link href="/recruitment/jobs/new">
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <PlusCircle className="w-4 h-4" />
                        Create Job
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <Card className="text-center py-12">
                        <p className="text-muted-foreground">No jobs found. Create your first job requisition.</p>
                    </Card>
                ) : (
                    jobs.map((job) => (
                        <Card key={job._id} className="hover:bg-slate-900/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                                <div>
                                    <CardTitle className="text-lg text-indigo-400">Position ID: {job.requisitionId}</CardTitle>
                                    <p className="text-sm text-slate-400 mt-1">{job.location} • {job.openings} Openings</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.publishStatus === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {job.publishStatus.toUpperCase()}
                                    </span>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            </CardHeader>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
