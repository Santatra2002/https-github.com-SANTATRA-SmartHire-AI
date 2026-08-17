// backend/src/services/ai/careerDashboard.js

/**
 * 📈 Career Success Dashboard
 * Prédictions et recommandations de carrière
 */
class CareerDashboard {
    constructor() {
      this.salaryRanges = {
        'Junior': { min: 35000, max: 42000, median: 38000 },
        'Intermédiaire': { min: 42000, max: 52000, median: 47000 },
        'Confirmé': { min: 52000, max: 65000, median: 58000 },
        'Sénior': { min: 65000, max: 85000, median: 75000 },
        'Expert': { min: 85000, max: 120000, median: 95000 }
      };
  
      this.careerPaths = {
        'Développeur Frontend': [
          { title: 'Développeur Frontend Junior', years: 0 },
          { title: 'Développeur Frontend Confirmé', years: 2 },
          { title: 'Développeur Frontend Senior', years: 4 },
          { title: 'Lead Frontend', years: 6 },
          { title: 'Architecte Frontend', years: 8 }
        ],
        'Développeur Backend': [
          { title: 'Développeur Backend Junior', years: 0 },
          { title: 'Développeur Backend Confirmé', years: 2 },
          { title: 'Développeur Backend Senior', years: 4 },
          { title: 'Lead Backend', years: 6 },
          { title: 'Architecte Backend', years: 8 }
        ],
        'Développeur Full Stack': [
          { title: 'Développeur Full Stack Junior', years: 0 },
          { title: 'Développeur Full Stack Confirmé', years: 2 },
          { title: 'Développeur Full Stack Senior', years: 4 },
          { title: 'Lead Full Stack', years: 6 },
          { title: 'Architecte Solutions', years: 8 }
        ]
      };
    }
  
    /**
     * 📊 Générer le dashboard complet
     */
    generateDashboard(cvAnalysis, jobMatches, userProfile) {
      console.log('📈 Génération du Career Dashboard...');
  
      const dashboard = {
        // 1. Profil carrière
        profile: this.generateProfile(cvAnalysis, userProfile),
        
        // 2. Compétences
        skills: this.analyzeSkills(cvAnalysis),
        
        // 3. Prédictions
        predictions: this.generatePredictions(cvAnalysis, jobMatches),
        
        // 4. Statistiques
        stats: this.generateStats(cvAnalysis, jobMatches),
        
        // 5. Recommandations
        recommendations: this.generateRecommendations(cvAnalysis),
        
        // 6. Timeline
        timeline: this.generateTimeline(cvAnalysis, userProfile),
        
        // 7. Marché
        market: this.analyzeMarket(cvAnalysis, jobMatches)
      };
  
      return {
        success: true,
        dashboard
      };
    }
  
    /**
     * 👤 Profil carrière
     */
    generateProfile(cvAnalysis, userProfile) {
      const skills = cvAnalysis.skills || [];
      const level = cvAnalysis.experienceLevel || 'Intermédiaire';
      
      return {
        name: userProfile?.name || 'Candidat',
        currentLevel: level,
        currentRole: userProfile?.currentRole || 'Développeur',
        yearsOfExperience: cvAnalysis.experience?.years || 0,
        topSkills: skills.slice(0, 5),
        totalSkills: skills.length,
        profileCompleteness: cvAnalysis.completeness?.score || 50
      };
    }
  
    /**
     * 📚 Analyse des compétences
     */
    analyzeSkills(cvAnalysis) {
      const skills = cvAnalysis.skills || [];
      const softSkills = cvAnalysis.softSkills || [];
  
      return {
        technical: {
          mastered: skills.filter(s => s.level === 'expert' || s.confidence > 0.8),
          developing: skills.filter(s => s.level === 'intermédiaire' || s.confidence > 0.5),
          learning: skills.filter(s => s.level === 'débutant' || s.confidence <= 0.5),
          total: skills.length
        },
        soft: {
          detected: softSkills,
          count: softSkills.length
        },
        skillGaps: this.identifySkillGaps(skills)
      };
    }
  
    /**
     * 🔮 Prédictions
     */
    generatePredictions(cvAnalysis, jobMatches) {
      const score = cvAnalysis.score || 70;
      const level = cvAnalysis.experienceLevel || 'Intermédiaire';
      const skills = cvAnalysis.skills || [];
  
      return {
        interviewSuccess: this.predictInterviewSuccess(score, level),
        careerGrowth: this.predictGrowth(level, skills),
        estimatedSalary: this.getSalaryEstimate(level),
        nextRole: this.predictNextRole(level, skills),
        timeToNextPromotion: this.estimatePromotionTime(level),
        growthPotential: this.calculateGrowthPotential(score, level)
      };
    }
  
