'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboardIcon,
  VideoIcon,
  ActivityIcon,
  FileTextIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  ShieldIcon
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboardIcon, label: 'Dashboard' },
  { path: '/live-monitoring', icon: ActivityIcon, label: 'Live Monitoring' },
  { path: '/video-analysis', icon: VideoIcon, label: 'Video Analysis' },
  { path: '/reports', icon: FileTextIcon, label: 'Reports' },
  { path: '/settings', icon: SettingsIcon, label: 'Settings' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg lg:hidden"
      >
        {isOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 shadow-xl z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <ShieldIcon className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-blue-400">Safety</span>
                <span className="text-emerald-400">Monitor</span>
              </h1>
              <p className="text-xs text-gray-400">Workforce Safety System</p>
            </div>
          </div>

          <nav className="space-y-2 flex-grow">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.path} href={item.path} onClick={() => setIsOpen(false)}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:text-red-300 transition-all w-full"
            >
              <LogOutIcon size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}