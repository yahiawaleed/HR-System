'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">HR Management System</h2>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Role:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {user.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

