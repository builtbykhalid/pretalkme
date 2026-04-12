import { Badge, Reveal, SectionLabel, SectionTitle, FeaturePlaceholder } from "./ui";

const DocIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect x="4" y="4" width="28" height="28" rx="5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 12h16M10 17h10M10 22h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const ChartIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect x="4" y="4" width="28" height="28" rx="5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="9" y="20" width="4" height="8" rx="1" fill="currentColor" opacity=".3" />
    <rect x="16" y="15" width="4" height="13" rx="1" fill="currentColor" opacity=".3" />
    <rect x="23" y="10" width="4" height="18" rx="1" fill="currentColor" opacity=".5" />
  </svg>
);
const FormIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect x="4" y="4" width="13" height="28" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <rect x="20" y="4" width="12" height="28" rx="3" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2 2" />
    <path d="M8 12h6M8 17h4M8 22h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const BarsIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect x="4" y="8" width="8" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <rect x="14" y="4" width="8" height="24" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <rect x="24" y="11" width="8" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
const LineIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path d="M4 28l8-12 8 6 8-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="28" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

function FeatureBlock({ children, full = false, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className={`bg-white p-11 hover:bg-gray-50 transition-colors duration-200 ${full ? "col-span-2" : ""}`}>
        {children}
      </div>
    </Reveal>
  );
}

function FiWrap({ color = "black", children }) {
  const bg = { black: "bg-black", green: "bg-green-100", violet: "bg-violet-100" }[color];
  return (
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-[18px] ${bg}`}>
      {children}
    </div>
  );
}

const CHECK_LIST = [
  "Questions générées via prompt en langage naturel",
  "Logique conditionnelle automatique",
  "Aperçu responsive mobile/desktop en temps réel",
  "Intégration calendrier directe dans le formulaire",
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-8 bg-gray-50">
      <div className="max-w-[1160px] mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <SectionLabel>L'OS du Consultant Moderne</SectionLabel>
            <SectionTitle className="mb-3.5">Tout ce dont vous avez besoin,<br />rien de superflu.</SectionTitle>
            <p className="text-[16px] text-gray-500 leading-[1.7] max-w-[520px] mx-auto">
              De la première impression à la signature, Pretalk orchestre chaque étape de votre pipeline.
            </p>
          </div>
        </Reveal>

        {/* Grid — gap 3px between cells, outer border */}
        <div className="grid grid-cols-2 gap-px border border-gray-200 rounded-3xl overflow-hidden bg-gray-200">
          {/* Audit IA */}
          <FeatureBlock delay={80}>
            <FiWrap color="black">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="white" strokeWidth="1.7" />
                <path d="M13.5 13.5L17 17" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M7 9h4M9 7v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </FiWrap>
            <Badge variant="violet" className="mb-3">Intelligence Artificielle</Badge>
            <h3 className="text-xl font-bold tracking-[-0.3px] mb-2.5">Audit IA avant le premier mot</h3>
            <p className="text-[14.5px] text-gray-500 leading-[1.68] max-w-[380px] mb-5">
              Votre agent IA analyse le site, le LinkedIn et le contexte marché de votre prospect en 90 secondes. Vous arrivez au call avec plus d'infos que votre client lui-même.
            </p>
            <FeaturePlaceholder height={220} icon={<DocIcon />} label="Interface Audit IA · Rapport entreprise + Score maturité · 560×220px" />
          </FeatureBlock>

          {/* Lead Scoring */}
          <FeatureBlock delay={160}>
            <FiWrap color="green">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 14l4-4 3 3 5-7" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="15" cy="5" r="3" fill="#16A34A" />
              </svg>
            </FiWrap>
            <Badge variant="green" className="mb-3">Scoring Automatique</Badge>
            <h3 className="text-xl font-bold tracking-[-0.3px] mb-2.5">Plus jamais de prospect fantôme</h3>
            <p className="text-[14.5px] text-gray-500 leading-[1.68] max-w-[380px] mb-5">
              Chaque lead reçoit un score de 0 à 100. Budget, maturité, timing, fit sectoriel. Concentrez votre énergie sur ceux qui valent votre temps.
            </p>
            <FeaturePlaceholder height={220} icon={<ChartIcon />} label="Vue Kanban Leads · Badges score colorés · 560×220px" />
          </FeatureBlock>

          {/* Form Builder — full width */}
          <Reveal>
            <div className="bg-white p-11 col-span-2 hover:bg-gray-50 transition-colors duration-200">
              <div className="grid grid-cols-2 gap-12 items-center">
                <div>
                  <FiWrap color="violet">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="5" width="14" height="10" rx="2" stroke="#7C3AED" strokeWidth="1.7" />
                      <path d="M7 9h6M7 12h4" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="16" cy="4" r="2.5" fill="#22C55E" />
                    </svg>
                  </FiWrap>
                  <Badge variant="violet" className="mb-3">Form Builder IA</Badge>
                  <h3 className="text-xl font-bold tracking-[-0.3px] mb-2.5">Un formulaire qualifiant en 30 secondes</h3>
                  <p className="text-[14.5px] text-gray-500 leading-[1.68] max-w-[380px] mb-5">
                    Décrivez votre offre en une phrase. Pretalk génère les 5 questions qui filtrent les mauvais clients, creusent les vrais besoins et créent un Lead Score précis.
                  </p>
                  <ul className="flex flex-col gap-2.5 mt-4">
                    {CHECK_LIST.map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-[13.5px] text-gray-800">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill="#DCFCE7" />
                          <path d="M5 8l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <FeaturePlaceholder height={280} icon={<FormIcon />} label="Form Builder Split-View · Éditeur G / Preview D · 560×280px" />
              </div>
            </div>
          </Reveal>

          {/* Devis */}
          <FeatureBlock delay={80}>
            <FiWrap color="black">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 3h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="1.7" />
                <path d="M8 8h4M8 11h3M8 14h2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </FiWrap>
            <Badge variant="gray" className="mb-3">Post-Appel</Badge>
            <h3 className="text-xl font-bold tracking-[-0.3px] mb-2.5">Devis & contrat en 1 clic</h3>
            <p className="text-[14.5px] text-gray-500 leading-[1.68] max-w-[380px] mb-5">
              Après le call, générez une proposition en 3 options Anchor Pricing avec ROI estimé, puis attachez automatiquement les clauses juridiques adaptées.
            </p>
            <FeaturePlaceholder height={180} icon={<BarsIcon />} label="Devis 3 options Anchor Pricing · 520×180px" />
          </FeatureBlock>

          {/* Analytics */}
          <FeatureBlock delay={160}>
            <FiWrap color="green">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 14l4-5 4 3 3-6 3 3" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 17h14" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </FiWrap>
            <Badge variant="green" className="mb-3">Analytics & ROI</Badge>
            <h3 className="text-xl font-bold tracking-[-0.3px] mb-2.5">Voyez exactement ce que vous gagnez</h3>
            <p className="text-[14.5px] text-gray-500 leading-[1.68] max-w-[380px] mb-5">
              MRR, pipeline prévisionnel, heures économisées par l'IA, taux de conversion. Pilotez votre activité comme une vraie entreprise.
            </p>
            <FeaturePlaceholder height={180} icon={<LineIcon />} label="Dashboard Analytics · Graphique + KPI · 520×180px" />
          </FeatureBlock>
        </div>
      </div>
    </section>
  );
}
