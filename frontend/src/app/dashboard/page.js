'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldIcon, 
  UsersIcon, 
  AlertTriangleIcon, 
  TrendingUpIcon,
  PlayIcon,
  VideoIcon,
  FileTextIcon,
  SettingsIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ActivityIcon,
  BarChart3Icon,
  CalendarIcon,
  DownloadIcon,
  EyeIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { useWebSocket } from '@/context/WebSocketContext';
import StatsCard from '@/components/StatsCard';
import PPEStatusCard from '@/components/PPEStatusCard';
import AlertCard from '@/components/AlertCard';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const router = useRouter();
  const { workers: wsWorkers, stats: wsStats, alerts: wsAlerts, detections } = useWebSocket();
  const [timeRange, setTimeRange] = useState('today');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Local state for initial data fetch
  const [initialStats, setInitialStats] = useState({});
  const [initialWorkers, setInitialWorkers] = useState([]);
  const [initialAlerts, setInitialAlerts] = useState([]);

  // Fetch initial data because WS only fires on detection events
  useEffect(() => {
    import('@/utils/api').then(({ monitoringAPI }) => {
      monitoringAPI.getStats().then(res => {
        if (res.data?.success) setInitialStats(res.data.stats);
      }).catch(console.error);

      monitoringAPI.getWorkers().then(res => {
        if (res.data?.success) setInitialWorkers(res.data.workers);
      }).catch(console.error);

      monitoringAPI.getAlerts().then(res => {
        if (res.data?.success) {
          setInitialAlerts(res.data.alerts);
          
          // Map real alerts to recent activities
          if (res.data.alerts.length > 0) {
            const activities = res.data.alerts.slice(0, 7).map((alert, idx) => ({
              id: alert.id || idx,
              worker: `Worker ${alert.workerId || 'Unknown'}`,
              action: alert.message || 'Safety alert detected',
              time: new Date(alert.timestamp).toLocaleString(),
              type: alert.severity === 'high' ? 'violation' : 'alert'
            }));
            setRecentActivities(activities);
          } else {
            setRecentActivities([]);
          }
        }
      }).catch(console.error);
    });
  }, []);

  // Merge websocket data with initial API data
  const stats = (Object.keys(wsStats || {}).length > 0) ? wsStats : initialStats;
  const workers = (wsWorkers?.length > 0) ? wsWorkers : initialWorkers;
  const alerts = (wsAlerts?.length > 0) ? wsAlerts : initialAlerts;

  const features = [
    { 
      icon: PlayIcon, 
      title: 'Live Monitoring', 
      description: 'Real-time worker tracking and PPE detection', 
      color: 'blue', 
      path: '/live-monitoring',
      stats: `${workers?.length || 0} Active Workers`
    },
    { 
      icon: VideoIcon, 
      title: 'Video Analysis', 
      description: 'Upload and analyze recorded footage', 
      color: 'green', 
      path: '/video-analysis',
      stats: 'Process Recorded Videos'
    },
    { 
      icon: FileTextIcon, 
      title: 'Reports', 
      description: 'Generate comprehensive safety reports', 
      color: 'purple', 
      path: '/reports',
      stats: 'Last 30 days'
    },
    { 
      icon: SettingsIcon, 
      title: 'Settings', 
      description: 'Configure system parameters', 
      color: 'orange', 
      path: '/settings',
      stats: 'System Configuration'
    },
  ];

  // Chart data for worker activity
  const activityChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Workers',
        data: [42, 48, 45, 52, 49, 38, 32],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'PPE Violations',
        data: [5, 3, 7, 4, 6, 2, 1],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB'
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };

  const complianceChartData = {
    labels: ['Compliant', 'Non-Compliant'],
    datasets: [
      {
        data: [stats?.compliantWorkers || 0, (stats?.totalWorkers || 0) - (stats?.compliantWorkers || 0)],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(16, 185, 129)', 'rgb(239, 68, 68)'],
        borderWidth: 2,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF'
        }
      }
    }
  };

  const handleQuickAction = (path) => {
    router.push(path);
    toast.success(`Navigating to ${path.slice(1)}`);
  };

  const handleExportData = () => {
    toast.success('Report generation started');
    setTimeout(() => {
      toast.success('Report ready for download');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
                  Safety Dashboard
                </h1>
                <p className="text-gray-400 mt-2 text-lg">
                  Real-time monitoring and safety compliance tracking system
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
                >
                  <DownloadIcon size={18} />
                  Export Report
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
                  <CalendarIcon size={18} className="text-gray-400" />
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-transparent outline-none text-sm"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </div>
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
              value={stats?.activeWorkers || 0}
              subValue={`${stats?.totalWorkers || 0} Total Workers`}
              icon={UsersIcon}
              color="blue"
              trend={null}
            />
            <StatsCard
              title="PPE Compliance"
              value={`${stats?.totalWorkers ? Math.round((stats?.compliantWorkers || 0) / stats?.totalWorkers * 100) : 0}%`}
              subValue={`${stats?.compliantWorkers || 0} out of ${stats?.totalWorkers || 0} compliant`}
              icon={ShieldIcon}
              color="green"
              trend={null}
            />
            <StatsCard
              title="Active Alerts"
              value={stats?.alertsCount || 0}
              subValue={stats?.alertsCount > 0 ? "Pending resolution" : "All clear"}
              icon={AlertTriangleIcon}
              color="red"
              trend={null}
            />
            <StatsCard
              title="Assessed Efficiency"
              value="N/A"
              subValue="Waiting for tracking data"
              icon={TrendingUpIcon}
              color="purple"
              trend={null}
            />
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-effect rounded-xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BarChart3Icon size={20} />
                  Activity Overview
                </h2>
                <button className="text-sm text-blue-400 hover:text-blue-300">
                  View Details
                </button>
              </div>
              <div className="h-80">
                <Line data={activityChartData} options={options} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-effect rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldIcon size={20} />
                Compliance Overview
              </h2>
              <div className="h-80">
                <Doughnut data={complianceChartData} options={doughnutOptions} />
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <PPEStatusCard workers={workers} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AlertCard alerts={alerts} />
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ActivityIcon size={20} />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'violation' ? 'bg-red-500' :
                      activity.type === 'alert' ? 'bg-yellow-500' :
                      activity.type === 'start' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-semibold text-white">{activity.worker}</p>
                      <p className="text-sm text-gray-400">{activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    <EyeIcon size={16} className="text-gray-500 hover:text-blue-400 cursor-pointer" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAction(feature.path)}
                  className="glass-effect rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 bg-opacity-20 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-500`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-400">{feature.stats}</span>
                    <PlayIcon size={14} className="text-gray-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Worker Details Modal */}
          <AnimatePresence>
            {selectedWorker && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedWorker(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="glass-effect rounded-xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold gradient-text">Worker Details</h2>
                    <button
                      onClick={() => setSelectedWorker(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm">Worker ID</label>
                      <p className="text-white font-semibold">{selectedWorker.workerId}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Name</label>
                      <p className="text-white">{selectedWorker.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Status</label>
                      <p className={`font-semibold ${selectedWorker.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedWorker.status}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Active Time</label>
                      <p className="text-white flex items-center gap-2">
                        <ClockIcon size={14} />
                        {selectedWorker.formattedActiveTime || '00:00:00'}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">PPE Compliance</label>
                      <div className="flex gap-3 mt-2">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded ${selectedWorker.ppeCompliance?.helmet ? 'bg-green-600' : 'bg-red-600'}`}>
                          {selectedWorker.ppeCompliance?.helmet ? <CheckCircleIcon size={14} /> : <XCircleIcon size={14} />}
                          Helmet
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded ${selectedWorker.ppeCompliance?.mask ? 'bg-green-600' : 'bg-red-600'}`}>
                          {selectedWorker.ppeCompliance?.mask ? <CheckCircleIcon size={14} /> : <XCircleIcon size={14} />}
                          Mask
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded ${selectedWorker.ppeCompliance?.vest ? 'bg-green-600' : 'bg-red-600'}`}>
                          {selectedWorker.ppeCompliance?.vest ? <CheckCircleIcon size={14} /> : <XCircleIcon size={14} />}
                          Vest
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWorker(null)}
                    className="mt-6 w-full px-4 py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}