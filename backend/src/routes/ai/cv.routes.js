// backend/src/routes/ai/cv.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const semanticAnalyzer = require('../../services/ai/semanticAnalysis');

// Configuration multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Fonction pour extraire le texte d'un PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// ✅ ANALYSE COMPLÈTE SANS OpenAI
function analyzeText(text) {
  console.log('🔍 Analyse locale du texte...');
  
  // Extraire le nom (première ligne)
  const lines = text.split('\n').filter(line => line.trim());
  const name = lines.length > 0 ? lines[0].trim() : 'Candidat';

  // Extraire l'email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : 'Non trouvé';

  // Extraire le téléphone
  const phoneMatch = text.match(/0[0-9]{9}/);
  const phone = phoneMatch ? phoneMatch[0] : 'Non trouvé';

  // Extraire l'année d'expérience
  const expMatch = text.match(/(\d+)\s*(?:ans|années?)/i);
  const experience = expMatch ? `${expMatch[1]} ans` : 'Non spécifié';

  // Détection des compétences
  const skillKeywords = [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java',
    'PHP', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'Docker',
    'AWS', 'Git', 'Vue.js', 'Angular', 'Express', 'NestJS', 'Next.js',
    'Laravel', 'Symfony', 'Ruby', 'Rails', 'C++', 'C#', 'Go', 'Rust'
  ];
  
  const detectedSkills = skillKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );

  // Calcul du score (basé sur les compétences)
  const baseScore = 50;
  const skillBonus = Math.min(detectedSkills.length * 4, 30);
  const expBonus = experience !== 'Non spécifié' ? 10 : 0;
  const score = Math.min(baseScore + skillBonus + expBonus, 100);

  // Suggestions d'amélioration
  const improvements = [];
  
  if (detectedSkills.length < 3) {
    improvements.push('Ajoutez plus de compétences techniques (React, Node.js, etc.)');
  }
  
  if (!text.toLowerCase().includes('projet')) {
    improvements.push('Ajoutez des projets personnels ou professionnels');
  }
  
  if (!text.toLowerCase().includes('certification')) {
    improvements.push('Ajoutez des certifications (AWS, Microsoft, etc.)');
  }
  
  if (!text.toLowerCase().includes('linkedin')) {
    improvements.push('Ajoutez votre profil LinkedIn');
  }
  
  if (!text.toLowerCase().includes('github')) {
    improvements.push('Ajoutez votre profil GitHub');
  }
  
  if (improvements.length === 0) {
    improvements.push('Votre CV est bien structuré !');
  }

  // Points forts
  const strengths = [];
  if (detectedSkills.length > 5) {
    strengths.push(`Maîtrise de ${detectedSkills.length} technologies`);
  }
  if (experience !== 'Non spécifié') {
    strengths.push(`${experience} d'expérience`);
  }
  if (detectedSkills.some(s => ['React', 'Node.js', 'JavaScript'].includes(s))) {
    strengths.push('Compétences en développement web');
  }
  if (strengths.length === 0) {
    strengths.push('Bon potentiel à développer');
  }

  return { 
    name, 
    email, 
    phone, 
    experience,
    skills: detectedSkills, 
    score, 
    strengths,
    improvements,
    method: 'local_analysis'
  };
}

// ============================================
// ⭐ ROUTE D'UPLOAD AVEC ANALYSE SÉMANTIQUE
// ============================================
router.post('/upload', upload.single('cv'), async (req, res) => {
  console.log('📥 Upload reçu !');
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier sélectionné' 
      });
    }

    console.log('📄 Fichier:', req.file.originalname);
    console.log('📊 Taille:', req.file.size, 'bytes');

    let text = '';
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    if (fileType === 'application/pdf') {
      text = await extractTextFromPDF(filePath);
      console.log('📖 PDF extrait, longueur:', text.length);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fs.readFileSync(filePath) });
      text = result.value;
      console.log('📖 DOCX extrait, longueur:', text.length);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Format non supporté. Utilisez PDF ou DOCX.' 
      });
    }

    if (!text || text.length < 30) {
      return res.status(400).json({
        success: false,
        message: 'Le fichier ne contient pas assez de texte à analyser.'
      });
    }

    // ============================================
    // ⭐ ANALYSE CLASSIQUE (compétences, score)
    // ============================================
    const analysis = analyzeText(text);
    console.log('✅ Analyse classique terminée');

    // ============================================
    // ⭐ ANALYSE SÉMANTIQUE (contexte, soft skills)
    // ============================================
    console.log('🧠 Analyse sémantique en cours...');
    const semanticResult = semanticAnalyzer.analyze(text);
    
    if (semanticResult.success) {
      console.log('✅ Analyse sémantique terminée');
    } else {
      console.log('⚠️ Analyse sémantique partielle:', semanticResult.message);
    }

    // ============================================
    // ⭐ COMBINAISON DES DEUX ANALYSES
    // ============================================
    const combinedAnalysis = {
      // Analyse classique
      name: analysis.name,
      email: analysis.email,
      phone: analysis.phone,
      experience: analysis.experience,
      skills: analysis.skills,
      score: analysis.score,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      method: analysis.method,
      
      // Analyse sémantique
      semantic: semanticResult.success ? semanticResult.analysis : {
        softSkills: [],
        achievements: [],
        industries: [],
        completeness: { score: 0, missing: [] },
        summary: { short: 'Analyse sémantique non disponible' },
        recommendations: ['Déposez un CV plus détaillé pour une analyse complète']
      },
      
      // Synthèse combinée
      synthesis: {
        // Fusion des recommandations
        allRecommendations: [
          ...analysis.improvements,
          ...(semanticResult.success ? semanticResult.analysis.recommendations : [])
        ],
        // Compétences techniques + soft skills
        allSkills: {
          technical: analysis.skills,
          soft: semanticResult.success ? semanticResult.analysis.softSkills : []
        },
        // Niveau global
        globalLevel: semanticResult.success ? semanticResult.analysis.experience.level : analysis.experience,
        // Score global pondéré
        globalScore: semanticResult.success 
          ? Math.round((analysis.score + (semanticResult.analysis.completeness.score || 0)) / 2)
          : analysis.score
      }
    };

    console.log('✅ Analyse combinée terminée');

    res.json({
      success: true,
      message: 'CV analysé avec succès !',
      file: {
        name: req.file.originalname,
        size: req.file.size
      },
      analysis: combinedAnalysis
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse',
      error: error.message
    });
  }
});

// ============================================
// ⭐ ROUTE D'ANALYSE SÉMANTIQUE UNIQUEMENT
// ============================================
router.post('/semantic', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Texte insuffisant pour l\'analyse sémantique'
      });
    }

    const result = semanticAnalyzer.analyze(text);
    
    res.json({
      success: result.success,
      analysis: result.analysis,
      message: result.message || 'Analyse sémantique réussie'
    });

  } catch (error) {
    console.error('❌ Erreur analyse sémantique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse sémantique',
      error: error.message
    });
  }
});

// Route de test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Route AI fonctionne !'
  });
});

module.exports = router;