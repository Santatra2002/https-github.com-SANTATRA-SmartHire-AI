// backend/src/services/ai/letterGenerator.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Générer une lettre de motivation personnalisée
 */
async function generateCoverLetter(candidateProfile, jobOffer) {
  try {
    const prompt = `
    Génère une lettre de motivation professionnelle en français pour ce candidat.
    
    Candidat :
    - Nom : ${candidateProfile.name}
    - Compétences : ${candidateProfile.skills?.join(', ')}
    - Expériences : ${candidateProfile.experiences?.join(', ')}
    
    Offre :
    - Titre : ${jobOffer.title}
    - Entreprise : ${jobOffer.company || 'l\'entreprise'}
    - Description : ${jobOffer.description}
    
    La lettre doit être :
    - Professionnelle mais chaleureuse
    - Personnalisée pour l'offre
    - Structurée (introduction, développement, conclusion)
    - Environ 200-300 mots
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en rédaction de lettres de motivation." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Erreur génération lettre:', error);
    throw error;
  }
}

module.exports = {
  generateCoverLetter
};