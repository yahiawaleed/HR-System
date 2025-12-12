import Link from "next/link";
import { Briefcase, Users, DollarSign, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent sm:text-5xl mb-4">
          Recruitment Dashboard
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl">
          Streamline your hiring process from requisition to offer acceptance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Jobs Card */}
        <Link href="/recruitment/jobs" className="group block p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Jobs</h2>
          <p className="text-neutral-500 mb-4">Create, manage, and track job requisitions and openings.</p>
          <div className="flex items-center text-blue-600 font-medium text-sm">
            <span>Manage Jobs</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Applications Card */}
        <Link href="/recruitment/applications" className="group block p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Applications</h2>
          <p className="text-neutral-500 mb-4">Review candidate applications, resumes, and track progress.</p>
          <div className="flex items-center text-indigo-600 font-medium text-sm">
            <span>View Applications</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Offers Card */}
        <Link href="/recruitment/offers" className="group block p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Offers</h2>
          <p className="text-neutral-500 mb-4">Generate and manage employment offers and contracts.</p>
          <div className="flex items-center text-green-600 font-medium text-sm">
            <span>Manage Offers</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="mt-12 p-8 bg-neutral-900 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Ready to grow your team?</h3>
          <p className="text-neutral-400 mb-6 max-w-xl">Start by creating a new job requisition to attract the best talent.</p>
          <Link href="/recruitment/jobs/create" className="inline-flex items-center bg-white text-neutral-900 px-6 py-3 rounded-lg font-bold hover:bg-neutral-100 transition-colors">
            Post a Job Now
          </Link>
        </div>
      </div>
    </div>
  );
}
