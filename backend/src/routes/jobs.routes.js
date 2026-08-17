// backend/src/routes/jobs.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecruiterJobs
} = require('../controllers/jobs.controller');

// Routes publiques
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Routes protégées (authentification requise)
router.use(authMiddleware);
router.post('/', createJob);
router.get('/recruiter/my-jobs', getRecruiterJobs);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;