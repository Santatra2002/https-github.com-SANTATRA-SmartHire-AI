// src/app/candidate/profile/result/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../../lib/auth';
import toast from 'react-hot-toast';

export default function CVResultPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());

    const storedResult = localStorage.getItem('cvAnalysis');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      toast.error('Aucune analyse trouvée');
      router.push('/candidate/profile/cv');
    }
  }, [router]);

  if (!user || !result) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white">🚀 SmartHire AI</h1>
            <button
              onClick={() => router.push('/candidate/dashboard')}
              className="text-white/60 hover:text-white"
            >
              ← Retour
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Résultat de l'analyse</h2>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Score du CV</span>
              <span className="text-3xl font-bold text-blue-400">{result.score}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 mt-2">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/40">Nom</p>
              <p className="text-white font-semibold">{result.name || 'Non trouvé'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/40">Email</p>
              <p className="text-white font-semibold">{result.email || 'Non trouvé'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/40">Compétences</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.skills?.map((skill: string, i: number) => (
                  <span key={i} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-bold text-yellow-400">💡 Suggestions d'amélioration</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {result.improvements?.map((suggestion: string, i: number) => (
                <li key={i} className="text-white/60">{suggestion}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push('/candidate/profile/cv')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition"
            >
              📄 Télécharger un nouveau CV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}