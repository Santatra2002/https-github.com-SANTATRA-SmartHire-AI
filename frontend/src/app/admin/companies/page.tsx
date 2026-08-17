// src/app/admin/companies/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import toast from 'react-hot-toast';
import { 
  Building2, Search, Filter, CheckCircle, XCircle, 
  Eye, Trash2, Users, Briefcase, Mail, Globe,
  Clock, AlertCircle
} from 'lucide-react';

interface Company {
  id: number;
  name: string;
  email: string;
  description: string;
  website: string;
  status: 'approved' | 'pending' | 'rejected';
  jobsCount: number;
  createdAt: string;
  logo?: string;
}

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
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
    fetchCompanies();
  }, [router]);

  const fetchCompanies = async () => {
    try {
      // Simuler des entreprises (à connecter avec le backend)
      setCompanies([
        { 
          id: 1, 
          name: 'TechCorp', 
          email: 'contact@techcorp.com', 
          description: 'Société de développement logiciel',
          website: 'https://techcorp.com',
          status: 'approved',
          jobsCount: 5,
          createdAt: '2026-01-15'
        },
        { 
          id: 2, 
          name: 'Digital Solutions', 
          email: 'info@digitalsolutions.com', 
          description: 'Agence digitale',
          website: 'https://digitalsolutions.com',
          status: 'pending',
          jobsCount: 2,
          createdAt: '2026-02-20'
        },
        { 
          id: 3, 
          name: 'Startup Innov', 
          email: 'contact@startupinnov.com', 
          description: 'Startup innovante',
          website: 'https://startupinnov.com',
          status: 'rejected',
          jobsCount: 0,
          createdAt: '2026-03-01'
        },
        { 
          id: 4, 
          name: 'Green Energy', 
          email: 'info@greenenergy.com', 
          description: 'Énergies renouvelables',
          website: 'https://greenenergy.com',
          status: 'pending',
          jobsCount: 1,
          createdAt: '2026-03-15'
        },
      ]);
    } catch (error) {
      toast.error('Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (companyId: number, newStatus: 'approved' | 'rejected') => {
    setCompanies(companies.map(c => 
      c.id === companyId ? { ...c, status: newStatus } : c
    ));
    toast.success(`✅ Entreprise ${newStatus === 'approved' ? 'approuvée' : 'rejetée'}`);
  };

  const handleDeleteCompany = (companyId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      setCompanies(companies.filter(c => c.id !== companyId));
      toast.success('🗑️ Entreprise supprimée');
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-500/20 text-green-400 border-green-500/20',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/20'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusLabel = (status: string) => {
    return {
      approved: '✅ Approuvée',
      pending: '⏳ En attente',
      rejected: '❌ Rejetée'
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
            <h1 className="text-2xl font-bold text-white">🏢 Gestion des entreprises</h1>
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
              placeholder="Rechercher une entreprise..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl transition ${
                  filterStatus === status
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                }`}
              >
                {status === 'all' ? 'Tous' :
                 status === 'pending' ? 'En attente' :
                 status === 'approved' ? 'Approuvées' :
                 'Rejetées'}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/40">Total entreprises</p>
            <p className="text-2xl font-bold text-white">{companies.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/40">Approuvées</p>
            <p className="text-2xl font-bold text-green-400">
              {companies.filter(c => c.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/40">En attente</p>
            <p className="text-2xl font-bold text-yellow-400">
              {companies.filter(c => c.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/40">Rejetées</p>
            <p className="text-2xl font-bold text-red-400">
              {companies.filter(c => c.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Liste des entreprises */}
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{company.name}</h3>
                    <p className="text-sm text-white/40">{company.email}</p>
                    <p className="text-sm text-white/30 mt-1">{company.description}</p>
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" 
                         className="text-xs text-teal-400 hover:text-teal-300 transition">
                        {company.website}
                      </a>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-white/30 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {company.jobsCount} offres
                      </span>
                      <span className="text-xs text-white/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(company.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`text-sm px-3 py-1 rounded-full border ${getStatusBadge(company.status)}`}>
                    {getStatusLabel(company.status)}
                  </span>
                  <div className="flex items-center gap-2">
                    {company.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(company.id, 'approved')}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition"
                          title="Approuver"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(company.id, 'rejected')}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                          title="Rejeter"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">Aucune entreprise trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}