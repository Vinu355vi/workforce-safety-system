class TrackingService {
  constructor() {
    this.workers = new Map();
    this.inactivityThreshold = 300000; // 5 minutes in milliseconds
  }

  updateWorkerTracking(workerId, detections, timestamp) {
    const now = Date.now();
    const worker = this.workers.get(workerId);
    
    if (!worker) {
      this.workers.set(workerId, {
        workerId,
        startTime: now,
        lastActiveTime: now,
        totalActiveTime: 0,
        inactiveDuration: 0,
        status: 'active'
      });
      return this.workers.get(workerId);
    }
    
    const inactivePeriod = now - worker.lastActiveTime;
    worker.lastActiveTime = now;
    
    if (inactivePeriod > this.inactivityThreshold) {
      worker.inactiveDuration += inactivePeriod;
      worker.status = 'inactive';
      
      // Generate inactivity alert
      if (worker.inactiveDuration >= this.inactivityThreshold) {
        return {
          ...worker,
          alert: {
            type: 'inactivity',
            message: `Worker ${workerId} has been inactive for ${Math.floor(worker.inactiveDuration / 60000)} minutes`
          }
        };
      }
    } else {
      worker.status = 'active';
      worker.totalActiveTime += inactivePeriod;
    }
    
    this.workers.set(workerId, worker);
    return worker;
  }

  formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getWorkerStats(workerId) {
    const worker = this.workers.get(workerId);
    if (!worker) return null;
    
    return {
      ...worker,
      formattedActiveTime: this.formatTime(worker.totalActiveTime),
      formattedInactiveTime: this.formatTime(worker.inactiveDuration)
    };
  }

  getAllWorkers() {
    return Array.from(this.workers.values()).map(worker => ({
      ...worker,
      formattedActiveTime: this.formatTime(worker.totalActiveTime),
      formattedInactiveTime: this.formatTime(worker.inactiveDuration)
    }));
  }
}

module.exports = new TrackingService();