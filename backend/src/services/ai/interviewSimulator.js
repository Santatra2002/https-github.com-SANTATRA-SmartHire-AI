// backend/src/services/ai/interviewSimulator.js

/**
 * 💬 AI Interview Simulator
 * Génère des questions personnalisées et simule un entretien
 */
class InterviewSimulator {
    constructor() {
      // Base de questions par catégorie
      this.questionBank = {
        technical: {
          react: [
            {
              question: "Expliquez le cycle de vie d'un composant React",
              difficulty: "Moyen",
              expectedKeywords: ["mounting", "updating", "unmounting", "componentDidMount", "useEffect"]
            },
            {
              question: "Quelle est la différence entre useState et useReducer ?",
              difficulty: "Moyen",
              expectedKeywords: ["état local", "actions", "reducer", "complexité"]
            },
            {
              question: "Comment optimiser les performances dans React ?",
              difficulty: "Difficile",
              expectedKeywords: ["memo", "useCallback", "useMemo", "lazy loading", "virtual DOM"]
            }
          ],
          node: [
            {
              question: "Comment fonctionne le système d'événements en Node.js ?",
              difficulty: "Moyen",
              expectedKeywords: ["event loop", "async", "non-blocking", "callbacks"]
            },
            {
              question: "Expliquez la différence entre process.nextTick et setImmediate",
              difficulty: "Difficile",
              expectedKeywords: ["microtasks", "macrotasks", "event loop phases"]
            }
          ],
          javascript: [
            {
              question: "Expliquez la différence entre == et === en JavaScript",
              difficulty: "Facile",
              expectedKeywords: ["égalité stricte", "type coercion", "comparaison"]
            },
            {
              question: "Qu'est-ce qu'une closure en JavaScript ?",
              difficulty: "Moyen",
              expectedKeywords: ["fonction", "scope", "variables", "parent", "lexical"]
            }
          ],
          typescript: [
            {
              question: "Quelle est la différence entre interface et type en TypeScript ?",
              difficulty: "Moyen",
              expectedKeywords: ["extension", "union", "intersection", "declaration merging"]
            }
          ],
          python: [
            {
              question: "Expliquez la GIL en Python",
              difficulty: "Difficile",
              expectedKeywords: ["global interpreter lock", "threading", "concurrency"]
            }
          ],
          docker: [
            {
              question: "Expliquez la différence entre une image et un conteneur Docker",
              difficulty: "Facile",
              expectedKeywords: ["image", "instance", "read-only", "runtime"]
            }
          ]
        },
        behavioral: {
          junior: [
            {
              question: "Comment gérez-vous les situations de stress en équipe ?",
              category: "Gestion du stress",
              expectedKeywords: ["calme", "organisation", "priorités", "communication"]
            },
            {
              question: "Parlez-moi d'un projet où vous avez appris une nouvelle technologie rapidement",
              category: "Adaptabilité",
              expectedKeywords: ["apprentissage", "initiative", "recherche", "documentation"]
            }
          ],
          intermediate: [
            {
              question: "Décrivez une situation où vous avez résolu un conflit en équipe",
              category: "Gestion de conflit",
              expectedKeywords: ["écoute", "médiation", "compromis", "solution"]
            },
            {
              question: "Comment gérez-vous les critiques sur votre travail ?",
              category: "Réception de feedback",
              expectedKeywords: ["constructif", "amélioration", "écoute", "adaptation"]
            }
          ],
          senior: [
            {
              question: "Comment avez-vous géré une situation de crise ?",
              category: "Gestion de crise",
              expectedKeywords: ["leadership", "décision", "équipe", "urgence"]
            },
            {
              question: "Décrivez votre approche de la gestion d'équipe",
              category: "Leadership",
              expectedKeywords: ["motivation", "délégation", "confiance", "objectifs"]
            }
          ]
        },
        general: [
          {
            question: "Quelles sont vos principales motivations professionnelles ?",
            category: "Motivation",
            expectedKeywords: ["passion", "défi", "apprentissage", "impact"]
          },
          {
            question: "Où vous voyez-vous dans 5 ans ?",
            category: "Vision",
            expectedKeywords: ["évolution", "objectif", "carrière", "ambition"]
          },
          {
            question: "Quelle est votre plus grande réussite professionnelle ?",
            category: "Réalisation",
            expectedKeywords: ["accomplissement", "impact", "résultat", "mesurable"]
          }
        ]
      };
    }
  
