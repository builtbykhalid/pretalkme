import { useState, useEffect } from "react";
import { Badge, Btn, Reveal, SL, ST, GlassCard, Check, CheckCircle, ArrowRight, PlayIcon } from "../ui";
import Logo from "../../ReactApp/components/ui/Logo";
import { CASE_STUDIES, PLANS } from "../../../data/landing/index";

// Avatars
const AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face",
];

// ── COUNT-UP ────────────────────────────────────────────────
function CountNum({ target, suffix="" }) {
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started) return;
    if (typeof target !== "number") return;
    let val = 0;
    const step = target / 80;
    const t = setInterval(() => {
      val += step;
      if (val >= target) { setN(target); clearInterval(t); return; }
      setN(Math.floor(val));
    }, 16);
    return () => clearInterval(t);
  }, [started, target]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    const el = document.getElementById("proof-bar");
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (typeof target !== "number") return <span>{target}</span>;
  return <span>{n}{suffix}</span>;
}

// ── HERO ─────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen bg-white flex items-center overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-80px] right-[-180px] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-[radial-gradient(circle,rgba(72,217,81,0.08)_0%,transparent_70%)] pointer-events-none animate-pulse-slow"/>
      <div className="absolute bottom-0 left-[-100px] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[radial-gradient(circle,rgba(34,26,64,0.05)_0%,transparent_70%)] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}/>
      
      <div className="max-w-[1160px] mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20 lg:py-0">
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <Reveal>
            <div className="mb-6 flex justify-center lg:justify-start">
              <Badge variant="green" dot>Agents IA — Maintenant disponibles</Badge>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-[clamp(32px,6vw,64px)] font-extrabold leading-[1.04] tracking-[-1.5px] md:tracking-[-2.5px] text-[#221A40] mb-6">
              Transformez chaque<br className="hidden md:block"/>prospect en client<br/>
              <span className="text-shimmer bg-gradient-to-r from-[#48D951] via-[#221A40] to-[#48D951] bg-clip-text text-transparent">avant de parler.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[16px] md:text-[18px] text-neutral-500 leading-relaxed max-w-[520px] mx-auto lg:mx-0 mb-10">
              Pretalk automatise votre cycle de vente : qualification IA, audit client, scoring, devis et contrats. Closez 3× plus vite sans sacrifier votre positionnement expert.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Btn href="/app/login" variant="green" size="lg" className="w-full sm:w-auto shadow-xl shadow-primary-500/20">
                Démarrer gratuitement <ArrowRight/>
              </Btn>
              <Btn href="/comment-ca-marche" variant="outline" size="lg" className="w-full sm:w-auto">
                <PlayIcon/> Voir la démo
              </Btn>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 pt-8 border-t border-neutral-100 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm"/>
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="text-[#F59E0B] text-xs tracking-widest mb-0.5 font-bold">★★★★★</div>
                <p className="text-[13px] text-neutral-500">
                  <strong className="text-dark font-bold">+340 consultants</strong> font confiance à pretalk
                </p>
              </div>
            </div>
          </Reveal>
        </div>
        
        {/* RIGHT - Image Container */}
        <div className="order-1 lg:order-2">
          <Reveal delay={160} dir="right">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#48D951]/10 to-[#221A40]/5 rounded-[40px] blur-2xl group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative aspect-square lg:h-[580px] w-full rounded-[32px] border border-neutral-100 bg-white shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center ring-1 ring-neutral-200/50">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-50/50 to-white pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-white shadow-xl shadow-primary-500/10 flex items-center justify-center animate-bounce-slow border border-primary-50">
                    <Logo size="xl" showText={false} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-dark font-bold text-lg">Visualisez votre succès</h3>
                    <p className="text-sm text-neutral-400 max-w-[280px] leading-relaxed">
                      L'interface ultra-minimaliste conçue pour les consultants exigeants.
                    </p>
                  </div>
                  <div className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-[10px] font-bold tracking-widest uppercase">
                    Interface Aperçu
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── PROOF BAR ─────────────────────────────────────────────
function ProofBar() {
  return (
    <div id="proof-bar" className="bg-neutral-50/50 border-y border-neutral-100 py-8 px-6 md:px-8">
      <div className="max-w-[1160px] mx-auto flex items-center justify-center gap-8 md:gap-12 flex-wrap">
        {[
          { val:340, suffix:"+", label:"Consultants actifs" },
          { val:2.1, suffix:"M€", label:"Générés via Pretalk" },
          { val:3, suffix:"×", label:"Taux de closing moyen" },
          { val:38, suffix:"h", label:"Économisées / mois" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-4 group">
            <span className="text-[24px] md:text-[32px] font-extrabold text-[#221A40] tracking-tight group-hover:text-primary-500 transition-colors duration-300">
              <CountNum target={s.val} suffix={s.suffix||""}/>
            </span>
            <span className="text-[12px] md:text-[13px] font-medium text-neutral-400 uppercase tracking-widest leading-none">{s.label}</span>
            {i<3 && <div className="hidden lg:block w-px h-8 bg-neutral-200 ml-8 opacity-50"/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PERSONAS ──────────────────────────────────────────────
const PERSONAS = [
  { accent:"border-t-[#221A40]", badge:"Conseil · Stratégie", bv:"violet", title:"Le Consultant\nHigh-Ticket", tag:"Finance, Management, Stratégie.", pain:"\"J'arrive à des calls sans savoir si le prospect peut payer. Je perds 4h par semaine.\"", dot:"bg-[#221A40]", feats:["Audit IA complet avant le 1er appel","Scoring automatique budget & maturité","Cheat sheet Discovery Call IA","Devis Anchor Pricing en 1 clic"] },
  { accent:"border-t-[#48D951]", badge:"Design · Dev · Growth", bv:"green", title:"L'Agence Solo\nSolopreneur", tag:"Design, Dev, Growth. Vous gérez 15 outils.", pain:"\"Typeform + Calendly + Stripe + Notion + Brevo... 300€/mois d'outils qui ne se parlent pas.\"", dot:"bg-[#48D951]", feats:["Profil public premium vitrine digitale","Form builder créé via prompt IA","Gestion financière MRR intégrée","Remplace 5 outils en un seul"] },
  { accent:"border-t-[#7C3AED]", badge:"Coaching · RH · Vente", bv:"white", title:"Le Coach &\nConseiller Expert", tag:"Relation humaine d'abord. L'IA en coulisses.", pain:"\"Je découvre le vrai problème du prospect pendant l'appel. Trop tard pour préparer.\"", dot:"bg-neutral-300", feats:["Formulaires dynamiques IA conversationnels","Bibliothèque d'agents IA spécialisés","Calendrier permanent intégré","Suivi de fidélisation automatisé"] },
];

function Personas() {
  return (
    <section className="py-24 px-6 md:px-8 bg-white/50 backdrop-blur-sm scroll-mt-20">
      <div className="max-w-[1160px] mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <SL>Fait pour vous</SL>
            <ST className="mb-4">Quel consultant êtes-vous ?</ST>
            <p className="text-[16px] text-neutral-500 leading-relaxed max-w-[540px] mx-auto">
              Que vous vendiez du high-ticket, juggliez 20 clients, ou vendiez à l'humain — Pretalk s'adapte à votre réalité.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
          {PERSONAS.map((p, i) => (
            <Reveal key={i} delay={i*100}>
              <div className={`group border border-neutral-100 border-t-[4px] ${p.accent} rounded-[28px] p-8 bg-white hover:shadow-2xl hover:shadow-neutral-200/50 hover:-translate-y-2 transition-all duration-500 cursor-default ring-1 ring-neutral-200/20`}>
                <div className="w-14 h-14 rounded-2xl bg-neutral-50 mb-6 border border-dashed border-neutral-200 flex items-center justify-center text-neutral-300 transition-colors group-hover:border-primary-200 group-hover:bg-primary-50/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="mb-4"><Badge variant={p.bv}>{p.badge}</Badge></div>
                <h3 className="text-[20px] font-bold tracking-tight text-[#221A40] mb-3 whitespace-pre-line leading-tight">{p.title}</h3>
                <p className="text-[13.5px] text-neutral-400 mb-6 leading-relaxed">{p.tag}</p>
                <div className="bg-neutral-50 rounded-2xl p-4 text-[13px] text-neutral-600 mb-6 border-l-[4px] border-neutral-200 italic leading-relaxed group-hover:border-primary-400 transition-colors">
                  {p.pain}
                </div>
                <ul className="space-y-3.5">
                  {p.feats.map((f,j)=>(
                    <li key={j} className="flex items-start gap-3 text-[13px] text-neutral-700 leading-tight">
                      <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.dot}`}/>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FEATURE HIGHLIGHTS ────────────────────────────────────
function FeatureHighlights() {
  const feats = [
    { color:"bg-primary-50", iconStroke:"#48D951", title:"Audit IA", desc:"Analyse complète du prospect en 90s. Brief envoyé 15 min avant le call.", badge:"Expert", bv:"violet" },
    { color:"bg-neutral-900", iconStroke:"#FFFFFF", title:"Lead Scoring", desc:"Score 0-100 automatique. Budget, maturité, timing, fit.", badge:"Auto", bv:"green" },
    { color:"bg-accent-50", iconStroke:"#221A40", title:"Form Builder IA", desc:"Formulaire qualifiant généré en 30 secondes via prompt.", badge:"Productivité", bv:"violet" },
    { color:"bg-amber-50", iconStroke:"#F59E0B", title:"Devis & Contrats", desc:"Propositions Anchor Pricing + contrats juridiques en 1 clic.", badge:"Sales", bv:"amber" },
    { color:"bg-neutral-50", iconStroke:"#221A40", title:"Qualifiez l'intention", desc:"Identifiez les prospects chauds avant même qu'ils ne réservent.", badge:"Intention", bv:"green" },
    { color:"bg-neutral-50", iconStroke:"#48D951", title:"Analytics ROI", desc:"Visualisez vos gains de temps et de revenus en temps réel.", badge:"Data", bv:"gray" },
  ];
  return (
    <section className="py-24 px-6 md:px-8 bg-gradient-to-b from-white to-neutral-50/30">
      <div className="max-w-[1160px] mx-auto text-center lg:text-left">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div className="max-w-[540px] mx-auto lg:mx-0">
              <SL>L'OS du Consultant</SL>
              <ST className="mb-4">Tout ce dont vous avez besoin,<br className="hidden md:block"/>rien de superflu.</ST>
              <p className="text-[16px] text-neutral-500 leading-relaxed">De la qualification au closing, Pretalk orchestre chaque étape de votre pipeline.</p>
            </div>
            <div className="flex-shrink-0">
              <Btn href="/fonctionnalites" variant="outline" size="md">Explorer le produit <ArrowRight/></Btn>
            </div>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {feats.map((f, i) => (
            <Reveal key={i} delay={i*60}>
              <div className="group bg-white rounded-[24px] p-7 border border-neutral-100 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 group-hover:rotate-3`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke={f.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <Badge variant={f.bv} className="mb-4">{f.badge}</Badge>
                <h3 className="text-[17px] font-bold mb-2 text-[#221A40]">{f.title}</h3>
                <p className="text-[14px] text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PIPELINE ──────────────────────────────────────────────
const STEPS = [
  { n:"01", t:"Le prospect arrive", d:"Via votre profil, QR code, réseaux ou lien partagé.", icon:"M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zM4 20c0-4 3.6-7 8-7s8 3 8 7" },
  { n:"02", t:"L'IA qualifie", d:"Formulaire IA + scoring 0-100 calculé en temps réel.", icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { n:"03", t:"Brief pré-call", d:"15 min avant le RDV : budget, objections, mots exacts à utiliser.", icon:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { n:"04", t:"Devis & contrat", d:"Proposition 3 options avec contrat adapté à la mission.", icon:"M9 12h6m-6 4h4m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { n:"05", t:"Fidélisation auto", d:"J+30 : avis 5 étoiles + proposition retainer mensuel auto.", icon:"M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
];

// ── PIPELINE ──────────────────────────────────────────────
function Pipeline() {
  return (
    <section className="py-24 px-6 md:px-8 bg-white overflow-hidden">
      <div className="max-w-[900px] mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <SL>Comment ça marche</SL>
            <ST className="mb-4">De l'inconnu à la signature<br className="hidden md:block"/>en 5 étapes automatisées.</ST>
          </div>
        </Reveal>
        
        <div className="relative space-y-12">
          {/* Vertical Connecting line */}
          <div className="absolute left-[23px] top-4 bottom-4 w-px bg-gradient-to-b from-primary-500/10 via-primary-500/40 to-primary-500/10 hidden sm:block"/>
          
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i*100} dir={i%2===0?"left":"right"}>
              <div className="group flex items-start gap-6 md:gap-10">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#221A40] text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-accent-900/20 relative z-10">
                  {s.n}
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-full bg-[#221A40] animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
                </div>
                <div className="pt-1.5 flex-1 p-6 rounded-[24px] bg-neutral-50/50 border border-neutral-100 hover:bg-white hover:border-primary-100 transition-all duration-300">
                  <h3 className="text-[17px] font-bold text-dark mb-2 flex items-center gap-2">
                    {s.t}
                    <div className="p-1 rounded-md bg-white border border-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#48D951" strokeWidth="2.5"><path d={s.icon} /></svg>
                    </div>
                  </h3>
                  <p className="text-[14px] text-neutral-400 leading-relaxed">{s.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CASE STUDY TEASER ─────────────────────────────────────
function CaseStudyTeaser() {
  const featured = CASE_STUDIES[0];
  return (
    <section className="py-24 px-6 md:px-8 bg-[#221A40] overflow-hidden relative rounded-[40px] md:rounded-[60px] mx-4 md:mx-10 my-10">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(72,217,81,0.12)_0%,transparent_70%)] pointer-events-none"/>
      <div className="max-w-[1160px] mx-auto relative z-10">
        <Reveal>
          <div className="mb-16">
            <SL light>Cas Clients</SL>
            <ST light className="mb-4">Leurs résultats valent<br className="hidden md:block"/>mieux que nos arguments.</ST>
          </div>
        </Reveal>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <Reveal dir="left">
            <div className="relative rounded-[32px] overflow-hidden group shadow-2xl shadow-black/40 border border-white/5">
              <img src={featured.cover} alt={featured.title} className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-1000"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#221A40] via-[#221A40]/30 to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <Badge variant="green" className="mb-4">{featured.category}</Badge>
                <h3 className="text-[24px] font-bold text-white leading-tight mb-6">{featured.title}</h3>
                <div className="flex flex-wrap gap-4">
                  {featured.metrics.map((m,i)=>(
                    <div key={i} className="bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 ring-1 ring-white/5">
                      <div className={`text-[18px] font-black ${m.color === 'text-green-400' ? 'text-[#48D951]' : 'text-[#48D951]'}`}>{m.value}</div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-white/40">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          
          <Reveal delay={80} dir="right">
            <div className="flex flex-col gap-4">
              {CASE_STUDIES.slice(1, 4).map((cs, i) => (
                <a key={i} href={`/blog/${cs.slug}`} className="group bg-white/5 backdrop-blur-sm rounded-[24px] p-6 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 no-underline block ring-1 ring-white/5">
                  <div className="flex items-center gap-5">
                    <img src={cs.cover} alt="" className="w-16 h-16 object-cover rounded-2xl flex-shrink-0 shadow-lg"/>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[#48D951] uppercase tracking-widest">{cs.category}</span>
                      <p className="text-[15px] font-bold text-white mt-1 leading-snug group-hover:text-[#48D951] transition-colors line-clamp-2">{cs.title}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 text-right">
                      {cs.metrics[0] && <span className="text-[16px] font-black text-[#48D951]">{cs.metrics[0].value}</span>}
                      <div className="text-[9px] text-white/30 uppercase font-bold">{cs.metrics[0]?.label}</div>
                    </div>
                  </div>
                </a>
              ))}
              <a href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-[#48D951] transition-colors text-[14px] font-bold mt-4 px-2 group">
                Découvrir tous les cas clients 
                <div className="transition-transform group-hover:translate-x-1"><ArrowRight size={16}/></div>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── PRICING TEASER ────────────────────────────────────────
function PricingTeaser() {
  return (
    <section className="py-24 px-6 md:px-8 bg-neutral-50/20">
      <div className="max-w-[1160px] mx-auto text-center">
        <Reveal>
          <SL>Tarifs</SL>
          <ST className="mb-4">Commencez gratuitement.<br className="hidden md:block"/>Scalez quand vous closez.</ST>
          <p className="text-[16px] text-neutral-500 mb-14 max-w-[500px] mx-auto leading-relaxed">De 0€ à 99€/mois. Aucune carte bancaire requise pour démarrer l'aventure Pretalk.</p>
        </Reveal>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-12">
          {PLANS.map((p, i) => (
            <Reveal key={i} delay={i*80}>
              <div className={`relative rounded-[32px] p-8 border transition-all duration-500 group overflow-hidden ${p.featured?"border-[#221A40] bg-white shadow-2xl shadow-[#221A40]/5 ring-1 ring-[#221A40]/10":"border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-xl"}`}>
                {p.featured && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-[#221A40] text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                      Recommandé
                    </div>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">{p.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[36px] font-black text-[#221A40] tracking-tight">{p.price.y}€</span>
                    <span className="text-[12px] font-medium text-neutral-400">/mois</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {p.features.slice(0,5).map((f,j)=>(
                    <li key={j} className="flex items-start gap-3 text-[13px] text-neutral-600 leading-tight">
                      <div className="mt-0.5"><Check/></div>
                      {f}
                    </li>
                  ))}
                </ul>
                
                <Btn href="/app/login" variant={p.featured?"violet":"outline"} size="md" className="w-full shadow-lg transition-transform active:scale-95 group-hover:-translate-y-1">
                  {p.cta}
                </Btn>
              </div>
            </Reveal>
          ))}
        </div>
        
        <Reveal delay={300}>
          <Btn href="/tarifs" variant="outline" className="border-neutral-300">
            Détails de tous les plans <ArrowRight/>
          </Btn>
        </Reveal>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────
function CTA() {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-8 bg-[#221A40] text-center overflow-hidden">
      {/* Animated branding background */}
      <div className="absolute top-[-350px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(72,217,81,0.15)_0%,transparent_60%)] pointer-events-none animate-pulse-slow"/>
      <div className="absolute bottom-[-350px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none"/>
      
      <div className="max-w-[1160px] mx-auto relative z-10">
        <Reveal>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#48D951] mb-8">Propulsez votre activité</p>
          <ST light className="mb-6 leading-tight">C'est qu'il est temps<br className="hidden md:block"/>d'essayer l'excellence.</ST>
          <p className="text-[17px] md:text-[19px] text-white/50 max-w-[440px] mx-auto mb-12 leading-relaxed font-medium">
            Rejoignez <span className="text-white font-bold">340+ consultants</span> qui ont déjà automatisé leur croissance avec Pretalk.
          </p>
        </Reveal>
        
        <Reveal delay={160}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Btn href="/app/login" variant="green" size="lg" className="w-full sm:w-auto shadow-2xl shadow-primary-500/40 transform hover:scale-105 transition-all">
              Démarrer l'essai gratuit <ArrowRight/>
            </Btn>
            <Btn href="/contact" variant="outline-dark" size="lg" className="w-full sm:w-auto backdrop-blur-md">
              <PlayIcon/> Voir une démo live
            </Btn>
          </div>
        </Reveal>
        
        <Reveal delay={240}>
          <div className="flex items-center justify-center gap-6 text-[12px] text-white/30 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle/> Pas de CB</span>
            <span className="flex items-center gap-1.5"><CheckCircle/> Setup 5min</span>
            <span className="flex items-center gap-1.5"><CheckCircle/> Sans engagement</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── EXPORT ───────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero/>
      <ProofBar/>
      <Personas/>
      <FeatureHighlights/>
      <Pipeline/>
      <CaseStudyTeaser/>
      <PricingTeaser/>
      <CTA/>
    </>
  );
}
