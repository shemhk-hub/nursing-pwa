'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalYears: 0,
    totalSubjects: 0,
    totalTopics: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, years, subjects, topics] = await Promise.all([
          supabase.from('users').select('count()', { count: 'exact', head: true }),
          supabase.from('years').select('count()', { count: 'exact', head: true }),
          supabase.from('subjects').select('count()', { count: 'exact', head: true }),
          supabase.from('topics').select('count()', { count: 'exact', head: true }),
        ]);

        setStats({
          totalUsers: users.count || 0,
          totalYears: years.count || 0,
          totalSubjects: subjects.count || 0,
          totalTopics: topics.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      href: '/admin/users',
    },
    {
      title: 'Study Years',
      value: stats.totalYears,
      icon: '📚',
      color: 'bg-purple-500',
      href: '/admin/curriculum',
    },
    {
      title: 'Subjects',
      value: stats.totalSubjects,
      icon: '📖',
      color: 'bg-green-500',
      href: '/admin/content',
    },
    {
      title: 'Topics',
      value: stats.totalTopics,
      icon: '📄',
      color: 'bg-orange-500',
      href: '/admin/content',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-teal-100">Manage users, curriculum, and content for the Nursing PWA</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">{card.title}</h3>
              <span className="text-3xl">{card.icon}</span>
            </div>
            <div className={`${card.color} text-white rounded p-3 text-center`}>
              {loading ? (
                <div className="animate-pulse h-8 bg-white/20 rounded" />
              ) : (
                <p className="text-3xl font-bold">{card.value}</p>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-semibold text-gray-900">Add New Subject</p>
              <p className="text-sm text-gray-500">Create curriculum content</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-semibold text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-500">View and edit user roles</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-semibold text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">Check platform statistics</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="font-semibold text-gray-900">Settings</p>
              <p className="text-sm text-gray-500">Configure platform settings</p>
            </div>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-green-900 font-semibold">Database</span>
            <span className="text-green-600 text-sm">✓ Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-green-900 font-semibold">Authentication</span>
            <span className="text-green-600 text-sm">✓ Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-green-900 font-semibold">API Endpoints</span>
            <span className="text-green-600 text-sm">✓ Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
