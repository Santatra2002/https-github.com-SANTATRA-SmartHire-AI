// src/app/recruiter/candidates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Search, Filter, User, Briefcase, Star, Mail, Phone, MapPin, Award } from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  skills: string[];
  experience?: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  status?: string;
  profile?: {
    photo?: string;
    description?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function RecruiterCandidatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    const userData = auth.getUser();
    setUser(userData);
    fetchJobs();
  }, [router]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      if (response.data.success) {
        setJobs(response.data.jobs || []);
        if (response.data.jobs.length > 0) {
          setSelectedJobId(String(response.data.jobs[0].id));
        }
      }
    } catch (error) {
      console.error('Erreur chargement offres:', error);
      toast.error('Erreur lors du chargement des offres');
    }
  };

  const fetchCandidates = async () => {
    if (!selectedJobId) {
      toast.error('Veuillez sélectionner une offre');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/api/matching/recruiter/job/${selectedJobId}/candidates`);
      if (response.data.success) {
        setCandidates(response.data.matches || []);
      } else {
        toast.error('Erreur lors du chargement des candidats');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      fetchCandidates();
    }
  }, [selectedJobId]);

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#05050a] text-gray-300">
        Chargement...
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
          <button
            onClick={() => router.push('/recruiter/dashboard')}
            className="text-gray-300 hover:text-white transition"
          >
            ← Retour
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* En-tête */}
        <div className="flex items-center gap-3 mb-6">
          <User className="w-8 h-8 text-violet-400" />
          <h1 className="text-3xl font-bold text-gray-100">👥 Candidats compatibles</h1>
        </div>

        {/* Filtres */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Offre</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-gray-100 outline-none transition-all duration-300 focus:border-violet-400/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.35)]"
              >
                {jobs.map((job) => (
                  <option className="bg-[#0b0b14]" key={job.id} value={job.id}>
                    {job.title} - {job.location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Recherche</label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom ou compétence..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-gray-100 placeholder-gray-500 outline-none transition-all duration-300 focus:border-violet-400/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.35)]"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchCandidates}
                className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-2 rounded-lg font-medium w-full transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.8)] hover:scale-[1.01]"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-spin">⏳</div>
              <p className="text-gray-400">Chargement des candidats...</p>
            </div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-12 text-center">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aucun candidat trouvé</p>
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'Essayez de modifier votre recherche' : 'Aucun candidat ne correspond à cette offre'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                        {candidate.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-100">{candidate.name}</h3>
                        <p className="text-gray-400">{candidate.email}</p>
                      </div>
                    </div>

                    {candidate.location && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{candidate.location}</span>
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {candidate.matchedSkills?.slice(0, 5).map((skill, i) => (
                          <span key={i} className="bg-green-500/10 text-green-300 border border-green-400/20 px-2 py-1 rounded-full text-sm backdrop-blur-sm">
                            ✅ {skill}
                          </span>
                        ))}
                        {candidate.missingSkills?.slice(0, 3).map((skill, i) => (
                          <span key={i} className="bg-red-500/10 text-red-300 border border-red-400/20 px-2 py-1 rounded-full text-sm backdrop-blur-sm">
                            ❌ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-center ml-4">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    {candidate.matchScore}%</div>
                    <p className="text-sm text-gray-500">Compatibilité</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">
                  <button
                    onClick={() => router.push(`/recruiter/candidates/${candidate.id}`)}
                    className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.7)] hover:scale-[1.03]"
                  >
                    👤 Voir le profil
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`📧 Message envoyé à ${candidate.name}`);
                    }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/10 hover:border-violet-400/30"
                  >
                    📧 Contacter
                  </button>
                  <button
                    className="bg-white/5 backdrop-blur-xl border border-violet-400/30 text-violet-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.15)] hover:bg-violet-500/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                  >
                    📊 Comparer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}