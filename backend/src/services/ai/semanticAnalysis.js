// backend/src/services/ai/semanticAnalysis.js

/**
 * Analyse sémantique du CV
 * C'est le cœur de l'IA - elle comprend le SENS du CV
 */
class SemanticAnalyzer {
    constructor() {
      // Dictionnaire de compétences avec contexte
      this.skillDictionary = {
        'react': { 
          keywords: ['react', 'reactjs', 'react.js', 'frontend', 'ui', 'components'],
          level: 'framework',
          synonyms: ['frontend', 'ui components', 'spa']
        },
        'node': { 
          keywords: ['node', 'nodejs', 'node.js', 'backend', 'api', 'rest', 'express'],
          level: 'framework',
          synonyms: ['backend', 'api development', 'server-side']
        },
        'javascript': { 
          keywords: ['javascript', 'js', 'es6', 'ecmascript', 'frontend', 'backend'],
          level: 'language',
          synonyms: ['web development', 'scripting']
        },
        'typescript': { 
          keywords: ['typescript', 'ts', 'typed', 'interfaces', 'generics'],
          level: 'language',
          synonyms: ['typed javascript', 'static typing']
        }
      };
  
      // Mots d'action pour détecter les réalisations
      this.actionVerbs = [
        'created', 'developed', 'built', 'led', 'managed', 'increased',
        'improved', 'reduced', 'implemented', 'designed', 'launched',
        'delivered', 'achieved', 'grew', 'scaled', 'optimized',
        'streamlined', 'automated', 'mentored', 'coached', 'spearheaded'
      ];
  
      // Soft skills à détecter
      this.softSkills = [
        { name: 'leadership', keywords: ['lead', 'manage', 'team', 'coach', 'mentor', 'director'] },
        { name: 'communication', keywords: ['communicate', 'present', 'speak', 'write', 'collaborate'] },
        { name: 'problemsolving', keywords: ['solve', 'analyze', 'troubleshoot', 'debug', 'resolve'] },
        { name: 'teamwork', keywords: ['team', 'collaborate', 'cooperate', 'joint', 'collective'] },
        { name: 'adaptability', keywords: ['adapt', 'flexible', 'agile', 'change', 'evolve'] },
        { name: 'creativity', keywords: ['create', 'innovate', 'design', 'imagine', 'invent'] },
        { name: 'time management', keywords: ['deadline', 'schedule', 'plan', 'organize', 'prioritize'] }
      ];
    }
  
    /**
     * Analyse sémantique complète
     */
    analyze(text) {
      if (!text || text.length < 50) {
        return {
          success: false,
          message: 'Texte insuffisant pour l\'analyse',
          analysis: null
        };
      }
  
      // 1. Extraction des compétences avec contexte
      const skills = this.extractSkillsWithContext(text);
      
      // 2. Détection du niveau d'expérience
      const experience = this.detectExperience(text);
      
      // 3. Détection des soft skills
      const softSkills = this.detectSoftSkills(text);
      
      // 4. Détection des réalisations
      const achievements = this.detectAchievements(text);
      
      // 5. Détection des secteurs
      const industries = this.detectIndustries(text);
      
      // 6. Calcul du score de complétude
      const completeness = this.calculateCompleteness(text);
      
      // 7. Résumé du profil
      const summary = this.generateSummary(skills, experience, softSkills);
  
      return {
        success: true,
        analysis: {
          skills: skills,
          experience: experience,
          softSkills: softSkills,
          achievements: achievements,
          industries: industries,
          completeness: completeness,
          summary: summary,
          recommendations: this.generateRecommendations(skills, experience, completeness)
        }
      };
    }
  
