// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const {
  getStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getCompanies,
  updateCompanyStatus,
  getJobsForModeration,
  updateJobStatus,
  deleteJob
} = require('../controllers/admin.controller');

// Toutes les routes admin nécessitent une authentification et le rôle ADMIN
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// Dashboard
router.get('/stats', getStats);

// Utilisateurs
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Entreprises
router.get('/companies', getCompanies);
router.put('/companies/:id/status', updateCompanyStatus);

// Offres
router.get('/jobs', getJobsForModeration);
router.put('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

module.exports = router;