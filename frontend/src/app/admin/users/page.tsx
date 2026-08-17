// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import toast from 'react-hot-toast';
import { Users, Search, Filter, MoreVertical, UserCheck, UserX, Trash2, Edit } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      // Simuler des utilisateurs (à connecter avec le backend)
      setUsers([
        { id: 1, name: 'Jean Dupont', email: 'jean@email.com', role: 'CANDIDAT', status: 'active', createdAt: '2026-01-15' },
        { id: 2, name: 'Marie Martin', email: 'marie@email.com', role: 'RECRUTEUR', status: 'active', createdAt: '2026-02-20' },
        { id: 3, name: 'Pierre Durand', email: 'pierre@email.com', role: 'CANDIDAT', status: 'suspended', createdAt: '2026-03-01' },
        { id: 4, name: 'Sophie Bernard', email: 'sophie@email.com', role: 'RECRUTEUR', status: 'pending', createdAt: '2026-03-15' },
        { id: 5, name: 'Lucas Petit', email: 'lucas@email.com', role: 'CANDIDAT', status: 'active', createdAt: '2026-03-20' },
      ]);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: newStatus as any } : u
    ));
    toast.success(`✅ Statut mis à jour`);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== userId));
      toast.success('🗑️ Utilisateur supprimé');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400',
      suspended: 'bg-red-500/20 text-red-400',
      pending: 'bg-yellow-500/20 text-yellow-400'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (!user || loading) {
    return <div className="flex justify-center items-center min-h-screen bg-[#040a09]">Chargement...</div>;
  }

  return (
    <div className="min-h-screen relative bg-[#040a09] text-gray-100 overflow-hidden">
      {/* Fond */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071412] via-[#040a09] to-black" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard')} className="text-white/60 hover:text-white">
              ←
            </button>
            <h1 className="text-2xl font-bold text-white">👥 Gestion des utilisateurs</h1>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Barre de recherche */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-white/60">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Tableau */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Inscrit le</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-sm text-white/40">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-teal-500/20 text-teal-400' :
                      u.role === 'RECRUTEUR' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {u.role === 'CANDIDAT' ? 'Candidat' : u.role === 'RECRUTEUR' ? 'Recruteur' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(u.status)}`}>
                      {u.status === 'active' ? '✅ Actif' : u.status === 'suspended' ? '⛔ Suspendu' : '⏳ En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/40">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.status !== 'suspended' && (
                        <button
                          onClick={() => handleStatusChange(u.id, 'suspended')}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                          title="Suspendre"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      {u.status === 'suspended' && (
                        <button
                          onClick={() => handleStatusChange(u.id, 'active')}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition"
                          title="Réactiver"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-white/30">
          Total: {filteredUsers.length} utilisateurs
        </div>
      </div>
    </div>
  );
}