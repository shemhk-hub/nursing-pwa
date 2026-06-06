'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

interface Subject {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  instructor_name: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Subject[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('title');

        if (error) throw error;

        setCourses(data || []);
        setFilteredCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [supabase]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
          <p className="text-gray-600 mt-1">
            Explore {courses.length} available nursing subjects
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search courses by title, code, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-12">Loading courses...</div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/courses/${course.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Course Header */}
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 text-white">
                <p className="text-sm font-semibold opacity-90">{course.code}</p>
                <h3 className="text-xl font-bold mt-1">{course.title}</h3>
              </div>

              {/* Course Content */}
              <div className="p-6">
                {course.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Course Info */}
                <div className="space-y-3 mb-4">
                  {course.credits && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Credits:</span>
                      <span className="font-semibold text-gray-900">{course.credits}</span>
                    </div>
                  )}
                  {course.instructor_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Instructor:</span>
                      <span className="font-semibold text-gray-900">
                        {course.instructor_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition-colors">
                  View Course →
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">No courses found matching your search.</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Filter Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-sm">
          <strong>Showing {filteredCourses.length}</strong> of <strong>{courses.length}</strong>{' '}
          available courses
        </p>
      </div>
    </div>
  );
}