    /**
     * 📊 Statistiques
     */
    generateStats(cvAnalysis, jobMatches) {
      return {
        overallScore: cvAnalysis.score || 70,
        completeness: cvAnalysis.completeness?.score || 50,
        matchCount: jobMatches?.length || 0,
        averageMatchScore: this.calculateAverageMatch(jobMatches),
        skillScore: this.calculateSkillScore(cvAnalysis.skills || []),
        experienceScore: this.calculateExperienceScore(cvAnalysis.experience)
      };
    }
  
    /**
     * 💡 Recommandations
     */
    generateRecommendations(cvAnalysis) {
      const recommendations = [];
      const skills = cvAnalysis.skills || [];
      const completeness = cvAnalysis.completeness?.score || 50;
      const missingSections = cvAnalysis.completeness?.missing || [];
  
      // 1. Compétences à développer
      const skillGaps = this.identifySkillGaps(skills);
      if (skillGaps.length > 0) {
        recommendations.push({
          type: 'skills',
          title: 'Compétences à développer',
          description: `Les compétences suivantes sont recherchées : ${skillGaps.slice(0, 3).join(', ')}`,
          priority: 'Haute',
          action: 'Suivez des formations ou certifications'
        });
      }
  
      // 2. Amélioration du CV
      if (completeness < 70) {
        recommendations.push({
          type: 'cv',
          title: 'Améliorer votre CV',
          description: `Ajoutez les sections manquantes : ${missingSections.join(', ')}`,
          priority: 'Moyenne',
          action: 'Complétez les sections manquantes'
        });
      }
  
      // 3. Soft skills
      const softSkills = cvAnalysis.softSkills || [];
      if (softSkills.length < 3) {
        recommendations.push({
          type: 'softskills',
          title: 'Développer vos soft skills',
          description: 'Les soft skills comme la communication et le leadership sont très recherchés',
          priority: 'Moyenne',
          action: 'Participez à des ateliers ou projets collaboratifs'
        });
      }
  
      // 4. Réseautage
      recommendations.push({
        type: 'networking',
        title: 'Développer votre réseau',
        description: 'Connectez-vous avec des professionnels du secteur',
        priority: 'Faible',
        action: 'Activez LinkedIn, participez à des meetups'
      });
  
      return recommendations;
    }
  
    /**
     * ⏳ Timeline de carrière
     */
    generateTimeline(cvAnalysis, userProfile) {
      const level = cvAnalysis.experienceLevel || 'Intermédiaire';
      const currentRole = userProfile?.currentRole || 'Développeur';
      
      // Trouver le chemin de carrière correspondant
      let careerPath = this.careerPaths['Développeur Full Stack'];
      for (const [key, path] of Object.entries(this.careerPaths)) {
        if (currentRole.toLowerCase().includes(key.toLowerCase())) {
          careerPath = path;
          break;
        }
      }
  
      // Ajuster en fonction du niveau actuel
      const currentIndex = careerPath.findIndex(p => 
        p.title.toLowerCase().includes(level.toLowerCase())
      );
  
      const startIndex = Math.max(0, currentIndex);
      const futurePath = careerPath.slice(startIndex, startIndex + 4);
  
      return {
        current: {
          title: futurePath[0]?.title || currentRole,
          level: level,
          duration: 'Actuel'
        },
        next: futurePath[1] ? {
          title: futurePath[1].title,
          timeline: `${futurePath[1].years - (cvAnalysis.experience?.years || 0)} ans`,
          requirements: ['Compétences techniques', 'Gestion de projet']
        } : null,
        future: futurePath.slice(2).map(p => ({
          title: p.title,
          timeline: `${p.years} ans d'expérience`,
          requirements: this.getRequirementsForLevel(p.title)
        }))
      };
    }
  
    /**
     * 📈 Analyse du marché
     */
    analyzeMarket(cvAnalysis, jobMatches) {
      const skills = cvAnalysis.skills || [];
      const topSkills = skills.slice(0, 5).map(s => typeof s === 'string' ? s : s.name);
  
      return {
        demand: this.calculateMarketDemand(topSkills),
        opportunities: jobMatches?.length || 0,
        trends: this.getCurrentTrends(),
        recommendedSkills: this.getRecommendedSkills(topSkills)
      };
    }
  
    /**
     * 🔧 Fonctions utilitaires
     */
    identifySkillGaps(skills) {
      const commonSkills = ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Docker', 'AWS', 'Git'];
      const currentSkills = skills.map(s => typeof s === 'string' ? s : s.name);
      return commonSkills.filter(s => !currentSkills.some(c => c.includes(s)));
    }
  
    predictInterviewSuccess(score, level) {
      const base = score / 100;
      const levelBonus = {
        'Junior': 0.05,
        'Intermédiaire': 0.1,
        'Confirmé': 0.15,
        'Sénior': 0.2,
        'Expert': 0.25
      }[level] || 0;
  
      const prediction = Math.min(base + levelBonus, 0.95);
      return {
        score: Math.round(prediction * 100),
        level: prediction > 0.7 ? 'Élevée' : prediction > 0.4 ? 'Moyenne' : 'Faible',
        confidence: 'Moyenne'
      };
    }
  
