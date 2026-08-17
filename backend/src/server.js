// backend/src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// IMPORTER LES MIDDLEWARES ET ROUTES
// ============================================
const { authMiddleware } = require('./middleware/auth.middleware');
const cvRoutes = require('./routes/ai/cv.routes');
const jobsRoutes = require('./routes/jobs.routes');
const applicationRoutes = require('./routes/application.routes');
const matchingRoutes = require('./routes/matching.routes');
const interviewRoutes = require('./routes/ai/interview.routes');
const dashboardRoutes = require('./routes/ai/dashboard.routes');
const adminRoutes = require('./routes/admin.routes');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Créer les dossiers d'upload
const uploadsDir = path.join(__dirname, '..', 'uploads');
const photosDir = path.join(__dirname, '..', 'uploads', 'photos');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

// ============================================
// ⭐ CONFIGURATION MULTER CORRIGÉE
// ============================================
const photoStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads', 'photos'),
  filename: (req, file, cb) => {
    const cleanName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const upload = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// ⭐ Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ============================================
// ROUTE D'UPLOAD DE PHOTO - AVEC URL COMPLÈTE
// ============================================
app.post('/api/auth/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    console.log('📷 Upload photo - req.user:', req.user);
    
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune photo sélectionnée'
      });
    }

    // Vérifier que l'utilisateur a un profil candidat
    const existingProfile = await prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil candidat non trouvé'
      });
    }

    // ⭐ URL complète de la photo
    const photoUrl = `http://localhost:${PORT}/uploads/photos/${req.file.filename}`;

    const updatedProfile = await prisma.candidateProfile.update({
      where: { userId },
      data: { photo: photoUrl }
    });

    console.log('✅ Photo mise à jour pour l\'utilisateur:', userId);
    console.log('📷 URL de la photo:', photoUrl);

    res.json({
      success: true,
      message: 'Photo mise à jour avec succès',
      photoUrl: photoUrl
    });

  } catch (error) {
    console.error('❌ Erreur upload photo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de la photo',
      error: error.message
    });
  }
});

// ============================================
// ROUTES AUTHENTIFICATION
// ============================================


// ============================================
// ROUTES RECRUTEUR - PROFIL
// ============================================

// ============================================
// ROUTES RECRUTEUR - PROFIL
// ============================================

// Mettre à jour le profil recruteur
app.put('/api/recruiter/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      photo, firstName, lastName, phone, location, bio, linkedin, github,
      companyName, logo, description, website, companyLocation,
      industry, size, foundedYear, contactEmail, contactPhone
    } = req.body;

    const updated = await prisma.companyProfile.update({
      where: { userId },
      data: {
        photo, firstName, lastName, phone, location, bio, linkedin, github,
        companyName, logo, description, website, companyLocation,
        industry, size, foundedYear, contactEmail, contactPhone
      }
    });

    res.json({
      success: true,
      message: 'Profil mis à jour',
      profile: updated
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil recruteur:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ⭐ Upload photo du recruteur
app.post('/api/recruiter/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune photo sélectionnée'
      });
    }

    const photoUrl = `http://localhost:${PORT}/uploads/photos/${req.file.filename}`;

    await prisma.companyProfile.update({
      where: { userId },
      data: { photo: photoUrl }
    });

    console.log('✅ Photo recruteur mise à jour pour:', userId);
    console.log('📷 URL:', photoUrl);

    res.json({
      success: true,
      message: 'Photo mise à jour avec succès',
      photoUrl: photoUrl
    });

  } catch (error) {
    console.error('❌ Erreur upload photo recruteur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload',
      error: error.message
    });
  }
});

// ⭐ Upload logo de l'entreprise
app.post('/api/recruiter/upload-logo', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun logo sélectionné'
      });
    }

    const logoUrl = `http://localhost:${PORT}/uploads/logos/${req.file.filename}`;

    // Créer le dossier logos s'il n'existe pas
    const logosDir = './uploads/logos';
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    await prisma.companyProfile.update({
      where: { userId },
      data: { logo: logoUrl }
    });

    console.log('✅ Logo entreprise mis à jour pour:', userId);
    console.log('📷 URL:', logoUrl);

    res.json({
      success: true,
      message: 'Logo mis à jour avec succès',
      logoUrl: logoUrl
    });

  } catch (error) {
    console.error('❌ Erreur upload logo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du logo',
      error: error.message
    });
  }
});

// Récupérer le profil recruteur
app.get('/api/recruiter/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await prisma.companyProfile.findUnique({
      where: { userId }
    });
    
    res.json({
      success: true,
      profile
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mettre à jour le profil recruteur
app.put('/api/recruiter/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      photo, firstName, lastName, phone, location, bio, linkedin, github,
      companyName, logo, description, website, companyLocation,
      industry, size, foundedYear, contactEmail, contactPhone
    } = req.body;

    const updated = await prisma.companyProfile.update({
      where: { userId },
      data: {
        photo, firstName, lastName, phone, location, bio, linkedin, github,
        companyName, logo, description, website, companyLocation,
        industry, size, foundedYear, contactEmail, contactPhone
      }
    });

    res.json({ success: true, message: 'Profil mis à jour', profile: updated });
  } catch (error) {
    console.error('❌ Erreur mise à jour profil recruteur:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload photo du recr

// ROUTE D'INSCRIPTION
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Tentative d\'inscription...');
    const { email, password, name, role } = req.body;
    
    console.log('📧 Email:', email);
    console.log('👤 Nom:', name);
    console.log('🎭 Rôle:', role);

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'CANDIDAT'
      }
    });

    console.log('✅ Utilisateur créé avec ID:', user.id);

    if (user.role === 'CANDIDAT') {
      await prisma.candidateProfile.create({
        data: { userId: user.id }
      });
      console.log('✅ Profil candidat créé');
    }

    if (user.role === 'RECRUTEUR') {
      await prisma.companyProfile.create({
        data: {
          userId: user.id,
          companyName: name || 'Mon Entreprise'
        }
      });
      console.log('✅ Profil recruteur créé');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'mon_secret_jwt_super_securise_2024',
      { expiresIn: '7d' }
    );

    console.log('✅ Inscription réussie pour:', email);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte',
      error: error.message
    });
  }
});

