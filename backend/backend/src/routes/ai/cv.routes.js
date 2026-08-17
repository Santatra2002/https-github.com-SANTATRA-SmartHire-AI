// backend/src/routes/ai/cv.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { extractTextFromFile, analyzeCV, generateImprovements } = require('../../services/ai/cvAnalysis');

// Configuration multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload et analyse de CV
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    console.log('1. Fichier reçu:', req.file?.filename);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier' });
    }
    const filePath = req.file.path;
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'docx';
    console.log('2. Extraction du texte...');
    const text = await extractTextFromFile(filePath, fileType);
    console.log('3. Texte extrait, longueur:', text.length);
    
    console.log('4. Appel OpenAI (analyse)...');
    const analysis = await analyzeCV(text);
    console.log('5. Analyse reçue');
    console.log('6. Appel OpenAI (améliorations)...');
    const improvements = await generateImprovements(text);
    console.log('7. Améliorations reçues');
    res.json({
      success: true,
      message: 'CV analysé avec succès',
      analysis: { ...analysis, improvements }
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'analyse', error: error.message });
  }
});

module.exports = router;