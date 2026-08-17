// src/app/recruiter/company/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Camera, Eye, Save } from 'lucide-react';

export default function CompanyPage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [formData, setFormData] = useState({
    // Personnel
    photo: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: '',
    linkedin: '',
    github: '',

    // Entreprise
    companyName: '',
    logo: '',
    description: '',
    website: '',
    companyLocation: '',
    industry: '',
    size: '',
    foundedYear: 0,
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    const userData = auth.getUser();
    setUser(userData);
    fetchCompanyData();
  }, [router]);

  useEffect(() => {
    setPhotoError(false);
    setLogoError(false);
  }, [formData.photo, formData.logo]);

  const fetchCompanyData = async () => {
    try {
      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        const p = response.data.user.profile || {};
        setFormData({
          photo: p.photo || '',
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phone: p.phone || '',
          location: p.location || '',
          bio: p.bio || '',
          linkedin: p.linkedin || '',
          github: p.github || '',
          companyName: p.companyName || '',
          logo: p.logo || '',
          description: p.description || '',
          website: p.website || '',
          companyLocation: p.companyLocation || '',
          industry: p.industry || '',
          size: p.size || '',
          foundedYear: p.foundedYear || 0,
          contactEmail: p.contactEmail || '',
          contactPhone: p.contactPhone || ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement entreprise:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/api/recruiter/profile', formData);
      if (response.data.success) {
        toast.success('✅ Profil mis à jour avec succès !');
        router.push('/recruiter/company/view');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '❌ Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => photoInputRef.current?.click();
  const handleLogoClick = () => logoInputRef.current?.click();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('❌ Veuillez sélectionner une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploadingPhoto(true);
    const formDataUpload = new FormData();
    formDataUpload.append('photo', file);

    try {
      const response = await api.post('/api/recruiter/upload-photo', formDataUpload);
      if (response.data.success) {
        toast.success('✅ Photo mise à jour !');
        setFormData(prev => ({ ...prev, photo: response.data.photoUrl }));
        await fetchCompanyData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('❌ Veuillez sélectionner une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploadingLogo(true);
    const formDataUpload = new FormData();
    formDataUpload.append('logo', file);

    try {
      const response = await api.post('/api/recruiter/upload-logo', formDataUpload);
      if (response.data.success) {
        toast.success('✅ Logo mis à jour !');
        setFormData(prev => ({ ...prev, logo: response.data.logoUrl }));
        await fetchCompanyData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#05050a] text-gray-300">
        Chargement...
      </div>
    );
  }

  const inputClass = "mt-1 w-full px-4 py-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-gray-100 placeholder-gray-500 outline-none transition-all duration-300 focus:border-purple-400/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.35)]";
  const labelClass = "block text-sm font-medium text-gray-300";
  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ') || user.name || 'Recruteur';

  const industries = ['Tech', 'Finance', 'Santé', 'Éducation', 'Consulting', 'Marketing', 'E-commerce', 'Autre'];
  const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  return (
    <div className="min-h-screen relative bg-[#05050a] text-gray-100 overflow-hidden">
      {/* Fond dégradé + halos lumineux */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#12081c] via-[#05050a] to-black" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">🚀 SmartHire AI</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/recruiter/company/view')}
              className="text-gray-300 hover:text-white transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir mon profil
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
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6">
          <h2 className="text-2xl font-bold mb-6">👤 Mon Profil</h2>

          {/* SECTION PERSONNELLE */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white/70 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-400 rounded-full"></span>
              Informations personnelles
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden ring-4 ring-purple-500/20">
                  {formData.photo && !photoError ? (
                    <img
                      src={formData.photo.startsWith('http') ? formData.photo : `http://localhost:5000${formData.photo}`}
                      alt={fullName}
                      className="w-full h-full object-cover"
                      onError={() => setPhotoError(true)}
                      onLoad={() => setPhotoError(false)}
                    />
                  ) : (
                    <span>{fullName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button
                  onClick={handlePhotoClick}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{fullName}</h3>
                <p className="text-gray-400">{user.email}</p>
                <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-0.5 rounded-full mt-1 inline-block">
                  🏢 Recruteur
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Prénom</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={inputClass}
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={inputClass}
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className={labelClass}>📍 Localisation</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className={inputClass}
                  placeholder="Ville, Pays"
                />
              </div>
              <div>
                <label className={labelClass}>📱 Téléphone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={inputClass}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>📝 Biographie</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className={inputClass}
                  placeholder="Parlez de vous..."
                />
              </div>
              <div>
                <label className={labelClass}>💼 LinkedIn</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                  className={inputClass}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className={labelClass}>🐙 GitHub</label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({...formData, github: e.target.value})}
                  className={inputClass}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>

          {/* SECTION ENTREPRISE */}
          <div>
            <h3 className="text-lg font-semibold text-white/70 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-pink-400 rounded-full"></span>
              Informations de l'entreprise
            </h3>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-4 ring-purple-500/20">
                  {formData.logo && !logoError ? (
                    <img
                      src={formData.logo.startsWith('http') ? formData.logo : `http://localhost:5000${formData.logo}`}
                      alt={formData.companyName}
                      className="w-full h-full object-cover"
                      onError={() => setLogoError(true)}
                      onLoad={() => setLogoError(false)}
                    />
                  ) : (
                    <span>{formData.companyName?.charAt(0).toUpperCase() || 'E'}</span>
                  )}
                </div>
                <button
                  onClick={handleLogoClick}
                  disabled={uploadingLogo}
                  className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{formData.companyName || 'Mon Entreprise'}</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>🏢 Nom de l'entreprise *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className={inputClass}
                  placeholder="Nom de votre entreprise"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>📝 Description</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setFormData({...formData, description: e.target.value});
                    }
                  }}
                  className={inputClass}
                  placeholder="Présentez votre entreprise..."
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {formData.description.length}/500 caractères
                  </span>
                  {formData.description.length >= 450 && (
                    <span className="text-xs text-orange-400">
                      ⚠️ Limite proche
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>🌐 Site web</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className={inputClass}
                  placeholder="https://www.monentreprise.com"
                />
              </div>
              <div>
                <label className={labelClass}>📍 Localisation</label>
                <input
                  type="text"
                  value={formData.companyLocation}
                  onChange={(e) => setFormData({...formData, companyLocation: e.target.value})}
                  className={inputClass}
                  placeholder="Paris, France"
                />
              </div>
              <div>
                <label className={labelClass}>🏷️ Secteur</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className={inputClass}
                >
                  <option value="">Sélectionner</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>👥 Taille</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className={inputClass}
                >
                  <option value="">Sélectionner</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>{size} employés</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>📅 Année de création</label>
                <input
                  type="number"
                  value={formData.foundedYear || ''}
                  onChange={(e) => setFormData({...formData, foundedYear: parseInt(e.target.value)})}
                  className={inputClass}
                  placeholder="2020"
                />
              </div>
              <div>
                <label className={labelClass}>📧 Email contact</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  className={inputClass}
                  placeholder="contact@monentreprise.com"
                />
              </div>
              <div>
                <label className={labelClass}>📱 Téléphone entreprise</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  className={inputClass}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.8)] hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
          >
            {loading ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
          </button>

          {/* Informations */}
          <div className="mt-6 p-4 backdrop-blur-xl bg-purple-500/10 border border-purple-400/20 rounded-lg">
            <p className="text-sm text-purple-300">
              💡 Ces informations seront visibles par les candidats sur vos offres d'emploi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
