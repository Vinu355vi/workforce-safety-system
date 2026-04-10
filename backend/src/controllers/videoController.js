const VideoAnalysis = require('../models/VideoAnalysis');
const detectionService = require('../services/detectionService');
const trackingService = require('../services/trackingService');
const fs = require('fs').promises;
const path = require('path');

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file uploaded' });
    }
    
    const videoAnalysis = await VideoAnalysis.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: 'uploaded'
    });
    
    res.json({
      success: true,
      analysisId: videoAnalysis.id,
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyzeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const videoAnalysis = await VideoAnalysis.findByPk(videoId);
    
    if (!videoAnalysis) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    
    videoAnalysis.status = 'processing';
    await videoAnalysis.save();
    
    // Process video frames
    const results = await processVideoFrames(videoAnalysis.filePath);
    
    videoAnalysis.status = 'completed';
    videoAnalysis.results = results;
    videoAnalysis.completedAt = new Date();
    await videoAnalysis.save();
    
    res.json({
      success: true,
      results,
      message: 'Video analysis completed'
    });
  } catch (error) {
    const videoAnalysis = await VideoAnalysis.findByPk(req.params.videoId);
    if (videoAnalysis) {
      videoAnalysis.status = 'failed';
      videoAnalysis.error = error.message;
      await videoAnalysis.save();
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

async function processVideoFrames(videoPath) {
  // Simulate video frame processing
  // In production, you would use FFmpeg to extract frames and process them
  
  const results = {
    totalFrames: 300,
    processedFrames: 300,
    detections: [],
    summary: {
      totalWorkers: 0,
      ppeCompliance: {
        helmet: 0,
        mask: 0,
        vest: 0
      },
      violations: []
    }
  };
  
  // Simulate detection results
  for (let i = 0; i < 10; i++) {
    results.detections.push({
      frame: i * 30,
      workers: Math.floor(Math.random() * 5) + 1,
      ppeCompliance: {
        helmet: Math.random() > 0.2,
        mask: Math.random() > 0.3,
        vest: Math.random() > 0.4
      }
    });
  }
  
  return results;
}

exports.getAnalysisResults = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await VideoAnalysis.findByPk(analysisId);
    
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }
    
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserAnalyses = async (req, res) => {
  try {
    const analyses = await VideoAnalysis.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, analyses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await VideoAnalysis.findByPk(analysisId);
    
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }
    
    // Delete file from storage
    await fs.unlink(analysis.filePath);
    
    await analysis.destroy();
    
    res.json({ success: true, message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};