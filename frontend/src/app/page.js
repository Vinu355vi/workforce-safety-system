'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldIcon, 
  UsersIcon, 
  AlertTriangleIcon, 
  TrendingUpIcon,
  PlayIcon,
  VideoIcon,
  FileTextIcon,
  SettingsIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/StatsCard';
import PPEStatusCard from '@/components/PPEStatusCard';
import AlertCard from '@/components/AlertCard';
import { useWebSocket } from '@/context/WebSocketContext';

export default function Dashboard() {
  const router = useRouter();
  const { stats, workers, alerts } = useWebSocket();
  const [recentAlerts, setRecentAlerts] = useState([]);

  const features = [
    { icon: PlayIcon, title: 'Live Monitoring', description: 'Real-time worker tracking and PPE detection', color: 'blue', path: '/live-monitoring' },
    { icon: VideoIcon, title: 'Video Analysis', description: 'Upload and analyze recorded footage', color: 'green', path: '/video-analysis' },
    { icon: FileTextIcon, title: 'Reports', description: 'Generate comprehensive safety reports', color: 'purple', path: '/reports' },
    { icon: SettingsIcon, title: 'Settings', description: 'Configure system parameters', color: 'orange', path: '/settings' },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Workforce Safety Dashboard
          </h1>
          <p className="text-gray-400">
            Real-time monitoring and safety compliance tracking
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Active Workers"
            value={stats?.totalWorkers || 0}
            subValue={`${stats?.activeWorkers || 0} active`}
            icon={UsersIcon}
            color="blue"
            trend="+12%"
          />
          <StatsCard
            title="PPE Compliance"
            value={`${Math.round((stats?.compliantWorkers || 0) / (stats?.totalWorkers || 1) * 100)}%`}
            subValue={`${stats?.compliantWorkers || 0} compliant`}
            icon={ShieldIcon}
            color="green"
            trend="+5%"
          />
          <StatsCard
            title="Active Alerts"
            value={stats?.alertsCount || 0}
            subValue="pending resolution"
            icon={AlertTriangleIcon}
            color="red"
            trend="-3"
          />
          <StatsCard
            title="Efficiency Rate"
            value="94%"
            subValue="+8% from last week"
            icon={TrendingUpIcon}
            color="purple"
            trend="+8%"
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* PPE Compliance Status */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <PPEStatusCard workers={workers} />
          </motion.div>

          {/* Recent Alerts */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AlertCard alerts={alerts} />
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(feature.path)}
                className="glass-effect rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl"
              >
                <feature.icon className={`w-12 h-12 text-${feature.color}-500 mb-4`} />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}