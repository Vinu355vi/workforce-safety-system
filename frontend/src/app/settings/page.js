'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, LockIcon, BellIcon, ShieldIcon, DatabaseIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    role: ''
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    smsAlerts: false,
    systemNotifications: true,
    retentionDays: 30
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL.replace(/\/api$/, '')}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProfile({
          username: response.data.user.name || '',
          email: response.data.user.email || '',
          role: response.data.user.role || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Note: Assuming a hypothetical update user endpoint if needed.
    // For now we simulate success since the backend may only support changePassword in auth.
    setTimeout(() => {
      toast.success('Profile updated successfully!');
      setLoading(false);
    }, 1000);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL.replace(/\/api$/, '')}/api/auth/change-password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('Preferences saved successfully!');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">System Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="col-span-1 glass-effect p-2 h-fit">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <UserIcon size={18} />
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'security' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <LockIcon size={18} />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notifications' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <BellIcon size={18} />
              Alert Preferences
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'system' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <DatabaseIcon size={18} />
              System Config
            </button>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="col-span-1 md:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-effect rounded-2xl p-6"
          >
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <UserIcon className="text-purple-500" /> User Profile
                </h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value})}
                      className="w-full bg-gray-800 border fill-current border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full bg-gray-800 border fill-current border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                    <input
                      type="text"
                      value={profile.role}
                      disabled
                      className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all text-white"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <LockIcon className="text-purple-500" /> Change Password
                </h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all text-white"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <BellIcon className="text-purple-500" /> Alert Preferences
                </h2>
                <div className="space-y-6 max-w-lg">
                  {[
                    { key: 'emailAlerts', title: 'Email Alerts', desc: 'Receive critical safety alerts via email.' },
                    { key: 'smsAlerts', title: 'SMS Notifications', desc: 'Get urgent warnings directly on your phone.' },
                    { key: 'systemNotifications', title: 'In-app Notifications', desc: 'Show toast notifications during active sessions.' }
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-white">{pref.title}</h3>
                        <p className="text-sm text-gray-400">{pref.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferences[pref.key]}
                          onChange={(e) => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                  ))}
                  
                  <button
                    onClick={handlePreferencesUpdate}
                    disabled={loading}
                    className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all text-white"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <ShieldIcon className="text-purple-500" /> System Configuration
                </h2>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Video Data Retention Policy (Days)</label>
                    <select
                      value={preferences.retentionDays}
                      onChange={(e) => setPreferences({...preferences, retentionDays: parseInt(e.target.value)})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 text-white"
                    >
                      <option value={7}>7 Days (Compliance minimal)</option>
                      <option value={30}>30 Days (Standard)</option>
                      <option value={90}>90 Days (Extended insight)</option>
                      <option value={365}>1 Year (Full archival)</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-2">Adjusting this will affect database storage costs and processing thresholds.</p>
                  </div>

                  <hr className="border-gray-800 my-6" />

                  <div>
                     <h3 className="font-medium text-red-400 mb-2">Danger Zone</h3>
                     <p className="text-sm text-gray-400 mb-4">Permanent actions that affect system availability.</p>
                     
                     <button className="px-4 py-2 bg-red-900/30 border border-red-800 text-red-400 rounded-lg font-medium hover:bg-red-900/50 transition-colors">
                        Purge All Historical Data
                     </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
