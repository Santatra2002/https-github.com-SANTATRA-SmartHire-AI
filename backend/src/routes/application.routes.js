// backend/src/routes/application.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  cancelApplication
} = require('../controllers/application.controller');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Candidat
router.post('/', applyToJob);
router.get('/my-applications', getMyApplications);
router.delete('/:applicationId', cancelApplication);

// Recruteur
router.get('/job/:jobId', getJobApplications);
router.put('/:applicationId/status', updateApplicationStatus);

module.exports = router;