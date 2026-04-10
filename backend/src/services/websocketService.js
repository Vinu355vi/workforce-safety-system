const detectionService = require('./detectionService');
const trackingService = require('./trackingService');

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
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      stopRealTimeMonitoring(socket);
    });
  });
}

let monitoringInterval = null;

function startRealTimeMonitoring(socket) {
  monitoringInterval = setInterval(async () => {
    // Simulate real-time detection (replace with actual camera feed)
    const mockDetections = generateMockDetections();
    
    // Process detections and update tracking
    const workersData = trackingService.getAllWorkers();
    
    // Send updates to client
    socket.emit('detection-update', {
      timestamp: new Date().toISOString(),
      detections: mockDetections,
      workers: workersData,
      stats: {
        totalWorkers: workersData.length,
        activeWorkers: workersData.filter(w => w.status === 'active').length,
        compliantWorkers: workersData.filter(w => w.ppeCompliance?.compliant).length,
        alertsCount: Math.floor(Math.random() * 5)
      }
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