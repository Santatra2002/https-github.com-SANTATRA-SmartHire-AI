// src/app/candidate/jobs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';

export default function JobsPage() {
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
            onClick={() => router.push('/candidate/dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">🔍 Offres d'emploi</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 hover:shadow-lg transition">
              <h3 className="font-bold text-lg">Développeur Full Stack</h3>
              <p className="text-gray-600">Entreprise XYZ</p>
              <p className="text-sm text-gray-500">📍 Paris | CDI</p>
              <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700">
                Postuler
              </button>
            </div>
            <div className="border rounded-lg p-4 hover:shadow-lg transition">
              <h3 className="font-bold text-lg">Développeur Frontend</h3>
              <p className="text-gray-600">Entreprise ABC</p>
              <p className="text-sm text-gray-500">📍 Lyon | CDD</p>
              <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700">
                Postuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}