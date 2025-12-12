import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HR System",
  description: "Modern HR Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900`}>
        <div className="flex min-h-screen flex-row">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col p-6 shadow-sm z-10">
            <div className="mb-8 pl-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HR System</h1>
            </div>

            <nav className="space-y-1 flex-1">
              <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Recruitment</div>
              <Link href="/recruitment/jobs" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group">
                <span className="font-medium">Jobs</span>
              </Link>
              <Link href="/recruitment/applications" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group">
                <span className="font-medium">Applications</span>
              </Link>
              <Link href="/recruitment/offers" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group">
                <span className="font-medium">Offers</span>
              </Link>
              <div className="px-2 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Employee Mgmt</div>
              <Link href="/recruitment/onboarding" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group">
                <span className="font-medium">Onboard</span>
              </Link>
              <Link href="/recruitment/offboarding" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group">
                <span className="font-medium">Offboard</span>
              </Link>
            </nav>

            <div className="pt-6 border-t border-neutral-100 mt-auto">
              <div className="flex items-center px-2 space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  HR
                </div>
                <div className="text-sm">
                  <p className="font-medium text-neutral-900">Admin User</p>
                  <p className="text-neutral-500 text-xs">admin@hr.com</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
