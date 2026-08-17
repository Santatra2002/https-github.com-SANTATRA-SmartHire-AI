// backend/src/services/ai/cvAnalysis.js
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

// Initialiser OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extraire le texte d'un fichier (PDF ou DOCX)
 */
async function extractTextFromFile(filePath, fileType) {
  const fileBuffer = fs.readFileSync(filePath);
  
  if (fileType === 'pdf') {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } else if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }
  throw new Error('Format de fichier non supporté');
}

/**
 * Analyser un CV avec OpenAI
 */
async function analyzeCV(cvText) {
  try {
    const prompt = `
    Analyse ce CV et extrait les informations suivantes au format JSON :
    
    CV : ${cvText.substring(0, 8000)}  // Limite de caractères
    
    Réponds avec ce format JSON :
    {
      "name": "Nom complet",
      "email": "Email",
      "phone": "Téléphone",
      "skills": ["Compétence1", "Compétence2", ...],
      "experience": ["Expérience1", "Expérience2", ...],
      "education": ["Formation1", "Formation2", ...],
      "languages": ["Langue1", "Langue2", ...],
      "certifications": ["Certification1", ...],
      "score": 85,  // Score sur 100
      "strengths": ["Point fort1", "Point fort2", ...],
      "improvements": ["Amélioration suggérée1", ...]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en analyse de CV et en recrutement." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Erreur analyse CV:', error);
    throw error;
  }
}

/**
 * Générer des suggestions d'amélioration
 */
async function generateImprovements(cvText) {
  try {
    const prompt = `
    Analyse ce CV et donne 3 suggestions d'amélioration concrètes :
    
    ${cvText.substring(0, 4000)}
    
    Réponds au format JSON :
    {
      "suggestions": [
        "Suggestion 1",
        "Suggestion 2",
        "Suggestion 3"
      ],
      "keywords": ["mot-clé1", "mot-clé2", ...]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en amélioration de CV." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Erreur génération suggestions:', error);
    throw error;
  }
}

module.exports = {
  extractTextFromFile,
  analyzeCV,
  generateImprovements
};