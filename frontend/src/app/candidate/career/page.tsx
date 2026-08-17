// src/app/candidate/career/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, Award, Briefcase, Users, 
  Clock, Star, Target, Sparkles, 
  ArrowRight, BarChart3, PieChart,
  Calendar, CheckCircle, AlertCircle,
  Rocket, Brain, Shield, Zap
} from 'lucide-react';

interface CareerData {
  profile: {
    name: string;
    currentLevel: string;
    currentRole: string;
    yearsOfExperience: number;
    topSkills: string[];
    totalSkills: number;
    profileCompleteness: number;
  };
  skills: {
    technical: {
      mastered: any[];
      developing: any[];
      learning: any[];
      total: number;
    };
    soft: {
      detected: any[];
      count: number;
    };
  };
  predictions: {
    interviewSuccess: { score: number; level: string };
    careerGrowth: { potential: string; estimatedTimeline: string };
    estimatedSalary: { min: number; max: number; median: number };
    nextRole: { title: string; timeline: string; requirements: string[] };
  };
  stats: {
    overallScore: number;
    completeness: number;
    matchCount: number;
    averageMatchScore: number;
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
    action: string;
  }>;
  timeline: {
    current: { title: string; level: string };
    next: { title: string; timeline: string; requirements: string[] } | null;
    future: Array<{ title: string; timeline: string; requirements: string[] }>;
  };
}

