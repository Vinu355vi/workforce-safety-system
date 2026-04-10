const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const auth = require('../middleware/auth');

router.get('/workers', auth, monitoringController.getWorkers);
router.get('/workers/:workerId', auth, monitoringController.getWorkerById);
router.get('/stats', auth, monitoringController.getStats);
router.post('/workers/:workerId/status', auth, monitoringController.updateWorkerStatus);
router.get('/alerts', auth, monitoringController.getAlerts);
router.put('/alerts/:alertId/resolve', auth, monitoringController.resolveAlert);

module.exports = router;