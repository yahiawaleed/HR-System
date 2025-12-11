"use client";

import { useState } from "react";
import {
    UserMinus,
    CreditCard,
    Monitor,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Dummy data for employees leaving
const employeesToOffboard = [
    {
        id: 101,
        name: "Sarah Connor",
        role: "Project Manager",
        status: "Resigned",
        lastDay: "2023-11-30",
        email: "sarah.c@example.com",
        avatar: "SC",
        payrollRemoved: false,
        itRevoked: false
    }
];

export default function OffboardingPage() {
    const [employees, setEmployees] = useState(employeesToOffboard);

    const togglePayroll = (id: number) => {
        setEmployees(employees.map(e =>
            e.id === id ? { ...e, payrollRemoved: !e.payrollRemoved } : e
        ));
    };

    const toggleIT = (id: number) => {
        setEmployees(employees.map(e =>
            e.id === id ? { ...e, itRevoked: !e.itRevoked } : e
        ));
    };

    const completeOffboarding = (id: number) => {
        alert(`Offboarding completed for employee ${id}!\nAccess revoked.`);
        setEmployees(employees.filter(e => e.id !== id));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-red-600 bg-clip-text text-transparent">
                    Offboarding
                </h1>
                <p className="text-muted-foreground mt-1">
                    Process employee exits and revoke access securely.
                </p>
            </div>

            <div className="grid gap-6">
                {employees.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No pending offboarding requests.
                    </Card>
                ) : (
                    employees.map(employee => (
                        <Card key={employee.id} className="border-border/50 bg-card/50 backdrop-blur-sm border-l-4 border-l-destructive">
                            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center text-destructive font-bold text-lg">
                                        {employee.avatar}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{employee.name}</h3>
                                        <p className="text-sm text-muted-foreground">{employee.role} &bull; Last Day {employee.lastDay}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <Button
                                        variant={employee.payrollRemoved ? "destructive" : "outline"}
                                        onClick={() => togglePayroll(employee.id)}
                                        className={cn("gap-2", !employee.payrollRemoved && "hover:text-destructive hover:bg-destructive/10")}
                                    >
                                        <CreditCard className="size-4" />
                                        {employee.payrollRemoved ? "Payroll Removed" : "Remove Payroll"}
                                    </Button>

                                    <Button
                                        variant={employee.itRevoked ? "destructive" : "outline"}
                                        onClick={() => toggleIT(employee.id)}
                                        className={cn("gap-2", !employee.itRevoked && "hover:text-destructive hover:bg-destructive/10")}
                                    >
                                        <Monitor className="size-4" />
                                        {employee.itRevoked ? "IT Access Revoked" : "Revoke IT Access"}
                                    </Button>

                                    <div className="w-px h-8 bg-border hidden md:block" />

                                    <Button
                                        variant="destructive"
                                        onClick={() => completeOffboarding(employee.id)}
                                        disabled={!employee.payrollRemoved || !employee.itRevoked}
                                    >
                                        <UserMinus className="mr-2 size-4" />
                                        Finalize Exit
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
