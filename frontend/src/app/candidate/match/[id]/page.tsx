// src/app/candidate/match/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '../../../../lib/auth';
import { getMatchScore, applyToJob } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { Share2, Heart, MapPin, Sparkles, Link2, CheckCircle } from 'lucide-react';

interface MatchData {
  candidate: {
    id: number;
    name: string;
    email: string;
    skills: string[];
  };
  job: {
    id: number;
    title: string;
    description: string;
    location: string;
    contract: string;
    salary: string;
    requiredSkills: string[];
    experience: string;
  };
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: string;
}

export default function MatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  const [user, setUser] = useState<any>(null);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    fetchMatchData();
  }, [router, jobId]);

  const fetchMatchData = async () => {
    setLoading(true);
    try {
      const response = await getMatchScore(Number(jobId));
      if (response.success) {
        setMatch(response.match);
      } else {
        toast.error('Erreur lors du chargement du matching');
        router.push('/candidate/dashboard');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const response = await applyToJob(Number(jobId));
      if (response.success) {
        toast.success('✅ Candidature envoyée avec succès !');
        router.push('/candidate/applications');
      } else {
        toast.error(response.message || 'Erreur lors de la candidature');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setApplying(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    toast.success('🔗 Lien copié !');
    setTimeout(() => setCopied(false), 3000);
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShareMenuOpen(false);
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShareMenuOpen(false);
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvrez cette offre : ${match?.job.title}`)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShareMenuOpen(false);
  };

  const shareOnWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Découvrez cette offre : ${match?.job.title} - ${window.location.href}`)}`;
    window.open(url, '_blank');
    setShareMenuOpen(false);
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(`Offre d'emploi : ${match?.job.title}`);
    const body = encodeURIComponent(`Bonjour,\n\nJe souhaite partager cette offre d'emploi :\n\n${match?.job.title}\n${window.location.href}\n\nCordialement.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShareMenuOpen(false);
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

  if (!match) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09]">
        <div className="text-center">
          <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-gray-400">Aucune donnée disponible</p>
          <button
            onClick={() => router.push('/candidate/dashboard')}
            className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[#040a09] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Retour */}
        <button
          onClick={() => router.push('/candidate/match')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition mb-4"
        >
          ← Retour aux offres
        </button>

        {/* En-tête */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white">{match.job.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-gray-300">{match.job.location}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span className="text-gray-300">{match.job.contract}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span className="text-gray-300">{match.job.experience}</span>
          </div>
          <p className="text-teal-400 text-sm mt-1">{match.job.salary}</p>
        </div>

        {/* Score */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(match.score)}`}>
                  {match.score}%
                </div>
                <p className="text-sm text-gray-400">Compatibilité</p>
              </div>
              <div className="flex flex-col gap-2 border-l border-white/10 pl-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-300">
                    {match.matchedSkills.length} compétences correspondantes
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">
                    {match.missingSkills.length} compétences à développer
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleApply}
              disabled={applying}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-[0_0_35px_rgba(20,184,166,0.6)] hover:scale-[1.03] disabled:opacity-40"
            >
              {applying ? '⏳ Envoi...' : '📝 Postuler'}
            </button>
          </div>
        </div>

        {/* Compétences */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">🔍 Compétences</h3>
          <div className="mb-4">
            <p className="text-sm font-medium text-emerald-400 mb-2">
              ✅ Correspondances ({match.matchedSkills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {match.matchedSkills.map((skill, i) => (
                <span key={i} className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-red-400 mb-2">
              ❌ Manquantes ({match.missingSkills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {match.missingSkills.map((skill, i) => (
                <span key={i} className="bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">📋 Description</h3>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {match.job.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push('/candidate/match')}
            className="bg-white/5 border border-white/10 text-gray-300 px-6 py-2.5 rounded-lg hover:bg-white/10 transition"
          >
            🔍 Voir d'autres offres
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-2.5 rounded-lg font-medium hover:shadow-[0_0_35px_rgba(20,184,166,0.6)] hover:scale-[1.02] disabled:opacity-40"
          >
            {applying ? '⏳ Envoi...' : '📝 Postuler'}
          </button>

          {/* Partager */}
          <div className="relative">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className="bg-white/5 border border-white/10 text-gray-300 px-6 py-2.5 rounded-lg hover:bg-white/10 transition flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>

            {shareMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-[#1a1a2e] border border-white/10 rounded-2xl p-3 shadow-2xl w-64 z-50 backdrop-blur-xl">
                <div className="space-y-2">
                  <button onClick={shareOnFacebook} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition">
                    <span>📘</span> Facebook
                  </button>
                  <button onClick={shareOnTwitter} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition">
                    <span>🐦</span> Twitter / X
                  </button>
                  <button onClick={shareOnLinkedIn} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition">
                    <span>💼</span> LinkedIn
                  </button>
                  <button onClick={shareOnWhatsApp} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition">
                    <span>💬</span> WhatsApp
                  </button>
                  <button onClick={shareByEmail} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition">
                    <span>✉️</span> Email
                  </button>
                  <div className="border-t border-white/10 my-1"></div>
                  <button onClick={copyLink} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition">
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4 text-white/40" />}
                    <span>{copied ? 'Copié !' : 'Copier le lien'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}