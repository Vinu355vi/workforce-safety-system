 'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadIcon, VideoIcon, FileTextIcon, TrashIcon, DownloadIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function VideoAnalysis() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/video/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Video uploaded successfully');
      await analyzeVideo(response.data.analysisId);
      await fetchAnalyses();
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const analyzeVideo = async (analysisId) => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/video/analyze/${analysisId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Video analysis completed');
    } catch (error) {
      toast.error('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/video/analyses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyses(response.data.analyses);
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    }
  };

  const deleteAnalysis = async (analysisId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/video/analysis/${analysisId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Analysis deleted');
      fetchAnalyses();
      if (selectedAnalysis?.id === analysisId) {
        setSelectedAnalysis(null);
      }
    } catch (error) {
      toast.error('Delete failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Video Analysis</h1>
          <p className="text-gray-400 mt-1">Upload and analyze recorded footage for safety compliance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Video</h2>
              <label className={`border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-all block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Click or drag to upload video</p>
                <p className="text-gray-500 text-sm mt-1">MP4, AVI, MOV up to 500MB</p>
              </label>
              {(uploading || analyzing) && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">{uploading ? 'Uploading...' : 'Analyzing...'}</p>
                </div>
              )}
            </div>

            {/* Recent Analyses */}
            <div className="glass-effect rounded-xl p-6 mt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Analyses</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedAnalysis?.id === analysis.id ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{analysis.originalName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                          analysis.status === 'completed' ? 'bg-green-600' :
                          analysis.status === 'processing' ? 'bg-yellow-600' :
                          analysis.status === 'failed' ? 'bg-red-600' : 'bg-gray-600'
                        }`}>
                          {analysis.status}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnalysis(analysis.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {selectedAnalysis ? (
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Analysis Results</h2>
                {selectedAnalysis.status === 'completed' && selectedAnalysis.results ? (
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Total Frames Processed</p>
                        <p className="text-2xl font-bold text-white">{selectedAnalysis.results.processedFrames}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Average Workers per Frame</p>
                        <p className="text-2xl font-bold text-white">
                          {(selectedAnalysis.results.detections.reduce((sum, d) => sum + d.workers, 0) / selectedAnalysis.results.detections.length).toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* PPE Compliance */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">PPE Compliance Overview</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Helmet Compliance</span>
                            <span>{Math.round(selectedAnalysis.results.summary.ppeCompliance.helmet / selectedAnalysis.results.detections.length * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${selectedAnalysis.results.summary.ppeCompliance.helmet / selectedAnalysis.results.detections.length * 100}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Mask Compliance</span>
                            <span>{Math.round(selectedAnalysis.results.summary.ppeCompliance.mask / selectedAnalysis.results.detections.length * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${selectedAnalysis.results.summary.ppeCompliance.mask / selectedAnalysis.results.detections.length * 100}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Vest Compliance</span>
                            <span>{Math.round(selectedAnalysis.results.summary.ppeCompliance.vest / selectedAnalysis.results.detections.length * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${selectedAnalysis.results.summary.ppeCompliance.vest / selectedAnalysis.results.detections.length * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Frame by Frame Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Frame Analysis Timeline</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedAnalysis.results.detections.map((detection, index) => (
                          <div key={index} className="bg-gray-800 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Frame {detection.frame}</span>
                              <span className="text-sm text-gray-400">Workers: {detection.workers}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {detection.ppeCompliance.helmet && <span className="text-xs bg-green-600 px-2 py-1 rounded">Helmet ✓</span>}
                              {detection.ppeCompliance.mask && <span className="text-xs bg-green-600 px-2 py-1 rounded">Mask ✓</span>}
                              {detection.ppeCompliance.vest && <span className="text-xs bg-green-600 px-2 py-1 rounded">Vest ✓</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Export Button */}
                    <button className="w-full px-4 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                      <DownloadIcon size={18} />
                      Export Report
                    </button>
                  </div>
                ) : selectedAnalysis.status === 'processing' ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Analysis in progress...</p>
                  </div>
                ) : selectedAnalysis.status === 'failed' ? (
                  <div className="text-center py-12">
                    <p className="text-red-400">Analysis failed: {selectedAnalysis.error}</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <VideoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Select a video analysis to view results</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-effect rounded-xl p-12 text-center">
                <FileTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select an analysis from the left to view results</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}