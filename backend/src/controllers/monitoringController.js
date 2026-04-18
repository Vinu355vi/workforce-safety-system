const Worker = require('../models/Worker');
const Alert = require('../models/Alert');
const VideoAnalysis = require('../models/VideoAnalysis');
const trackingService = require('../services/trackingService');
const { Op } = require('sequelize');

exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, workers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      where: { workerId: req.params.workerId }
    });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    let totalWorkers = await Worker.count();
    let activeWorkers = await Worker.count({ where: { status: 'active' } });
    let compliantWorkers = await Worker.count({
      where: {
        ppeCompliance: {
          compliant: true
        }
      }
    });
    const alerts = await Alert.count({ where: { resolved: false } });

    // Aggregate Video Analysis Data
    const videos = await VideoAnalysis.findAll({ where: { status: 'completed' } });
    videos.forEach(video => {
      const summary = video.results?.summary;
      if (summary) {
        totalWorkers += summary.totalWorkers || 0;
        activeWorkers += summary.totalWorkers || 0;
        const fullyCompliant = Math.min(
          summary.ppeCompliance?.helmet || 0,
          summary.ppeCompliance?.mask || 0,
          summary.ppeCompliance?.vest || 0
        );
        compliantWorkers += fullyCompliant;
      }
    });

    res.json({
      success: true,
      stats: {
        totalWorkers,
        activeWorkers,
        compliantWorkers,
        alertsCount: alerts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateWorkerStatus = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { status } = req.body;
    
    const worker = await Worker.findOne({ where: { workerId } });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    
    worker.status = status;
    await worker.save();
    
    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      where: { resolved: false },
      order: [['timestamp', 'DESC']],
      limit: 50
    });
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findByPk(alertId);
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    alert.resolved = true;
    alert.resolvedAt = new Date();
    await alert.save();
    
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};