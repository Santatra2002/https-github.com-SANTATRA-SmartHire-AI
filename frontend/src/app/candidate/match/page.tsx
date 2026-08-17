// src/app/candidate/match/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Heart, MapPin, Briefcase, Sparkles } from 'lucide-react';

export default function MatchPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    fetchMatches();
  }, [router]);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/matching/candidate/recommendations');
      if (response.data.success) {
        setMatches(response.data.matches || []);
      } else {
        setError(response.data.message || 'Erreur');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur de chargement');
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
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#040a09] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-8 text-center">
            <p className="text-red-300">❌ {error}</p>
            <button
              onClick={() => router.push('/candidate/dashboard')}
              className="mt-4 bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition"
            >
              ← Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040a09] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-teal-400" />
          <h1 className="text-2xl font-bold text-white">🎯 Matching IA</h1>
          <span className="text-sm text-white/30">| Offres compatibles</span>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg">Aucune offre compatible</p>
            <p className="text-white/20 text-sm">Déposez votre CV pour recevoir des recommandations</p>
            <button
              onClick={() => router.push('/candidate/profile/cv')}
              className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2 rounded-lg"
            >
              📄 Déposer mon CV
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{match.job?.title || 'Offre'}</h3>
                    <p className="text-white/40">{match.job?.company?.user?.name || 'Entreprise'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-white/30" />
                      <span className="text-sm text-white/30">{match.job?.location || 'Localisation'}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                      <span className="text-sm text-white/30">{match.job?.contract || 'CDI'}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-400">{match.score || 0}%</div>
                    <p className="text-sm text-white/30">Compatibilité</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {match.matchedSkills?.slice(0, 5).map((skill: string, i: number) => (
                    <span key={i} className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-sm">
                      ✅ {skill}
                    </span>
                  ))}
                  {match.missingSkills?.slice(0, 3).map((skill: string, i: number) => (
                    <span key={i} className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-sm">
                      ❌ {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => router.push(`/candidate/match/${match.job?.id}`)}
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    📊 Voir le détail
                  </button>
                  <button
                    onClick={() => router.push(`/candidate/apply/${match.job?.id}`)}
                    className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition"
                  >
                    📝 Postuler
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