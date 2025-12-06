"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Briefcase, FileCheck, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function RecruitmentDashboard() {
    const [stats, setStats] = useState({
        jobs: 0,
        applications: 0,
        onboarding: 0
    });

    useEffect(() => {
        // In a real app, I'd fetch these from the backend count endpoints.
        // For now, I'll fetch lists and count them to verify integration.
        const fetchData = async () => {
            try {
                const [jobsRes, appsRes] = await Promise.all([
                    api.get('/recruitment/jobs'),
                    api.get('/recruitment/applications')
                ]);
                setStats({
                    jobs: jobsRes.data.length,
                    applications: appsRes.data.length,
                    onboarding: 0 // No endpoint for this yet
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Recruitment</h2>
                    <p className="text-muted-foreground mt-2">Manage your hiring pipeline and talent acquisition.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/recruitment/jobs/new">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <PlusCircle className="w-4 h-4" />
                            Create Job
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-400">Open Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.jobs}</div>
                        <p className="text-xs text-muted-foreground mt-1">+2 from last month</p>
                    </CardContent>
                </Card>

                <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-cyan-400">Active Applications</CardTitle>
                        <Users className="h-4 w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.applications}</div>
                        <p className="text-xs text-muted-foreground mt-1">+12% since last week</p>
                    </CardContent>
                </Card>

                <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-400">Offers Accepted</CardTitle>
                        <FileCheck className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">4</div>
                        <p className="text-xs text-muted-foreground mt-1">Ready for Onboarding</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Job Postings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Placeholder for list */}
                            <p className="text-sm text-muted-foreground">No recent activity.</p>
                            <Link href="/recruitment/jobs">
                                <Button variant="link" className="px-0 text-indigo-400">View all jobs &rarr;</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Pipeline Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center border border-dashed border-slate-700 rounded-md">
                            <p className="text-muted-foreground">Chart visual will go here</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
