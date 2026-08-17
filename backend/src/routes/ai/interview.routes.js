// backend/src/routes/ai/interview.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const interviewSimulator = require('../../services/ai/interviewSimulator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// 🎯 GÉNÉRER DES QUESTIONS D'ENTRETIEN
// ============================================
router.post('/generate-questions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;

    // Récupérer le candidat
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    if (!user?.candidateProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil candidat non trouvé'
      });
    }

    // Récupérer l'offre
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    // Extraire les compétences du candidat
    // Extraire les compétences du candidat (JSON ou texte libre)
const parseSkills = (skillsRaw) => {
  if (!skillsRaw) return ['React', 'Node.js', 'JavaScript'];
  try {
    const parsed = JSON.parse(skillsRaw);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return skillsRaw
      .split(/[,/\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
};

const skills = parseSkills(user.candidateProfile.skills);

    // Générer les questions
    const result = interviewSimulator.generateQuestions(
      skills,
      job.title,
      'Intermédiaire',
      job.description
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Erreur génération questions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des questions',
      error: error.message
    });
  }
});

// ============================================
// ✅ ÉVALUER UNE RÉPONSE
// ============================================
router.post('/evaluate-answer', authMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question et réponse requises'
      });
    }

    const evaluation = interviewSimulator.evaluateAnswer(question, answer);

    res.json({
      success: true,
      evaluation
    });

  } catch (error) {
    console.error('❌ Erreur évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'évaluation',
      error: error.message
    });
  }
});

// ============================================
//============================================
// 📋 SIMULER UN ENTRETIEN COMPLET
// ============================================
router.post('/generate-questions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;
    // Récupérer le candidat
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });
    if (!user?.candidateProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil candidat non trouvé'
      });
    }
    // Récupérer l'offre
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) }
    });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }
    // Extraire les compétences du candidat (JSON ou texte libre)   ← remplacé
    const parseSkills = (skillsRaw) => {
      if (!skillsRaw) return ['React', 'Node.js', 'JavaScript'];
      try {
        const parsed = JSON.parse(skillsRaw);
        return Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        return skillsRaw
          .split(/[,/\n]/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
    };
    const skills = parseSkills(user.candidateProfile.skills);
    // Générer les questions
    const result = interviewSimulator.generateQuestions(
      skills,
      job.title,
      'Intermédiaire',
      job.description
    );
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Erreur génération questions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des questions',
      error: error.message
    });
  }
});

module.exports = router;