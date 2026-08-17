// src/app/candidate/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Save, Camera } from 'lucide-react';

interface ProfileData {
  photo: string;
  description: string;
  skills: string;
  experiences: string;
  education: string;
  linkedin: string;
  github: string;
  portfolio: string;
  phone: string;
  location: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [profile, setProfile] = useState<ProfileData>({
    photo: '',
    description: '',
    skills: '',
    experiences: '',
    education: '',
    linkedin: '',
    github: '',
    portfolio: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    const userData = auth.getUser();
    setUser(userData);
    fetchProfile();
  }, [router, forceUpdate]);

  useEffect(() => {
    setPhotoError(false);
  }, [profile.photo]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/auth/me');
      console.log('📊 Profil reçu:', response.data);
      if (response.data.success) {
        const p = response.data.user.profile || {};
        setProfile({
          photo: p.photo || '',
          description: p.description || '',
          skills: p.skills || '',
          experiences: p.experiences || '',
          education: p.education || '',
          linkedin: p.linkedin || '',
          github: p.github || '',
          portfolio: p.portfolio || '',
          phone: p.phone || '',
          location: p.location || ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/api/auth/profile', profile);
      if (response.data.success) {
        toast.success('✅ Profil mis à jour avec succès !');
        router.push('/candidate/profile/view');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('❌ Aucun fichier sélectionné');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('❌ Veuillez sélectionner une image');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ L\'image ne doit pas dépasser 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.post('/api/auth/upload-photo', formData);

      if (response.data.success) {
        toast.success('✅ Photo mise à jour !');
        setProfile(prev => ({ ...prev, photo: response.data.photoUrl }));
        await fetchProfile();
        setForceUpdate(prev => prev + 1);
      } else {
        toast.error(response.data.message || 'Erreur lors de l\'upload');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  return (
    <div className="min-h-screen bg-[#040a09] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-8 h-8 text-teal-400" />
          <h1 className="text-2xl font-bold text-white">📝 Mon Profil</h1>
          <span className="text-sm text-white/30">| Gérez vos informations</span>
        </div>

        {/* Photo de profil */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {profile.photo && !photoError ? (
                  <img 
                    src={profile.photo} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                    onError={() => setPhotoError(true)}
                    onLoad={() => setPhotoError(false)}
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 p-1.5 bg-teal-500 rounded-full hover:bg-teal-600 transition disabled:opacity-50"
                title="Changer la photo"
              >
                {uploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
              <span className="text-sm bg-teal-500/20 text-teal-300 px-3 py-0.5 rounded-full mt-1 inline-block">
                {user.role === 'CANDIDAT' ? '🔍 Candidat' : '🏢 Recruteur'}
              </span>
              {uploadingPhoto && (
                <p className="text-xs text-teal-400 mt-1">📤 Upload en cours...</p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={profile.description}
                onChange={(e) => setProfile({...profile, description: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
                placeholder="Parlez de vous..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Compétences</label>
              <input
                type="text"
                value={profile.skills}
                onChange={(e) => setProfile({...profile, skills: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
                placeholder="React, Node.js, TypeScript..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Localisation</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
                placeholder="Paris, France"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Téléphone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
                placeholder="06 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">LinkedIn</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg">💼</span>
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">GitHub</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg">🐙</span>
                <input
                  type="url"
                  value={profile.github}
                  onChange={(e) => setProfile({...profile, github: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Portfolio</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg">🌐</span>
                <input
                  type="url"
                  value={profile.portfolio}
                  onChange={(e) => setProfile({...profile, portfolio: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="https://monportfolio.com"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Expériences</label>
              <textarea
                rows={3}
                value={profile.experiences}
                onChange={(e) => setProfile({...profile, experiences: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
                placeholder="Développeur Full Stack - Entreprise XYZ (2020-2024)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Formation</label>
              <textarea
                rows={2}
                value={profile.education}
                onChange={(e) => setProfile({...profile, education: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
                placeholder="Master en Informatique - Université XYZ"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-medium hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? '⏳ Enregistrement...' : '💾 Enregistrer et voir mon profil'}
            <Save className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}