    /**
     * Extraire les compétences avec contexte sémantique
     */
    extractSkillsWithContext(text) {
      const detected = [];
      const lowerText = text.toLowerCase();
  
      for (const [skill, data] of Object.entries(this.skillDictionary)) {
        let confidence = 0;
        let context = 'non spécifié';
        let level = 'débutant';
  
        // Vérifier les mots-clés
        for (const keyword of data.keywords) {
          if (lowerText.includes(keyword)) {
            confidence += 0.3;
            
            // Détection du contexte
            if (this.hasContext(lowerText, keyword, ['projet', 'mission', 'réalisation'])) {
              confidence += 0.2;
              context = 'expérience pratique';
            }
            if (this.hasContext(lowerText, keyword, ['formation', 'certification', 'diplôme'])) {
              confidence += 0.1;
              context = 'formation';
            }
            
            // Détection du niveau
            if (this.hasContext(lowerText, keyword, ['expert', 'avancé', 'senior'])) {
              level = 'expert';
              confidence += 0.3;
            } else if (this.hasContext(lowerText, keyword, ['intermédiaire', 'confirmé'])) {
              level = 'intermédiaire';
              confidence += 0.2;
            }
          }
        }
  
        if (confidence > 0.3) {
          detected.push({
            name: skill,
            type: data.level,
            level: level,
            confidence: Math.min(confidence, 1),
            context: context
          });
        }
      }
  
      return detected;
    }
  
    /**
     * Vérifier le contexte autour d'un mot-clé
     */
    hasContext(text, keyword, contextWords) {
      // Trouver la position du mot-clé
      const index = text.indexOf(keyword);
      if (index === -1) return false;
      
      // Extraire le contexte (50 caractères avant et après)
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + 50);
      const context = text.substring(start, end);
      
