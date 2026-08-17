// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { 
  Users, Briefcase, Building2, BarChart3, 
  TrendingUp, UserCheck, UserX, Clock,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecruiters: 0,
    totalCandidates: 0,
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    totalApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    const userData = auth.getUser();
    if (userData.role !== 'ADMIN') {
      router.push('/candidate/dashboard');
      return;
    }
    setUser(userData);
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      // Simuler des stats (à connecter avec le backend)
      setStats({
        totalUsers: 45,
        totalRecruiters: 12,
        totalCandidates: 33,
        totalJobs: 28,
        activeJobs: 15,
        pendingJobs: 5,
        totalApplications: 67
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    toast.success('Déconnexion réussie');
    router.push('/auth/login');
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
    <div className="min-h-screen relative bg-[#040a09] text-gray-100 overflow-hidden">
      {/* Fond */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071412] via-[#040a09] to-black" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <span className="text-white font-bold">A</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              🛡️ Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80">👋 {user.name}</span>
            <span className="text-sm bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full">Admin</span>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Bannière */}
        <div className="bg-gradient-to-r from-teal-600/30 via-cyan-600/30 to-emerald-600/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-white mb-8">
          <h2 className="text-2xl font-bold">Bonjour {user.name} !</h2>
          <p className="mt-2 text-white/70">
            🛡️ Gérez les utilisateurs, entreprises et contenus de la plateforme
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <Building2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Recruteurs</p>
                <p className="text-2xl font-bold text-white">{stats.totalRecruiters}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Offres</p>
                <p className="text-2xl font-bold text-white">{stats.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-xl">
                <BarChart3 className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Candidatures</p>
                <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Admin */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-400" />
              <h3 className="font-semibold text-white">Utilisateurs</h3>
            </div>
            <p className="text-sm text-white/40">Gérer les comptes utilisateurs</p>
            <span className="text-xs text-teal-400 mt-2 block group-hover:translate-x-1 transition">→ Voir</span>
          </button>

          <button
            onClick={() => router.push('/admin/companies')}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold text-white">Entreprises</h3>
            </div>
            <p className="text-sm text-white/40">Gérer les profils entreprises</p>
            <span className="text-xs text-teal-400 mt-2 block group-hover:translate-x-1 transition">→ Voir</span>
          </button>

          <button
            onClick={() => router.push('/admin/jobs')}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-6 h-6 text-purple-400" />
              <h3 className="font-semibold text-white">Offres</h3>
            </div>
            <p className="text-sm text-white/40">Modérer les offres d'emploi</p>
            <span className="text-xs text-teal-400 mt-2 block group-hover:translate-x-1 transition">→ Voir</span>
          </button>
        </div>

        {/* Statistiques avancées */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="font-bold text-white mb-4">📊 Activité récente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-green-400" />
                <span className="text-white/70">Nouvel utilisateur inscrit</span>
              </div>
              <span className="text-sm text-white/30">Il y a 5 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span className="text-white/70">Nouvelle offre publiée</span>
              </div>
              <span className="text-sm text-white/30">Il y a 2 heures</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <UserX className="w-4 h-4 text-red-400" />
                <span className="text-white/70">Compte suspendu</span>
              </div>
              <span className="text-sm text-white/30">Il y a 1 jour</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}