'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface ProgressData {
  topicTitle: string;
  progress: number;
  completed: boolean;
  lastAccessed: string;
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const { data, error } = await supabase
          .from('user_progress')
          .select(
            `
            id,
            progress_percentage,
            completed,
            last_accessed_at,
            topics(title)
          `
          )
          .eq('user_id', session.user.id)
          .order('last_accessed_at', { ascending: false });

        if (error) throw error;

        const formattedData: ProgressData[] = (data || []).map((item: any) => ({
          topicTitle: item.topics?.title || 'Unknown Topic',
          progress: item.progress_percentage || 0,
          completed: item.completed || false,
          lastAccessed: item.last_accessed_at
            ? new Date(item.last_accessed_at).toLocaleDateString()
            : 'Never',
        }));

        setProgress(formattedData);

        // Calculate overall progress
        const avgProgress =
          formattedData.length > 0
            ? Math.round(
                formattedData.reduce((sum, item) => sum + item.progress, 0) /
                  formattedData.length
              )
            : 0;

        setOverallProgress(avgProgress);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [supabase]);

  const filteredProgress = progress.filter((item) => {
    if (filter === 'completed') return item.completed;
    if (filter === 'in-progress') return !item.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Learning Progress</h1>
        <p className="text-gray-600 mt-1">Track your advancement through the curriculum</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Progress</h2>
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-5xl font-bold">{overallProgress}%</p>
                <p className="text-sm">Complete</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="space-y-3">
              <div>
                <p className="text-gray-700 font-semibold mb-2">Overall Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Topics Started</p>
                  <p className="text-2xl font-bold text-gray-900">{progress.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Topics Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {progress.filter((p) => p.completed).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-2">
        {(['all', 'in-progress', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              filter === tab
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab === 'all' && 'All Topics'}
            {tab === 'in-progress' && 'In Progress'}
            {tab === 'completed' && 'Completed'}
          </button>
        ))}
      </div>

      {/* Progress List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading progress...</p>
        ) : filteredProgress.length > 0 ? (
          filteredProgress.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.topicTitle}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.completed
                          ? 'bg-green-500'
                          : 'bg-gradient-to-r from-teal-500 to-teal-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">{item.progress}% complete</span>
                    <span className="text-xs text-gray-500">
                      Last accessed: {item.lastAccessed}
                    </span>
                  </div>
                </div>
                {item.completed && (
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-600">
              {filter === 'completed'
                ? 'No completed topics yet. Start learning!'
                : filter === 'in-progress'
                ? 'No topics in progress.'
                : 'No progress data yet. Begin your first course!'}
            </p>
          </div>
        )}
      </div>

      {/* Motivational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm font-semibold">💪 Keep Going!</p>
          <p className="text-blue-800 text-sm mt-1">
            You're making great progress. Keep up the momentum!
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-900 text-sm font-semibold">🎯 Next Goal</p>
          <p className="text-green-800 text-sm mt-1">
            Complete 5 more topics to reach 50% overall progress
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-900 text-sm font-semibold">📅 Daily Streak</p>
          <p className="text-orange-800 text-sm mt-1">Learn something new every day!</p>
        </div>
      </div>
    </div>
  );
}