      // Vérifier si un mot de contexte est présent
      return contextWords.some(word => context.includes(word));
    }
  
    /**
     * Détecter le niveau d'expérience
     */
    detectExperience(text) {
      const years = this.extractTotalExperience(text);
      const hasSenior = /(senior|lead|head|director|manager|architect)/i.test(text);
      const hasJunior = /(junior|entry|débutant)/i.test(text);
  
      let level = 'Junior';
      let description = 'Débutant avec peu d\'expérience';
  
      if (years >= 8 || hasSenior) {
        level = 'Sénior';
        description = 'Expert avec plus de 8 ans d\'expérience';
      } else if (years >= 5) {
        level = 'Confirmé';
        description = 'Professionnel confirmé avec 5 ans d\'expérience';
      } else if (years >= 2) {
        level = 'Intermédiaire';
        description = 'Professionnel intermédiaire avec 2-5 ans d\'expérience';
      } else if (years > 0) {
        level = 'Junior';
        description = 'Débutant avec moins de 2 ans d\'expérience';
      }
  
      return {
        level: level,
        years: years,
        description: description,
        hasSeniorRole: hasSenior,
        hasJuniorRole: hasJunior
      };
    }
  
    /**
     * Extraire le nombre total d'années
     */
    extractTotalExperience(text) {
      const patterns = [
        /(\d+)\s*(?:ans|années?|years?)\s*(?:d['']expérience|experience)/i,
        /experience.*?(\d+)\s*(?:ans|années?|years?)/i,
        /(\d+)\s*(?:ans|années?|years?)/i
      ];
      
      let total = 0;
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          total = Math.max(total, parseInt(matches[1]));
        }
      }
      return total;
    }
  
    /**
     * Détecter les soft skills
     */
    detectSoftSkills(text) {
      const detected = [];
      const lowerText = text.toLowerCase();
  
      for (const skill of this.softSkills) {
        let confidence = 0;
        for (const keyword of skill.keywords) {
          if (lowerText.includes(keyword)) {
            confidence += 0.3;
            // Bonus si dans un contexte positif
            if (this.hasContext(lowerText, keyword, ['développé', 'acquis', 'démontré'])) {
              confidence += 0.2;
            }
          }
        }
        if (confidence > 0.3) {
          detected.push({
            name: skill.name,
            confidence: Math.min(confidence, 1)
          });
        }
      }
  
      return detected;
    }
  
    /**
     * Détecter les réalisations
     */
    detectAchievements(text) {
      const achievements = [];
      const sentences = text.split(/[.!?]+/);
  
      for (const sentence of sentences) {
        for (const verb of this.actionVerbs) {
          if (sentence.toLowerCase().includes(verb)) {
            // Vérifier que c'est une réalisation significative
            if (sentence.length > 20 && this.isSignificantAchievement(sentence)) {
              achievements.push({
                action: verb,
                description: sentence.trim(),
                impact: this.extractImpact(sentence)
              });
              break;
            }
          }
        }
      }
  
      return achievements;
    }
  
    /**
     * Vérifier si c'est une réalisation significative
     */
    isSignificantAchievement(sentence) {
      const hasNumber = /\d+/.test(sentence);
      const hasPercent = /%/.test(sentence);
      const hasMetric = /(réduit|augmenté|amélioré|créé|développé)/i.test(sentence);
      return hasNumber || hasPercent || hasMetric;
    }
  
    /**
     * Extraire l'impact d'une réalisation
     */
    extractImpact(sentence) {
      const impactPatterns = [
        /(\d+)\s*%/.exec(sentence),
        /(\d+)\s*(?:fois|mois|jours)/.exec(sentence),
        /(\d+)\s*(?:K|k|M|m)/.exec(sentence)
      ];
  
      for (const pattern of impactPatterns) {
        if (pattern) {
          return pattern[0];
        }
      }
      return 'impact non quantifié';
    }
  
    /**
     * Détecter les secteurs d'activité
     */
    detectIndustries(text) {
      const industries = [
        { name: 'Tech', keywords: ['tech', 'technologie', 'software', 'digital', 'it'] },
        { name: 'Finance', keywords: ['finance', 'bank', 'assurance', 'investment'] },
        { name: 'Santé', keywords: ['santé', 'medical', 'health', 'biotech'] },
        { name: 'Éducation', keywords: ['éducation', 'formation', 'teaching', 'training'] }
      ];
  
      const detected = [];
      const lowerText = text.toLowerCase();
  
      for (const industry of industries) {
        let confidence = 0;
        for (const keyword of industry.keywords) {
          if (lowerText.includes(keyword)) {
            confidence += 0.3;
          }
        }
        if (confidence > 0.3) {
          detected.push({
            name: industry.name,
            confidence: Math.min(confidence, 1)
          });
        }
      }
  
      return detected;
    }
  
    /**
     * Calculer le score de complétude
     */
    calculateCompleteness(text) {
      const sections = {
        education: /(education|formation|diplôme|master|bachelor|licence|étude)/i,
        experience: /(experience|expérience|travail|carrière|poste|job|mission)/i,
        skills: /(skills|compétences|technologies|tools|outils|maîtrise)/i,
        projects: /(projects|projets|realisations|achievements|réalisations)/i,
        languages: /(languages|langues|anglais|français|espagnol|bilingue)/i,
        certifications: /(certification|certificat|formation|diplôme|qualification)/i,
        contact: /(email|téléphone|phone|linkedin|github|portfolio)/i
      };
  
      let score = 0;
      for (const [section, regex] of Object.entries(sections)) {
        if (regex.test(text)) {
          score += 1;
        }
      }
  
      const totalSections = Object.keys(sections).length;
      return {
        score: Math.round((score / totalSections) * 100),
        missing: Object.keys(sections).filter(key => !sections[key].test(text))
      };
    }
  
    /**
     * Générer un résumé du profil
     */
    generateSummary(skills, experience, softSkills) {
      const techSkills = skills.map(s => s.name).slice(0, 5).join(', ');
      const topSoftSkills = softSkills.map(s => s.name).slice(0, 3).join(', ');
      
      return {
        short: `Profil ${experience.level} avec ${skills.length} compétences techniques.`,
        detailed: `Développeur ${experience.level} maîtrisant ${techSkills}. Bonnes compétences en ${topSoftSkills || 'soft skills à développer'}.`,
        topSkills: skills.slice(0, 5).map(s => s.name)
      };
    }
  
    /**
     * Générer des recommandations
     */
    generateRecommendations(skills, experience, completeness) {
      const recommendations = [];
  
      // Recommandations basées sur les compétences
      if (skills.length < 5) {
        recommendations.push('Ajoutez des compétences techniques supplémentaires (React, Node.js, etc.)');
      }
  
      // Recommandations basées sur le niveau
      if (experience.level === 'Junior') {
        recommendations.push('Mettez en avant vos projets personnels et stages');
      }
  
      // Recommandations basées sur la complétude
      if (completeness.score < 70) {
        recommendations.push(`Ajoutez des sections manquantes : ${completeness.missing.join(', ')}`);
      }
  
      // Recommandations générales
      if (experience.years === 0) {
        recommendations.push('Ajoutez des expériences professionnelles ou projets significatifs');
      }
  
      return recommendations;
    }
  }
  
  module.exports = new SemanticAnalyzer();