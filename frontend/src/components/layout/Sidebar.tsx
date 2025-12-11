"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    FileText,
    Calendar,
    Settings,
    LogOut,
    Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Employees",
        href: "/employees",
        icon: Users,
        submenu: [
            { title: "Recruiting", href: "/recruitment/applications" },
            { title: "Onboarding", href: "/employees/onboarding" },
            { title: "Offboarding", href: "/employees/offboarding" },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col h-screen sticky top-0 transition-all duration-300">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    HR Nexus
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <div key={item.href}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                {item.title}
                            </Link>
                            {/* Simple Submenu logic for now, expanding if active */}
                            {item.submenu && isActive && (
                                <div className="ml-9 mt-1 space-y-1">
                                    {item.submenu.map((sub) => (
                                        <Link
                                            key={sub.href}
                                            href={sub.href}
                                            className={cn(
                                                "block px-3 py-1.5 text-sm rounded-md transition-colors",
                                                pathname === sub.href
                                                    ? "text-primary font-medium"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {sub.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="mr-2 size-4" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
