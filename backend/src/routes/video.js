const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require('../controllers/videoController');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.VIDEO_STORAGE_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', auth, upload.single('video'), videoController.uploadVideo);
router.post('/analyze/:videoId', auth, videoController.analyzeVideo);
router.get('/analysis/:analysisId', auth, videoController.getAnalysisResults);
router.get('/analyses', auth, videoController.getUserAnalyses);
router.delete('/analysis/:analysisId', auth, videoController.deleteAnalysis);

module.exports = router;