    predictGrowth(level, skills) {
      const base = {
        'Junior': 'Rapide',
        'Intermédiaire': 'Modérée',
        'Confirmé': 'Stable',
        'Sénior': 'Lente',
        'Expert': 'Lente'
      }[level] || 'Modérée';
  
      const skillBonus = skills.length > 10 ? 0.2 : 0;
      return {
        potential: base,
        estimatedTimeline: this.getGrowthTimeline(level),
        factors: ['Expérience actuelle', 'Compétences techniques', 'Soft skills']
      };
    }
  
    getSalaryEstimate(level) {
      const range = this.salaryRanges[level] || this.salaryRanges['Intermédiaire'];
      return {
        min: range.min,
        max: range.max,
        median: range.median,
        currency: '€'
      };
    }
  
    predictNextRole(level, skills) {
      const levels = ['Junior', 'Intermédiaire', 'Confirmé', 'Sénior', 'Expert'];
      const currentIndex = levels.indexOf(level);
      
      if (currentIndex < levels.length - 1) {
        return {
          title: levels[currentIndex + 1],
          timeline: '2-3 ans',
          requirements: ['Expérience supplémentaire', 'Compétences avancées']
        };
      }
      return {
        title: 'Lead / Architecte',
        timeline: '3-5 ans',
        requirements: ['Leadership', 'Architecture', 'Mentorat']
      };
    }
  
    estimatePromotionTime(level) {
      const times = {
        'Junior': '1-2 ans',
        'Intermédiaire': '2-3 ans',
        'Confirmé': '3-4 ans',
        'Sénior': '4-5 ans',
        'Expert': '5+ ans'
      };
      return times[level] || '3 ans';
    }
  
    calculateGrowthPotential(score, level) {
      const base = {
        'Junior': 0.8,
        'Intermédiaire': 0.6,
        'Confirmé': 0.4,
        'Sénior': 0.3,
        'Expert': 0.2
      }[level] || 0.5;
  
      const scoreBonus = score > 80 ? 0.2 : 0;
      return Math.round((base + scoreBonus) * 100);
    }
  
    calculateAverageMatch(matches) {
      if (!matches || matches.length === 0) return 0;
      const total = matches.reduce((sum, m) => sum + (m.score || 0), 0);
      return Math.round(total / matches.length);
    }
  
    calculateSkillScore(skills) {
      const experts = skills.filter(s => s.level === 'expert' || s.confidence > 0.8).length;
      const total = skills.length;
      return total > 0 ? Math.round((experts / total) * 100) : 0;
    }
  
    calculateExperienceScore(experience) {
      const years = experience?.years || 0;
      if (years >= 8) return 100;
      if (years >= 5) return 80;
      if (years >= 3) return 60;
      if (years >= 1) return 40;
      return 20;
    }
  
    getGrowthTimeline(level) {
      const timelines = {
        'Junior': 'Progression rapide avec les bonnes opportunités',
        'Intermédiaire': 'Progression régulière',
        'Confirmé': 'Évolution stable',
        'Sénior': 'Évolution lente mais constante'
      };
      return timelines[level] || 'Progression modérée';
    }
  
    getRequirementsForLevel(title) {
      if (title.includes('Lead') || title.includes('Architecte')) {
        return ['Leadership', 'Vision stratégique', 'Mentorat'];
      }
      if (title.includes('Senior')) {
        return ['Expertise technique', 'Autonomie', 'Gestion de projet'];
      }
      return ['Compétences techniques', 'Esprit d\'équipe', 'Adaptabilité'];
    }
  
    calculateMarketDemand(skills) {
      const demandMap = {
        'React': 95,
        'Node.js': 90,
        'TypeScript': 85,
        'Python': 90,
        'Docker': 80,
        'AWS': 85,
        'Git': 75,
        'JavaScript': 70
      };
  
      let total = 0;
      let count = 0;
      for (const skill of skills) {
        const demand = demandMap[skill] || 50;
        total += demand;
        count++;
      }
      return count > 0 ? Math.round(total / count) : 70;
    }
  
    getCurrentTrends() {
      return [
        'Télétravail',
        'IA et Machine Learning',
        'Cloud (AWS, Azure, GCP)',
        'DevOps',
        'Cybersécurité',
        'Agilité'
      ];
    }
  
    getRecommendedSkills(currentSkills) {
      const allSkills = ['React', 'Node.js', 'TypeScript', 'Python', 'Docker', 'AWS', 'Kubernetes', 'GraphQL'];
      return allSkills.filter(s => !currentSkills.includes(s)).slice(0, 3);
    }
  }
  
  module.exports = new CareerDashboard();