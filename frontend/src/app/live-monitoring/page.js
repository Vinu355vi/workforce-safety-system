'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { 
  PlayIcon, 
  PauseIcon, 
  CameraIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  ActivityIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { WebSocketContext } from '../../context/WebSocketContext';

export default function LiveMonitoring() {
  const { socket } = useContext(WebSocketContext) || {};
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [detections, setDetections] = useState([]);
  const webcamRef = useRef(null);
  const modelRef = useRef(null);
  const requestRef = useRef(null);

  // Load Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        modelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        console.log('TFJS Object Detection Model Loaded');
      } catch (err) {
        console.error('Failed to load TFJS model', err);
      }
    };
    loadModel();
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const detectFrame = async () => {
    if (!isMonitoring || !webcamRef.current || !webcamRef.current.video || !modelRef.current) {
      if (isMonitoring) requestRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const video = webcamRef.current.video;
    if (video.readyState !== 4) {
      requestRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    try {
      const predictions = await modelRef.current.detect(video);
      
      // Filter only for persons (simulating "workforce tracking")
      const personDetections = predictions.filter(p => p.class === 'person');
      
      // Adjust bounding boxes to be more accurate (webcam scales down, so these are relative)
      const formattedDetections = personDetections.map((p, i) => {
        // Since coco-ssd can only detect 'person', we accurate default to no PPE 
        // for realistic testing when the user is not wearing any gear
        const hasHelmet = false;
        const hasMask = false;
        const hasVest = false;
        const isCompliant = hasHelmet && hasMask && hasVest;
        
        return {
          workerId: `WORKER_${i + 1}`,
          bbox: p.bbox, // [x, y, width, height]
          score: p.score,
          ppe: {
            helmet: hasHelmet,
            mask: hasMask,
            vest: hasVest
          },
          compliant: isCompliant
        };
      });

      setDetections(formattedDetections);
      
      const newWorkers = formattedDetections.map(d => ({
        workerId: d.workerId,
        status: 'active',
        ppeCompliance: d.ppe,
        compliant: d.compliant,
        lastActiveTime: new Date().toISOString()
      }));
      
      // Update mocked tracking logic natively
      setWorkers(newWorkers);

      // Emit to websocket if available
      if (socket && newWorkers.length > 0) {
        socket.emit('live-detections', { detections: newWorkers });
      }

    } catch (error) {
      console.error('Detection Error', error);
    }
    
    // Continuously run via RAF
    requestRef.current = requestAnimationFrame(detectFrame);
  };

  useEffect(() => {
    if (isMonitoring) {
      requestRef.current = requestAnimationFrame(detectFrame);
    } else {
      cancelAnimationFrame(requestRef.current);
      setDetections([]);
    }
  }, [isMonitoring]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    toast.success('Live monitoring started');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    cancelAnimationFrame(requestRef.current);
    toast.success('Live monitoring stopped');
  };

  const captureSnapshot = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Handle snapshot capture
      toast.success('Snapshot captured');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Live Monitoring</h1>
            <p className="text-gray-400 mt-1">Real-time worker tracking and PPE detection</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                isMonitoring 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isMonitoring ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </button>
            <button
              onClick={captureSnapshot}
              className="px-6 py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
            >
              <CameraIcon size={18} />
              Capture
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <div className="glass-effect rounded-xl overflow-hidden">
              <div className="relative">
                <Webcam
                    ref={webcamRef}
                    className="w-full h-auto"
                    videoConstraints={{ width: 640, height: 480 }}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {isMonitoring && (
                    <div className="absolute top-4 left-4 z-50 bg-red-600 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                      RECORDING
                    </div>
                  )}
                  {/* Detection Overlay */}
                  {detections && detections.map((detection, index) => {
                    const mirroredLeft = 640 - (detection.bbox[0]) - (detection.bbox[2]);
                    return (
                    <div
                      key={index}
                      className={`absolute border-2 rounded-lg ${detection.compliant ? 'border-green-500' : 'border-yellow-500'}`}
                      style={{
                        left: mirroredLeft,
                        top: detection.bbox[1],
                        width: detection.bbox[2],
                        height: detection.bbox[3],
                        pointerEvents: 'none'
                      }}
                    >
                      <div className={`absolute -top-6 left-0 text-black text-xs px-2 py-1 rounded whitespace-nowrap ${detection.compliant ? 'bg-green-500' : 'bg-yellow-500'}`}>
                        {detection.workerId} - {Math.round(detection.score * 100)}%
                      </div>
                    </div>
                  )})}
                </div>
              </div>
          </motion.div>

          {/* Workers List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <UsersIcon size={20} />
              Active Workers ({workers?.length || 0})
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {workers?.map((worker) => (
                <motion.div
                  key={worker.workerId}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedWorker(worker)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedWorker?.workerId === worker.workerId
                      ? 'bg-blue-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{worker.workerId}</h3>
                      <p className="text-sm text-gray-300">{worker.department || 'General'}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      worker.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {worker.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <ClockIcon size={14} />
                      <span>{worker.formattedActiveTime || '00:00:00'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ActivityIcon size={14} />
                      <span>Active</span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {worker.ppeCompliance?.helmet && <CheckCircleIcon size={14} className="text-green-500" />}
                    {worker.ppeCompliance?.mask && <CheckCircleIcon size={14} className="text-green-500" />}
                    {worker.ppeCompliance?.vest && <CheckCircleIcon size={14} className="text-green-500" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Worker Details Modal */}
        <AnimatePresence>
          {selectedWorker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setSelectedWorker(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-effect rounded-xl p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4">Worker Details</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Worker ID</label>
                    <p className="text-white font-semibold">{selectedWorker.workerId}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Status</label>
                    <p className={`font-semibold ${selectedWorker.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                      {selectedWorker.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Active Time</label>
                    <p className="text-white">{selectedWorker.formattedActiveTime}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">PPE Compliance</label>
                    <div className="flex gap-3 mt-1">
                      <div className={`px-3 py-1 rounded ${selectedWorker.ppeCompliance?.helmet ? 'bg-green-600' : 'bg-red-600'}`}>
                        Helmet
                      </div>
                      <div className={`px-3 py-1 rounded ${selectedWorker.ppeCompliance?.mask ? 'bg-green-600' : 'bg-red-600'}`}>
                        Mask
                      </div>
                      <div className={`px-3 py-1 rounded ${selectedWorker.ppeCompliance?.vest ? 'bg-green-600' : 'bg-red-600'}`}>
                        Vest
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWorker(null)}
                  className="mt-6 w-full px-4 py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}