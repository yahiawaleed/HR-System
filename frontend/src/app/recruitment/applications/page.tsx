"use client";

import {
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Clock,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Dummy data for applications
const applications = [
    {
        id: 1,
        name: "Alice Johnson",
        role: "Senior Software Engineer",
        status: "In Review",
        appliedDate: "Oct 24, 2023",
        email: "alice.j@example.com",
        avatar: "AJ"
    },
    {
        id: 2,
        name: "Bob Smith",
        role: "Senior Software Engineer",
        status: "Rejected",
        appliedDate: "Oct 23, 2023",
        email: "bob.smith@example.com",
        avatar: "BS"
    },
    {
        id: 3,
        name: "Carol White",
        role: "Product Designer",
        status: "Interviewing",
        appliedDate: "Oct 22, 2023",
        email: "carol.w@example.com",
        avatar: "CW"
    },
    {
        id: 4,
        name: "Dave Brown",
        role: "Marketing Manager",
        status: "New",
        appliedDate: "Oct 25, 2023",
        email: "dave.b@example.com",
        avatar: "DB"
    },
    {
        id: 5,
        name: "Eve Davis",
        role: "HR Coordinator",
        status: "Offered",
        appliedDate: "Oct 20, 2023",
        email: "eve.d@example.com",
        avatar: "ED"
    }
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "New": return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
        case "In Review": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";
        case "Interviewing": return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";
        case "Offered": return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
        case "Rejected": return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
        default: return "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400";
    }
};

export default function ApplicationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Applications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage candidate applications.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 size-4" /> Filter
                    </Button>
                    <Button variant="outline">
                        <FileText className="mr-2 size-4" /> Export
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search applicants..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Candidate</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Applied Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                    {app.avatar}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{app.name}</div>
                                                    <div className="text-muted-foreground text-xs">{app.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{app.role}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{app.appliedDate}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", getStatusColor(app.status))}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