    /**
     * 🎯 Générer des questions personnalisées
     */
    generateQuestions(candidateSkills, jobTitle, experienceLevel, jobDescription) {
      console.log('💬 Génération des questions d\'entretien...');
      
      const questions = [];
  
      // 1. Questions techniques (basées sur les compétences)
      const technicalQuestions = this.generateTechnicalQuestions(candidateSkills);
      questions.push(...technicalQuestions);
  
      // 2. Questions comportementales (basées sur l'expérience)
      const behavioralQuestions = this.generateBehavioralQuestions(experienceLevel);
      questions.push(...behavioralQuestions);
  
      // 3. Questions générales (adaptées au poste)
      const generalQuestions = this.generateGeneralQuestions(jobTitle, jobDescription);
      questions.push(...generalQuestions);
  
      // 4. Questions spécifiques (basées sur la description du poste)
      const specificQuestions = this.generateSpecificQuestions(jobDescription);
      questions.push(...specificQuestions);
  
      // Limiter à 10 questions max
      const limitedQuestions = questions.slice(0, 10);
  
      return {
        success: true,
        questions: limitedQuestions,
        total: limitedQuestions.length,
        estimatedDuration: limitedQuestions.length * 3, // 3 minutes par question
        categories: this.getCategories(limitedQuestions)
      };
    }
  
    /**
     * 🔧 Générer les questions techniques
     */
    generateTechnicalQuestions(skills) {
      const questions = [];
      const techQuestions = this.questionBank.technical;
  
      for (const skill of skills) {
        const skillKey = skill.toLowerCase();
        const qList = techQuestions[skillKey];
        if (qList) {
          // Prendre 1-2 questions par compétence
          const selected = this.shuffleArray(qList).slice(0, 2);
          questions.push(...selected.map(q => ({
            ...q,
            type: 'technique',
            category: skill,
            difficulty: q.difficulty || 'Moyen'
          })));
        }
      }
  
      // Si pas assez de questions, ajouter des questions générales
      if (questions.length < 3) {
        questions.push({
          question: "Quel est votre projet technique le plus complexe ?",
          type: 'technique',
          category: 'Général',
          difficulty: 'Moyen',
          expectedKeywords: ['architecture', 'solution', 'impact']
        });
      }
  
      return questions;
    }
  
    /**
     * 🧠 Générer les questions comportementales
     */
    generateBehavioralQuestions(experienceLevel) {
      const questions = [];
      const behaviorMap = {
        'Junior': 'junior',
        'Intermédiaire': 'intermediate',
        'Confirmé': 'intermediate',
        'Sénior': 'senior',
        'Expert': 'senior'
      };
  
      const level = behaviorMap[experienceLevel] || 'intermediate';
      const behaviorQuestions = this.questionBank.behavioral[level] || this.questionBank.behavioral.intermediate;
  
      // Prendre 2-3 questions aléatoires
      const selected = this.shuffleArray(behaviorQuestions).slice(0, 3);
      questions.push(...selected.map(q => ({
        ...q,
        type: 'comportemental',
        difficulty: this.getBehavioralDifficulty(level)
      })));
  
      return questions;
    }
  
    /**
     * 📋 Générer les questions générales
     */
    generateGeneralQuestions(jobTitle, jobDescription) {
      const questions = [];
      const generalQuestions = this.shuffleArray(this.questionBank.general).slice(0, 3);
  
      // Adapter les questions au poste
      questions.push(...generalQuestions.map(q => ({
        ...q,
        type: 'général',
        difficulty: 'Facile'
      })));
  
      // Ajouter une question spécifique au poste
      if (jobTitle) {
        questions.push({
          question: `Pourquoi êtes-vous intéressé par ce poste de ${jobTitle} ?`,
          type: 'général',
          category: 'Motivation',
          difficulty: 'Facile',
          expectedKeywords: ['passion', 'compétences', 'opportunité']
        });
      }
  
      return questions;
    }
  
    /**
     * 🎯 Générer des questions spécifiques basées sur la description
     */
    generateSpecificQuestions(jobDescription) {
      const questions = [];
      if (!jobDescription) return questions;
  
      const keywords = ['équipe', 'projet', 'client', 'leadership', 'innovation', 'qualité'];
      const usedKeywords = keywords.filter(k => jobDescription.toLowerCase().includes(k));
  
      for (const keyword of usedKeywords) {
        questions.push({
          question: `Pouvez-vous nous parler de votre expérience avec ${keyword} ?`,
          type: 'spécifique',
          category: 'Poste',
          difficulty: 'Moyen',
          expectedKeywords: [keyword]
        });
      }
  
      return questions;
    }
  
