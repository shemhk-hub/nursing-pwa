'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function ContentManagement() {
  const [content, setContent] = useState({
    topics: 0,
    units: 0,
    subjects: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [topics, units, subjects] = await Promise.all([
          supabase.from('topics').select('count()', { count: 'exact' }),
          supabase.from('units').select('count()', { count: 'exact' }),
          supabase.from('subjects').select('count()', { count: 'exact' }),
        ]);

        setContent({
          topics: topics.count || 0,
          units: units.count || 0,
          subjects: subjects.count || 0,
        });
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <button className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
          Add Content
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Total Subjects</p>
          <p className="text-4xl font-bold text-blue-500">
            {loading ? '...' : content.subjects}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Total Units</p>
          <p className="text-4xl font-bold text-green-500">
            {loading ? '...' : content.units}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-semibold mb-2">Total Topics</p>
          <p className="text-4xl font-bold text-orange-500">
            {loading ? '...' : content.topics}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Content Types</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded hover:bg-gray-50">
            <span className="text-2xl">📖</span>
            <div>
              <p className="font-semibold">Subjects</p>
              <p className="text-sm text-gray-500">Main course divisions</p>
            </div>
            <span className="ml-auto text-2xl font-bold text-blue-500">
              {content.subjects}
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded hover:bg-gray-50">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold">Units</p>
              <p className="text-sm text-gray-500">Content modules within subjects</p>
            </div>
            <span className="ml-auto text-2xl font-bold text-green-500">
              {content.units}
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded hover:bg-gray-50">
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-semibold">Topics</p>
              <p className="text-sm text-gray-500">Individual lessons and materials</p>
            </div>
            <span className="ml-auto text-2xl font-bold text-orange-500">
              {content.topics}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900">
          <strong>Tip:</strong> Organize content hierarchically - Subjects contain Units, which contain Topics.
        </p>
      </div>
    </div>
  );
}
