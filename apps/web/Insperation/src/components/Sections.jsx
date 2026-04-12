import { useState } from "react";
import { Badge, Reveal, SectionLabel, SectionTitle, BtnPrimary, BtnOutline, BtnHero, CheckIcon, ArrowIcon, PlayIcon } from "./ui";

// ── PIPELINE ──────────────────────────────────────────────

const STEPS = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#0A0A0A" strokeWidth="1.7"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#0A0A0A" strokeWidth="1.7" strokeLinecap="round"/></svg>,
    num: "Étape 01", title: "Le prospect arrive", desc: "Via votre profil, QR code, réseaux ou lien partagé.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="12" rx="2" stroke="#0A0A0A" strokeWidth="1.7"/><path d="M8 10h8M8 13h5" stroke="#0A0A0A" strokeWidth="1.4" strokeLinecap="round"/><circle cx="19" cy="5" r="3" fill="#22C55E"/></svg>,
    num: "Étape 02", title: "L'IA qualifie", desc: "Formulaire IA + scoring automatique en temps réel.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#0A0A0A" strokeWidth="1.7"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="#0A0A0A" strokeWidth="1.5"/><path d="M9 12l2 2 4-4" stroke="#22C55E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    num: "Étape 03", title: "Vous recevez le brief", desc: "15 min avant le call : budget, objections, mots exacts à utiliser.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-5z" stroke="#0A0A0A" strokeWidth="1.7"/><path d="M14 3v5h5M9 13h6M9 17h4" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    num: "Étape 04", title: "Devis & contrat", desc: "Proposition en 3 options avec contrat adapté à la mission.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#0A0A0A" strokeWidth="1.7" strokeLinecap="round"/></svg>,
    num: "Étape 05", title: "Fidélisation auto", desc: "J+30 : avis 5 étoiles + proposition retainer mensuel.",
  },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="py-24 px-8 bg-white">
      <div className="max-w-[1160px] mx-auto">
        <Reveal>
          <div className="text-center mb-[72px]">
            <SectionLabel>Comment ça marche</SectionLabel>
            <SectionTitle className="mb-3.5">De l'inconnu à la signature<br />en 5 étapes automatisées.</SectionTitle>
          </div>
        </Reveal>

        <div className="relative grid grid-cols-5 gap-0">
          {/* Line */}
          <div className="absolute top-[31px] left-[10%] right-[10%] h-px bg-gradient-to-r from-gray-200 via-green-500 to-gray-200" />

          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="group flex flex-col items-center text-center px-3 relative z-10">
                <div className="w-[62px] h-[62px] rounded-full bg-white border-[1.5px] border-gray-200 flex items-center justify-center mb-[18px] shadow-sm transition-all duration-250 group-hover:border-green-500 group-hover:shadow-[0_0_0_5px_#dcfce7] group-hover:scale-110">
                  {s.icon}
                </div>
                <p className="text-[10px] font-bold text-gray-400 tracking-[0.07em] uppercase mb-1.5">{s.num}</p>
                <p className="text-[14px] font-bold text-black mb-1.5">{s.title}</p>
                <p className="text-xs text-gray-500 leading-[1.55]">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ──────────────────────────────────────────

