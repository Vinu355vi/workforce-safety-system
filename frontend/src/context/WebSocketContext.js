'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('detection-update', (data) => {
      setDetections(data.detections);
      setWorkers(data.workers);
      setStats(data.stats);
      
      // Check for new alerts
      if (data.workers) {
        const newAlerts = data.workers
          .filter(w => w.alert)
          .map(w => ({
            id: Date.now(),
            workerId: w.workerId,
            message: w.alert.message,
            severity: 'high',
            timestamp: new Date()
          }));
        
        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
        }
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  return (
    <WebSocketContext.Provider value={{ workers, detections, stats, alerts, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}