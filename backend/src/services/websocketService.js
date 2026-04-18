const detectionService = require('./detectionService');
const trackingService = require('./trackingService');
const Worker = require('../models/Worker');
const Alert = require('../models/Alert');

let io;

function setupWebSocket(server) {
  io = server;
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('start-monitoring', () => {
      startRealTimeMonitoring(socket);
    });
    
    socket.on('stop-monitoring', () => {
      stopRealTimeMonitoring(socket);
    });

    socket.on('live-detections', async (data) => {
      const detections = data.detections || [];
      
      for (const worker of detections) {
        trackingService.updateWorkerTracking(
          worker.workerId,
          detections,
          new Date()
        );
        const trackingWorker = trackingService.workers.get(worker.workerId);
        if (trackingWorker) {
          trackingWorker.ppeCompliance = { 
            compliant: worker.compliant,
            helmet: worker.ppe?.helmet,
            mask: worker.ppe?.mask,
            vest: worker.ppe?.vest
          };
          trackingWorker.ppe = worker.ppe;

          // Sync to Database periodically or create if not exists
          try {
            let dbWorker = await Worker.findOne({ where: { workerId: trackingWorker.workerId } });
            if (!dbWorker) {
              dbWorker = await Worker.create({
                workerId: trackingWorker.workerId,
                name: `Worker ${trackingWorker.workerId.split('_')[1] || trackingWorker.workerId}`,
                department: 'General',
                status: trackingWorker.status,
                totalActiveTime: trackingWorker.totalActiveTime,
                ppeCompliance: trackingWorker.ppeCompliance
              });
            } else {
              dbWorker.status = trackingWorker.status;
              dbWorker.totalActiveTime = trackingWorker.totalActiveTime;
              dbWorker.ppeCompliance = trackingWorker.ppeCompliance;
              await dbWorker.save();
            }
            
            // Check for new PPE violation alert
            if (!worker.compliant) {
              const recentAlert = await Alert.findOne({
                where: { workerId: worker.workerId, resolved: false }
              });
              if (!recentAlert) {
                await Alert.create({
                  workerId: worker.workerId,
                  alertType: 'ppe_violation',
                  severity: 'high',
                  message: `PPE violation detected: missing required gear.`,
                  resolved: false
                });
              }
            }
          } catch (err) {
            console.error('Error syncing worker to DB:', err);
          }
        }
      }

      const workersData = trackingService.getAllWorkers();
      
      const stats = {
        totalWorkers: workersData.length,
        activeWorkers: workersData.filter(w => w.status === 'active').length,
        compliantWorkers: workersData.filter(w => w.ppeCompliance?.compliant).length,
        alertsCount: workersData.filter(w => w.alert).length
      };

      const payload = {
        timestamp: new Date().toISOString(),
        detections: detections,
        workers: workersData,
        stats: stats
      };

      // Broadcast and send back to sender
      socket.broadcast.emit('detection-update', payload);
      socket.emit('detection-update', payload);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      stopRealTimeMonitoring(socket);
    });
  });
}

let monitoringInterval = null;

function startRealTimeMonitoring(socket) {
  if (monitoringInterval) clearInterval(monitoringInterval);
  
  monitoringInterval = setInterval(async () => {
    // Simulate real-time detection (replace with actual camera feed)
    const mockDetections = generateMockDetections();
    
    // Update tracking for each worker detected
    mockDetections.forEach(worker => {
      const isCompliant = worker.ppe.helmet && worker.ppe.mask && worker.ppe.vest;
      const tracked = trackingService.updateWorkerTracking(
        worker.workerId,
        mockDetections,
        new Date()
      );
      const trackingWorker = trackingService.workers.get(worker.workerId);
      if (trackingWorker) {
        trackingWorker.ppeCompliance = { compliant: isCompliant };
        trackingWorker.ppe = worker.ppe;
      }
    });

    // Process detections and update tracking
    const workersData = trackingService.getAllWorkers();
    
    // Send updates to client
    const stats = {
      totalWorkers: workersData.length,
      activeWorkers: workersData.filter(w => w.status === 'active').length,
      compliantWorkers: workersData.filter(w => w.ppeCompliance?.compliant).length,
      alertsCount: workersData.filter(w => w.alert).length
    };

    socket.emit('detection-update', {
      timestamp: new Date().toISOString(),
      detections: mockDetections,
      workers: workersData,
      stats: stats
    });
  }, 1000);
}

function generateMockDetections() {
  const detections = [];
  const numWorkers = Math.floor(Math.random() * 5) + 1;
  
  for (let i = 0; i < numWorkers; i++) {
    detections.push({
      workerId: `WORKER_${i + 1}`,
      bbox: [Math.random() * 640, Math.random() * 480, 100, 200],
      ppe: {
        helmet: Math.random() > 0.3,
        mask: Math.random() > 0.2,
        vest: Math.random() > 0.4
      },
      confidence: 0.7 + Math.random() * 0.3
    });
  }
  
  return detections;
}

function stopRealTimeMonitoring(socket) {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

module.exports = { setupWebSocket };