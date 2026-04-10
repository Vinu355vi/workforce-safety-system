import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangleIcon, BellIcon, CheckCircleIcon } from 'lucide-react';
import { useState } from 'react';

export default function AlertCard({ alerts }) {
  const [showAll, setShowAll] = useState(false);
  const displayedAlerts = showAll ? alerts : alerts?.slice(0, 5);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <BellIcon size={20} />
          Recent Alerts
        </h2>
        {alerts?.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showAll ? 'Show Less' : `View All (${alerts.length})`}
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {displayedAlerts?.map((alert, index) => (
            <motion.div
              key={alert.id || index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800 rounded-lg p-3"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                  <AlertTriangleIcon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{alert.message}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      Worker: {alert.workerId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                {!alert.resolved && (
                  <button className="text-green-500 hover:text-green-400">
                    <CheckCircleIcon size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {(!alerts || alerts.length === 0) && (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-400">No active alerts</p>
            <p className="text-sm text-gray-500">All systems operating normally</p>
          </div>
        )}
      </div>
    </div>
  );
}