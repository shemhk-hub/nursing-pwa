'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  instructor_name: string;
  instructor_email: string;
}

interface Unit {
  id: string;
  number: number;
  title: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  title: string;
  duration_minutes: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Fetch course
        const { data: courseData } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', courseId)
          .single();

        setCourse(courseData);

        // Fetch units and topics
        const { data: unitsData } = await supabase
          .from('units')
          .select(
            `
            id,
            number,
            title,
            topics(
              id,
              title,
              duration_minutes
            )
          `
          )
          .eq('subject_id', courseId)
          .order('number');

        setUnits(unitsData || []);
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, supabase]);

  const handleBookmark = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', session.user.id);
      } else {
        // Add bookmark
        await supabase.from('bookmarks').insert([
          {
            user_id: session.user.id,
            course_id: courseId,
          },
        ]);
      }

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading course details...</div>;
  }

  if (!course) {
    return <div className="text-center py-12">Course not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-teal-100 mb-2">{course.code}</p>
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-teal-100 max-w-2xl">{course.description}</p>
          </div>
          <button
            onClick={handleBookmark}
            className={`px-6 py-2 rounded font-semibold transition-colors ${
              isBookmarked
                ? 'bg-white text-teal-600 hover:bg-gray-100'
                : 'border-2 border-white text-white hover:bg-teal-600'
            }`}
          >
            {isBookmarked ? '🔖 Bookmarked' : '☐ Bookmark'}
          </button>
        </div>
      </div>

      {/* Course Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Credits</p>
          <p className="text-2xl font-bold text-gray-900">{course.credits}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Units</p>
          <p className="text-2xl font-bold text-gray-900">{units.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Instructor</p>
          <p className="text-lg font-bold text-gray-900">{course.instructor_name}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Topics</p>
          <p className="text-2xl font-bold text-gray-900">
            {units.reduce((sum, unit) => sum + (unit.topics?.length || 0), 0)}
          </p>
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {units.map((unit) => (
            <div key={unit.id}>
              <button
                onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">
                    Unit {unit.number}: {unit.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {unit.topics?.length || 0} topics
                  </p>
                </div>
                <span
                  className={`text-xl transition-transform ${
                    expandedUnit === unit.id ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              {expandedUnit === unit.id && (
                <div className="bg-gray-50 px-6 py-4 space-y-2 border-t border-gray-200">
                  {unit.topics?.map((topic) => (
                    <button
                      key={topic.id}
                      className="w-full flex items-center gap-4 p-3 bg-white rounded hover:bg-teal-50 transition-colors text-left border border-gray-200"
                    >
                      <span className="text-xl">📄</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{topic.title}</p>
                        <p className="text-sm text-gray-600">
                          {topic.duration_minutes} minutes
                        </p>
                      </div>
                      <span className="text-teal-600 font-semibold">Start →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Instructor Info */}
      {course.instructor_email && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">About Your Instructor</h3>
          <p className="text-blue-800 mb-2">{course.instructor_name}</p>
          <p className="text-blue-700 text-sm">{course.instructor_email}</p>
        </div>
      )}
    </div>
  );
}
