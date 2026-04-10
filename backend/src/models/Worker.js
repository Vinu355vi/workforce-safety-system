const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workerId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_break'),
    defaultValue: 'active'
  },
  currentActivity: {
    type: DataTypes.STRING,
    defaultValue: 'working'
  },
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  totalActiveTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ppeCompliance: {
    type: DataTypes.JSONB,
    defaultValue: {
      helmet: false,
      mask: false,
      vest: false
    }
  },
  lastLocation: {
    type: DataTypes.JSONB,
    defaultValue: { x: 0, y: 0 }
  }
}, {
  timestamps: true
});

module.exports = Worker;