// ROUTE DE CONNEXION
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔑 Tentative de connexion...');
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        candidateProfile: true,
        companyProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'mon_secret_jwt_super_securise_2024',
      { expiresIn: '7d' }
    );

    console.log('✅ Connexion réussie pour:', email);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.candidateProfile || user.companyProfile
      }
    });

  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
});

// ROUTE PROFIL (ME)
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mon_secret_jwt_super_securise_2024');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        candidateProfile: true,
        companyProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.candidateProfile || user.companyProfile
      }
    });

  } catch (error) {
    console.error('❌ Erreur profil:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
});

// ROUTE MISE À JOUR DU PROFIL
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true, companyProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const {
      description, skills, experiences, education,
      linkedin, github, portfolio, phone, location
    } = req.body;

    let updatedProfile;

    if (user.role === 'CANDIDAT') {
      updatedProfile = await prisma.candidateProfile.update({
        where: { userId },
        data: { description, skills, experiences, education, linkedin, github, portfolio, phone, location }
      });
    } else {
      updatedProfile = await prisma.companyProfile.update({
        where: { userId },
        data: { description, phone, location }
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
});



// ROUTE DÉCONNEXION
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// ROUTE DE TEST
app.get('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Route de test fonctionne !',
    routes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/auth/logout',
      'GET /api/auth/test'
    ]
  });
});

// ROUTE MOT DE PASSE OUBLIÉ
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun compte associé à cet email'
      });
    }

    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'mon_secret_jwt_super_securise_2024',
      { expiresIn: '1h' }
    );

    console.log('📧 Email de réinitialisation envoyé à:', email);
    console.log('🔑 Token:', resetToken);

    res.json({
      success: true,
      message: 'Email de réinitialisation envoyé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur forgot-password:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi',
      error: error.message
    });
  }
});

// ROUTE RÉINITIALISER LE MOT DE PASSE
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token et nouveau mot de passe requis'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mon_secret_jwt_super_securise_2024');

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    console.log('✅ Mot de passe réinitialisé pour:', decoded.email);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur reset-password:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation',
      error: error.message
    });
  }
});

// ============================================
// ROUTES IA (ANALYSE DE CV)
// ============================================
app.use('/api/cv', cvRoutes);

// ============================================
// ROUTES OFFRES D'EMPLOI
// ============================================
app.use('/api/jobs', jobsRoutes);

// ============================================
// ROUTES CANDIDATURES
// ============================================
app.use('/api/applications', applicationRoutes);

// ============================================
// ROUTES MATCHING IA
// ============================================
app.use('/api/matching', matchingRoutes);

// ============================================
// ROUTES INTERVIEW
// ============================================
app.use('/api/interview', interviewRoutes);

// ============================================
// ROUTES DASHBOARD
// ============================================
app.use('/api/dashboard', dashboardRoutes);

// ============================================
// ROUTES ADMIN
// ============================================
app.use('/api/admin', adminRoutes);

// ============================================
// ROUTE RACINE
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 SmartHire AI API est en ligne !',
    version: '1.0.0',
    routes: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
        uploadPhoto: 'POST /api/auth/upload-photo'
      },
      cv: {
        upload: 'POST /api/cv/upload'
      },
      jobs: {
        list: 'GET /api/jobs',
        create: 'POST /api/jobs',
        detail: 'GET /api/jobs/:id'
      },
      applications: {
        apply: 'POST /api/applications',
        myApplications: 'GET /api/applications/my-applications'
      },
      matching: {
        score: 'GET /api/matching/candidate/match/:jobId',
        recommendations: 'GET /api/matching/candidate/recommendations',
        candidates: 'GET /api/matching/recruiter/job/:jobId/candidates'
      }
    }
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Routes disponibles:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/test`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/upload-photo`);
  console.log(`   - POST http://localhost:${PORT}/api/cv/upload`);
  console.log(`   - POST http://localhost:${PORT}/api/jobs`);
  console.log(`   - GET  http://localhost:${PORT}/api/jobs`);
  console.log(`   - POST http://localhost:${PORT}/api/applications`);
  console.log(`   - GET  http://localhost:${PORT}/api/applications/my-applications`);
  console.log(`   - GET  http://localhost:${PORT}/api/matching/candidate/match/:jobId`);
  console.log(`   - GET  http://localhost:${PORT}/api/matching/candidate/recommendations`);
  console.log(`   - GET  http://localhost:${PORT}/api/matching/recruiter/job/:jobId/candidates`);
  console.log(`   - GET  http://localhost:${PORT}/\n`);
});