// backend/src/routes/matching.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  getMatchScore,
  getBestMatchesForCandidate,
  getBestCandidatesForJob
} = require('../controllers/matching.controller');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Candidat
router.get('/candidate/match/:jobId', getMatchScore);
router.get('/candidate/recommendations', getBestMatchesForCandidate);

// Recruteur
router.get('/recruiter/job/:jobId/candidates', getBestCandidatesForJob);

module.exports = router;