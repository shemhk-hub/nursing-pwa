'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    // Clear the auth cookie
    document.cookie = 'sb-uiakghpvtayplyuaxzyh-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Curriculum', href: '/admin/curriculum', icon: '📚' },
    { name: 'Content', href: '/admin/content', icon: '📄' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-teal-900 text-white transition-all duration-300 flex flex-col sticky top-0 h-screen`}
      >
        {/* Header */}
        <div className="p-4 border-b border-teal-800 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-teal-800 rounded"
          >
            ☰
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 py-2 rounded hover:bg-teal-800 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-teal-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-2 rounded hover:bg-teal-800 transition-colors"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Nursing PWA - Admin Panel</h2>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
