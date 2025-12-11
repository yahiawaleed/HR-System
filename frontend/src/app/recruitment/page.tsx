"use client";

import Link from "next/link";
import {
    Briefcase,
    Users,
    FileCheck,
    PlusCircle,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

export default function RecruitmentDashboard() {
    // Dummy stats for UI verification
    const stats = {
        jobs: 12,
        applications: 45,
        offers: 4
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Recruitment Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Overview of your hiring pipeline and activity.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/recruitment/jobs">
                        <Button variant="outline" className="gap-2">
                            View All Jobs
                        </Button>
                    </Link>
                    <Link href="/recruitment/jobs/new">
                        <Button className="gap-2 bg-primary hover:bg-primary/90">
                            <PlusCircle className="size-4" />
                            Post New Job
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Open Positions</CardTitle>
                        <Briefcase className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats.jobs}</div>
                        <p className="text-xs text-green-500 font-medium mt-1 flex items-center">
                            <TrendingUp className="size-3 mr-1" /> +2 this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
                        <Users className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats.applications}</div>
                        <p className="text-xs text-green-500 font-medium mt-1 flex items-center">
                            <TrendingUp className="size-3 mr-1" /> +12% vs last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Offers Accepted</CardTitle>
                        <FileCheck className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats.offers}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ready for onboarding</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">AJ</div>
                                <div>
                                    <p className="text-sm font-medium">Alice Johnson applied for Senior Engineer</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-9 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold text-xs">ED</div>
                                <div>
                                    <p className="text-sm font-medium">Eve Davis accepted offer</p>
                                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-center p-8">
                    <p className="text-muted-foreground">Analytics Chart Placeholder</p>
                </Card>
            </div>
        </div>
    );
}

