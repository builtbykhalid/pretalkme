import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge, Btn, Reveal, SL, ST, GlassCard, Check, CheckCircle, ArrowRight, PlayIcon } from "../components/ui";
import { CASE_STUDIES, PLANS } from "../data/index";

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
    <section className="relative min-h-screen bg-white flex items-center overflow-hidden">
      <div className="absolute top-[-80px] right-[-180px] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(34,197,94,0.07)_0%,transparent_65%)] pointer-events-none"/>
      <div className="absolute bottom-0 left-[-100px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(124,58,237,0.04)_0%,transparent_65%)] pointer-events-none"/>
      <div className="max-w-[1160px] mx-auto px-8 w-full grid grid-cols-2 gap-16 items-center min-h-[calc(100vh-60px)]">
        <div>
          <Reveal>
            <div className="mb-6"><Badge variant="green" dot>Agents IA — Maintenant disponibles</Badge></div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-[clamp(38px,5vw,64px)] font-extrabold leading-[1.04] tracking-[-2.5px] text-black mb-6">
              Transformez chaque<br/>prospect en client<br/>
              <span className="text-shimmer">avant de parler.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-[17px] text-gray-500 leading-[1.72] max-w-[460px] mb-9">
              Pretalk automatise votre cycle de vente : qualification IA, audit client, scoring, devis et contrats. Closez 3× plus vite sans sacrifier votre positionnement expert.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex items-center gap-3 flex-wrap">
              <Btn to="/tarifs" variant="black" size="lg">Démarrer gratuitement <ArrowRight/></Btn>
              <Btn to="/comment-ca-marche" variant="outline" size="lg"><PlayIcon/> Voir la démo</Btn>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="flex items-center gap-3.5 mt-11 pt-7 border-t border-gray-200">
              <div className="flex">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" style={{ marginLeft: i===0?0:-8 }}/>
                ))}
              </div>
              <div>
                <div className="text-[#F59E0B] text-xs tracking-widest mb-0.5">★★★★★</div>
                <span className="text-[13px] text-gray-500"><strong className="text-black font-semibold">+340 consultants</strong> closent mieux ce mois-ci</span>
              </div>
            </div>
          </Reveal>
        </div>
        {/* RIGHT - image slot */}
        <Reveal delay={160} dir="right">
          <div className="h-[560px] flex items-center justify-center">
            <div className="w-full h-full rounded-3xl border-[1.5px] border-dashed border-gray-300 bg-gradient-to-br from-[#F4F7FF] via-[#F9FAFB] to-[#F4FFF8] flex flex-col items-center justify-center gap-4 text-gray-400 p-8 text-center">
              <svg className="opacity-30" width="52" height="52" viewBox="0 0 52 52" fill="none">
                <rect x="8" y="8" width="36" height="36" rx="7" stroke="currentColor" strokeWidth="2"/>
                <circle cx="21" cy="22" r="5" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 38l10-10 7 7 7-9 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[12px] font-semibold tracking-[0.06em] uppercase leading-[1.7]">
                Image principale<br/>Consultant 35 ans · Costume sombre<br/>Stylo digital · PNG fond transparent<br/>Cadrage 3/4 corps entier
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── PROOF BAR ─────────────────────────────────────────────
function ProofBar() {
  return (
    <div id="proof-bar" className="bg-gray-50 border-y border-gray-200 py-5 px-8">
      <div className="max-w-[1160px] mx-auto flex items-center justify-center gap-12 flex-wrap">
        {[
          { val:340, suffix:"+", label:"Consultants actifs" },
          { val:"€2.1M", label:"Générés via Pretalk" },
          { val:"3×", label:"Taux de closing moyen" },
          { val:"38h", label:"Économisées / mois" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[26px] font-extrabold text-black tracking-[-0.8px]">
              <CountNum target={s.val} suffix={s.suffix||""}/>
            </span>
            <span className="text-[13px] text-gray-500">{s.label}</span>
            {i<3 && <div className="w-px h-8 bg-gray-200 ml-9"/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PERSONAS ──────────────────────────────────────────────
const PERSONAS = [
  { accent:"border-t-black", badge:"Conseil · Stratégie", bv:"gray", title:"Le Consultant\nHigh-Ticket", tag:"Finance, Management, Stratégie.", pain:"\"J'arrive à des calls sans savoir si le prospect peut payer. Je perds 4h par semaine.\"", dot:"bg-black", feats:["Audit IA complet avant le 1er appel","Scoring automatique budget & maturité","Cheat sheet Discovery Call IA","Devis Anchor Pricing en 1 clic"] },
  { accent:"border-t-green-500", badge:"Design · Dev · Growth", bv:"green", title:"L'Agence Solo\nSolopreneur", tag:"Design, Dev, Growth. Vous gérez 15 outils.", pain:"\"Typeform + Calendly + Stripe + Notion + Brevo... 300€/mois d'outils qui ne se parlent pas.\"", dot:"bg-green-500", feats:["Profil public premium vitrine digitale","Form builder créé via prompt IA","Gestion financière MRR intégrée","Remplace 5 outils en un seul"] },
  { accent:"border-t-violet-600", badge:"Coaching · RH · Vente", bv:"violet", title:"Le Coach &\nConseiller Expert", tag:"Relation humaine d'abord. L'IA en coulisses.", pain:"\"Je découvre le vrai problème du prospect pendant l'appel. Trop tard pour préparer.\"", dot:"bg-violet-600", feats:["Formulaires dynamiques IA conversationnels","Bibliothèque d'agents IA spécialisés","Calendrier permanent intégré","Suivi de fidélisation automatisé"] },
];

function Personas() {
  return (
    <section className="py-24 px-8 bg-white">
      <div className="max-w-[1160px] mx-auto">
        <Reveal><div className="text-center mb-16"><SL>Fait pour vous</SL><ST className="mb-3.5">Quel consultant êtes-vous ?</ST><p className="text-[16px] text-gray-500 leading-[1.7] max-w-[520px] mx-auto">Que vous vendiez du high-ticket, juggliez 20 clients, ou vendiez à l'humain — Pretalk s'adapte à votre réalité.</p></div></Reveal>
        <div className="grid grid-cols-3 gap-6">
          {PERSONAS.map((p, i) => (
            <Reveal key={i} delay={i*80}>
              <div className={`border border-gray-200 border-t-[3px] ${p.accent} rounded-3xl p-8 bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-[300ms] ease-spring cursor-default`}>
                <div className="w-16 h-16 rounded-xl bg-gray-100 mb-5 border border-dashed border-gray-200 flex items-center justify-center">
                  <span className="text-[9px] text-gray-400 font-semibold uppercase text-center leading-tight px-1">📸 Persona</span>
                </div>
                <div className="mb-3"><Badge variant={p.bv}>{p.badge}</Badge></div>
                <h3 className="text-[18px] font-bold tracking-[-0.3px] mb-2 whitespace-pre-line">{p.title}</h3>
                <p className="text-[13px] text-gray-500 mb-4 leading-[1.55]">{p.tag}</p>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-[12.5px] text-gray-700 mb-4 border-l-[3px] border-gray-200 italic leading-snug">{p.pain}</div>
                <ul className="flex flex-col gap-2">
                  {p.feats.map((f,j)=>(
                    <li key={j} className="flex items-center gap-2.5 text-[12.5px] text-gray-800">
                      <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${p.dot}`}/>
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
    { color:"bg-black", iconStroke:"white", title:"Audit IA", desc:"Analyse complète du prospect en 90s. Brief envoyé 15 min avant le call.", badge:"IA", bv:"violet" },
    { color:"bg-green-50", iconStroke:"#16A34A", title:"Lead Scoring", desc:"Score 0-100 automatique. Budget, maturité, timing, fit.", badge:"Auto", bv:"green" },
    { color:"bg-violet-50", iconStroke:"#7C3AED", title:"Form Builder IA", desc:"Formulaire qualifiant généré en 30 secondes via prompt.", badge:"IA", bv:"violet" },
    { color:"bg-amber-50", iconStroke:"#F59E0B", title:"Devis & Contrats", desc:"Propositions Anchor Pricing + contrats juridiques en 1 clic.", badge:"Post-appel", bv:"amber" },
    { color:"bg-gray-50", iconStroke:"#6B6B6B", title:"CRM Pipeline", desc:"Kanban leads drag & drop. Suivi client centralisé.", badge:"CRM", bv:"gray" },
    { color:"bg-green-50", iconStroke:"#16A34A", title:"Analytics & ROI", desc:"MRR, pipeline prévisionnel, heures sauvées par l'IA.", badge:"Data", bv:"green" },
  ];
  return (
    <section className="py-24 px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1160px] mx-auto">
        <Reveal><div className="text-center mb-16"><SL>L'OS du Consultant</SL><ST className="mb-3.5">Tout ce dont vous avez besoin,<br/>rien de superflu.</ST><p className="text-[16px] text-gray-500 max-w-[480px] mx-auto leading-[1.7]">De la qualification au closing, Pretalk orchestre chaque étape de votre pipeline.</p></div></Reveal>
        <div className="grid grid-cols-3 gap-5">
          {feats.map((f, i) => (
            <Reveal key={i} delay={i*60} dir={i%3===0?"left":i%3===2?"right":"up"}>
              <div className="group glass-card rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-[280ms] ease-spring cursor-default">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 9h12M9 3l6 6-6 6" stroke={f.iconStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <Badge variant={f.bv} className="mb-3 text-[10px]">{f.badge}</Badge>
                <h3 className="text-[16px] font-bold mb-2">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-[1.6]">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="text-center mt-10">
            <Btn to="/fonctionnalites" variant="outline" size="md">Voir toutes les fonctionnalités <ArrowRight/></Btn>
          </div>
        </Reveal>
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

function Pipeline() {
  return (
    <section className="py-24 px-8 bg-white">
      <div className="max-w-[1160px] mx-auto">
        <Reveal><div className="text-center mb-20"><SL>Comment ça marche</SL><ST className="mb-3.5">De l'inconnu à la signature<br/>en 5 étapes automatisées.</ST></div></Reveal>
        <div className="relative grid grid-cols-5 gap-0">
          <div className="absolute top-[30px] left-[10%] right-[10%] h-px bg-gradient-to-r from-gray-200 via-green-500 to-gray-200"/>
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i*80}>
              <div className="group flex flex-col items-center text-center px-3 relative z-10">
                <div className="w-[62px] h-[62px] rounded-full bg-white border-[1.5px] border-gray-200 flex items-center justify-center mb-5 shadow-sm transition-all duration-250 group-hover:border-green-500 group-hover:shadow-[0_0_0_6px_rgba(34,197,94,0.12)] group-hover:scale-110">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d={s.icon} stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-[9px] font-bold text-gray-400 tracking-[0.1em] uppercase mb-1">Étape {s.n}</p>
                <p className="text-[13px] font-bold text-black mb-1.5">{s.t}</p>
                <p className="text-[11.5px] text-gray-500 leading-[1.55]">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={400}>
          <div className="text-center mt-14">
            <Btn to="/comment-ca-marche" variant="outline">Voir la démo complète <ArrowRight/></Btn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── CASE STUDY TEASER ─────────────────────────────────────
function CaseStudyTeaser() {
  const featured = CASE_STUDIES[0];
  return (
    <section className="py-24 px-8 bg-black overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,197,94,0.08)_0%,transparent_65%)] pointer-events-none"/>
      <div className="max-w-[1160px] mx-auto">
        <Reveal><div className="mb-16"><SL light>Cas Clients</SL><ST light className="mb-3.5">Leurs résultats valent<br/>mieux que nos arguments.</ST></div></Reveal>
        <div className="grid grid-cols-[1.4fr_1fr] gap-8 items-center">
          <Reveal dir="left">
            <div className="relative rounded-2xl overflow-hidden group">
              <img src={featured.cover} alt={featured.title} className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <span className="text-[10px] font-bold bg-white/10 text-white px-2.5 py-1 rounded-full backdrop-blur-sm mb-3 inline-block">{featured.category}</span>
                <h3 className="text-[20px] font-bold text-white leading-snug">{featured.title}</h3>
                <div className="flex gap-4 mt-4">
                  {featured.metrics.map((m,i)=>(
                    <div key={i} className="glass-dark px-3 py-1.5 rounded-xl">
                      <div className={`text-[16px] font-extrabold ${m.color}`}>{m.value}</div>
                      <div className="text-[10px] text-white/50">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80} dir="right">
            <div className="flex flex-col gap-4">
              {CASE_STUDIES.slice(1, 4).map((cs, i) => (
                <Link key={i} to={`/blog/${cs.slug}`} className="group glass-dark rounded-2xl p-5 hover:bg-white/[0.08] transition-all duration-200 no-underline block">
                  <div className="flex items-center gap-4">
                    <img src={cs.cover} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0"/>
                    <div className="min-w-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cs.badgeClass}`}>{cs.category}</span>
                      <p className="text-[13px] font-semibold text-white mt-1 leading-snug group-hover:text-green-400 transition-colors line-clamp-2">{cs.title}</p>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      {cs.metrics[0] && <span className={`text-[15px] font-extrabold ${cs.metrics[0].color}`}>{cs.metrics[0].value}</span>}
                    </div>
                  </div>
                </Link>
              ))}
              <Link to="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[13px] font-medium mt-2 px-1">
                Tous les cas clients <ArrowRight size={14}/>
              </Link>
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
    <section className="py-24 px-8 bg-gray-50">
      <div className="max-w-[1160px] mx-auto text-center">
        <Reveal><SL>Tarifs</SL><ST className="mb-3.5">Commencez gratuitement.<br/>Scalez quand vous closez.</ST></Reveal>
        <Reveal delay={80}><p className="text-[16px] text-gray-500 mb-12 max-w-[480px] mx-auto leading-[1.7]">De $0 à $99/mois. Aucune carte bancaire requise pour démarrer.</p></Reveal>
        <Reveal delay={160}>
          <div className="grid grid-cols-4 gap-5 text-left mb-10">
            {PLANS.map((p, i) => (
              <div key={i} className={`rounded-2xl p-6 border-[1.5px] transition-all hover:shadow-md ${p.featured?"border-black bg-white shadow-sm":"border-gray-200 bg-white"}`}>
                {p.featured && <div className="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-2.5 py-1 rounded-full inline-block mb-3">Populaire</div>}
                <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-gray-400 mb-2">{p.name}</p>
                <div className="text-[38px] font-extrabold tracking-[-1.5px] text-black leading-none mb-0.5"><sup className="text-[16px] align-top mt-2 font-semibold">$</sup>{p.price.y}</div>
                <p className="text-[11px] text-gray-400 mb-4">{p.period}</p>
                <ul className="flex flex-col gap-1.5 mb-5">
                  {p.features.slice(0,4).map((f,j)=>(<li key={j} className="flex items-center gap-2 text-[12px] text-gray-600"><Check/>{f}</li>))}
                </ul>
                <Btn to="/tarifs" variant={p.featured?"black":"outline"} size="sm" className="w-full justify-center">{p.cta}</Btn>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={240}><Btn to="/tarifs" variant="outline">Comparer tous les plans <ArrowRight/></Btn></Reveal>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────
function CTA() {
  return (
    <section className="relative py-[120px] px-8 bg-black text-center overflow-hidden">
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(34,197,94,0.12)_0%,transparent_60%)] pointer-events-none"/>
      <div className="max-w-[1160px] mx-auto relative z-10">
        <Reveal><p className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/35 mb-6">Si vous êtes arrivé jusqu'ici,</p></Reveal>
        <Reveal delay={80}><ST light className="mb-4">C'est qu'il est temps<br/>d'essayer.</ST></Reveal>
        <Reveal delay={160}><p className="text-[16px] text-white/50 max-w-[380px] mx-auto mb-10 leading-[1.7]">Rejoignez 340+ consultants qui closent avec autorité.</p></Reveal>
        <Reveal delay={240}>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Btn to="/tarifs" variant="white" size="lg">Démarrer gratuitement <ArrowRight color="black"/></Btn>
            <Btn to="/contact" variant="outline-dark" size="lg"><PlayIcon/> Voir une démo en direct</Btn>
          </div>
        </Reveal>
        <Reveal delay={320}><p className="mt-5 text-[12px] text-white/30">Aucune carte bancaire · Activation en 5 min · Annulez à tout moment</p></Reveal>
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