const TESTIMONIALS = [
  {
    text: "\"J'arrive maintenant au premier rendez-vous avec un dossier complet sur le prospect. La réaction du client quand il voit que vous avez fait vos devoirs… c'est du closing avant même de commencer.\"",
    name: "Thomas R.", role: "Consultant Stratégie — Paris",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    badge: { label: "+€12k/mois", variant: "green" },
  },
  {
    text: "\"J'ai supprimé Typeform, Calendly et Notion. Pretalk fait tout ça, mieux, pour moins cher. Et les leads sont pré-scorés — je sais en 30 secondes si ça vaut la peine de rappeler.\"",
    name: "Sonia M.", role: "Freelance Growth — Lyon",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    badge: { label: "3 outils remplacés", variant: "violet" },
  },
  {
    text: "\"Le formulaire IA creuse les vrais besoins avant même qu'on se parle. Mes séances de coaching sont 10× plus efficaces car je connais déjà le blocage profond.\"",
    name: "Amira K.", role: "Coach Exécutive — Casablanca",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face",
    badge: { label: "×2 conversions", variant: "green" },
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-8 bg-black">
      <div className="max-w-[1160px] mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/40 mb-3.5">Ce qu'ils en disent</p>
            <h2 className="text-[clamp(30px,3.8vw,50px)] font-extrabold leading-[1.08] tracking-[-1.5px] text-white mb-3.5">
              Leurs résultats valent<br />mieux que nos arguments.
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-3 gap-[18px]">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="bg-white/5 border border-white/[0.09] rounded-3xl p-7 hover:bg-white/[0.09] hover:border-white/[0.18] hover:-translate-y-1 transition-all duration-250 cursor-default">
                <div className="text-[#F59E0B] text-xs tracking-[2px] mb-3.5">★★★★★</div>
                <p className="text-[14.5px] text-white/80 leading-[1.68] mb-5 italic">{t.text}</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-[38px] h-[38px] rounded-full object-cover" />
                  <div>
                    <p className="text-[13.5px] font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={t.badge.variant} className="text-[10px]">{t.badge.label}</Badge>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PRICING ───────────────────────────────────────────────

const PLANS = [
  {
    name: "Free", price: "0", period: "Pour toujours",
    cta: { label: "Créer mon compte", outline: true },
    features: ["1 profil public", "3 leads / mois", "1 formulaire IA", "Scoring basique"],
  },
  {
    name: "Starter", price: "19", period: "/ mois · facturation annuelle",
    cta: { label: "C'est parti !", outline: true },
    features: ["30 leads / mois", "5 formulaires IA", "Scoring avancé", "Calendrier intégré", "PDF rapport IA"],
  },
  {
    name: "Pro", price: "49", period: "/ mois · facturation annuelle",
    featured: true,
    cta: { label: "C'est parti !", outline: false },
    features: ["Leads illimités", "Audit IA complet (scraping)", "Cheat sheet Discovery Call", "Générateur devis & contrats", "Agents IA bibliothèque", "CRM Pipeline Kanban"],
  },
  {
    name: "Business", price: "99", period: "/ mois · facturation annuelle",
    cta: { label: "C'est parti !", outline: true },
    features: ["White label & domaine custom", "Multi-workspace équipe", "Webhooks & API complète", "Agents IA custom (clone)", "Intégrations Stripe & System.io", "Support prioritaire"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-8 bg-white">
      <div className="max-w-[1160px] mx-auto">
        <Reveal>
          <div className="text-center mb-4">
            <SectionLabel>Tarifs</SectionLabel>
            <SectionTitle className="mb-3.5">Investissez dans votre<br />meilleur commercial.</SectionTitle>
            <p className="text-[16px] text-gray-500 max-w-[520px] mx-auto">Commencez gratuitement. Scalez quand vous closez.</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex items-center justify-center gap-3 mb-14 text-[13.5px] text-gray-500">
            <span>Mensuel</span>
            <div className="w-[42px] h-[23px] bg-green-500 rounded-full relative cursor-pointer">
              <div className="absolute top-[3px] right-[3px] w-[17px] h-[17px] bg-white rounded-full" />
            </div>
            <span className="text-black font-semibold">Annuel</span>
            <Badge variant="green">Économisez 35%</Badge>
          </div>
        </Reveal>

        <div className="grid grid-cols-4 gap-[18px] items-start">
          {PLANS.map((plan, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className={`relative rounded-3xl p-7 border transition-all duration-200 hover:shadow-md ${plan.featured ? "border-black border-2" : "border-gray-200"}`}>
                {plan.featured && (
                  <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-3.5 py-1 rounded-full tracking-[0.06em] uppercase whitespace-nowrap">
                    Le plus populaire
                  </div>
                )}
                <p className="text-[11px] font-bold tracking-[0.09em] uppercase text-gray-400 mb-2.5">{plan.name}</p>
                <div className="text-[46px] font-extrabold tracking-[-2px] text-black leading-none mb-0.5">
                  <sup className="text-[18px] align-top mt-2.5 font-semibold">$</sup>{plan.price}
                </div>
                <p className="text-[12.5px] text-gray-400 mb-5">{plan.period}</p>
                {plan.cta.outline ? (
                  <BtnOutline href="#" className="w-full justify-center mb-5 py-[11px]">{plan.cta.label}</BtnOutline>
                ) : (
                  <BtnPrimary href="#" className="w-full justify-center mb-5 py-[11px] rounded-xl text-[13.5px]">{plan.cta.label}</BtnPrimary>
                )}
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-[12.5px] text-gray-500">
                      <CheckIcon />{f}
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

// ── FAQ ───────────────────────────────────────────────────

const FAQS = [
  {
    q: "Faut-il des compétences techniques pour utiliser Pretalk ?",
    a: "Aucune. Vous décrivez votre offre en une phrase, Pretalk construit le formulaire, le scoring et votre profil public. Si vous savez envoyer un email, vous savez utiliser Pretalk.",
  },
  {
    q: "En quoi l'audit IA est-il différent d'une recherche Google ?",
    a: "L'audit Pretalk scrappe le site web, le LinkedIn, les actualités presse et les signaux d'intention d'achat du prospect. Il synthétise tout en un brief actionnable avec les arguments de vente adaptés à ce prospect spécifique.",
  },
  {
    q: "Pretalk remplace-t-il vraiment Calendly, Typeform et Notion ?",
    a: "Oui. Pretalk intègre nativement : formulaires intelligents, prise de rendez-vous, CRM pipeline, génération de devis et suivi client. Un seul abonnement à la place de quatre.",
  },
  {
    q: "Mes données et celles de mes clients sont-elles sécurisées ?",
    a: "Pretalk est hébergé en Europe, conforme RGPD. Vos données ne sont jamais vendues ni utilisées pour entraîner des modèles tiers. Vous êtes propriétaire de 100% de vos données.",
  },
  {
    q: "Puis-je utiliser Pretalk si je débute comme consultant ?",
    a: "Absolument. Le plan Free vous permet de tester toutes les fonctionnalités clés. L'onboarding IA configure automatiquement vos offres et votre profil public en 10 minutes.",
  },
  {
    q: "Les contrats générés par l'IA sont-ils juridiquement valides ?",
    a: "Les templates sont rédigés par des juristes spécialisés en droit des services. Pour les missions complexes (+€10k), nous recommandons une validation par votre avocat.",
  },
];

function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-colors duration-200 ${open ? "border-gray-400" : "border-gray-200"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 text-[15px] font-semibold text-black flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors duration-150 text-left"
      >
        {q}
        <svg
          className={`flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-180" : ""}`}
          width="18" height="18" viewBox="0 0 18 18" fill="none"
        >
          <path d="M4.5 6.75L9 11.25l4.5-4.5" stroke="#6B6B6B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-[max-height,padding] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ maxHeight: open ? "200px" : "0" }}
      >
        <p className="px-6 pb-5 text-[14px] text-gray-500 leading-[1.7]">{a}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-24 px-8 bg-gray-50">
      <div className="max-w-[1160px] mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <SectionLabel>Questions fréquentes</SectionLabel>
            <SectionTitle>On a les réponses.<br />On les attendait.</SectionTitle>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="max-w-[820px] mx-auto flex flex-col gap-2.5">
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────

export function CTA() {
  return (
    <section className="relative py-[120px] px-8 bg-black text-center overflow-hidden">
      <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,197,94,0.13)_0%,transparent_65%)] pointer-events-none" />
      <div className="max-w-[1160px] mx-auto relative z-10">
        <Reveal><p className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/35 mb-6">Si vous êtes arrivé jusqu'ici,</p></Reveal>
        <Reveal delay={80}><SectionTitle light className="mb-3.5">C'est qu'il est temps<br />d'essayer.</SectionTitle></Reveal>
        <Reveal delay={160}>
          <p className="text-[16px] text-white/50 leading-[1.7] max-w-[400px] mx-auto mb-9">
            Rejoignez 340+ consultants qui closent avec autorité.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <BtnHero href="#" white>
              Démarrer gratuitement — c'est gratuit <ArrowIcon color="black" />
            </BtnHero>
            <BtnOutline href="#" dark>
              <PlayIcon /> Voir une démo en direct
            </BtnOutline>
          </div>
        </Reveal>
        <Reveal delay={320}>
          <p className="mt-5 text-[12.5px] text-white/35">
            Aucune carte bancaire requise · Activation en 5 minutes · Annulez à tout moment
          </p>
        </Reveal>
      </div>
    </section>
  );
}
