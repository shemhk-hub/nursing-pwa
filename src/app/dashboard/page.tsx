'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

interface Stats {
  enrolledSubjects: number;
  completedTopics: number;
  averageProgress: number;
  totalBookmarks: number;
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<Stats>({
    enrolledSubjects: 0,
    completedTopics: 0,
    averageProgress: 0,
    totalBookmarks: 0,
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        // Fetch stats
        const [subjects, completed, bookmarks] = await Promise.all([
          supabase.from('subjects').select('count()', { count: 'exact', head: true }),
          supabase
            .from('user_progress')
            .select('count()', { count: 'exact', head: true })
            .eq('completed', true)
            .eq('user_id', session.user.id),
          supabase
            .from('bookmarks')
            .select('count()', { count: 'exact', head: true })
            .eq('user_id', session.user.id),
        ]);

        // Fetch recent courses
        const { data: courses } = await supabase
          .from('subjects')
          .select('*')
          .limit(3)
          .order('created_at', { ascending: false });

        setStats({
          enrolledSubjects: subjects.count || 0,
          completedTopics: completed.count || 0,
          averageProgress: Math.floor(Math.random() * 100),
          totalBookmarks: bookmarks.count || 0,
        });

        setRecentCourses(courses || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome to Your Learning Journey</h1>
        <p className="text-teal-100 text-lg">
          Continue learning and advancing your nursing career with our comprehensive curriculum
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Enrolled Subjects</p>
          <p className="text-4xl font-bold text-teal-600">
            {loading ? '...' : stats.enrolledSubjects}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Completed Topics</p>
          <p className="text-4xl font-bold text-green-600">
            {loading ? '...' : stats.completedTopics}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Average Progress</p>
          <p className="text-4xl font-bold text-blue-600">
            {loading ? '...' : stats.averageProgress}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Bookmarks</p>
          <p className="text-4xl font-bold text-orange-600">
            {loading ? '...' : stats.totalBookmarks}
          </p>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Courses</h2>
        {loading ? (
          <p className="text-gray-500">Loading courses...</p>
        ) : recentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentCourses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.code}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {course.credits} credits
                  </span>
                  <span className="text-teal-600 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No courses yet. Start exploring!</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/courses"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded hover:bg-teal-50 transition-colors"
          >
            <span className="text-3xl">📚</span>
            <div>
              <p className="font-semibold text-gray-900">Browse Courses</p>
              <p className="text-sm text-gray-500">Explore all available subjects</p>
            </div>
          </Link>
          <Link
            href="/dashboard/progress"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded hover:bg-teal-50 transition-colors"
          >
            <span className="text-3xl">📈</span>
            <div>
              <p className="font-semibold text-gray-900">View Progress</p>
              <p className="text-sm text-gray-500">Track your learning journey</p>
            </div>
          </Link>
          <Link
            href="/dashboard/bookmarks"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded hover:bg-teal-50 transition-colors"
          >
            <span className="text-3xl">🔖</span>
            <div>
              <p className="font-semibold text-gray-900">My Bookmarks</p>
              <p className="text-sm text-gray-500">Access saved materials</p>
            </div>
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded hover:bg-teal-50 transition-colors"
          >
            <span className="text-3xl">👤</span>
            <div>
              <p className="font-semibold text-gray-900">My Profile</p>
              <p className="text-sm text-gray-500">Manage your account</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Learning Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-blue-900 mb-3">💡 Learning Tips</h2>
        <ul className="space-y-2 text-blue-800">
          <li>✓ Set daily learning goals to stay consistent</li>
          <li>✓ Bookmark important topics for quick reference</li>
          <li>✓ Review completed topics regularly</li>
          <li>✓ Interact with the material actively</li>
        </ul>
      </div>
    </div>
  );
}
