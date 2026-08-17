// backend/src/controllers/matching.controller.js
const { calculateMatchScore, findBestMatchesForCandidate, findBestCandidatesForJob } = require('../services/matching.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// 1. MATCHING CANDIDAT/OFFRE
// ============================================
const getMatchScore = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    // Vérifier que l'utilisateur est un candidat
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    if (!user || user.role !== 'CANDIDAT') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les candidats peuvent voir leur matching'
      });
    }

    if (!user.candidateProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profil candidat non trouvé'
      });
    }

    const match = await calculateMatchScore(userId, parseInt(jobId));

    res.json({
      success: true,
      match
    });

  } catch (error) {
    console.error('❌ Erreur matching:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul du matching',
      error: error.message
    });
  }
};

// ============================================
// 2. MEILLEURES OFFRES POUR UN CANDIDAT
// ============================================
const getBestMatchesForCandidate = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    if (!user || user.role !== 'CANDIDAT') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les candidats peuvent voir leurs recommandations'
      });
    }

    const matches = await findBestMatchesForCandidate(userId);

    res.json({
      success: true,
      count: matches.length,
      matches
    });

  } catch (error) {
    console.error('❌ Erreur recommandations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des recommandations'
    });
  }
};

// ============================================
// 3. MEILLEURS CANDIDATS POUR UNE OFFRE (RECRUTEUR)
// ============================================
const getBestCandidatesForJob = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    // Vérifier que l'utilisateur est un recruteur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true }
    });

    if (!user || user.role !== 'RECRUTEUR') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les recruteurs peuvent voir les candidats'
      });
    }

    // Vérifier que l'offre appartient au recruteur
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) }
    });

    if (!job || job.companyId !== user.companyProfile.id) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée ou vous n\'y avez pas accès'
      });
    }

    const matches = await findBestCandidatesForJob(parseInt(jobId));

    res.json({
      success: true,
      count: matches.length,
      matches
    });

  } catch (error) {
    console.error('❌ Erreur recherche candidats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des candidats'
    });
  }
};

module.exports = {
  getMatchScore,
  getBestMatchesForCandidate,
  getBestCandidatesForJob
};