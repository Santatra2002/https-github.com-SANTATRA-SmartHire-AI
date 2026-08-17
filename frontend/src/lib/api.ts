// src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token + gérer correctement les uploads (FormData)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si le body est un FormData (upload de fichier), on retire le Content-Type
  // forcé en JSON pour laisser le navigateur générer le bon header
  // multipart/form-data avec le boundary correct automatiquement.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// ============================================
// FONCTIONS API POUR LES OFFRES
// ============================================

// Récupérer toutes les offres
export const getJobs = async () => {
  const response = await api.get('/api/jobs');
  return response.data;
};

// Récupérer une offre par ID
export const getJobById = async (id: number) => {
  const response = await api.get(`/api/jobs/${id}`);
  return response.data;
};

// Créer une offre (recruteur)
export const createJob = async (jobData: any) => {
  const response = await api.post('/api/jobs', jobData);
  return response.data;
};

// ============================================
// FONCTIONS API POUR LE MATCHING
// ============================================

// Récupérer les recommandations d'offres pour un candidat
export const getRecommendations = async () => {
  const response = await api.get('/api/matching/candidate/recommendations');
  return response.data;
};

// Récupérer le score de matching pour une offre
export const getMatchScore = async (jobId: number) => {
  const response = await api.get(`/api/matching/candidate/match/${jobId}`);
  return response.data;
};

// ============================================
// FONCTIONS API POUR LES CANDIDATURES
// ============================================

// Postuler à une offre
export const applyToJob = async (jobId: number, coverLetter?: string) => {
  const response = await api.post('/api/applications', { jobId, coverLetter });
  return response.data;
};

// Récupérer mes candidatures
export const getMyApplications = async () => {
  const response = await api.get('/api/applications/my-applications');
  return response.data;
};

export default api;
