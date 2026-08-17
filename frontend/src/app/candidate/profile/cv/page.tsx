// src/app/candidate/profile/cv/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { auth } from '../../../../lib/auth';
import toast from 'react-hot-toast';

export default function UploadCV() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    
    // Vérifier si une analyse existe déjà
    const storedAnalysis = localStorage.getItem('cvAnalysis');
    if (storedAnalysis) {
      setAnalysisResult(JSON.parse(storedAnalysis));
    }
  }, [router]);

  // Gérer la sélection du fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('❌ Format non supporté. Utilisez PDF ou DOCX');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('❌ Le fichier dépasse 5MB');
        return;
      }
      
      setFile(selectedFile);
      setUploadSuccess(false);
      toast.success(`✅ Fichier sélectionné : ${selectedFile.name}`);
    }
  };

  // Gérer le téléchargement
  const handleUpload = async () => {
    if (!file) {
      toast.error('❌ Veuillez sélectionner un fichier');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await api.post('/api/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        // Afficher l'icône de succès
        setUploadSuccess(true);
        toast.success('✅ CV analysé avec succès !');
        
        // Sauvegarder les résultats
        setAnalysisResult(response.data.analysis);
        localStorage.setItem('cvAnalysis', JSON.stringify(response.data.analysis));
        
        // Rediriger après un court délai pour voir l'animation
        setTimeout(() => {
          router.push('/candidate/profile/cv/result');
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '❌ Erreur lors du téléchargement');
      setUploadSuccess(false);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09] text-gray-300">
        Chargement...
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
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">🚀 SmartHire AI</h1>
          <button
            onClick={() => router.push('/candidate/dashboard')}
            className="text-gray-300 hover:text-white transition"
          >
            ← Retour
          </button>
        </div>
      </nav>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6">
          <h2 className="text-2xl font-bold mb-6">📄 Déposer mon CV</h2>

          {/* ⭐ ANIMATION DE SUCCÈS */}
          {uploadSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center gap-4 animate-fade-in">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-emerald-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-emerald-300">✅ CV analysé avec succès !</p>
                <p className="text-sm text-emerald-400/70">Redirection vers les résultats...</p>
              </div>
            </div>
          )}

          {/* Zone de dépôt */}
          <label
            htmlFor="cv-input"
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
            className={`block cursor-pointer rounded-2xl p-12 text-center border-2 border-dashed backdrop-blur-xl transition-all duration-300 ${
              dragActive
                ? 'border-teal-400/70 bg-teal-500/10 shadow-[0_0_30px_rgba(20,184,166,0.3)]'
                : 'border-white/15 bg-white/5 hover:border-teal-400/40 hover:bg-white/10'
            }`}
          >
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-300 mb-2">Glissez votre CV ici ou cliquez pour sélectionner</p>
            <p className="text-sm text-gray-500">Formats acceptés : PDF, DOCX (max 5MB)</p>
            
            <input
              id="cv-input"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="mt-4 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-500/20 file:text-teal-300 hover:file:bg-teal-500/30 file:cursor-pointer file:transition"
            />
            
            {/* Affichage du fichier sélectionné */}
            {file && (
              <div className="mt-4 text-emerald-400 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </div>
            )}

            {/* Barre de progression */}
            {loading && (
              <div className="mt-4">
                <div className="w-full bg-white/10 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(20,184,166,0.6)]"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">{uploadProgress}%</p>
              </div>
            )}

            {/* Bouton Télécharger */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpload(); }}
              disabled={!file || loading}
              className="mt-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.5)] hover:shadow-[0_0_35px_rgba(20,184,166,0.8)] hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
            >
              {loading ? '⏳ Téléchargement...' : '📤 Télécharger'}
            </button>
          </label>

          {/* Informations supplémentaires */}
          <div className="mt-6 p-4 backdrop-blur-xl bg-teal-500/10 border border-teal-400/20 rounded-lg">
            <p className="text-sm text-teal-300">
              💡 Votre CV sera analysé par l'IA pour vous proposer les meilleures offres.
            </p>
          </div>
        </div>

        {/* Résultats de l'analyse (si déjà existante) */}
        {analysisResult && !loading && !uploadSuccess && (
          <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6">
            <h3 className="text-xl font-bold text-gray-100 mb-4">📊 Dernière analyse de votre CV</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="backdrop-blur-xl bg-teal-500/10 border border-teal-400/20 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Score du CV</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{analysisResult.score}%</p>
              </div>
              <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-400/20 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Compétences détectées</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysisResult.skills?.slice(0, 5).map((skill: string, i: number) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 px-2 py-1 rounded-full text-sm backdrop-blur-sm">
                      {skill}
                    </span>
                  ))}
                  {analysisResult.skills?.length > 5 && (
                    <span className="text-sm text-gray-500">+{analysisResult.skills.length - 5}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 backdrop-blur-xl bg-amber-500/10 border border-amber-400/20 rounded-lg p-4">
              <p className="font-bold text-amber-300">💡 Suggestions d'amélioration</p>
              <ul className="list-disc list-inside mt-2">
                {analysisResult.improvements?.map((suggestion: string, i: number) => (
                  <li key={i} className="text-sm text-gray-300">{suggestion}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => router.push('/candidate/profile/cv/result')}
              className="mt-4 bg-white/5 backdrop-blur-xl border border-cyan-400/30 text-cyan-300 px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.15)] hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              📊 Voir l'analyse complète
            </button>
          </div>
        )}
      </div>
    </div>
  );
}