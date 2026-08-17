// backend/src/controllers/application.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// 1. POSTULER À UNE OFFRE
// ============================================
const applyToJob = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { jobId, coverLetter } = req.body;

    // Vérifier que l'utilisateur est un candidat
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    if (!user || user.role !== 'CANDIDAT') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les candidats peuvent postuler'
      });
    }

    if (!user.candidateProfile) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez avoir un profil candidat pour postuler'
      });
    }

    // Vérifier que l'offre existe
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    // Vérifier si le candidat a déjà postulé
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: parseInt(jobId),
        candidateId: user.candidateProfile.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà postulé à cette offre'
      });
    }

    // Créer la candidature
    const application = await prisma.application.create({
      data: {
        jobId: parseInt(jobId),
        candidateId: user.candidateProfile.id,
        coverLetter: coverLetter || '',
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Candidature envoyée avec succès',
      application
    });

  } catch (error) {
    console.error('❌ Erreur candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la candidature',
      error: error.message
    });
  }
};

// ============================================
// 2. LISTER MES CANDIDATURES (CANDIDAT)
// ============================================
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    if (!user.candidateProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profil candidat non trouvé'
      });
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: user.candidateProfile.id },
      include: {
        job: {
          include: {
            company: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('❌ Erreur liste candidatures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures'
    });
  }
};

// ============================================
// 3. GÉRER LES CANDIDATURES (RECRUTEUR)
// ============================================
const getJobApplications = async (req, res) => {
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
        message: 'Accès refusé'
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

    const applications = await prisma.application.findMany({
      where: { jobId: parseInt(jobId) },
      include: {
        candidate: {
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
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('❌ Erreur récupération candidatures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures'
    });
  }
};

// ============================================
// 4. MODIFIER LE STATUT D'UNE CANDIDATURE
// ============================================
const updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'REVIEWED', 'ACCEPTED', 'REFUSED', 'INTERVIEW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    // Récupérer la candidature
    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) },
      include: {
        job: {
          include: { company: true }
        }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }

    // Vérifier que le recruteur est propriétaire de l'offre
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true }
    });

    if (!user.companyProfile || user.companyProfile.id !== application.job.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier cette candidature'
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: parseInt(applicationId) },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      application: updatedApplication
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

// ============================================
// 5. ANNULER UNE CANDIDATURE
// ============================================
const cancelApplication = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { applicationId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }

    if (application.candidateId !== user.candidateProfile.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à annuler cette candidature'
      });
    }

    await prisma.application.delete({
      where: { id: parseInt(applicationId) }
    });

    res.json({
      success: true,
      message: 'Candidature annulée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur annulation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation'
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  cancelApplication
};