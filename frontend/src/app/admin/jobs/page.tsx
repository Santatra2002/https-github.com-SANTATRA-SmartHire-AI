// src/app/admin/jobs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import toast from 'react-hot-toast';
import { 
  Briefcase, Search, Filter, CheckCircle, XCircle, 
  Eye, Trash2, Building2, MapPin, Calendar,
  Clock, AlertCircle, Users
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  contract: string;
  salary: string;
  company: string;
  companyId: number;
  status: 'published' | 'pending' | 'rejected' | 'archived';
  skills: string[];
  applicationsCount: number;
  createdAt: string;
}

export default function AdminJobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
    fetchJobs();
  }, [router]);

  const fetchJobs = async () => {
    try {
      // Simuler des offres (à connecter avec le backend)
      setJobs([
        { 
          id: 1, 
          title: 'Développeur Full Stack', 
          description: 'Nous recherchons un développeur Full Stack...',
          location: 'Paris, France',
          contract: 'CDI',
          salary: '45 000€ - 55 000€',
          company: 'TechCorp',
          companyId: 1,
          status: 'published',
          skills: ['React', 'Node.js', 'TypeScript'],
          applicationsCount: 12,
          createdAt: '2026-01-15'
        },
        { 
          id: 2, 
          title: 'UX Designer', 
          description: 'Nous recherchons un UX Designer créatif...',
          location: 'Lyon, France',
          contract: 'CDD',
          salary: '35 000€ - 42 000€',
          company: 'Digital Solutions',
          companyId: 2,
          status: 'pending',
          skills: ['Figma', 'UI/UX', 'Design Thinking'],
          applicationsCount: 5,
          createdAt: '2026-02-20'
        },
        { 
          id: 3, 
          title: 'Data Scientist', 
          description: 'Nous recherchons un Data Scientist...',
          location: 'Remote',
          contract: 'Freelance',
          salary: '60 000€ - 80 000€',
          company: 'Startup Innov',
          companyId: 3,
          status: 'rejected',
          skills: ['Python', 'Machine Learning', 'SQL'],
          applicationsCount: 3,
          createdAt: '2026-03-01'
        },
      ]);
    } catch (error) {
      toast.error('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (jobId: number, newStatus: 'published' | 'rejected' | 'archived') => {
    setJobs(jobs.map(j => 
      j.id === jobId ? { ...j, status: newStatus } : j
    ));
    toast.success(`✅ Offre ${newStatus === 'published' ? 'publiée' : newStatus === 'archived' ? 'archivée' : 'rejetée'}`);
  };

  const handleDeleteJob = (jobId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success('🗑️ Offre supprimée');
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || j.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-500/20 text-green-400 border-green-500/20',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/20',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusLabel = (status: string) => {
    return {
      published: '✅ Publiée',
      pending: '⏳ En attente',
      rejected: '❌ Rejetée',
      archived: '📦 Archivée'
    }[status] || status;
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
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard')} className="text-white/60 hover:text-white">
              ←
            </button>
            <h1 className="text-2xl font-bold text-white">📋 Modération des offres</h1>
          </div>
          
        </div>
      </header>

      {/* Contenu */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une offre..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'pending', 'published', 'rejected', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl transition ${
                  filterStatus === status
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                }`}
              >
                {status === 'all' ? 'Toutes' :
                 status === 'pending' ? 'En attente' :
                 status === 'published' ? 'Publiées' :
                 status === 'rejected' ? 'Rejetées' :
                 'Archivées'}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/40">Total offres</p>
            <p className="text-2xl font-bold text-white">{jobs.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/40">Publiées</p>
            <p className="text-2xl font-bold text-green-400">
              {jobs.filter(j => j.status === 'published').length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/40">En attente</p>
            <p className="text-2xl font-bold text-yellow-400">
              {jobs.filter(j => j.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/40">Candidatures totales</p>
            <p className="text-2xl font-bold text-blue-400">
              {jobs.reduce((sum, j) => sum + j.applicationsCount, 0)}
            </p>
          </div>
        </div>

        {/* Liste des offres */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm text-white/40 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {job.company}
                    </span>
                    <span className="text-sm text-white/40 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span className="text-sm text-white/40">{job.contract}</span>
                    <span className="text-sm text-teal-400">{job.salary}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.skills.map((skill, i) => (
                      <span key={i} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-white/30 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {job.applicationsCount} candidatures
                    </span>
                    <span className="text-xs text-white/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(job.id, 'published')}
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition"
                        title="Publier"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(job.id, 'rejected')}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                        title="Rejeter"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {job.status === 'published' && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'archived')}
                      className="p-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition"
                      title="Archiver"
                    >
                      <Briefcase className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                    title="Voir"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">Aucune offre trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}