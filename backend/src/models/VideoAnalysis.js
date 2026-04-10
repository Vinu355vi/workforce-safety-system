const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const VideoAnalysis = sequelize.define('VideoAnalysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  status: {
    type: DataTypes.ENUM('uploaded', 'processing', 'completed', 'failed'),
    defaultValue: 'uploaded'
  },
  results: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  error: {
    type: DataTypes.TEXT
  },
  completedAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true
});

module.exports = VideoAnalysis;