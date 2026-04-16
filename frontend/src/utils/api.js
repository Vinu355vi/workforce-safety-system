import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Ensure '/api' suffix if the base URL is injected directly by a hosting provider like Render
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Monitoring API
export const monitoringAPI = {
  getWorkers: () => api.get('/monitoring/workers'),
  getWorkerById: (id) => api.get(`/monitoring/workers/${id}`),
  getStats: () => api.get('/monitoring/stats'),
  updateWorkerStatus: (id, status) => api.post(`/monitoring/workers/${id}/status`, { status }),
  getAlerts: () => api.get('/monitoring/alerts'),
  resolveAlert: (id) => api.put(`/monitoring/alerts/${id}/resolve`),
};

// Video API
export const videoAPI = {
  uploadVideo: (formData) => api.post('/video/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  analyzeVideo: (id) => api.post(`/video/analyze/${id}`),
  getAnalysisResults: (id) => api.get(`/video/analysis/${id}`),
  getUserAnalyses: () => api.get('/video/analyses'),
  deleteAnalysis: (id) => api.delete(`/video/analysis/${id}`),
};

// Reports API
export const reportsAPI = {
  getReportByType: (type) => api.get(`/reports/${type}`),
  getDailyReport: () => api.get('/reports/daily'),
  getWeeklyReport: () => api.get('/reports/weekly'),
  getMonthlyReport: () => api.get('/reports/monthly'),
  getPPEComplianceReport: () => api.get('/reports/ppe-compliance'),
  getWorkerPerformanceReport: () => api.get('/reports/worker-performance'),
  exportReport: (type, format) => api.get(`/reports/export/${type}?format=${format}`, {
    responseType: 'blob',
  }),
};

export default api;