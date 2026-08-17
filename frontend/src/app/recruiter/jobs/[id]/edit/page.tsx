// src/app/recruiter/jobs/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '../../../../../lib/auth';
import api from '../../../../../lib/api';
import toast from 'react-hot-toast';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contract: 'CDI',
    salary: '',
    skills: '',
    experience: 'Junior',
    status: 'PUBLISHED'
  });

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    fetchJob();
  }, [router, jobId]);

  const fetchJob = async () => {
    setFetching(true);
    try {
      const response = await api.get(`/api/jobs/${jobId}`);
      if (response.data.success) {
        const job = response.data.job;
        setFormData({
          title: job.title || '',
          description: job.description || '',
          location: job.location || '',
          contract: job.contract || 'CDI',
          salary: job.salary || '',
          skills: job.skills || '',
          experience: job.experience || 'Junior',
          status: job.status || 'PUBLISHED'
        });
      } else {
        toast.error('Offre non trouvée');
        router.push('/recruiter/dashboard');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
      router.push('/recruiter/dashboard');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put(`/api/jobs/${jobId}`, formData);
      if (response.data.success) {
        toast.success('✅ Offre mise à jour avec succès !');
        router.push('/recruiter/dashboard');
      } else {
        toast.error(response.data.message || 'Erreur');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;

    try {
      const response = await api.delete(`/api/jobs/${jobId}`);
      if (response.data.success) {
        toast.success('🗑️ Offre supprimée');
        router.push('/recruiter/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  if (!user || fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#05050a]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const inputClass = "mt-1 w-full px-4 py-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-gray-100 placeholder-gray-500 outline-none transition-all duration-300 focus:border-violet-400/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.35)]";
  const labelClass = "block text-sm font-medium text-gray-300";

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

      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6">
          <h2 className="text-2xl font-bold mb-6">✏️ Modifier l'offre</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Titre du poste</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={inputClass}
                placeholder="Développeur Full Stack"
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={5}
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={inputClass}
                placeholder="Description du poste..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Localisation</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className={inputClass}
                  placeholder="Paris, France"
                />
              </div>
              <div>
                <label className={labelClass}>Type de contrat</label>
                <select
                  value={formData.contract}
                  onChange={(e) => setFormData({...formData, contract: e.target.value})}
                  className={inputClass}
                >
                  <option className="bg-[#0b0b14]" value="CDI">CDI</option>
                  <option className="bg-[#0b0b14]" value="CDD">CDD</option>
                  <option className="bg-[#0b0b14]" value="Freelance">Freelance</option>
                  <option className="bg-[#0b0b14]" value="Stage">Stage</option>
                  <option className="bg-[#0b0b14]" value="Alternance">Alternance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Salaire</label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className={inputClass}
                  placeholder="45 000€ - 55 000€"
                />
              </div>
              <div>
                <label className={labelClass}>Niveau d'expérience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className={inputClass}
                >
                  <option className="bg-[#0b0b14]" value="Junior">Junior (0-2 ans)</option>
                  <option className="bg-[#0b0b14]" value="Confirmé">Confirmé (2-5 ans)</option>
                  <option className="bg-[#0b0b14]" value="Senior">Senior (5+ ans)</option>
                  <option className="bg-[#0b0b14]" value="Expert">Expert (8+ ans)</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Compétences recherchées</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className={inputClass}
                placeholder="React, Node.js, TypeScript, MongoDB"
              />
              <p className="text-sm text-gray-500 mt-1">Séparez par des virgules</p>
            </div>

            <div>
              <label className={labelClass}>Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className={inputClass}
              >
                <option className="bg-[#0b0b14]" value="PUBLISHED">✅ Publiée</option>
                <option className="bg-[#0b0b14]" value="ARCHIVED">📦 Archivée</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.8)] hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
              >
                {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/recruiter/dashboard')}
                className="bg-white/5 backdrop-blur-xl border border-white/10 text-gray-200 px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="ml-auto bg-white/5 backdrop-blur-xl border border-red-400/30 text-red-300 px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.15)] hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              >
                🗑️ Supprimer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}