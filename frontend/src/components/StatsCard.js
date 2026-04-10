import { motion } from 'framer-motion';

export default function StatsCard({ title, value, subValue, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-effect rounded-xl p-6 transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-20`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-green-500 text-sm font-semibold">{trend}</span>
        )}
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className="text-gray-400 text-sm">{subValue}</p>
    </motion.div>
  );
}