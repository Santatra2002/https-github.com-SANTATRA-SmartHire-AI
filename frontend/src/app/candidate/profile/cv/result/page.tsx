// src/app/candidate/profile/cv/result/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../../../lib/auth';
import toast from 'react-hot-toast';

export default function CVResultPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());

    // Récupérer les résultats de l'analyse
    const storedResult = localStorage.getItem('cvAnalysis');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      toast.error('Aucune analyse trouvée');
      router.push('/candidate/profile/cv');
    }
    setLoading(false);
  }, [router]);

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09]">
        <div className="text-center">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-gray-400">Aucun résultat disponible</p>
          <button
            onClick={() => router.push('/candidate/profile/cv')}
            className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition"
          >
            📄 Déposer mon CV
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
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6">
          <h2 className="text-2xl font-bold mb-6">📊 Résultat de l'analyse</h2>

          {/* Score */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Score du CV</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                {result.score}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 mt-2">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_20px_rgba(20,184,166,0.4)]"
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-500">Nom</p>
              <p className="text-lg font-semibold text-white">{result.name || 'Non trouvé'}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-semibold text-white">{result.email || 'Non trouvé'}</p>
            </div>
          </div>

          {/* Compétences */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">🔍 Compétences détectées</p>
            <div className="flex flex-wrap gap-2">
              {result.skills?.map((skill: string, i: number) => (
                <span key={i} className="bg-teal-500/20 text-teal-300 border border-teal-400/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {skill}
                </span>
              ))}
              {(!result.skills || result.skills.length === 0) && (
                <span className="text-gray-500 text-sm">Aucune compétence détectée</span>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-400/20 rounded-lg p-4 mb-6">
            <p className="font-bold text-amber-300">💡 Suggestions d'amélioration</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {result.improvements?.map((suggestion: string, i: number) => (
                <li key={i} className="text-gray-300 text-sm">{suggestion}</li>
              ))}
              {(!result.improvements || result.improvements.length === 0) && (
                <li className="text-gray-400 text-sm">✅ Votre CV est bien structuré !</li>
              )}
            </ul>
          </div>

          {/* Points forts */}
          {result.strengths && result.strengths.length > 0 && (
            <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-400/20 rounded-lg p-4 mb-6">
              <p className="font-bold text-emerald-300">⭐ Points forts</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {result.strengths?.map((strength: string, i: number) => (
                  <li key={i} className="text-gray-300 text-sm">{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => router.push('/candidate/profile/cv')}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition"
            >
              📄 Télécharger un nouveau CV
            </button>
            <button
              onClick={() => router.push('/candidate/dashboard')}
              className="bg-white/5 border border-white/10 text-gray-300 px-6 py-2 rounded-lg hover:bg-white/10 transition"
            >
              🏠 Retour au dashboard
            </button>
            <button
              onClick={() => {
                // Télécharger les résultats en JSON
                const dataStr = JSON.stringify(result, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `cv_analysis_${new Date().toISOString().slice(0,10)}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
              className="bg-white/5 border border-white/10 text-gray-300 px-6 py-2 rounded-lg hover:bg-white/10 transition"
            >
              📥 Exporter l'analyse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}