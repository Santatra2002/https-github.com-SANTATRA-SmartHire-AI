// src/app/recruiter/jobs/[id]/applications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '../../../../../lib/auth';
import api from '../../../../../lib/api';
import toast from 'react-hot-toast';

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    fetchApplications();
  }, [router, jobId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/applications/job/${jobId}`);
      if (response.data.success) {
        setApplications(response.data.applications || []);
        if (response.data.applications.length > 0) {
          setJobTitle(response.data.applications[0]?.job?.title || 'Offre');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: number, status: string) => {
    try {
      const response = await api.put(`/api/applications/${applicationId}/status`, { status });
      if (response.data.success) {
        toast.success(`✅ Statut mis à jour`);
        fetchApplications();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#05050a] text-gray-300">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#05050a] text-gray-100 overflow-hidden">
      {/* Fond dégradé + halos lumineux */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b14] via-[#05050a] to-black" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">🚀 SmartHire AI</h1>
          <button
            onClick={() => router.push('/recruiter/dashboard')}
            className="text-gray-300 hover:text-white transition"
          >
            ← Retour
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">
          📊 Candidatures - {jobTitle || 'Offre'}
        </h1>

        {loading ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-4 animate-spin">⏳</div>
            Chargement...
          </div>
        ) : applications.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 text-center">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-gray-400">Aucune candidature reçue</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 hover:bg-white/10 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-100">{app.candidate?.user?.name || 'Candidat'}</h3>
                    <p className="text-gray-400 text-sm">{app.candidate?.user?.email}</p>
                    <div className="mt-2 flex gap-2">
                      <span className={`text-sm px-2 py-1 rounded-full border backdrop-blur-sm ${
                        app.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-400/20' :
                        app.status === 'REVIEWED' ? 'bg-blue-500/10 text-blue-300 border-blue-400/20' :
                        app.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-300 border-green-400/20' :
                        'bg-red-500/10 text-red-300 border-red-400/20'
                      }`}>
                        {app.status === 'PENDING' ? 'En attente' :
                         app.status === 'REVIEWED' ? 'Consultée' :
                         app.status === 'ACCEPTED' ? 'Acceptée' :
                         'Refusée'}
                      </span>
                      {app.score && (
                        <span className="text-sm bg-violet-500/10 text-violet-300 border border-violet-400/20 px-2 py-1 rounded-full backdrop-blur-sm">
                          Score: {app.score}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {app.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, 'REVIEWED')}
                          className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-3 py-1 rounded text-sm font-medium transition-all duration-300 shadow-[0_0_12px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.7)] hover:scale-[1.03]"
                        >
                          Consulter
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, 'ACCEPTED')}
                          className="bg-white/5 backdrop-blur-xl border border-green-400/30 text-green-300 px-3 py-1 rounded text-sm font-medium transition-all duration-300 shadow-[0_0_8px_rgba(34,197,94,0.15)] hover:bg-green-500/10 hover:shadow-[0_0_16px_rgba(34,197,94,0.4)]"
                        >
                          Accepter
                        </button>
                      </>
                    )}
                    {app.status !== 'ACCEPTED' && app.status !== 'REFUSED' && (
                      <button
                        onClick={() => updateStatus(app.id, 'REFUSED')}
                        className="bg-white/5 backdrop-blur-xl border border-red-400/30 text-red-300 px-3 py-1 rounded text-sm font-medium transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.15)] hover:bg-red-500/10 hover:shadow-[0_0_16px_rgba(239,68,68,0.4)]"
                      >
                        Refuser
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}