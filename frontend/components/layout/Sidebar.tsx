'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Employees', href: '/employees', icon: '👥' },
  { name: 'Departments', href: '/departments', icon: '🏢' },
  { name: 'Positions', href: '/positions', icon: '💼' },
  { name: 'Performance', href: '/dashboard/performance', icon: '⭐' },
  { name: 'Time Management', href: '/dashboard/time-management', icon: '⏳' },
  { name: 'Payroll', href: '/payroll', icon: '💰' },
  { name: 'Payslips', href: '/payslips', icon: '📄' },
  { name: 'Claims', href: '/claims', icon: '📝' },
  { name: 'Disputes', href: '/disputes', icon: '⚠️' },
  { name: 'Candidates', href: '/dashboard/candidates', icon: '📝' },
  { name: 'Recruitment', href: '/recruitment', icon: '🤝' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">HR System</h1>
        {user && (
          <p className="text-sm text-gray-400 mt-1">{user.email}</p>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

