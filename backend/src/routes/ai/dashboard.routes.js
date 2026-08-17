// backend/src/routes/ai/dashboard.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const careerDashboard = require('../../services/ai/careerDashboard');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// 📈 TABLEAU DE BORD CARRIÈRE
// ============================================
router.get('/career', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Récupérer les données de l'utilisateur
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

    // Récupérer les offres et matchs
    const applications = await prisma.application.findMany({
      where: { candidateId: user.candidateProfile.id },
      include: { job: true }
    });

    // Construire l'analyse du CV
    const cvAnalysis = {
      name: user.name,
      skills: user.candidateProfile.skills ? 
        JSON.parse(user.candidateProfile.skills) : 
        [],
      experienceLevel: 'Intermédiaire',
      experience: { years: 3 },
      score: 70,
      completeness: { score: 65, missing: ['certifications', 'languages'] },
      softSkills: ['communication', 'teamwork'],
      strengths: ['React', 'Node.js'],
      improvements: ['Ajouter des certifications']
    };

    const jobMatches = applications.map(app => ({
      score: app.score || 70,
      job: app.job
    }));

    const userProfile = {
      name: user.name,
      currentRole: 'Développeur Full Stack'
    };

    // Générer le dashboard
    const dashboard = careerDashboard.generateDashboard(
      cvAnalysis,
      jobMatches,
      userProfile
    );

    res.json(dashboard);

  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du dashboard',
      error: error.message
    });
  }
});

// ============================================
// 📊 PRÉDICTION DE SALAIRE
// ============================================
router.get('/salary-prediction', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    const skills = user.candidateProfile?.skills ? 
      JSON.parse(user.candidateProfile.skills) : 
      [];

    const level = user.candidateProfile?.experienceLevel || 'Intermédiaire';
    
    // Calculer la prédiction
    const salary = careerDashboard.getSalaryEstimate(level);
    
    const marketDemand = careerDashboard.calculateMarketDemand(skills);
    const bonus = marketDemand > 80 ? 0.15 : marketDemand > 60 ? 0.1 : 0;

    const predictedSalary = {
      min: Math.round(salary.min * (1 + bonus)),
      max: Math.round(salary.max * (1 + bonus)),
      median: Math.round(salary.median * (1 + bonus)),
      marketDemand: marketDemand,
      factors: {
        experience: level,
        skillsCount: skills.length,
        marketDemand: marketDemand
      }
    };

    res.json({
      success: true,
      predictedSalary
    });

  } catch (error) {
    console.error('❌ Erreur prédiction salaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la prédiction',
      error: error.message
    });
  }
});

module.exports = router;