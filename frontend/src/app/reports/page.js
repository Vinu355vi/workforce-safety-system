'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChartIcon, 
  LineChartIcon, 
  DownloadIcon, 
  CalendarIcon,
  TrendingUpIcon,
  ShieldIcon,
  AlertTriangleIcon,
  UsersIcon
} from 'lucide-react';
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
  ArcElement
} from 'chart.js';
import { reportsAPI } from '../../utils/api';
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
  Legend
);

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [complianceData, setComplianceData] = useState(null);

  useEffect(() => {
    fetchReport();
    fetchComplianceData();
  }, [reportType]);

    const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getReportByType(reportType);
      setReportData(response.data.report);
    } catch (error) {
      toast.error('Failed to fetch report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplianceData = async () => {
    try {
      const response = await reportsAPI.getPPEComplianceReport();
      setComplianceData(response.data.complianceData);
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await reportsAPI.exportReport(reportType, format);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    }
  };

  const lineChartData = {
    labels: reportData?.workers?.map(w => w.workerId) || [],
    datasets: [
      {
        label: 'Active Time (hours)',
        data: reportData?.workers?.map(w => (w.activeTime / 3600000).toFixed(2)) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      }
    ]
  };

  const complianceChartData = {
    labels: ['Helmet', 'Mask', 'Vest'],
    datasets: [
      {
        label: 'Compliance Rate',
        data: complianceData ? [
          (complianceData.helmet / reportData?.summary?.totalWorkers * 100).toFixed(1),
          (complianceData.mask / reportData?.summary?.totalWorkers * 100).toFixed(1),
          (complianceData.vest / reportData?.summary?.totalWorkers * 100).toFixed(1)
        ] : [0, 0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 1
      }
    ]
  };

  const pieChartData = {
    labels: ['Active Workers', 'Inactive Workers'],
    datasets: [
      {
        data: [
          reportData?.summary?.activeWorkers || 0,
          (reportData?.summary?.totalWorkers || 0) - (reportData?.summary?.activeWorkers || 0)
        ],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(16, 185, 129)', 'rgb(239, 68, 68)'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Reports & Analytics</h1>
            <p className="text-gray-400 mt-1">Comprehensive safety and performance reports</p>
          </div>
          <div className="flex gap-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
            <button
              onClick={() => exportReport('pdf')}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <DownloadIcon size={18} />
              PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <DownloadIcon size={18} />
              Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading report data...</p>
          </div>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <UsersIcon className="w-8 h-8 text-blue-500" />
                  <span className="text-2xl font-bold text-white">{reportData.summary.totalWorkers}</span>
                </div>
                <h3 className="text-gray-400 text-sm">Total Workers</h3>
                <p className="text-green-500 text-sm mt-2">{reportData.summary.activeWorkers} active</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-effect rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <ShieldIcon className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold text-white">{reportData.summary.ppeComplianceRate}%</span>
                </div>
                <h3 className="text-gray-400 text-sm">PPE Compliance Rate</h3>
                <p className="text-gray-400 text-sm mt-2">Overall compliance</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-effect rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangleIcon className="w-8 h-8 text-yellow-500" />
                  <span className="text-2xl font-bold text-white">{reportData.summary.totalAlerts}</span>
                </div>
                <h3 className="text-gray-400 text-sm">Total Alerts</h3>
                <p className="text-green-500 text-sm mt-2">{reportData.summary.resolvedAlerts} resolved</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-effect rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUpIcon className="w-8 h-8 text-purple-500" />
                  <span className="text-2xl font-bold text-white">94%</span>
                </div>
                <h3 className="text-gray-400 text-sm">Efficiency Rate</h3>
                <p className="text-green-500 text-sm mt-2">+8% from last period</p>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-effect rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <LineChartIcon size={20} />
                  Worker Active Time
                </h2>
                <Line data={lineChartData} options={{ responsive: true }} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-effect rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChartIcon size={20} />
                  PPE Compliance by Type
                </h2>
                <Bar data={complianceChartData} options={{ responsive: true }} />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Worker Status Distribution</h2>
                <div className="w-64 h-64 mx-auto">
                  <Doughnut data={pieChartData} options={{ responsive: true }} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Alert Breakdown</h2>
                <div className="space-y-3">
                  {Object.entries(reportData.alerts).map(([key, count]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(count / reportData.summary.totalAlerts * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No report data available</p>
          </div>
        )}
      </div>
    </div>
  );
}