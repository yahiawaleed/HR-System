"use client";

import { useState } from "react";
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    Search,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Dummy data for jobs
const jobs = [
    {
        id: 1,
        title: "Senior Software Engineer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        salary: "$120k - $160k",
        posted: "2 days ago",
        description: "We are looking for an experienced Full Stack Engineer to join our core team...",
        tags: ["React", "Node.js", "TypeScript"]
    },
    {
        id: 2,
        title: "Product Designer",
        department: "Design",
        location: "New York, NY",
        type: "Full-time",
        salary: "$90k - $130k",
        posted: "1 week ago",
        description: "Join our design team to craft beautiful and intuitive user experiences...",
        tags: ["Figma", "UI/UX", "Prototyping"]
    },
    {
        id: 3,
        title: "Marketing Manager",
        department: "Marketing",
        location: "London, UK",
        type: "Contract",
        salary: "$80k - $100k",
        posted: "3 days ago",
        description: "Lead our marketing campaigns and drive growth across international markets...",
        tags: ["SEO", "Content Strategy", "Analytics"]
    },
    {
        id: 4,
        title: "HR Coordinator",
        department: "Human Resources",
        location: "San Francisco, CA",
        type: "Part-time",
        salary: "$40k - $60k",
        posted: "5 days ago",
        description: "Assist with daily HR operations and recruitment processes...",
        tags: ["Recruiting", "Employee Relations", "Admin"]
    }
];

export default function JobsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Open Positions
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Find top talent to join your team.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 size-4" /> Filter
                    </Button>
                    <Button>
                        <Briefcase className="mr-2 size-4" /> Post New Job
                    </Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by title or department..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                    <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">{job.department}</p>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{job.title}</CardTitle>
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    job.type === "Full-time" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" :
                                        job.type === "Contract" ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" :
                                            "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                )}>
                                    {job.type}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {job.description}
                            </p>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-4" /> {job.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="size-4" /> {job.salary}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="size-4" /> Posted {job.posted}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {job.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-secondary rounded text-xs font-medium text-secondary-foreground">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="secondary">View Details</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
