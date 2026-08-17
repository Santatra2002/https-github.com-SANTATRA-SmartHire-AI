// src/app/candidate/profile/view/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../../../lib/auth';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';
import {
    User, Mail, MapPin, Phone, Edit3, Globe,
    Briefcase, GraduationCap, Award, Link as LinkIcon
  } from 'lucide-react';

export default function ProfileViewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
        setProfile(response.data.user.profile || {});
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const skillsList = profile?.skills
    ? profile.skills.split(/[,/\n]/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#040a09] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Aperçu du profil</h1>
          </div>
          <Link
            href="/candidate/profile"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition"
          >
            <Edit3 className="w-4 h-4" />
            Modifier
          </Link>
        </div>

        {/* En-tête profil */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden shrink-0">
              {profile?.photo && !photoError ? (
                <img
                  src={profile.photo}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              {profile?.location && (
                <p className="text-gray-400 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                  <MapPin className="w-4 h-4" /> {profile.location}
                </p>
              )}
              {profile?.phone && (
                <p className="text-gray-400 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                  <Phone className="w-4 h-4" /> {profile.phone}
                </p>
              )}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300">
                    <LinkIcon className="w-5 h-5" />
                  </a>
                )}
                {profile?.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300">
                   <LinkIcon className="w-5 h-5" />
                  </a>
                )}
                {profile?.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {profile?.description && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">À propos</h3>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">{profile.description}</p>
          </div>
        )}

        {/* Compétences */}
        {skillsList.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-400" /> Compétences
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="bg-teal-500/10 text-teal-300 border border-teal-500/20 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expériences */}
        {profile?.experiences && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-400" /> Expériences
            </h3>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">{profile.experiences}</p>
          </div>
        )}

        {/* Formation */}
        {profile?.education && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-teal-400" /> Formation
            </h3>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">{profile.education}</p>
          </div>
        )}

        {!profile?.description && !profile?.experiences && !profile?.education && skillsList.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-gray-400">Ton profil est encore incomplet.</p>
            <Link href="/candidate/profile" className="text-teal-400 hover:underline mt-2 inline-block">
              Complète-le maintenant →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
