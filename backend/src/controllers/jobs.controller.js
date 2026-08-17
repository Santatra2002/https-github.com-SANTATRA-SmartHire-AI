// backend/src/controllers/jobs.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// 1. CRÉER UNE OFFRE
// ============================================
const createJob = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { title, description, location, contract, salary, skills, experience } = req.body;

    // Vérifier si l'utilisateur est un recruteur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true }
    });

    if (!user || user.role !== 'RECRUTEUR') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les recruteurs peuvent créer des offres'
      });
    }

    if (!user.companyProfile) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez avoir un profil entreprise pour créer une offre'
      });
    }

    const job = await prisma.job.create({
      data: {
        companyId: user.companyProfile.id,
        title,
        description,
        location,
        contract,
        salary,
        skills: skills || '',
        experience: experience || 'Junior',
        status: 'PUBLISHED'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Offre créée avec succès',
      job
    });

  } catch (error) {
    console.error('❌ Erreur création offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'offre',
      error: error.message
    });
  }
};

// ============================================
// 2. LISTER TOUTES LES OFFRES
// ============================================
const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        company: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    console.error('❌ Erreur liste offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des offres'
    });
  }
};

// ============================================
// 3. RÉCUPÉRER UNE OFFRE PAR ID
// ============================================
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        company: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    res.json({
      success: true,
      job
    });

  } catch (error) {
    console.error('❌ Erreur récupération offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'offre'
    });
  }
};

// ============================================
// 4. MODIFIER UNE OFFRE
// ============================================
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { title, description, location, contract, salary, skills, experience, status } = req.body;

    // Vérifier que l'offre existe
    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: { company: true }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true }
    });

    if (!user.companyProfile || user.companyProfile.id !== job.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier cette offre'
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        location,
        contract,
        salary,
        skills,
        experience,
        status: status || job.status
      }
    });

    res.json({
      success: true,
      message: 'Offre mise à jour avec succès',
      job: updatedJob
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'offre'
    });
  }
};

// ============================================
// 5. SUPPRIMER UNE OFFRE
// ============================================
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: { company: true }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true }
    });

    if (!user.companyProfile || user.companyProfile.id !== job.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer cette offre'
      });
    }

    await prisma.job.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Offre supprimée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur suppression offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'offre'
    });
  }
};

// ============================================
// 6. RÉCUPÉRER LES OFFRES D'UN RECRUTEUR
// ============================================
const getRecruiterJobs = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true }
    });

    if (!user.companyProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profil entreprise non trouvé'
      });
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: user.companyProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    console.error('❌ Erreur récupération offres recruteur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des offres'
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecruiterJobs
};