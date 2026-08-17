// backend/src/controllers/admin.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// 1. STATISTIQUES GLOBALES
// ============================================
const getStats = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const [
      totalUsers,
      totalRecruiters,
      totalCandidates,
      totalJobs,
      activeJobs,
      pendingJobs,
      totalApplications,
      totalCompanies
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'RECRUTEUR' } }),
      prisma.user.count({ where: { role: 'CANDIDAT' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.job.count({ where: { status: 'PENDING' } }),
      prisma.application.count(),
      prisma.companyProfile.count()
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalRecruiters,
        totalCandidates,
        totalJobs,
        activeJobs,
        pendingJobs,
        totalApplications,
        totalCompanies
      }
    });

  } catch (error) {
    console.error('❌ Erreur stats admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des statistiques',
      error: error.message
    });
  }
};

// ============================================
// 2. LISTER TOUS LES UTILISATEURS
// ============================================
const getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        candidateProfile: true,
        companyProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('❌ Erreur liste utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des utilisateurs',
      error: error.message
    });
  }
};

// ============================================
// 3. MODIFIER LE STATUT D'UN UTILISATEUR
// ============================================
const updateUserStatus = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'SUSPENDED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });

    res.json({
      success: true,
      message: 'Statut utilisateur mis à jour',
      user
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// ============================================
// 4. SUPPRIMER UN UTILISATEUR
// ============================================
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Supprimer l'utilisateur (les relations seront supprimées via CASCADE)
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur suppression utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// ============================================
// 5. LISTER TOUTES LES ENTREPRISES
// ============================================
const getCompanies = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const companies = await prisma.companyProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true
          }
        },
        jobs: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formater les données
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.companyName,
      email: company.user.email,
      description: company.description,
      website: company.website,
      status: company.user.status || 'PENDING',
      jobsCount: company.jobs.length,
      createdAt: company.createdAt
    }));

    res.json({
      success: true,
      count: formattedCompanies.length,
      companies: formattedCompanies
    });

  } catch (error) {
    console.error('❌ Erreur liste entreprises:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des entreprises',
      error: error.message
    });
  }
};

// ============================================
// 6. MODIFIER LE STATUT D'UNE ENTREPRISE
// ============================================
const updateCompanyStatus = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'SUSPENDED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    // Récupérer l'entreprise pour avoir l'userId
    const company = await prisma.companyProfile.findUnique({
      where: { id: parseInt(id) }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    // Mettre à jour le statut de l'utilisateur associé
    const updatedCompany = await prisma.user.update({
      where: { id: company.userId },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Statut entreprise mis à jour',
      company: {
        id: company.id,
        name: company.companyName,
        status: updatedCompany.status
      }
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// ============================================
// 7. MODÉRER LES OFFRES
// ============================================
const getJobsForModeration = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const jobs = await prisma.job.findMany({
      include: {
        company: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        applications: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      contract: job.contract,
      salary: job.salary,
      skills: job.skills ? job.skills.split(',') : [],
      company: job.company.companyName,
      companyId: job.company.id,
      status: job.status,
      applicationsCount: job.applications.length,
      createdAt: job.createdAt
    }));

    res.json({
      success: true,
      count: formattedJobs.length,
      jobs: formattedJobs
    });

  } catch (error) {
    console.error('❌ Erreur liste offres modération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des offres',
      error: error.message
    });
  }
};

// ============================================
// 8. MODIFIER LE STATUT D'UNE OFFRE
// ============================================
const updateJobStatus = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PUBLISHED', 'REJECTED', 'ARCHIVED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Statut offre mis à jour',
      job
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// ============================================
// 9. SUPPRIMER UNE OFFRE
// ============================================
const deleteJob = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const { id } = req.params;

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
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getCompanies,
  updateCompanyStatus,
  getJobsForModeration,
  updateJobStatus,
  deleteJob
};