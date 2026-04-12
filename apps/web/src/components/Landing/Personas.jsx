import { Badge, Reveal, SectionLabel, SectionTitle, PersonaPhoto } from "./ui";

const PERSONAS = [
  {
    accent: "border-t-black",
    badge: { label: "Conseil · Stratégie", variant: "gray" },
    photo: { label: "📸 Portrait Consultant H 40-50ans" },
    title: "Le Consultant\nHigh-Ticket",
    tagline: "Finance, Management, Stratégie. Vous vendez cher. Chaque heure compte.",
    pain: "\"J'arrive à des calls de découverte sans savoir si le prospect peut payer. Je perds 4h par semaine.\"",
    dotColor: "bg-green-500",
    features: [
      "Audit IA complet avant le 1er appel",
      "Scoring automatique budget & maturité",
      "Cheat sheet Discovery Call IA",
      "Devis Anchor Pricing en 1 clic",
    ],
  },
  {
    accent: "border-t-green-500",
    badge: { label: "Design · Dev · Growth", variant: "green" },
    photo: { label: "📸 Solopreneur 28-35ans", bg: "bg-green-50", border: "border-green-200" },
    title: "L'Agence Solo\nSolopreneur",
    tagline: "Design, Dev, Growth. Vous gérez 15 outils. Il n'en faut qu'un.",
    pain: "\"Typeform + Calendly + Stripe + Notion + Brevo... 300€/mois d'outils qui ne se parlent pas.\"",
    dotColor: "bg-green-500",
    features: [
      "Profil public premium vitrine digitale",
      "Form builder créé via prompt IA",
      "Gestion financière MRR intégrée",
      "Remplace 5 outils en un seul",
    ],
  },
  {
    accent: "border-t-violet-600",
    badge: { label: "Coaching · RH · Vente", variant: "violet" },
    photo: { label: "📸 Coach F 35-45ans", bg: "bg-violet-50", border: "border-violet-200" },
    title: "Le Coach &\nConseiller Expert",
    tagline: "Relation humaine d'abord. L'IA fait le reste en coulisses.",
    pain: "\"Je découvre le vrai problème du prospect pendant l'appel. Trop tard pour préparer ma proposition.\"",
    dotColor: "bg-violet-600",
    features: [
      "Formulaires dynamiques IA conversationnels",
      "Bibliothèque d'agents IA spécialisés",
      "Calendrier permanent intégré",
      "Suivi de fidélisation automatisé",
    ],
  },
];

function PersonaCard({ persona, delay }) {
  return (
    <Reveal delay={delay}>
      <div className={`border border-gray-200 border-t-[3px] ${persona.accent} rounded-3xl p-8 bg-white hover:shadow-lg hover:-translate-y-1.5 transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] cursor-default`}>
        <PersonaPhoto
          label={persona.photo.label}
          bg={persona.photo.bg}
          border={persona.photo.border}
        />
        <div className="mb-3">
          <Badge variant={persona.badge.variant}>{persona.badge.label}</Badge>
        </div>
        <h3 className="text-[19px] font-bold tracking-[-0.3px] mb-2 whitespace-pre-line">{persona.title}</h3>
        <p className="text-[13.5px] text-gray-500 mb-[18px] leading-[1.55]">{persona.tagline}</p>
        <div className="bg-gray-50 rounded-lg px-3.5 py-3 text-[13px] text-gray-700 mb-4 border-l-[3px] border-gray-200 italic leading-[1.55]">
          {persona.pain}
        </div>
        <ul className="flex flex-col gap-2.5">
          {persona.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2.5 text-[13px] text-gray-800">
              <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${persona.dotColor}`} />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function Personas() {
  return (
    <section id="personas" className="py-24 px-8 bg-white">
      <div className="max-w-[1160px] mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <SectionLabel>Fait pour vous</SectionLabel>
            <SectionTitle className="mb-3.5">Quel consultant êtes-vous ?</SectionTitle>
            <p className="text-[16px] text-gray-500 leading-[1.7] max-w-[520px] mx-auto">
              Que vous vendiez du high-ticket, juggliez 20 clients, ou vendiez à l'humain — Pretalk s'adapte à votre réalité.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-3 gap-[22px]">
          {PERSONAS.map((p, i) => (
            <PersonaCard key={i} persona={p} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
