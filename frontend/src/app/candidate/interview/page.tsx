// src/app/candidate/interview/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Sparkles, Send, RefreshCw, 
  CheckCircle, XCircle, Clock, Brain,
  ArrowRight, Mic, FileText, Users,
  Star, Award, Target, Zap
} from 'lucide-react';

interface Question {
  question: string;
  type: string;
  category: string;
  difficulty: string;
  expectedKeywords?: string[];
}

interface Evaluation {
  score: number;
  feedback: string;
  improvements: string[];
  recommendation: string;
}

export default function InterviewSimulatorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(auth.getUser());
    fetchJobs();
  }, [router]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      if (response.data.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Erreur chargement offres:', error);
    }
  };

  const generateQuestions = async () => {
    if (!selectedJobId) {
      toast.error('Veuillez sélectionner une offre');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/api/interview/generate-questions', {
        jobId: parseInt(selectedJobId)
      });

      if (response.data.success) {
        setQuestions(response.data.questions);
        setAnswers(new Array(response.data.questions.length).fill(''));
        setEvaluations([]);
        setCurrentQuestionIndex(0);
        setShowResults(false);
        toast.success(`✅ ${response.data.questions.length} questions générées`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setGenerating(false);
    }
  };

  const evaluateAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];

    if (!currentAnswer || currentAnswer.length < 5) {
      toast.error('Veuillez écrire une réponse plus détaillée');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/interview/evaluate-answer', {
        question: currentQuestion,
        answer: currentAnswer
      });

      if (response.data.success) {
        const newEvaluations = [...evaluations];
        newEvaluations[currentQuestionIndex] = response.data.evaluation;
        setEvaluations(newEvaluations);

        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          toast.success('✅ Réponse évaluée, question suivante');
        } else {
          setShowResults(true);
          toast.success('🎉 Entretien terminé !');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
  const averageScore = evaluations.length > 0 ? Math.round(totalScore / evaluations.length) : 0;

  const getDifficultyBadge = (difficulty: string) => {
    const styles = {
      'Facile': 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      'Moyen': 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      'Difficile': 'bg-red-500/20 text-red-300 border-red-400/30'
    };
    return styles[difficulty as keyof typeof styles] || styles['Moyen'];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen bg-[#040a09]">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-[#040a09] p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-8 h-8 text-teal-400" />
          <h1 className="text-2xl font-bold text-white">💬 Simulateur d'entretien</h1>
          <span className="text-sm text-white/30">| Entraînez-vous avec l'IA</span>
        </div>

        {/* Sélection de l'offre */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <p className="text-sm text-gray-400 mb-3">Sélectionnez une offre pour générer des questions personnalisées</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choisir une offre --</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.location}
                </option>
              ))}
            </select>
            <button
              onClick={generateQuestions}
              disabled={generating}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] transition disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? '⏳ Génération...' : '🎯 Générer les questions'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {questions.length > 0 && !showResults && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            {/* Progression */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-400">
                Question {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span className={`text-sm px-3 py-1 rounded-full border ${getDifficultyBadge(questions[currentQuestionIndex].difficulty)}`}>
                {questions[currentQuestionIndex].difficulty}
              </span>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
              <div
                className="bg-gradient-to-r from-teal-400 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Catégorie */}
            <div className="mb-4">
              <span className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-full">
                {questions[currentQuestionIndex].category || 'Général'}
              </span>
            </div>

            {/* Question */}
            <p className="text-lg font-medium text-white mb-4">
              {questions[currentQuestionIndex].question}
            </p>

            {/* Réponse */}
            <textarea
              value={answers[currentQuestionIndex] || ''}
              onChange={handleAnswerChange}
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition"
              placeholder="Écrivez votre réponse ici..."
            />

            {/* Bouton Évaluer */}
            <button
              onClick={evaluateAnswer}
              disabled={loading}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? '⏳ Évaluation...' : '📤 Évaluer ma réponse'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Résultats */}
        {showResults && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">📊 Résultats de l'entretien</h2>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-teal-400">{averageScore}%</div>
              <p className="text-gray-400">Score moyen</p>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{q.question}</p>
                      <p className="text-xs text-gray-400 mt-1">{q.category}</p>
                    </div>
                    <div className="text-right ml-4">
                      <span className={`text-xl font-bold ${getScoreColor(evaluations[i]?.score || 0)}`}>
                        {evaluations[i]?.score || 0}%
                      </span>
                    </div>
                  </div>
                  {evaluations[i] && (
                    <div className="mt-2 text-sm text-gray-300">
                      <p>{evaluations[i].feedback}</p>
                      {evaluations[i].improvements.length > 0 && (
                        <div className="mt-1">
                          <p className="font-medium text-amber-400 text-xs">Améliorations :</p>
                          <ul className="list-disc list-inside text-xs text-gray-400">
                            {evaluations[i].improvements.map((imp, j) => (
                              <li key={j}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-teal-500/10 border border-teal-400/20 rounded-xl">
              <p className="font-medium text-teal-300">
                💡 {evaluations.length > 0 && evaluations[0]?.recommendation}
              </p>
            </div>

            <button
              onClick={() => {
                setQuestions([]);
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setAnswers([]);
                setEvaluations([]);
              }}
              className="mt-4 bg-white/10 text-white px-6 py-2.5 rounded-xl hover:bg-white/20 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}