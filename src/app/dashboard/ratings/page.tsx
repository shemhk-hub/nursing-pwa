'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Rating {
  id: string;
  topicTitle: string;
  rating: number;
  review: string;
  createdAt: string;
}

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        // Fetch user's ratings
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select(
            `
            id,
            rating,
            review,
            created_at,
            topics(title)
          `
          )
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        const formattedRatings: Rating[] = (ratingsData || []).map((item: any) => ({
          id: item.id,
          topicTitle: item.topics?.title || 'Unknown Topic',
          rating: item.rating,
          review: item.review,
          createdAt: new Date(item.created_at).toLocaleDateString(),
        }));

        setRatings(formattedRatings);

        // Fetch all topics for rating
        const { data: topicsData } = await supabase
          .from('topics')
          .select('id, title')
          .limit(20);

        setTopics(topicsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const handleSubmitRating = async () => {
    if (!selectedTopic || !selectedRating) {
      alert('Please select a topic and rating');
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      await supabase.from('ratings').insert([
        {
          user_id: session.user.id,
          topic_id: selectedTopic,
          rating: selectedRating,
          review: review || null,
        },
      ]);

      // Reset form and refresh
      setSelectedTopic('');
      setSelectedRating(5);
      setReview('');

      // Refresh ratings
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select(
          `
          id,
          rating,
          review,
          created_at,
          topics(title)
        `
        )
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      const formattedRatings: Rating[] = (ratingsData || []).map((item: any) => ({
        id: item.id,
        topicTitle: item.topics?.title || 'Unknown Topic',
        rating: item.rating,
        review: item.review,
        createdAt: new Date(item.created_at).toLocaleDateString(),
      }));

      setRatings(formattedRatings);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? '⭐' : '☆'}>
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rate & Review Topics</h1>
        <p className="text-gray-600 mt-1">Share your feedback on course materials</p>
      </div>

      {/* Rating Submission Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Submit a Rating</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`text-4xl transition-transform hover:scale-110 ${
                    selectedRating >= rating ? '⭐' : '☆'
                  }`}
                >
                  {selectedRating >= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts on this topic..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={handleSubmitRating}
            disabled={submitting}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded font-semibold hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>

      {/* My Ratings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">My Ratings ({ratings.length})</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading ratings...</div>
        ) : ratings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {ratings.map((rating) => (
              <div key={rating.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{rating.topicTitle}</h3>
                  <span className="text-sm text-gray-600">{rating.createdAt}</span>
                </div>
                <div className="mb-2">{renderStars(rating.rating)}</div>
                {rating.review && <p className="text-gray-700">{rating.review}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-600">No ratings yet. Rate some topics to get started!</p>
          </div>
        )}
      </div>

      {/* Rating Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-bold text-yellow-900 mb-3">💡 Rating Tips</h3>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>✓ Rate topics based on clarity and usefulness</li>
          <li>✓ Your reviews help other students find great content</li>
          <li>✓ Be constructive in your feedback</li>
          <li>✓ High ratings help improve the platform</li>
        </ul>
      </div>
    </div>
  );
}
