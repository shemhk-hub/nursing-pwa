'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  subscription_status: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setUser(data);
        setFormData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  const handleSaveProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', session.user.id);

      setUser((prev) =>
        prev
          ? {
              ...prev,
              full_name: formData.full_name || prev.full_name,
              phone: formData.phone || prev.phone,
            }
          : null
      );

      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center py-12">User not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
            <p className="text-gray-600 mt-1">Nursing Student</p>
            <span className="inline-block mt-3 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-semibold">
              {user.subscription_status} Plan
            </span>
          </div>
        </div>

        {/* Profile Information */}
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(user);
                }}
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Email Address</p>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="text-lg font-semibold text-gray-900">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">{user.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Subscription Plan</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {user.subscription_status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-blue-900 mb-4">📋 Subscription Information</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">Current Plan</span>
            <span className="font-semibold text-blue-900 capitalize">{user.subscription_status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-800">Status</span>
            <span className="font-semibold text-green-600">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-800">Access Level</span>
            <span className="font-semibold text-blue-900">Full Curriculum</span>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Account Actions</h2>
        <div className="space-y-3">
          <button className="w-full p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left">
            <p className="font-semibold text-gray-900">Change Password</p>
            <p className="text-sm text-gray-600">Update your account password</p>
          </button>
          <button className="w-full p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left">
            <p className="font-semibold text-gray-900">Download Data</p>
            <p className="text-sm text-gray-600">Export your learning data</p>
          </button>
          <button className="w-full p-4 border border-red-200 rounded hover:bg-red-50 transition-colors text-left">
            <p className="font-semibold text-red-600">Delete Account</p>
            <p className="text-sm text-red-500">Permanently delete your account</p>
          </button>
        </div>
      </div>
    </div>
  );
}
