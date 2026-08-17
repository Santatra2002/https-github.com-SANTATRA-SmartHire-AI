// src/app/candidate/layout.tsx
export default function CandidateLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen relative bg-[#040a09] text-gray-100">
        {/* Image de fond */}
        <div
          className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/candidat.jpg')" }}
        />
  
        {/* Voile sombre pour garder le texte lisible par-dessus l'image */}
        <div className="fixed inset-0 -z-10 bg-[#040a09]/80" />
  
        {/* Halos lumineux existants, gardés en overlay léger */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>
  
        {children}
      </div>
    );
  }