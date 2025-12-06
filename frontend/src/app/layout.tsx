import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Switch to Inter for premium look
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HR Nexus | Recruitment",
  description: "Advanced HR Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-background text-foreground">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
