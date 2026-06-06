'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Bookmark {
  id: string;
  topicTitle: string;
  unitTitle: string;
  subjectTitle: string;
  createdAt: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const { data, error } = await supabase
          .from('bookmarks')
          .select(
            `
            id,
            created_at,
            topics(
              title,
              units(
                title,
                subjects(title)
              )
            )
          `
          )
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedBookmarks: Bookmark[] = (data || []).map((item: any) => ({
          id: item.id,
          topicTitle: item.topics?.title || 'Unknown Topic',
          unitTitle: item.topics?.units?.[0]?.title || 'Unknown Unit',
          subjectTitle: item.topics?.units?.[0]?.subjects?.[0]?.title || 'Unknown Subject',
          createdAt: new Date(item.created_at).toLocaleDateString(),
        }));

        setBookmarks(formattedBookmarks);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [supabase]);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await supabase.from('bookmarks').delete().eq('id', bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
        <p className="text-gray-600 mt-1">
          Quick access to your saved topics ({bookmarks.length})
        </p>
      </div>

      {/* Bookmarks List */}
      {loading ? (
        <div className="text-center py-12">Loading bookmarks...</div>
      ) : bookmarks.length > 0 ? (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{bookmark.topicTitle}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {bookmark.subjectTitle} • {bookmark.unitTitle}
                </p>
                <p className="text-xs text-gray-500 mt-2">Saved on {bookmark.createdAt}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors">
                  View
                </button>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">No bookmarks yet!</p>
          <p className="text-gray-500 mb-6">
            Bookmark topics while learning to save them for quick access
          </p>
          <button className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
            Browse Courses
          </button>
        </div>
      )}

      {/* Bookmarking Tips */}
      {bookmarks.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 text-sm font-semibold">💡 Pro Tips</p>
          <ul className="text-yellow-800 text-sm mt-2 space-y-1">
            <li>✓ Bookmark important topics you want to review later</li>
            <li>✓ Organize your learning by regularly reviewing bookmarks</li>
            <li>✓ Remove bookmarks once you've mastered the topic</li>
          </ul>
        </div>
      )}
    </div>
  );
}
