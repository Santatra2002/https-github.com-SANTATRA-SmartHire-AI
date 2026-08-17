// backend/src/services/ai/matching.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calculer le matching entre un candidat et une offre
 */
async function calculateMatch(candidateProfile, jobOffer) {
  try {
    const prompt = `
    Compare ce candidat avec cette offre d'emploi et calcule un score de compatibilité.
    
    Candidat :
    - Nom : ${candidateProfile.name}
    - Compétences : ${candidateProfile.skills?.join(', ')}
    - Expériences : ${candidateProfile.experiences?.join(', ')}
    - Formation : ${candidateProfile.education?.join(', ')}
    
    Offre :
    - Titre : ${jobOffer.title}
    - Description : ${jobOffer.description}
    - Compétences requises : ${jobOffer.skills}
    - Niveau d'expérience : ${jobOffer.experience}
    
    Réponds au format JSON :
    {
      "score": 92,  // Score sur 100
      "match": [
        "Point de correspondance 1",
        "Point de correspondance 2"
      ],
      "missing": [
        "Compétence manquante 1",
        "Compétence manquante 2"
      ],
      "recommendations": [
        "Recommandation 1",
        "Recommandation 2"
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en recrutement et en matching." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Erreur matching:', error);
    throw error;
  }
}

/**
 * Trouver les meilleurs candidats pour une offre
 */
async function findBestCandidates(candidates, jobOffer) {
  const results = [];
  
  for (const candidate of candidates) {
    const match = await calculateMatch(candidate, jobOffer);
    results.push({
      candidate,
      ...match
    });
  }
  
  // Trier par score décroissant
  results.sort((a, b) => b.score - a.score);
  
  return results;
}

module.exports = {
  calculateMatch,
  findBestCandidates
};