    /**
     * ✅ Évaluer une réponse
     */
    evaluateAnswer(question, answer) {
      if (!answer || answer.length < 5) {
        return {
          score: 0,
          feedback: "⚠️ Réponse trop courte. Développez davantage.",
          improvements: ["Structurez votre réponse", "Donnez des exemples concrets"]
        };
      }
  
      let score = 0;
      const feedback = [];
      const improvements = [];
  
      // 1. Longueur de la réponse
      if (answer.length > 100) {
        score += 20;
        feedback.push("✅ Bonne longueur de réponse");
      } else if (answer.length > 50) {
        score += 10;
        feedback.push("📝 Réponse correcte, mais peut être plus détaillée");
        improvements.push("Ajoutez plus de détails");
      } else {
        feedback.push("⚠️ Réponse trop courte");
        improvements.push("Développez votre réponse avec des exemples");
      }
  
      // 2. Mots-clés attendus
      if (question.expectedKeywords) {
        const matched = question.expectedKeywords.filter(k => 
          answer.toLowerCase().includes(k.toLowerCase())
        );
        const ratio = matched.length / question.expectedKeywords.length;
        score += ratio * 30;
        if (ratio > 0.7) {
          feedback.push("✅ Excellente utilisation des mots-clés");
        } else if (ratio > 0.4) {
          feedback.push("👍 Quelques mots-clés importants sont mentionnés");
          improvements.push("Utilisez plus de termes techniques");
        } else {
          feedback.push("⚠️ Peu de mots-clés techniques mentionnés");
          improvements.push("Utilisez le vocabulaire spécifique au domaine");
        }
      }
  
      // 3. Structure (exemples, résultats)
      if (answer.includes('exemple') || answer.includes('projet') || answer.includes('résultat')) {
        score += 20;
        feedback.push("✅ Bonne utilisation d'exemples concrets");
      } else {
        improvements.push("Ajoutez des exemples concrets");
      }
  
      // 4. Clarté et précision
      if (answer.split('.').length > 3) {
        score += 10;
        feedback.push("✅ Réponse bien structurée");
      } else {
        improvements.push("Structurez votre réponse en plusieurs parties");
      }
  
      // Bonus pour les résultats quantifiables
      if (/\d+/.test(answer)) {
        score += 20;
        feedback.push("✅ Excellente utilisation de données quantifiables");
      }
  
      const finalScore = Math.min(Math.round(score), 100);
  
      return {
        score: finalScore,
        feedback: feedback.join(' | '),
        improvements: improvements,
        recommendation: this.getRecommendation(finalScore)
      };
    }
  
    /**
     * 📊 Obtenir une recommandation basée sur le score
     */
    getRecommendation(score) {
      if (score >= 80) {
        return "🌟 Excellent ! Vous êtes bien préparé pour cet entretien.";
      } else if (score >= 60) {
        return "👍 Bonne préparation. Continuez à vous entraîner sur les points faibles.";
      } else if (score >= 40) {
        return "📝 Niveau correct. Travaillez davantage les exemples concrets.";
      } else {
        return "⚠️ Besoin d'amélioration. Entraînez-vous avec plus d'exercices pratiques.";
      }
    }
  
    /**
     * 🔀 Mélanger un tableau
     */
    shuffleArray(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
  
    /**
     * 🏷️ Obtenir la difficulté comportementale
     */
    getBehavioralDifficulty(level) {
      const map = {
        'junior': 'Facile',
        'intermediate': 'Moyen',
        'senior': 'Difficile'
      };
      return map[level] || 'Moyen';
    }
  
    /**
     * 📂 Obtenir les catégories
     */
    getCategories(questions) {
      const categories = {};
      for (const q of questions) {
        const cat = q.category || 'Général';
        categories[cat] = (categories[cat] || 0) + 1;
      }
      return categories;
    }
  
    /**
     * 📋 Simuler un entretien complet
     */
    simulateInterview(questions, answers) {
      const results = [];
      let totalScore = 0;
  
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answer = answers[i] || '';
        const evaluation = this.evaluateAnswer(question, answer);
        results.push({
          question: question.question,
          answer: answer,
          score: evaluation.score,
          feedback: evaluation.feedback,
          improvements: evaluation.improvements
        });
        totalScore += evaluation.score;
      }
  
      const avgScore = Math.round(totalScore / questions.length);
  
      return {
        success: true,
        results: results,
        averageScore: avgScore,
        totalQuestions: questions.length,
        recommendation: this.getRecommendation(avgScore)
      };
    }
  }
  
  module.exports = new InterviewSimulator();