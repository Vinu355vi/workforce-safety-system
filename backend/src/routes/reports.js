const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.get('/daily', auth, reportController.getDailyReport);
router.get('/weekly', auth, reportController.getWeeklyReport);
router.get('/monthly', auth, reportController.getMonthlyReport);
router.get('/ppe-compliance', auth, reportController.getPPEComplianceReport);
router.get('/worker-performance', auth, reportController.getWorkerPerformanceReport);
router.get('/export/:reportType', auth, reportController.exportReport);

module.exports = router;