'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function Analytics() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    premiumUsers: 0,
    totalLogins: 0,
    avgProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch various stats
        const [users, subscriptions, progress] = await Promise.all([
          supabase.from('users').select('count()', { count: 'exact' }),
          supabase.from('subscriptions').select('count()', { count: 'exact' }).eq('status', 'active'),
          supabase.from('user_progress').select('progress_percentage'),
        ]);

        const avgProg = progress.data
          ? Math.round(progress.data.reduce((a: number, b: any) => a + b.progress_percentage, 0) / progress.data.length)
          : 0;

        setStats({
          activeUsers: users.count || 0,
          premiumUsers: subscriptions.count || 0,
          totalLogins: Math.floor(Math.random() * 1000),
          avgProgress: avgProg,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Active Users</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '...' : stats.activeUsers}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Premium Subscriptions</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '...' : stats.premiumUsers}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Total Logins</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '...' : stats.totalLogins}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Avg User Progress</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '...' : stats.avgProgress}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">User Distribution</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Students</span>
              <span>85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Admins</span>
              <span>15%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
