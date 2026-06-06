'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Year {
  id: string;
  number: number;
  title: string;
  semesters?: Semester[];
}

interface Semester {
  id: string;
  number: number;
  title: string;
  subjects?: Subject[];
}

interface Subject {
  id: string;
  code: string;
  title: string;
}

export default function CurriculumManagement() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYearTitle, setNewYearTitle] = useState('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      const response = await fetch('/api/admin/curriculum');
      const data = await response.json();
      setYears(data.years || []);
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddYear = async () => {
    if (!newYearTitle.trim()) return;

    try {
      const response = await fetch('/api/admin/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'year',
          data: {
            number: years.length + 1,
            title: newYearTitle,
            description: `Year ${years.length + 1}`,
          },
        }),
      });

      if (response.ok) {
        setNewYearTitle('');
        setShowAddYear(false);
        fetchCurriculum();
      }
    } catch (error) {
      console.error('Error adding year:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading curriculum...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Curriculum Management</h1>
        <button
          onClick={() => setShowAddYear(!showAddYear)}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Add Year
        </button>
      </div>

      {showAddYear && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Year</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Title
              </label>
              <input
                type="text"
                value={newYearTitle}
                onChange={(e) => setNewYearTitle(e.target.value)}
                placeholder="e.g., Year 1"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddYear}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddYear(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {years.map((year) => (
          <div key={year.id} className="bg-white rounded-lg shadow">
            <button
              onClick={() => setExpandedYear(expandedYear === year.id ? null : year.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">
                  📚 {year.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {year.semesters?.length || 0} semesters
                </p>
              </div>
              <span className={`text-xl transition-transform ${
                expandedYear === year.id ? 'rotate-180' : ''
              }`}>
                ▼
              </span>
            </button>

            {expandedYear === year.id && (
              <div className="border-t border-gray-200 px-6 py-4 space-y-3">
                {year.semesters?.map((semester) => (
                  <div key={semester.id} className="bg-gray-50 rounded p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      📖 {semester.title}
                    </h3>
                    <div className="ml-4 space-y-2">
                      {semester.subjects?.map((subject) => (
                        <div key={subject.id} className="text-sm text-gray-600">
                          • <strong>{subject.code}</strong>: {subject.title}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {years.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-900">No years found. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}
