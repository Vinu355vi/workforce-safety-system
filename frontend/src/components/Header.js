'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, UserIcon, SearchIcon, MoonIcon, SunIcon } from 'lucide-react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      // Simulated notifications
      setNotifications([
        { id: 1, message: 'PPE violation detected in Zone A', time: '2 min ago', unread: true },
        { id: 2, message: 'Worker inactivity alert', time: '15 min ago', unread: true },
        { id: 3, message: 'Weekly report generated', time: '1 hour ago', unread: false },
      ]);
    };
    fetchNotifications();
  }, []);

  return (
    <header className="glass-effect sticky top-0 z-30">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-800 rounded-lg px-3 py-2 w-96">
          <SearchIcon size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search workers, reports..."
            className="bg-transparent ml-2 outline-none text-white w-full"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            {darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all relative">
              <BellIcon size={18} />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl hidden group-hover:block">
              <div className="p-3 border-b border-gray-700">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${notif.unread ? 'bg-blue-900 bg-opacity-20' : ''}`}>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <UserIcon size={16} />
              </div>
              <span className="hidden md:inline">Admin User</span>
            </button>
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl hidden group-hover:block">
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors">Profile</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors">Account Settings</button>
                <hr className="my-2 border-gray-700" />
                <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}