export default function CareerPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    fetchCareerData();
  }, [router]);

  const fetchCareerData = async () => {
    setLoading(true);
    try {
      // Simuler des données (à connecter avec le backend)
      setData({
        profile: {
          name: user?.name || 'Candidat',
          currentLevel: 'Intermédiaire',
          currentRole: 'Développeur Full Stack',
          yearsOfExperience: 3,
          topSkills: ['React', 'Node.js', 'TypeScript', 'Python'],
          totalSkills: 12,
          profileCompleteness: 75
        },
        skills: {
          technical: {
            mastered: [{ name: 'React' }, { name: 'Node.js' }],
            developing: [{ name: 'TypeScript' }, { name: 'Python' }],
            learning: [{ name: 'Docker' }, { name: 'AWS' }],
            total: 12
          },
          soft: {
            detected: [{ name: 'Communication' }, { name: 'Leadership' }],
            count: 2
          }
        },
        predictions: {
          interviewSuccess: { score: 78, level: 'Élevée' },
          careerGrowth: { potential: 'Rapide', estimatedTimeline: '2-3 ans' },
          estimatedSalary: { min: 42000, max: 52000, median: 47000 },
          nextRole: { 
            title: 'Lead Developer', 
            timeline: '2-3 ans',
            requirements: ['Leadership', 'Architecture', 'Mentorat']
          }
        },
        stats: {
          overallScore: 78,
          completeness: 75,
          matchCount: 5,
          averageMatchScore: 72
        },
        recommendations: [
          {
            type: 'skills',
            title: 'Compétences à développer',
            description: 'Docker et AWS sont très demandés dans votre secteur',
            priority: 'Haute',
            action: 'Suivez une formation sur les technologies cloud'
          },
          {
            type: 'cv',
            title: 'Améliorer votre CV',
            description: 'Ajoutez des réalisations quantifiables',
            priority: 'Moyenne',
            action: 'Ajoutez des métriques à vos expériences'
          }
        ],
        timeline: {
          current: { title: 'Développeur Full Stack', level: 'Intermédiaire' },
          next: { 
            title: 'Lead Developer', 
            timeline: '2-3 ans',
            requirements: ['Leadership', 'Architecture']
          },
          future: [
            { title: 'Tech Lead', timeline: '4-5 ans', requirements: ['Vision stratégique'] },
            { title: 'Architecte Solutions', timeline: '6-8 ans', requirements: ['Expertise technique'] }
          ]
        }
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de votre carrière...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09]">
        <div className="text-center">
          <Rocket className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-gray-400">Aucune donnée disponible</p>
          <button
            onClick={() => router.push('/candidate/profile/cv')}
            className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2 rounded-lg"
          >
            📄 Déposer votre CV
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-teal-400" />
        <h1 className="text-2xl font-bold text-white">📈 Tableau de bord carrière</h1>
        <span className="text-sm text-white/30">| Analyse et prédictions</span>
      </div>

      {/* Profil */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">👤 {data.profile.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-sm text-white/50">{data.profile.currentRole}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span className="text-sm bg-teal-500/20 text-teal-300 px-3 py-0.5 rounded-full">
                {data.profile.currentLevel}
              </span>
              <span className="text-sm text-white/30">
                {data.profile.yearsOfExperience} ans d'expérience
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-400">{data.stats.overallScore}%</p>
              <p className="text-xs text-white/30">Score global</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{data.profile.totalSkills}</p>
              <p className="text-xs text-white/30">Compétences</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{data.stats.matchCount}</p>
              <p className="text-xs text-white/30">Offres matching</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prédictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white">Prédiction entretien</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-teal-400">{data.predictions.interviewSuccess.score}%</div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              data.predictions.interviewSuccess.level === 'Élevée' 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-yellow-500/20 text-yellow-300'
            }`}>
              {data.predictions.interviewSuccess.level}
            </span>
          </div>
          <p className="text-sm text-white/30 mt-2">Probabilité de réussite en entretien</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white">Prochain rôle</h3>
          </div>
          <p className="text-lg font-bold text-white">{data.predictions.nextRole.title}</p>
          <p className="text-sm text-white/30">Dans {data.predictions.nextRole.timeline}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {data.predictions.nextRole.requirements.map((req, i) => (
              <span key={i} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
                {req}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Salaire */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bold text-white">Salaire estimé</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-white/30">Min</p>
            <p className="text-xl font-bold text-white/70">{data.predictions.estimatedSalary.min}€</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-sm text-white/30">Médian</p>
            <p className="text-2xl font-bold text-teal-400">{data.predictions.estimatedSalary.median}€</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/30">Max</p>
            <p className="text-xl font-bold text-white/70">{data.predictions.estimatedSalary.max}€</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white">Évolution de carrière</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <div>
              <p className="font-medium text-white">{data.timeline.current.title}</p>
              <p className="text-sm text-white/30">{data.timeline.current.level} • Actuel</p>
            </div>
          </div>
          {data.timeline.next && (
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
              <div>
                <p className="font-medium text-white">{data.timeline.next.title}</p>
                <p className="text-sm text-white/30">{data.timeline.next.timeline}</p>
              </div>
            </div>
          )}
          {data.timeline.future.map((step, i) => (
            <div key={i} className="flex items-center gap-4 opacity-60">
              <div className="w-3 h-3 bg-white/20 rounded-full"></div>
              <div>
                <p className="font-medium text-white/60">{step.title}</p>
                <p className="text-sm text-white/20">{step.timeline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bold text-white">Recommandations</h3>
        </div>
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <div key={i} className={`p-4 rounded-xl border ${
              rec.priority === 'Haute' ? 'border-red-400/20 bg-red-500/5' :
              rec.priority === 'Moyenne' ? 'border-yellow-400/20 bg-yellow-500/5' :
              'border-gray-400/20 bg-white/5'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-white">{rec.title}</p>
                  <p className="text-sm text-white/40 mt-1">{rec.description}</p>
                  <p className="text-sm text-teal-400 mt-2">💡 {rec.action}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rec.priority === 'Haute' ? 'bg-red-500/20 text-red-300' :
                  rec.priority === 'Moyenne' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {rec.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => router.push('/candidate/profile/cv')}
          className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2.5 rounded-lg hover:shadow-2xl hover:shadow-teal-500/30 transition"
        >
          📄 Mettre à jour mon CV
        </button>
        <button
          onClick={() => router.push('/candidate/match')}
          className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-lg hover:bg-white/10 transition"
        >
          🎯 Voir les offres matching
        </button>
        <button
          onClick={() => router.push('/candidate/interview')}
          className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-lg hover:bg-white/10 transition"
        >
          💬 Simuler un entretien
        </button>
      </div>
    </div>
  );
}