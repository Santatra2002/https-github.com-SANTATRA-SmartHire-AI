// src/app/recruiter/jobs/[id]/candidates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '../../../../../lib/auth';
import api from '../../../../../lib/api';
import toast from 'react-hot-toast';

export default function JobCandidatesPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  const [user, setUser] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    fetchJobAndCandidates();
  }, [router, jobId]);

  const fetchJobAndCandidates = async () => {
    setLoading(true);
    try {
      // 1. Récupérer les infos de l'offre
      const jobResponse = await api.get(`/api/jobs/${jobId}`);
      if (jobResponse.data.success) {
        setJob(jobResponse.data.job);
        setJobTitle(jobResponse.data.job.title);
      }

      // 2. Récupérer les candidats compatibles
      try {
        const candidatesResponse = await api.get(`/api/matching/recruiter/job/${jobId}/candidates`);
        if (candidatesResponse.data.success) {
          setCandidates(candidatesResponse.data.matches || []);
        }
      } catch (candidateError: any) {
        // Si l'erreur est 404 ou "no candidates", ce n'est pas grave
        if (candidateError.response?.status !== 404) {
          console.error('Erreur candidats:', candidateError);
        }
        setCandidates([]);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      if (error.response?.status === 404) {
        toast.error('Offre non trouvée');
        router.push('/recruiter/dashboard');
      } else {
        toast.error('Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

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

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">
          👥 Candidats compatibles - {jobTitle || 'Offre'}
        </h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-400">Chargement des candidats...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-12 text-center">
            <p className="text-6xl mb-4">👥</p>
            <p className="text-gray-300 text-lg">Aucun candidat compatible</p>
            <p className="text-gray-500 text-sm">
              Les candidats apparaîtront ici après avoir postulé à cette offre
            </p>
            <button
              onClick={() => router.push('/recruiter/dashboard')}
              className="mt-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.8)] hover:scale-[1.03]"
            >
              ← Retour au dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div key={index} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-100">
                      {candidate.candidate?.user?.name || 'Candidat'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {candidate.candidate?.user?.email || 'Email non disponible'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {candidate.matchedSkills?.slice(0, 5).map((skill: string, i: number) => (
                        <span key={i} className="bg-green-500/10 text-green-300 border border-green-400/20 px-2 py-1 rounded-full text-sm backdrop-blur-sm">
                          ✅ {skill}
                        </span>
                      ))}
                      {candidate.missingSkills?.slice(0, 3).map((skill: string, i: number) => (
                        <span key={i} className="bg-red-500/10 text-red-300 border border-red-400/20 px-2 py-1 rounded-full text-sm backdrop-blur-sm">
                          ❌ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-center ml-4">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{candidate.score || 0}%</div>
                    <p className="text-sm text-gray-500">Compatibilité</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}