// src/app/recruiter/company/view/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../../lib/auth';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';
import { Edit3, Eye, Share2, Printer, MapPin, Phone, Mail, Globe, Building2, Users,
    Calendar, Link as LinkIcon, User } from 'lucide-react';

export default function ViewCompanyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    const userData = auth.getUser();
    if (userData.role !== 'RECRUTEUR') {
      router.push('/candidate/dashboard');
      return;
    }
    setUser(userData);
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        setProfile(response.data.user.profile || {});
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#05050a] text-gray-300">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const p = profile || {};
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || user.name;

  return (
    <div className="min-h-screen relative bg-[#05050a] text-gray-100 overflow-hidden">
      {/* Fond dégradé + halos lumineux */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#12081c] via-[#05050a] to-black" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">🚀 SmartHire AI</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/recruiter/company')}
              className="text-purple-400 hover:text-purple-300 transition flex items-center gap-2 text-sm"
            >
              <Edit3 className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={() => router.push('/recruiter/dashboard')}
              className="text-gray-300 hover:text-white transition"
            >
              ← Retour
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* En-tête avec photo */}
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 p-6 border-b border-white/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-5xl font-bold overflow-hidden flex-shrink-0 ring-4 ring-purple-500/20">
                {p.photo ? (
                  <img src={p.photo} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{fullName}</h2>
                <p className="text-purple-300">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                    🏢 Recruteur
                  </span>
                  {p.location && (
                    <span className="bg-white/5 text-white/60 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {p.location}
                    </span>
                  )}
                  {p.phone && (
                    <span className="bg-white/5 text-white/60 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {p.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {p.bio && (
            <div className="p-6 border-b border-white/10">
              <h3 className="text-sm font-medium text-white/40 mb-2">📝 À propos</h3>
              <p className="text-white/80 leading-relaxed">{p.bio}</p>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Liens sociaux */}
            {(p.linkedin || p.github) && (
              <div>
                <h3 className="text-sm font-medium text-white/40 mb-3">🔗 Liens professionnels</h3>
                <div className="flex flex-wrap gap-3">
                  {p.linkedin && (
                    <a href={p.linkedin} target="_blank" rel="noopener noreferrer" 
                       className="bg-[#0077B5]/20 text-[#0077B5] px-4 py-2 rounded-lg hover:bg-[#0077B5]/30 transition flex items-center gap-2 text-sm">
                      <LinkIcon className="w-4 h-4" />
                     LinkedIn
                    </a>
                  )}
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" 
                       className="bg-white/10 text-white/80 px-4 py-2 rounded-lg hover:bg-white/20 transition flex items-center gap-2 text-sm">
                      <LinkIcon className="w-4 h-4" />
                       GitHub
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Entreprise */}
            {p.companyName && (
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm font-medium text-white/40 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Entreprise
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
                    {p.logo ? (
                      <img src={p.logo} alt={p.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{p.companyName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-bold text-white break-words">{p.companyName}</h4>
                    {p.description && (
                      <p className="text-sm text-white/60 mt-1 leading-relaxed break-words whitespace-pre-wrap">{p.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noopener noreferrer" 
                           className="text-xs text-purple-400 hover:text-purple-300 transition flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {p.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                      {p.companyLocation && (
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {p.companyLocation}
                        </span>
                      )}
                      {p.industry && (
                        <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
                          {p.industry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Détails entreprise */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {p.size && (
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <Users className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-xs text-white/40">Taille</p>
                      <p className="text-sm text-white font-medium">{p.size}</p>
                    </div>
                  )}
                  {p.foundedYear && (
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <Calendar className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-xs text-white/40">Création</p>
                      <p className="text-sm text-white font-medium">{p.foundedYear}</p>
                    </div>
                  )}
                  {p.contactEmail && (
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <Mail className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-xs text-white/40">Email</p>
                      <p className="text-sm text-white font-medium truncate">{p.contactEmail}</p>
                    </div>
                  )}
                  {p.contactPhone && (
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <Phone className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-xs text-white/40">Téléphone</p>
                      <p className="text-sm text-white font-medium">{p.contactPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white/5 p-4 border-t border-white/10 text-center">
            <p className="text-xs text-white/20">
              Profil mis à jour le {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-4">

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success('🔗 Lien copié !');
            }}
            className="bg-white/5 border border-white/10 text-white/60 px-6 py-2.5 rounded-lg hover:bg-white/10 transition flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
          <button
            onClick={() => window.print()}
            className="bg-white/5 border border-white/10 text-white/60 px-6 py-2.5 rounded-lg hover:bg-white/10 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}
