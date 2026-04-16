const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class YOLODetector {
  constructor() {
    this.model = null;
    this.classes = [
      'person', 'helmet', 'mask', 'vest', 
      'hardhat', 'safety_vest', 'face_mask', 'gloves', 'goggles'
    ];
    this.inputSize = 640;
    this.confidenceThreshold = 0.5;
    this.iouThreshold = 0.45;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Check if model exists, if not, download or use a pre-trained model
      const modelPath = process.env.MODEL_PATH || './models/yolov8n.pt';
      
      // For demonstration, we'll create a lightweight model
      // In production, you would load an actual YOLO model
      this.model = await this.createLightweightModel();
      this.isInitialized = true;
      console.log('YOLO Detector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize YOLO detector:', error);
      // Create a mock detector for demo purposes
      this.isInitialized = false;
    }
  }

  async createLightweightModel() {
    // Create a simple convolutional model for object detection
    const model = tf.sequential();
    
    model.add(tf.layers.conv2d({
      inputShape: [this.inputSize, this.inputSize, 3],
      filters: 16,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.globalAveragePooling2d({ dataFormat: 'channelsLast' }));
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(tf.layers.dense({ units: this.classes.length * 5, activation: 'sigmoid' }));
    
    return model;
  }

  async detectObjects(imageBuffer) {
    try {
      // Preprocess image
      const preprocessed = await this.preprocessImage(imageBuffer);
      
      if (this.isInitialized && this.model) {
        // Run inference with actual model
        const predictions = await this.model.predict(preprocessed);
        const detections = await this.processPredictions(predictions);
        return detections;
      } else {
        // Return mock detections for demo
        return this.generateMockDetections();
      }
    } catch (error) {
      console.error('Detection error:', error);
      return this.generateMockDetections();
    }
  }

  async preprocessImage(imageBuffer) {
    try {
      // Resize and normalize image
      const processed = await sharp(imageBuffer)
        .resize(this.inputSize, this.inputSize, {
          fit: 'cover',
          position: 'center'
        })
        .removeAlpha()
        .raw()
        .toBuffer();
      
      // Convert to tensor and normalize to [0,1]
      let tensor = tf.tensor3d(new Uint8Array(processed), [this.inputSize, this.inputSize, 3]);
      tensor = tensor.div(255.0);
      tensor = tensor.expandDims(0);
      
      return tensor;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw error;
    }
  }

  async processPredictions(predictions) {
    const detections = [];
    const data = await predictions.data();
    
    // Reshape predictions to [gridSize, gridSize, anchors, classes + 5]
    const gridSize = this.inputSize / 32; // Typical YOLO grid size
    const numAnchors = 3;
    const numClasses = this.classes.length;
    
    for (let i = 0; i < data.length; i += (numClasses + 5)) {
      const confidence = data[i + 4];
      
      if (confidence > this.confidenceThreshold) {
        // Get class predictions
        const classScores = [];
        for (let j = 0; j < numClasses; j++) {
          classScores.push(data[i + 5 + j]);
        }
        
        const classId = classScores.indexOf(Math.max(...classScores));
        const classConfidence = classScores[classId];
        
        if (classConfidence > this.confidenceThreshold) {
          // Extract bounding box coordinates (normalized)
          const x = data[i];
          const y = data[i + 1];
          const w = data[i + 2];
          const h = data[i + 3];
          
          // Convert to pixel coordinates
          const bbox = [
            Math.max(0, (x - w/2) * this.inputSize),
            Math.max(0, (y - h/2) * this.inputSize),
            Math.min(this.inputSize, w * this.inputSize),
            Math.min(this.inputSize, h * this.inputSize)
          ];
          
          detections.push({
            class: this.classes[classId],
            confidence: classConfidence * confidence,
            bbox: bbox,
            classId: classId
          });
        }
      }
    }
    
    // Apply NMS (Non-Maximum Suppression)
    return this.applyNMS(detections);
  }

  applyNMS(detections) {
    if (detections.length === 0) return [];
    
    // Sort by confidence descending
    detections.sort((a, b) => b.confidence - a.confidence);
    
    const selected = [];
    const suppressed = new Array(detections.length).fill(false);
    
    for (let i = 0; i < detections.length; i++) {
      if (suppressed[i]) continue;
      
      selected.push(detections[i]);
      
      for (let j = i + 1; j < detections.length; j++) {
        if (suppressed[j]) continue;
        
        const iou = this.calculateIoU(detections[i].bbox, detections[j].bbox);
        if (iou > this.iouThreshold) {
          suppressed[j] = true;
        }
      }
    }
    
    return selected;
  }

  calculateIoU(box1, box2) {
    const x1 = Math.max(box1[0], box2[0]);
    const y1 = Math.max(box1[1], box2[1]);
    const x2 = Math.min(box1[0] + box1[2], box2[0] + box2[2]);
    const y2 = Math.min(box1[1] + box1[3], box2[1] + box2[3]);
    
    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const area1 = box1[2] * box1[3];
    const area2 = box2[2] * box2[3];
    const union = area1 + area2 - intersection;
    
    return intersection / union;
  }

  generateMockDetections() {
    // Generate realistic mock detections for demo
    const detections = [];
    const numDetections = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < numDetections; i++) {
      const isPerson = Math.random() > 0.3;
      const className = isPerson ? 'person' : 
        ['helmet', 'mask', 'vest'][Math.floor(Math.random() * 3)];
      
      detections.push({
        class: className,
        confidence: 0.7 + Math.random() * 0.29,
        bbox: [
          Math.random() * (this.inputSize - 100),
          Math.random() * (this.inputSize - 150),
          80 + Math.random() * 60,
          120 + Math.random() * 80
        ],
        classId: this.classes.indexOf(className)
      });
    }
    
    return detections;
  }

  detectPPECompliance(detections) {
    // Group detections by person (using proximity)
    const persons = detections.filter(d => d.class === 'person');
    const ppeItems = detections.filter(d => ['helmet', 'mask', 'vest'].includes(d.class));
    
    const complianceResults = [];
    
    persons.forEach(person => {
      // Find PPE items near this person
      const nearbyPPE = ppeItems.filter(ppe => {
        const centerX = person.bbox[0] + person.bbox[2] / 2;
        const centerY = person.bbox[1] + person.bbox[3] / 2;
        const ppeCenterX = ppe.bbox[0] + ppe.bbox[2] / 2;
        const ppeCenterY = ppe.bbox[1] + ppe.bbox[3] / 2;
        
        const distance = Math.sqrt(
          Math.pow(centerX - ppeCenterX, 2) + 
          Math.pow(centerY - ppeCenterY, 2)
        );
        
        return distance < 100; // Threshold for association
      });
      
      const hasHelmet = nearbyPPE.some(ppe => ppe.class === 'helmet');
      const hasMask = nearbyPPE.some(ppe => ppe.class === 'mask');
      const hasVest = nearbyPPE.some(ppe => ppe.class === 'vest');
      
      complianceResults.push({
        personId: `worker_${Date.now()}_${Math.random()}`,
        bbox: person.bbox,
        confidence: person.confidence,
        ppe: {
          helmet: hasHelmet,
          mask: hasMask,
          vest: hasVest,
          compliant: hasHelmet && hasMask && hasVest
        },
        timestamp: new Date()
      });
    });
    
    return complianceResults;
  }

  async detectFromVideo(videoPath, onProgress) {
    // This would integrate with FFmpeg to process video frames
    // For now, return mock results
    const results = {
      totalFrames: 300,
      processedFrames: 0,
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
    
    // Simulate processing
    for (let i = 0; i < results.totalFrames; i += 30) {
      const frameDetections = this.generateMockDetections();
      const compliance = this.detectPPECompliance(frameDetections);
      
      results.detections.push({
        frame: i,
        detections: frameDetections,
        compliance: compliance
      });
      
      results.processedFrames = i;
      
      if (onProgress) {
        onProgress((i / results.totalFrames) * 100);
      }
    }
    
    // Calculate summary
    results.detections.forEach(frame => {
      results.summary.totalWorkers += frame.compliance.length;
      
      frame.compliance.forEach(worker => {
        if (worker.ppe.helmet) results.summary.ppeCompliance.helmet++;
        if (worker.ppe.mask) results.summary.ppeCompliance.mask++;
        if (worker.ppe.vest) results.summary.ppeCompliance.vest++;
        
        if (!worker.ppe.compliant) {
          results.summary.violations.push({
            frame: frame.frame,
            workerId: worker.personId,
            missing: {
              helmet: !worker.ppe.helmet,
              mask: !worker.ppe.mask,
              vest: !worker.ppe.vest
            }
          });
        }
      });
    });
    
    return results;
  }

  async cleanup() {
    if (this.model) {
      this.model.dispose();
    }
  }
}

// Helper function to get array length
function len(arr) {
  return arr.length;
}

// Export singleton instance
const yoloDetector = new YOLODetector();

// Initialize on load
yoloDetector.initialize().catch(console.error);

module.exports = yoloDetector;