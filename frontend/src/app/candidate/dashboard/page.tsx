// src/app/candidate/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import { getRecommendations, getMyApplications } from '../../../lib/api';
import toast from 'react-hot-toast';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  contract: string;
  salary: string;
  skills: string;
  experience: string;
  company?: {
    user: {
      name: string;
    };
  };
}

interface Recommendation {
  score: number;
  matchPercentage: string;
  matchedSkills: string[];
  missingSkills: string[];
  job: Job;
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    const userData = auth.getUser();
    setUser(userData);
    fetchData();

    // Récupérer l'analyse du CV depuis localStorage
    const storedAnalysis = localStorage.getItem('cvAnalysis');
    if (storedAnalysis) {
      setAnalysis(JSON.parse(storedAnalysis));
    }
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Récupérer les recommandations
      const recsData = await getRecommendations();
      if (recsData.success) {
        setRecommendations(recsData.matches || []);
      }

      // Récupérer les candidatures
      const appsData = await getMyApplications();
      if (appsData.success) {
        setApplications(appsData.applications || []);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    toast.success('Déconnexion réussie');
    router.push('/auth/login');
  };

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">🚀 SmartHire AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">👋 {user.name}</span>
            <span className="text-sm bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 px-3 py-1 rounded-full backdrop-blur-sm">Candidat</span>
            <button
              onClick={() => router.push('/candidate/profile')}
              className="text-gray-300 hover:text-white transition"
            >
              Profil
            </button>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Bannière de bienvenue */}
        <div className="relative rounded-2xl p-6 text-white mb-8 overflow-hidden backdrop-blur-xl bg-gradient-to-r from-teal-500/30 to-cyan-600/30 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <h2 className="text-2xl font-bold">Bonjour {user.name} !</h2>
          <p className="mt-2 text-teal-100">
            🔍 {recommendations.length > 0
              ? `Nous avons trouvé ${recommendations.length} offres qui correspondent à votre profil`
              : 'Nous cherchons les meilleures offres pour vous...'}
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
            <p className="text-sm text-gray-400">Offres recommandées</p>
            <p className="text-3xl font-bold text-teal-400">{recommendations.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
            <p className="text-sm text-gray-400">Candidatures</p>
            <p className="text-3xl font-bold text-emerald-400">{applications.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
            <p className="text-sm text-gray-400">Score moyen</p>
            <p className="text-3xl font-bold text-cyan-400">
              {recommendations.length > 0
                ? Math.round(recommendations.reduce((acc, r) => acc + r.score, 0) / recommendations.length) + '%'
                : '-'}
            </p>
            
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
            <p className="text-sm text-gray-400">Score CV</p>
            <p className="text-3xl font-bold text-amber-400">
              {analysis?.score ? `${analysis.score}%` : '-'}
            </p>
            {!analysis?.score && (
    <p className="text-xs text-gray-400 mt-1">Déposez votre CV pour l'analyser</p>
  )}
          </div>
        </div>

        {/* ⭐ Section Analyse de CV */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-100 text-lg">📄 Analyse de votre CV</h3>
              <p className="text-sm text-gray-400 mt-1">
                {analysis?.score ? `Score : ${analysis.score}%` : 'Déposez votre CV pour une analyse'}
              </p>
            </div>
            <button
              onClick={() => router.push('/candidate/profile/cv')}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.7)] hover:scale-[1.03]"
            >
              {analysis?.score ? '🔄 Mettre à jour' : '📤 Déposer mon CV'}
            </button>
          </div>

          {analysis?.score && (
            <div className="mt-4">
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    analysis.score >= 80 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' :
                    analysis.score >= 60 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]' :
                    'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]'
                  }`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>

              {/* Détails de l'analyse */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="backdrop-blur-xl bg-teal-500/10 border border-teal-400/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Compétences détectées</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.skills?.slice(0, 5).map((skill: string, i: number) => (
                      <span key={i} className="bg-teal-500/10 text-teal-300 border border-teal-400/20 px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
                        {skill}
                      </span>
                    ))}
                    {analysis.skills?.length > 5 && (
                      <span className="text-xs text-gray-500">+{analysis.skills.length - 5}</span>
                    )}
                  </div>
                </div>
                <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-400/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Suggestions</p>
                  <ul className="text-xs text-gray-300 list-disc list-inside mt-1">
                    {analysis.improvements?.slice(0, 2).map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                    {analysis.improvements?.length > 2 && (
                      <li className="text-gray-500">+{analysis.improvements.length - 2} suggestions</li>
                    )}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => router.push('/candidate/analysis')}
                className="mt-3 text-teal-400 text-sm hover:text-teal-300 hover:underline transition"
              >
                📊 Voir l'analyse complète →
              </button>
            </div>
          )}
        </div>

        {/* ⭐ NOUVEAU - Actions IA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push('/candidate/interview')}
            className="relative backdrop-blur-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-400/30 text-white p-6 rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:shadow-[0_0_35px_rgba(20,184,166,0.5)] hover:bg-white/10 transition-all duration-300 flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-lg font-bold">💬 Simuler un entretien</p>
              <p className="text-sm text-teal-200">Entraînez-vous avec l'IA</p>
            </div>
            <span className="text-2xl text-teal-300 group-hover:translate-x-1 transition">→</span>
          </button>

          <button
            onClick={() => router.push('/candidate/career')}
            className="relative backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-white p-6 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] hover:bg-white/10 transition-all duration-300 flex items-center justify-between group"
          >
            <div className="text-left">
              <p className="text-lg font-bold">📈 Dashboard carrière</p>
              <p className="text-sm text-cyan-200">Vos prédictions et recommandations</p>
            </div>
            <span className="text-2xl text-cyan-300 group-hover:translate-x-1 transition">→</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
              activeTab === 'recommendations'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 border-white/10 text-white shadow-[0_0_20px_rgba(20,184,166,0.5)]'
                : 'bg-white/5 backdrop-blur-xl border-white/10 text-gray-300 hover:bg-white/10 hover:border-teal-400/30'
            }`}
          >
            💡 Offres recommandées
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
              activeTab === 'applications'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 border-white/10 text-white shadow-[0_0_20px_rgba(20,184,166,0.5)]'
                : 'bg-white/5 backdrop-blur-xl border-white/10 text-gray-300 hover:bg-white/10 hover:border-teal-400/30'
            }`}
          >
            📊 Mes candidatures
          </button>
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-12 text-center">
                <p className="text-6xl mb-4">🔍</p>
                <p className="text-gray-300 text-lg">Aucune offre recommandée pour le moment</p>
                <p className="text-gray-500 text-sm">Déposez votre CV pour recevoir des recommandations personnalisées</p>
                <button
                  onClick={() => router.push('/candidate/profile/cv')}
                  className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.5)] hover:shadow-[0_0_35px_rgba(20,184,166,0.8)] hover:scale-[1.03]"
                >
                  📄 Déposer mon CV
                </button>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-100">{rec.job.title}</h3>
                      <p className="text-gray-400">
                        {rec.job.company?.user?.name || 'Entreprise'} • {rec.job.location}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-sm bg-white/5 border border-white/10 px-2 py-1 rounded-full text-gray-300 backdrop-blur-sm">{rec.job.contract}</span>
                        <span className="text-sm bg-white/5 border border-white/10 px-2 py-1 rounded-full text-gray-300 backdrop-blur-sm">{rec.job.experience}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{rec.score}%</div>
                      <p className="text-sm text-gray-500">Compatibilité</p>
                    </div>
                  </div>

                  {/* Compétences */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {rec.matchedSkills.map((skill, i) => (
                        <span key={i} className="bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 px-2 py-1 rounded-full text-sm backdrop-blur-sm">
                          ✅ {skill}
                        </span>
                      ))}
                      {rec.missingSkills.map((skill, i) => (
                        <span key={i} className="bg-red-500/10 text-red-300 border border-red-400/20 px-2 py-1 rounded-full text-sm backdrop-blur-sm">
                          ❌ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => router.push(`/candidate/match/${rec.job.id}`)}
                      className="bg-white/5 backdrop-blur-xl border border-cyan-400/30 text-cyan-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.15)] hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    >
                      📊 Voir le détail
                    </button>
                    <button
                      onClick={() => router.push(`/candidate/apply/${rec.job.id}`)}
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.7)] hover:scale-[1.03]"
                    >
                      📝 Postuler
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-6xl mb-4">📭</p>
                <p className="text-gray-400">Vous n'avez pas encore de candidatures</p>
                <p className="text-gray-500 text-sm">Consultez les offres recommandées pour postuler</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border-b border-white/10 pb-4 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-100">{app.job.title}</h4>
                        <p className="text-sm text-gray-400">{app.job.company?.user?.name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm border backdrop-blur-sm ${
                        app.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-400/20' :
                        app.status === 'REVIEWED' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400/20' :
                        app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20' :
                        app.status === 'REFUSED' ? 'bg-red-500/10 text-red-300 border-red-400/20' :
                        'bg-purple-500/10 text-purple-300 border-purple-400/20'
                      }`}>
                        {app.status === 'PENDING' ? 'En attente' :
                         app.status === 'REVIEWED' ? 'Consultée' :
                         app.status === 'ACCEPTED' ? 'Acceptée' :
                         app.status === 'REFUSED' ? 'Refusée' :
                         'Entretien'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
