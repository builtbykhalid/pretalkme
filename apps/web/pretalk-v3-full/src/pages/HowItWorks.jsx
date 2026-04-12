import { Btn, Reveal, SL, ST, Badge, GlassCard, ArrowRight, ImgPh, CheckCircle } from "../components/ui";

const PHASES = [
  {
    phase:"Phase 0", label:"Setup & Onboarding", color:"text-black", bg:"bg-black",
    steps: [
      { title:"Productisation de votre offre", time:"~5 min", desc:"L'IA analyse vos services et génère 3 offres packagées (Starter/Pro/Premium) avec des prix suggérés basés sur le marché.", icon:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
      { title:"Profil public premium", time:"~8 min", desc:"Bio générée par l'IA, headline optimisée pour la conversion, page publique prête à partager avec lien unique.", icon:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    ]
  },
  {
    phase:"Phase 1", label:"Avant l'appel", color:"text-green-700", bg:"bg-green-500",
    steps: [
      { title:"Qualification automatique", time:"Automatique", desc:"5 questions qualifiantes générées par l'IA filtrent les prospects. Budget, timing, maturité : tout est capturé avant que vous décrochiez.", icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
      { title:"Audit IA complet", time:"90 secondes", desc:"Scraping site web, LinkedIn, actualités presse, signaux d'intention. Un dossier complet sur votre prospect 15 minutes avant le call.", icon:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    ]
  },
  {
    phase:"Phase 2", label:"Pendant l'appel", color:"text-violet-700", bg:"bg-violet-600",
    steps: [
      { title:"Cheat Sheet Discovery Call", time:"Pré-call", desc:"Budget détecté, objections probables, mots exacts à utiliser, questions à poser. Tout pour fermer en premier rendez-vous.", icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    ]
  },
  {
    phase:"Phase 3", label:"Après l'appel", color:"text-amber-700", bg:"bg-amber-500",
    steps: [
      { title:"Devis en 3 options", time:"1 clic", desc:"Anchor Pricing automatique. 3 options avec ROI estimé pour le client. Le devis est envoyé et tracké directement depuis Pretalk.", icon:"M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" },
      { title:"Contrat & signature", time:"Automatique", desc:"Contrat juridique généré selon le type de mission détecté par l'IA. Signature électronique intégrée.", icon:"M9 12h6m-6 4h4m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    ]
  },
  {
    phase:"Phase 4", label:"Fidélisation", color:"text-green-700", bg:"bg-green-500",
    steps: [
      { title:"Demande d'avis automatique", time:"J+30", desc:"30 jours après la mission, Pretalk envoie automatiquement un email de suivi et une demande d'avis 5 étoiles.", icon:"M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
      { title:"Proposition retainer", time:"Auto", desc:"Sur les clients satisfaits, Pretalk propose automatiquement un retainer mensuel adapté à la mission réalisée.", icon:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    ]
  },
];

export default function HowItWorks() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-20 px-8 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.08),transparent_60%)] pointer-events-none"/>
        <div className="max-w-[1160px] mx-auto text-center relative z-10">
          <Reveal><Badge variant="green" className="mb-5">Comment ça marche</Badge></Reveal>
          <Reveal delay={80}><h1 className="text-[clamp(36px,4.5vw,60px)] font-extrabold leading-[1.05] tracking-[-2px] text-white mb-5">De l'onboarding à la fidélisation.<br/><span className="text-shimmer">5 phases. 0 effort manuel.</span></h1></Reveal>
          <Reveal delay={160}><p className="text-[17px] text-white/55 leading-[1.7] max-w-[560px] mx-auto mb-10">Pretalk implémente les 12 frameworks des meilleurs cabinets de conseil (McKinsey, Bain, HBS) dans un système automatisé simple à activer.</p></Reveal>
          <Reveal delay={240}>
            <div className="flex items-center justify-center gap-3">
              <Btn to="/tarifs" variant="green" size="lg">Commencer maintenant <ArrowRight/></Btn>
              <Btn to="/contact" variant="outline-dark" size="lg">Voir la démo live</Btn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Timeline phases */}
      {PHASES.map((ph, pi) => (
        <section key={pi} className={`py-20 px-8 ${pi%2===0?"bg-white":"bg-gray-50"}`}>
          <div className="max-w-[1160px] mx-auto">
            <Reveal>
              <div className="flex items-center gap-3 mb-10">
                <span className={`${ph.bg} text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full`}>{ph.phase}</span>
                <h2 className={`text-[22px] font-bold ${ph.color}`}>{ph.label}</h2>
                <div className="h-px flex-1 bg-gray-200 ml-2"/>
              </div>
            </Reveal>
            <div className={`grid gap-6 ${ph.steps.length===1?"grid-cols-1 max-w-[720px]":"grid-cols-2"}`}>
              {ph.steps.map((s, si) => (
                <Reveal key={si} delay={si*100} dir={si===0?"left":"right"}>
                  <div className="glass-card rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-[260ms] ease-spring">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${pi%2===0?"bg-black":"bg-gray-200"}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d={s.icon} stroke={pi%2===0?"white":"#0A0A0A"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{s.time}</span>
                    </div>
                    <h3 className="text-[18px] font-bold text-black mb-3">{s.title}</h3>
                    <p className="text-[14px] text-gray-500 leading-[1.7]">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Visual timeline summary */}
      <section className="py-24 px-8 bg-black">
        <div className="max-w-[900px] mx-auto">
          <Reveal><ST light className="text-center mb-14">En résumé : 5 phases, 60 jours pour transformer votre activité.</ST></Reveal>
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-green-500/60 via-green-500/30 to-transparent"/>
            {["Onboarding & setup (10 min)", "Qualification automatique active", "Premier audit IA pré-call", "Premier devis & contrat généré", "Premier retainer proposé"].map((t, i) => (
              <Reveal key={i} delay={i*80} dir="left">
                <div className="flex items-center gap-5 mb-7 relative pl-12">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-green-400">{i+1}</span>
                  </div>
                  <div className="glass-dark rounded-xl px-5 py-3.5 flex-1">
                    <p className="text-[14px] text-white font-medium">{t}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 bg-white text-center">
        <Reveal><ST className="mb-4">Prêt à automatiser votre pipeline ?</ST></Reveal>
        <Reveal delay={80}><p className="text-[16px] text-gray-500 mb-8 max-w-[400px] mx-auto leading-[1.7]">Rejoignez 340+ consultants. Activation en 5 minutes.</p></Reveal>
        <Reveal delay={160}><Btn to="/tarifs" variant="black" size="lg">Démarrer gratuitement <ArrowRight/></Btn></Reveal>
      </section>
    </>
  );
}
