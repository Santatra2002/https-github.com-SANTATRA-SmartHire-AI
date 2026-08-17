// src/app/candidate/applications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import { getMyApplications } from '../../../lib/api';
import toast from 'react-hot-toast';
import { 
  Briefcase, Calendar, CheckCircle, Clock, 
  XCircle, Eye, Building2, MapPin, 
  FileText, Star, TrendingUp, Filter,
  Search, ArrowUpRight, AlertCircle
} from 'lucide-react';

interface Application {
  id: number;
  status: string;
  score: number;
  coverLetter: string;
  createdAt: string;
  job: {
    id: number;
    title: string;
    location: string;
    contract: string;
    salary: string;
    company: {
      user: {
        name: string;
      };
    };
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    fetchApplications();
  }, [router]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await getMyApplications();
      if (response.success) {
        setApplications(response.applications || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { label: string; icon: React.ReactNode; color: string } } = {
      'PENDING': { 
        label: 'En attente', 
        icon: <Clock className="w-4 h-4" />, 
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
      },
      'REVIEWED': { 
        label: 'Consultée', 
        icon: <Eye className="w-4 h-4" />, 
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
      },
      'ACCEPTED': { 
        label: 'Acceptée 🎉', 
        icon: <CheckCircle className="w-4 h-4" />, 
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
      },
      'REFUSED': { 
        label: 'Refusée', 
        icon: <XCircle className="w-4 h-4" />, 
        color: 'bg-red-500/20 text-red-300 border-red-500/30' 
      },
      'INTERVIEW': { 
        label: 'Entretien 📞', 
        icon: <Calendar className="w-4 h-4" />, 
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
      }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    averageScore: applications.length > 0 
      ? Math.round(applications.reduce((sum, a) => sum + (a.score || 0), 0) / applications.length)
      : 0
  };

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#040a09]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040a09] p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">📊 Mes candidatures</h1>
            <span className="text-sm text-white/30">| Suivez vos postulations</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/40">Total:</span>
            <span className="text-white font-bold">{stats.total}</span>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-white/40">Total</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition">
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-xs text-white/40">En attente</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition">
            <p className="text-2xl font-bold text-emerald-400">{stats.accepted}</p>
            <p className="text-xs text-white/40">Acceptées</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition">
            <p className="text-2xl font-bold text-purple-400">{stats.interview}</p>
            <p className="text-xs text-white/40">Entretiens</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
            }`}
          >
            Toutes ({stats.total})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'PENDING'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
            }`}
          >
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('ACCEPTED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'ACCEPTED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
            }`}
          >
            Acceptées ({stats.accepted})
          </button>
          <button
            onClick={() => setFilter('INTERVIEW')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'INTERVIEW'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
            }`}
          >
            Entretiens ({stats.interview})
          </button>
        </div>

        {/* Liste des candidatures */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-white/40 text-lg">Aucune candidature trouvée</p>
            <p className="text-white/20 text-sm mt-2">
              {filter !== 'all' ? 'Essayez de changer le filtre' : 'Postulez à des offres pour les voir ici'}
            </p>
            {filter !== 'all' ? (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 bg-teal-500/20 text-teal-300 px-6 py-2 rounded-lg hover:bg-teal-500/30 transition"
              >
                Voir toutes
              </button>
            ) : (
              <button
                onClick={() => router.push('/candidate/match')}
                className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition"
              >
                🔍 Voir les offres
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const status = getStatusInfo(app.status);
              return (
                <div key={app.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white">{app.job.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color} flex items-center gap-1`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-sm text-white/40 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {app.job.company?.user?.name || 'Entreprise'}
                        </span>
                        <span className="text-sm text-white/40 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {app.job.location || 'Non spécifié'}
                        </span>
                        <span className="text-sm text-white/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {app.score && (
                        <div className="text-center">
                          <div className="text-xl font-bold text-teal-400">{app.score}%</div>
                          <p className="text-xs text-white/30">Matching</p>
                        </div>
                      )}
                      <button
                        onClick={() => router.push(`/candidate/match/${app.job.id}`)}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-white/40 hover:text-white"
                        title="Voir le détail"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-sm text-white/50 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{app.coverLetter}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Score moyen */}
        {applications.length > 0 && stats.averageScore > 0 && (
          <div className="mt-6 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <span className="text-white/60 text-sm">Score moyen de matching</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-teal-400">{stats.averageScore}%</span>
              <span className="text-xs text-white/30">sur {stats.total} candidatures</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}