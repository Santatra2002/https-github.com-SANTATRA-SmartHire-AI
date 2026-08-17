// src/app/recruiter/applications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';

export default function ApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
  }, [router]);

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-600">🚀 SmartHire AI</h1>
          <button
            onClick={() => router.push('/recruiter/dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">📊 Gestion des candidatures</h2>
          <div className="text-center text-gray-500 py-12">
            <p className="text-6xl mb-4">📭</p>
            <p>Aucune candidature reçue</p>
            <p className="text-sm">Les candidatures apparaîtront ici</p>
          </div>
        </div>
      </div>
    </div>
  );
}