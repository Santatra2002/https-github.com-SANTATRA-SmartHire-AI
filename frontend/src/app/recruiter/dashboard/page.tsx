// src/app/recruiter/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import { getJobs, getMyApplications } from '../../../lib/api';
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
  status: string;
  createdAt: string;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    const userData = auth.getUser();
    setUser(userData);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsData = await getJobs();
      if (jobsData.success) {
        setJobs(jobsData.jobs || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
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
      <div className="flex justify-center items-center min-h-screen bg-[#05050a]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#05050a] text-gray-100 overflow-hidden">
      {/* Fond dégradé + halos lumineux */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b14] via-[#05050a] to-black" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">🚀 SmartHire AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">👋 {user.name}</span>
            <span className="text-sm bg-purple-500/10 text-purple-300 border border-purple-400/20 px-3 py-1 rounded-full backdrop-blur-sm">Recruteur</span>
            <button
              onClick={() => router.push('/recruiter/company')}
              className="text-gray-300 hover:text-white transition"
            >
              🏢 Entreprise
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
        {/* Bannière */}
        <div className="relative rounded-2xl p-6 text-white mb-8 overflow-hidden backdrop-blur-xl bg-gradient-to-r from-purple-500/30 to-pink-600/30 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <h2 className="text-2xl font-bold">Bonjour {user.name} !</h2>
          <p className="mt-2 text-purple-100">
            🏢 Gérez vos offres et trouvez les meilleurs talents
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
            <p className="text-sm text-gray-400">Offres publiées</p>
            <p className="text-3xl font-bold text-blue-400">{jobs.filter(j => j.status === 'PUBLISHED').length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
            <p className="text-sm text-gray-400">Candidatures reçues</p>
            <p className="text-3xl font-bold text-green-400">0</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
            <p className="text-sm text-gray-400">Taux de matching</p>
            <p className="text-3xl font-bold text-purple-400">87%</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
            <p className="text-sm text-gray-400">Meilleurs profils</p>
            <p className="text-3xl font-bold text-orange-400">95%</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => router.push('/recruiter/jobs/create')}
            className="relative bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.8)] hover:scale-[1.03] border border-white/10"
          >
            📝 Publier une offre
          </button>
          <button
            onClick={() => router.push('/recruiter/candidates')}
            className="relative bg-white/5 backdrop-blur-xl text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 border border-violet-400/30 shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:bg-white/10 hover:border-violet-400/60 hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-[1.03]"
          >
            👥 Voir les candidats
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
              activeTab === 'jobs'
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 border-white/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 backdrop-blur-xl border-white/10 text-gray-300 hover:bg-white/10 hover:border-violet-400/30'
            }`}
          >
            📋 Mes offres
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
              activeTab === 'candidates'
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 border-white/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 backdrop-blur-xl border-white/10 text-gray-300 hover:bg-white/10 hover:border-violet-400/30'
            }`}
          >
            👥 Candidats compatibles
          </button>
        </div>

        {/* Liste des offres */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-12 text-center">
                <p className="text-6xl mb-4">📭</p>
                <p className="text-gray-400 text-lg">Vous n'avez pas encore publié d'offres</p>
                <button
                  onClick={() => router.push('/recruiter/jobs/create')}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.8)] hover:scale-[1.03]"
                >
                  📝 Publier une offre
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-100">{job.title}</h3>
                      <p className="text-gray-400">{job.location} • {job.contract}</p>
                      <p className="text-gray-500 text-sm">{job.salary}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm border backdrop-blur-sm ${
                        job.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-300 border-green-400/20' : 'bg-white/5 text-gray-300 border-white/10'
                      }`}>
                        {job.status === 'PUBLISHED' ? '✅ Publiée' : '📦 Archivée'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {job.skills?.split(',').map((skill, i) => (
                      <span key={i} className="bg-blue-500/10 text-blue-300 border border-blue-400/20 px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => router.push(`/recruiter/jobs/${job.id}/applications`)}
                      className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.7)] hover:scale-[1.03]"
                    >
                      📊 Voir les candidatures
                    </button>
                    <button
                      onClick={() => router.push(`/recruiter/jobs/${job.id}/edit`)}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:border-violet-400/30"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => router.push(`/recruiter/jobs/${job.id}/candidates`)}
                      className="bg-white/5 backdrop-blur-xl border border-violet-400/30 text-violet-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.15)] hover:bg-violet-500/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                    >
                      👥 Candidats compatibles
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6">
            <div className="text-center py-8">
              <p className="text-6xl mb-4">👥</p>
              <p className="text-gray-400">Sélectionnez une offre pour voir les candidats compatibles</p>
              {jobs.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => router.push(`/recruiter/jobs/${job.id}/candidates`)}
                      className="bg-white/5 backdrop-blur-xl border border-violet-400/30 text-violet-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.15)] hover:bg-violet-500/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-[1.03]"
                    >
                      {job.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}