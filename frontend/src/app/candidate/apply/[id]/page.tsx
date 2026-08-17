// src/app/candidate/apply/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '../../../../lib/auth';
import { getJobById, applyToJob } from '../../../../lib/api';
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
      email: string;
    };
  };
}

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    fetchJob();
  }, [router, jobId]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await getJobById(Number(jobId));
      if (response.success) {
        setJob(response.job);
      } else {
        toast.error('Offre non trouvée');
        router.push('/candidate/dashboard');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await applyToJob(Number(jobId), coverLetter);
      if (response.success) {
        toast.success('✅ Candidature envoyée avec succès !');
        router.push('/candidate/applications');
      } else {
        toast.error(response.message || 'Erreur lors de la candidature');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09]">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-gray-400">Offre non trouvée</p>
          <button
            onClick={() => router.push('/candidate/dashboard')}
            className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition"
          >
            ← Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#040a09] text-gray-100 overflow-hidden">
      {/* Fond dégradé + halos lumineux */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071412] via-[#040a09] to-black" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">🚀 SmartHire AI</h1>
          <button
            onClick={() => router.push('/candidate/dashboard')}
            className="text-gray-300 hover:text-white transition"
          >
            ← Retour
          </button>
        </div>
      </header>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Informations de l'offre */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 mb-6">
          <h2 className="text-2xl font-bold text-white">{job.title}</h2>
          <p className="text-gray-300">
            {job.company?.user?.name || 'Entreprise'} • {job.location}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {job.contract}
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {job.experience}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {job.salary}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-400">Compétences recherchées :</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {job.skills?.split(',').map((skill, i) => (
                <span key={i} className="bg-white/5 text-gray-300 border border-white/10 px-3 py-1 rounded-full text-sm">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Formulaire de candidature */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6">
          <h3 className="text-xl font-bold text-white mb-4">📝 Postuler</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lettre de motivation
              </label>
              <textarea
                rows={6}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                placeholder="Parlez-nous de vous, de votre expérience et de votre motivation pour ce poste..."
              />
              <p className="text-sm text-gray-500 mt-1">Optionnel mais recommandé</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_35px_rgba(20,184,166,0.6)] hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? '⏳ Envoi en cours...' : '📤 Postuler'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/candidate/dashboard')}
                className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        {/* Description de l'offre */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 mt-6">
          <h4 className="font-bold text-white mb-2">📋 Description du poste</h4>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        </div>
      </div>
    </div>
  );
}