// backend/src/services/matching.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculer le score de matching entre un candidat et une offre
 */
const calculateMatchScore = async (candidateId, jobId) => {
  try {
    // Récupérer le candidat et son profil
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
      include: { user: true }
    });

    if (!candidate) {
      throw new Error('Candidat non trouvé');
    }

    // Récupérer l'offre
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error('Offre non trouvée');
    }

    // Extraire les compétences du candidat (depuis l'analyse du CV)
    const parseSkills = (skillsRaw) => {
      if (!skillsRaw) return [];
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
    
    const candidateSkills = parseSkills(candidate.skills);
    
    // Extraire les compétences requises pour l'offre
    const requiredSkills = job.skills ? job.skills.split(',').map(s => s.trim().toLowerCase()) : [];

    console.log('🔍 Compétences candidat:', candidateSkills);
    console.log('📋 Compétences requises:', requiredSkills);

    // Calculer les correspondances
    const matchedSkills = candidateSkills.filter(skill => 
      requiredSkills.some(req => req.includes(skill.toLowerCase()) || skill.toLowerCase().includes(req))
    );

    const missingSkills = requiredSkills.filter(req => 
      !candidateSkills.some(skill => skill.toLowerCase().includes(req) || req.includes(skill.toLowerCase()))
    );

    // Calculer le score (basé sur les compétences)
    const score = requiredSkills.length > 0 
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    // Score minimum 0, maximum 100
    const finalScore = Math.min(Math.max(score, 0), 100);

    return {
      candidate: {
        id: candidate.id,
        name: candidate.user.name,
        email: candidate.user.email,
        skills: candidateSkills
      },
      job: {
        id: job.id,
        title: job.title,
        requiredSkills: requiredSkills
      },
      score: finalScore,
      matchedSkills: matchedSkills,
      missingSkills: missingSkills,
      matchPercentage: `${finalScore}%`
    };

  } catch (error) {
    console.error('❌ Erreur matching:', error);
    throw error;
  }
};

/**
 * Trouver les meilleures offres pour un candidat
 */
const findBestMatchesForCandidate = async (candidateId) => {
  try {
    // Récupérer toutes les offres publiées
    const jobs = await prisma.job.findMany({
      where: { status: 'PUBLISHED' }
    });

    const results = [];

    for (const job of jobs) {
      const match = await calculateMatchScore(candidateId, job.id);
      results.push(match);
    }

    // Trier par score décroissant
    results.sort((a, b) => b.score - a.score);

    return results;

  } catch (error) {
    console.error('❌ Erreur recherche meilleures offres:', error);
    throw error;
  }
};

/**
 * Trouver les meilleurs candidats pour une offre
 */
const findBestCandidatesForJob = async (jobId) => {
  try {
    // Récupérer tous les candidats avec leur profil
    const candidates = await prisma.candidateProfile.findMany({
      include: { user: true }
    });

    const results = [];

    for (const candidate of candidates) {
      const match = await calculateMatchScore(candidate.userId, jobId);
      results.push(match);
    }

    // Trier par score décroissant
    results.sort((a, b) => b.score - a.score);

    return results;

  } catch (error) {
    console.error('❌ Erreur recherche meilleurs candidats:', error);
    throw error;
  }
};

module.exports = {
  calculateMatchScore,
  findBestMatchesForCandidate,
  findBestCandidatesForJob
};