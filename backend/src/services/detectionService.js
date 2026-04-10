const yoloDetector = require('../utils/yoloDetector');
const trackingService = require('./trackingService');

class DetectionService {
  constructor() {
    this.isReady = false;
    this.initialize();
  }

  async initialize() {
    await yoloDetector.initialize();
    this.isReady = true;
    console.log('Detection service ready');
  }

  async detectFromImage(imageBuffer) {
    try {
      // Detect objects using YOLO
      const detections = await yoloDetector.detectObjects(imageBuffer);
      
      // Check PPE compliance
      const complianceResults = yoloDetector.detectPPECompliance(detections);
      
      // Update tracking for each worker detected
      const trackedWorkers = [];
      for (const worker of complianceResults) {
        const tracked = trackingService.updateWorkerTracking(
          worker.personId,
          detections,
          new Date()
        );
        trackedWorkers.push({
          ...worker,
          ...tracked
        });
      }
      
      return {
        timestamp: new Date(),
        detections,
        workers: trackedWorkers,
        compliance: complianceResults
      };
    } catch (error) {
      console.error('Detection error:', error);
      return null;
    }
  }

  async detectFromVideo(videoPath, onProgress) {
    try {
      const results = await yoloDetector.detectFromVideo(videoPath, onProgress);
      return results;
    } catch (error) {
      console.error('Video detection error:', error);
      throw error;
    }
  }

  checkInactivity(workers, threshold = 300000) {
    const now = Date.now();
    const inactiveWorkers = [];
    
    workers.forEach(worker => {
      const lastActive = new Date(worker.lastActiveTime || worker.startTime);
      const inactiveDuration = now - lastActive;
      
      if (inactiveDuration > threshold && worker.status === 'active') {
        inactiveWorkers.push({
          workerId: worker.workerId,
          inactiveDuration,
          threshold,
          alert: true
        });
      }
    });
    
    return inactiveWorkers;
  }
}

module.exports = new DetectionService();