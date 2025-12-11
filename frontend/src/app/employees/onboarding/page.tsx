"use client";

import { useState } from "react";
import {
    CheckCircle2,
    UserPlus,
    CreditCard,
    Monitor,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Dummy data for candidates ready to onboard
const candidatesToOnboard = [
    {
        id: 1,
        name: "Eve Davis",
        role: "HR Coordinator",
        status: "Offer Accepted",
        startDate: "2023-11-01",
        email: "eve.d@example.com",
        avatar: "ED",
        payrollReady: false,
        itReady: false
    },
    {
        id: 2,
        name: "Frank Miller",
        role: "Backend Developer",
        status: "Offer Accepted",
        startDate: "2023-11-15",
        email: "frank.m@example.com",
        avatar: "FM",
        payrollReady: false,
        itReady: false
    }
];

export default function OnboardingPage() {
    // In a real app, state would be managed better or fetched from backend
    const [candidates, setCandidates] = useState(candidatesToOnboard);

    const togglePayroll = (id: number) => {
        setCandidates(candidates.map(c =>
            c.id === id ? { ...c, payrollReady: !c.payrollReady } : c
        ));
    };

    const toggleIT = (id: number) => {
        setCandidates(candidates.map(c =>
            c.id === id ? { ...c, itReady: !c.itReady } : c
        ));
    };

    const completeOnboarding = (id: number) => {
        // Here we would call backend to move status to 'Active'
        alert(`Onboarding completed for candidate ${id}!\nLinked to Payroll & IT.`);
        setCandidates(candidates.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Onboarding
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage new hires and set up their access.
                </p>
            </div>

            <div className="grid gap-6">
                {candidates.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No candidates waiting for onboarding.
                    </Card>
                ) : (
                    candidates.map(candidate => (
                        <Card key={candidate.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold text-lg">
                                        {candidate.avatar}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{candidate.name}</h3>
                                        <p className="text-sm text-muted-foreground">{candidate.role} &bull; Starts {candidate.startDate}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <Button
                                        variant={candidate.payrollReady ? "default" : "outline"}
                                        onClick={() => togglePayroll(candidate.id)}
                                        className={cn("gap-2", candidate.payrollReady && "bg-green-600 hover:bg-green-700 text-white")}
                                    >
                                        <CreditCard className="size-4" />
                                        {candidate.payrollReady ? "Payroll Linked" : "Link Payroll"}
                                    </Button>

                                    <Button
                                        variant={candidate.itReady ? "default" : "outline"}
                                        onClick={() => toggleIT(candidate.id)}
                                        className={cn("gap-2", candidate.itReady && "bg-blue-600 hover:bg-blue-700 text-white")}
                                    >
                                        <Monitor className="size-4" />
                                        {candidate.itReady ? "IT Access Granted" : "Grant IT Access"}
                                    </Button>

                                    <div className="w-px h-8 bg-border hidden md:block" />

                                    <Button
                                        onClick={() => completeOnboarding(candidate.id)}
                                        disabled={!candidate.payrollReady || !candidate.itReady}
                                    >
                                        <UserPlus className="mr-2 size-4" />
                                        Complete Onboarding
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
