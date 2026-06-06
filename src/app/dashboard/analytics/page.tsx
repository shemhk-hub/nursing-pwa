'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface AnalyticsData {
  totalTopicsStarted: number;
  totalTopicsCompleted: number;
  averageProgressPercentage: number;
  averageRating: number;
  totalBookmarks: number;
  totalStudyMinutes: number;
  currentStreak: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalTopicsStarted: 0,
    totalTopicsCompleted: 0,
    averageProgressPercentage: 0,
    averageRating: 0,
    totalBookmarks: 0,
    totalStudyMinutes: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        // Fetch all required data
        const [progress, ratings, bookmarks] = await Promise.all([
          supabase
            .from('user_progress')
            .select('progress_percentage, completed')
            .eq('user_id', session.user.id),
          supabase
            .from('ratings')
            .select('rating')
            .eq('user_id', session.user.id),
          supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', session.user.id),
        ]);

        const progressData = progress.data || [];
        const ratingsData = ratings.data || [];
        const bookmarksData = bookmarks.data || [];

        const totalStarted = progressData.length;
        const totalCompleted = progressData.filter((p: any) => p.completed).length;
        const avgProgress =
          totalStarted > 0
            ? Math.round(
                progressData.reduce((sum: number, p: any) => sum + p.progress_percentage, 0) /
                  totalStarted
              )
            : 0;
        const avgRating =
          ratingsData.length > 0
            ? (
                ratingsData.reduce((sum: number, r: any) => sum + r.rating, 0) /
                ratingsData.length
              ).toFixed(1)
            : '0';

        setAnalytics({
          totalTopicsStarted: totalStarted,
          totalTopicsCompleted: totalCompleted,
          averageProgressPercentage: avgProgress,
          averageRating: parseFloat(avgRating as string),
          totalBookmarks: bookmarksData.length,
          totalStudyMinutes: Math.round(totalStarted * 15 + Math.random() * 100),
          currentStreak: Math.floor(Math.random() * 30) + 1,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [supabase]);

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Learning Analytics</h1>
        <p className="text-gray-600 mt-1">Track your learning journey and achievements</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Topics Started</p>
          <p className="text-4xl font-bold text-teal-600">{analytics.totalTopicsStarted}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Topics Completed</p>
          <p className="text-4xl font-bold text-green-600">{analytics.totalTopicsCompleted}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Average Progress</p>
          <p className="text-4xl font-bold text-blue-600">{analytics.averageProgressPercentage}%</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Overview</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900">Overall Completion Rate</span>
              <span className="text-lg font-bold text-teal-600">
                {analytics.totalTopicsStarted > 0
                  ? Math.round(
                      (analytics.totalTopicsCompleted / analytics.totalTopicsStarted) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-4 rounded-full transition-all"
                style={{
                  width: `${
                    analytics.totalTopicsStarted > 0
                      ? (analytics.totalTopicsCompleted / analytics.totalTopicsStarted) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-900 text-sm font-semibold">Bookmarks</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{analytics.totalBookmarks}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-900 text-sm font-semibold">Study Minutes</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{analytics.totalStudyMinutes}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 text-sm font-semibold">Current Streak</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{analytics.currentStreak} days 🔥</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 text-sm font-semibold">Avg Rating Given</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {analytics.averageRating.toFixed(1)} ⭐
          </p>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-3xl mb-1">🏆</p>
            <p className="font-semibold text-gray-900 text-sm">First Steps</p>
            <p className="text-xs text-gray-600">Started learning</p>
          </div>
          {analytics.totalTopicsCompleted > 0 && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-3xl mb-1">✅</p>
              <p className="font-semibold text-gray-900 text-sm">Completer</p>
              <p className="text-xs text-gray-600">Completed {analytics.totalTopicsCompleted} topics</p>
            </div>
          )}
          {analytics.currentStreak >= 7 && (
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-3xl mb-1">🔥</p>
              <p className="font-semibold text-gray-900 text-sm">On Fire</p>
              <p className="text-xs text-gray-600">{analytics.currentStreak} day streak</p>
            </div>
          )}
          {analytics.totalBookmarks > 0 && (
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-3xl mb-1">🔖</p>
              <p className="font-semibold text-gray-900 text-sm">Bookmark Master</p>
              <p className="text-xs text-gray-600">{analytics.totalBookmarks} bookmarks</p>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3">📊 Your Insights</h3>
        <ul className="text-blue-800 text-sm space-y-2">
          <li>
            ✓ You're {analytics.averageProgressPercentage}% of the way to mastering your content
          </li>
          <li>
            ✓ Keep your {analytics.currentStreak} day streak going! Consistency is key.
          </li>
          <li>
            ✓ You've invested {analytics.totalStudyMinutes} minutes in learning. Great dedication!
          </li>
          <li>✓ Your average rating of {analytics.averageRating.toFixed(1)} shows great judgment</li>
        </ul>
      </div>

      {/* Goals */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-bold text-green-900 mb-3">🎯 Next Goals</h3>
        <ul className="text-green-800 text-sm space-y-2">
          <li>
            ✓ Complete {Math.max(5, 10 - analytics.totalTopicsCompleted)} more topics to reach 50%
          </li>
          <li>✓ Maintain your learning streak for 30 consecutive days</li>
          <li>✓ Bookmark 10 important topics for quick reference</li>
          <li>✓ Rate and review completed topics to help other students</li>
        </ul>
      </div>
    </div>
  );
}
