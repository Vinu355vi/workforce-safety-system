import { motion } from 'framer-motion';
import { ShieldIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

export default function PPEStatusCard({ workers }) {
  const compliantWorkers = workers?.filter(w => w.ppeCompliance?.compliant) || [];
  const nonCompliantWorkers = workers?.filter(w => !w.ppeCompliance?.compliant) || [];

  return (
    <div className="glass-effect rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <ShieldIcon size={20} />
        PPE Compliance Status
      </h2>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Overall Compliance</span>
          <span>{Math.round((compliantWorkers.length / (workers?.length || 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(compliantWorkers.length / (workers?.length || 1)) * 100}%` }}
            transition={{ duration: 1 }}
            className="bg-green-500 h-3 rounded-full"
          ></motion.div>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {workers?.map((worker, index) => (
          <motion.div
            key={worker.workerId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800 rounded-lg p-3"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{worker.workerId}</p>
                <p className="text-xs text-gray-400">{worker.department || 'General'}</p>
              </div>
              {worker.ppeCompliance?.compliant ? (
                <CheckCircleIcon className="text-green-500" size={20} />
              ) : (
                <XCircleIcon className="text-red-500" size={20} />
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <div className={`px-2 py-1 rounded text-xs ${
                worker.ppeCompliance?.helmet ? 'bg-green-600' : 'bg-red-600'
              }`}>
                Helmet
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                worker.ppeCompliance?.mask ? 'bg-green-600' : 'bg-red-600'
              }`}>
                Mask
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                worker.ppeCompliance?.vest ? 'bg-green-600' : 'bg-red-600'
              }`}>
                Vest
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}