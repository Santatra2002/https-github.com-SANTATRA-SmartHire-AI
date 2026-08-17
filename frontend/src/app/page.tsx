// src/app/page.tsx
import Link from 'next/link';
import { Sparkles, Briefcase, Users, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/fond.png')",
        }}
      >
        {/* Overlay avec dégradé */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
      </div>

      {/* Effets de lumière */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl mb-8 animate-fade-in-down">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">SmartHire AI</span>
            <span className="text-xs bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full">v3.0</span>
          </div>

          {/* Titre */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white text-center leading-tight mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-teal-300 via-white to-cyan-300 bg-clip-text text-transparent">
              L'avenir du recrutement
            </span>
            <br />
            <span className="text-white/90">commence ici</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/60 text-center max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
            Rejoignez la plateforme qui connecte les talents aux entreprises
            <br className="hidden sm:block" />
            grâce à l'intelligence artificielle.
          </p>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up animation-delay-400">
            <Link
              href="/auth/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Créer un compte
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/auth/login"
              className="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 text-lg hover:shadow-2xl hover:shadow-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Se connecter
            </Link>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
              <p className="text-3xl font-bold text-teal-400">100+</p>
              <p className="text-sm text-white/50">Offres d'emploi</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
              <p className="text-3xl font-bold text-emerald-400">500+</p>
              <p className="text-sm text-white/50">Candidats</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
              <p className="text-3xl font-bold text-cyan-400">95%</p>
              <p className="text-sm text-white/50">Taux de matching</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
              <p className="text-3xl font-bold text-amber-400">4.9</p>
              <p className="text-sm text-white/50">Note moyenne</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="w-full max-w-7xl mx-auto mt-24 px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Pourquoi SmartHire AI ?</h2>
            <p className="text-white/50 mt-2">Une solution complète pour le recrutement moderne</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-teal-400" />}
              title="IA Intelligente"
              description="Analyse automatique des CV et matching optimal entre candidats et offres"
            />
            <FeatureCard
              icon={<Briefcase className="w-8 h-8 text-cyan-400" />}
              title="Gestion des offres"
              description="Créez, publiez et gérez vos offres d'emploi en quelques clics"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-emerald-400" />}
              title="Candidats qualifiés"
              description="Accédez aux meilleurs profils grâce à notre système de matching"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-amber-400" />}
              title="Rapide et efficace"
              description="Processus de recrutement simplifié et automatisé"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-rose-400" />}
              title="Sécurisé"
              description="Données protégées et authentification sécurisée"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-indigo-400" />}
              title="Suivi en temps réel"
              description="Tableau de bord complet pour suivre vos candidatures et offres"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/30">© 2026 SmartHire AI - Tous droits réservés</p>
        </footer>
      </div>
    </div>
  );
}

// Composant FeatureCard
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-white/50 text-sm mt-1 leading-relaxed">{description}</p>
    </div>
  );
}