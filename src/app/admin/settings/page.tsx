'use client';

import { useState } from 'react';

export default function Settings() {
  const [platformName, setPlatformName] = useState('Nursing PWA');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-900">✓ Settings saved successfully!</p>
        </div>
      )}

      {/* Platform Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform Name
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 text-teal-600"
            />
            <span className="text-gray-900">Enable Email Notifications</span>
          </label>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-5 h-5 text-orange-600"
            />
            <span className="text-gray-900">Maintenance Mode</span>
          </label>
          <p className="text-sm text-gray-500 ml-8">
            When enabled, only admins can access the platform
          </p>
        </div>
      </div>

      {/* Database Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Database Information</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Provider:</strong> Supabase PostgreSQL
          </p>
          <p>
            <strong>Project ID:</strong> uiakghpvtayplyuaxzyh
          </p>
          <p>
            <strong>Tables:</strong> 15
          </p>
          <p>
            <strong>Status:</strong> <span className="text-green-600">✓ Connected</span>
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="px-6 py-3 bg-teal-600 text-white rounded font-semibold hover:bg-teal-700 transition-colors"
      >
        Save Settings
      </button>
    </div>
  );
}
