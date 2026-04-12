// ── CASE STUDIES ─────────────────────────────────────────
export const CASE_STUDIES = [
  {
    slug: "thomas-3x-closing",
    category: "Conseil Stratégie",
    badgeClass: "bg-black text-white",
    title: "Comment Thomas a multiplié son taux de closing par 3 en 60 jours",
    excerpt: "Consultant senior en stratégie, Thomas perdait 6h par semaine sur des prospects hors budget. Pretalk a transformé son processus de découverte.",
    readTime: "8 min",
    date: "15 mars 2025",
    author: { name: "Équipe Pretalk", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" },
    cover: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&h=500&fit=crop",
    metrics: [{ label: "Taux de closing", value: "×3", color: "text-green-600" }, { label: "Temps économisé", value: "6h/sem", color: "text-violet-600" }, { label: "MRR additionnel", value: "+€18k", color: "text-black" }],
    tags: ["Closing", "Audit IA", "High-Ticket"],
    featured: true,
    content: [
      { type: "intro", text: "Thomas Renard est consultant en stratégie senior depuis 12 ans. Il facture ses missions entre €5 000 et €25 000. Pourtant, malgré son expertise et son réseau solide, il constatait un problème récurrent : ses rendez-vous de découverte étaient trop souvent des pertes de temps." },
      { type: "h2", text: "Le problème : des calls de découverte chronophages" },
      { type: "text", text: "Avant Pretalk, Thomas passait en moyenne 45 minutes à préparer chaque rendez-vous de découverte — et la moitié de ses prospects n'avaient tout simplement pas le budget pour ses services. Il calculait perdre entre 5 et 7 heures par semaine en appels non-qualifiés." },
      { type: "quote", text: "\"Je rentrais dans des réunions en sachant presque rien sur le prospect. La moitié du temps passé à comprendre qui ils étaient, c'était du temps perdu pour les deux parties.\"", author: "Thomas R., Consultant Stratégie" },
      { type: "h2", text: "La solution : l'audit IA pré-call de Pretalk" },
      { type: "text", text: "En intégrant Pretalk, Thomas a activé l'Audit IA. Désormais, 15 minutes avant chaque rendez-vous, il reçoit un brief complet : taille de l'entreprise, dernières actualités presse, signaux d'intention d'achat, estimation du budget disponible, et les 3 arguments de vente les plus pertinents pour ce prospect spécifique." },
      { type: "h2", text: "Résultats après 60 jours" },
      { type: "text", text: "En deux mois, le taux de closing de Thomas est passé de 18% à 54%. Il a également réduit son cycle de vente moyen de 3 semaines à 9 jours. Le chiffre qu'il retient le plus : il a économisé 38 heures sur la période — soit presque une semaine de travail." },
    ],
  },
  {
    slug: "sonia-5-outils-remplaces",
    category: "Solopreneur",
    badgeClass: "bg-green-100 text-green-800",
    title: "Sonia remplace 5 outils et économise 340€/mois",
    excerpt: "Freelance Growth depuis 4 ans, Sonia jonglait entre Typeform, Calendly, Notion, Brevo et Stripe. Un seul abonnement Pretalk pour tout centraliser.",
    readTime: "6 min",
    date: "28 fév. 2025",
    author: { name: "Équipe Pretalk", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
    cover: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&h=500&fit=crop",
    metrics: [{ label: "Économies / mois", value: "€340", color: "text-green-600" }, { label: "Outils remplacés", value: "5", color: "text-violet-600" }, { label: "Leads qualifiés", value: "+120%", color: "text-black" }],
    tags: ["Solopreneur", "Stack", "Productivité"],
    featured: false,
    content: [
      { type: "intro", text: "Sonia Marchand est freelance en Growth Marketing depuis 4 ans. Elle gère seule son activité, ses clients, et sa prospection. Son problème ? Un stack d'outils qui coûtait cher, ne se parlait pas, et consommait 3h de setup chaque semaine." },
      { type: "h2", text: "Un stack fragmenté à €340/mois" },
      { type: "text", text: "Typeform (€50/mois), Calendly (€12/mois), Notion (€16/mois), Brevo (€89/mois), Stripe (frais variables ~€173/mois) — la facture mensuelle de ses outils dépassait les €340. Sans compter le temps perdu à synchroniser les données entre eux." },
      { type: "quote", text: "\"J'avais cinq onglets ouverts en permanence et des données partout. Un lead remplissait mon Typeform, je devais manuellement le copier dans Notion, lui envoyer un Calendly, puis relancer depuis Brevo. C'était épuisant.\"", author: "Sonia M., Freelance Growth" },
      { type: "h2", text: "Tout centralisé en une semaine" },
      { type: "text", text: "En 7 jours, Sonia a migré l'intégralité de son stack vers Pretalk. Le formulaire IA a remplacé Typeform avec des questions bien plus qualifiantes. Le calendrier intégré a remplacé Calendly. Et la gestion financière Pretalk lui donne une vision MRR qu'elle n'avait jamais eue auparavant." },
    ],
  },
  {
    slug: "amira-coach-conversion",
    category: "Coaching",
    badgeClass: "bg-violet-100 text-violet-700",
    title: "Amira double son taux de conversion avec les formulaires IA",
    excerpt: "Coach exécutive, Amira ne découvrait le vrai besoin de ses prospects qu'en séance. Le formulaire conversationnel de Pretalk a changé la donne.",
    readTime: "7 min",
    date: "10 jan. 2025",
    author: { name: "Équipe Pretalk", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face" },
    cover: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=500&fit=crop",
    metrics: [{ label: "Taux de conversion", value: "×2", color: "text-green-600" }, { label: "Temps qualification", value: "–45min", color: "text-violet-600" }, { label: "Score NPS", value: "94", color: "text-black" }],
    tags: ["Coaching", "Formulaires IA", "Conversion"],
    featured: false,
    content: [
      { type: "intro", text: "Amira Khelil est coach exécutive certifiée depuis 8 ans. Ses clients sont des dirigeants et managers qui traversent des transitions professionnelles majeures. Son défi : comprendre le vrai besoin du prospect avant même la première séance d'exploration." },
      { type: "h2", text: "Le problème : découvrir trop tard" },
      { type: "text", text: "Amira recevait des demandes de coaching via un formulaire basique. Le problème : les prospects remplissaient les cases avec des réponses superficielles. Elle ne découvrait le vrai blocage — souvent émotionnel ou relationnel — que pendant la séance de 60 minutes, ce qui rendait sa proposition commerciale peu précise et son taux de conversion faible." },
      { type: "quote", text: "\"Je passais une heure à explorer avant de pouvoir proposer quoi que ce soit. Souvent, mes propositions n'étaient pas assez ciblées parce que je n'avais pas le vrai contexte.\"", author: "Amira K., Coach Exécutive" },
      { type: "h2", text: "Des formulaires qui creusent vraiment" },
      { type: "text", text: "Le form builder IA de Pretalk a généré un parcours de 7 questions conversationnelles adaptées au coaching exécutif. Chaque réponse déclenche une question de suivi intelligente. En 12 minutes, Amira reçoit un profil psychologique complet du prospect avec ses blocages principaux identifiés." },
    ],
  },
  {
    slug: "marc-50k-mrr",
    category: "Agence",
    badgeClass: "bg-amber-100 text-amber-700",
    title: "Marc structure son pipeline et atteint €50k MRR en 3 mois",
    excerpt: "Fondateur d'une micro-agence digital, Marc n'avait aucun process de vente. Pretalk lui a permis de construire un pipeline reproductible et prévisible.",
    readTime: "9 min",
    date: "5 déc. 2024",
    author: { name: "Équipe Pretalk", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" },
    cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=500&fit=crop",
    metrics: [{ label: "MRR atteint", value: "€50k", color: "text-green-600" }, { label: "Délai", value: "3 mois", color: "text-black" }, { label: "Leads / mois", value: "+85", color: "text-violet-600" }],
    tags: ["Agence", "Pipeline", "MRR"],
    featured: false,
    content: [
      { type: "intro", text: "Marc Dupont dirige une micro-agence de 3 personnes spécialisée en marketing digital. Il avait de bons clients mais aucun process de vente structuré — tout reposait sur son réseau et le bouche-à-oreille." },
      { type: "h2", text: "Zéro process, zéro prévisibilité" },
      { type: "text", text: "Sans CRM, sans formulaire de qualification, sans scoring, Marc ne savait jamais d'où viendrait son prochain client. Ses revenus variaient de €15k à €60k selon les mois. Il ne pouvait pas recruter, pas investir, pas scaler." },
      { type: "quote", text: "\"Je ne savais pas combien je gagnerais le mois prochain. C'était épuisant. J'avais besoin d'un système, pas juste d'un outil.\"", author: "Marc D., Fondateur Agence Digital" },
      { type: "h2", text: "Un pipeline en 30 jours" },
      { type: "text", text: "En un mois, Marc a déployé le CRM Kanban Pretalk, créé 3 formulaires de qualification par type de service, et activé les automations de relance. Son pipeline est passé de 0 à 85 leads qualifiés par mois — avec un taux de closing de 22%." },
    ],
  },
];

// ── FEATURES ─────────────────────────────────────────────
export const FEATURES = [
  {
    id:"audit", badge:"IA", badgeColor:"violet",
    icon: null, // SVG inline in component
    title:"Audit IA — Connaissez votre prospect mieux que lui-même",
    desc:"En 90 secondes, votre agent IA analyse le site, le LinkedIn et le contexte marché du prospect. Vous arrivez au call avec un brief complet : budget estimé, défis actuels, arguments de vente personnalisés.",
    points:["Scraping site web + LinkedIn en temps réel","Analyse actualités presse & signaux d'intention","Estimation budget et maturité d'achat","Brief envoyé 15 min avant le rendez-vous"],
  },
  {
    id:"scoring", badge:"Scoring", badgeColor:"green",
    title:"Lead Scoring — Concentrez-vous sur les leads qui comptent",
    desc:"Pretalk calcule un score de 0 à 100 pour chaque prospect. Budget, maturité, timing, fit sectoriel. Fini de perdre 2h sur un lead qui ne convertira jamais.",
    points:["Score calculé en temps réel pendant le formulaire","4 dimensions : budget, maturité, timing, fit","Alertes automatiques pour les leads score >80","Historique et évolution du score dans le temps"],
  },
  {
    id:"forms", badge:"Form Builder", badgeColor:"gray",
    title:"Form Builder IA — Un formulaire qualifiant en 30 secondes",
    desc:"Décrivez votre offre en langage naturel. Pretalk génère automatiquement les questions qui filtrent les mauvais clients, creusent les vrais besoins et créent un profil précis du prospect.",
    points:["Questions générées via prompt langage naturel","Logique conditionnelle et branchements auto","Aperçu responsive mobile/desktop temps réel","A/B testing intégré pour optimiser les taux"],
  },
  {
    id:"proposals", badge:"Post-Appel", badgeColor:"amber",
    title:"Devis & Contrats — De l'appel à la signature en 1 clic",
    desc:"Après le call, générez en un clic une proposition en 3 options Anchor Pricing avec ROI estimé. Le contrat juridique adapté à la mission est attaché automatiquement.",
    points:["Devis en 3 options (Starter/Pro/Premium)","ROI estimé calculé depuis les données prospect","Contrats juridiques adaptés par type de mission","Envoi email via Brevo intégré nativement"],
  },
  {
    id:"analytics", badge:"Analytics", badgeColor:"violet",
    title:"Analytics & ROI — Pilotez comme une vraie entreprise",
    desc:"MRR réel, pipeline prévisionnel, taux de conversion par source, heures économisées par l'IA. Fini la gestion au feeling.",
    points:["MRR et ARR calculés en temps réel","Pipeline prévisionnel basé sur devis en cours","Taux de conversion par source et canal","Widget 'heures sauvées IA' mis à jour en continu"],
  },
  {
    id:"crm", badge:"CRM", badgeColor:"green",
    title:"CRM Pipeline — Gérez vos clients comme un pro",
    desc:"Kanban drag & drop : Nouveaux → Appel → Proposition → Gagné/Perdu. Chaque fiche client centralise l'historique, les notes de call, les documents signés, les relances auto.",
    points:["Kanban drag & drop personnalisable","Fiche client complète avec historique complet","Notes de call transcrites et résumées par IA","Relances automatiques configurables par statut"],
  },
];

// ── PLANS ─────────────────────────────────────────────────
export const PLANS = [
  { name:"Free",     price:{m:"0",y:"0"},   period:"Pour toujours", featured:false, cta:"Créer mon compte", outline:true,  features:["1 profil public","3 leads / mois","1 formulaire IA","Scoring basique","Support communauté"] },
  { name:"Starter",  price:{m:"25",y:"19"}, period:"/ mois",        featured:false, cta:"C'est parti !",   outline:true,  features:["30 leads / mois","5 formulaires IA","Scoring avancé","Calendrier intégré","PDF rapport IA","Email support"] },
  { name:"Pro",      price:{m:"65",y:"49"}, period:"/ mois",        featured:true,  cta:"C'est parti !",   outline:false, features:["Leads illimités","Audit IA complet (scraping)","Cheat sheet Discovery Call","Générateur devis & contrats","Agents IA bibliothèque","CRM Pipeline Kanban","Intégrations Stripe & System.io"] },
  { name:"Business", price:{m:"129",y:"99"},period:"/ mois",        featured:false, cta:"Nous contacter",  outline:true,  features:["White label & domaine custom","Multi-workspace équipe","Webhooks & API complète","Agents IA custom (clone)","Toutes intégrations","SLA garanti 99.9%","Support prioritaire dédié"] },
];

// ── FAQS ──────────────────────────────────────────────────
export const FAQS = [
  { cat:"Général", q:"Faut-il des compétences techniques ?", a:"Aucune. Vous décrivez votre offre en une phrase, Pretalk construit le formulaire, le scoring et votre profil public. Si vous savez envoyer un email, vous savez utiliser Pretalk." },
  { cat:"Général", q:"Pretalk remplace-t-il Calendly, Typeform et Notion ?", a:"Oui. Pretalk intègre nativement : formulaires intelligents, prise de rendez-vous, CRM pipeline, génération de devis et suivi client. Un seul abonnement à la place de quatre — et tout se parle." },
  { cat:"IA", q:"En quoi l'audit IA diffère d'une recherche Google ?", a:"L'audit Pretalk scrappe le site web, LinkedIn, les actualités presse et les signaux d'intention d'achat. Il synthétise tout en un brief actionnable avec les arguments de vente adaptés à ce prospect spécifique — en 90 secondes." },
  { cat:"IA", q:"Les questions du formulaire sont-elles vraiment générées par l'IA ?", a:"Oui. Vous décrivez votre offre et votre client idéal, l'IA génère les questions les plus pertinentes pour qualifier ce prospect. Vous pouvez affiner, supprimer ou réorganiser ensuite." },
  { cat:"Données", q:"Mes données sont-elles sécurisées ?", a:"Pretalk est hébergé en Europe (AWS Paris), conforme RGPD. Vos données ne sont jamais vendues ni utilisées pour entraîner des modèles tiers. Vous êtes propriétaire de 100% de vos données et pouvez les exporter à tout moment." },
  { cat:"Données", q:"Puis-je importer mes leads depuis un autre CRM ?", a:"Oui. Import CSV compatible HubSpot, Notion, Airtable et la plupart des CRMs du marché. L'import prend moins de 5 minutes et les données sont immédiatement scorées." },
  { cat:"Tarifs", q:"Puis-je changer de plan à tout moment ?", a:"Absolument. Upgrade ou downgrade à tout moment. En cas d'upgrade en cours de mois, vous ne payez que le différentiel au prorata. Annulation en 1 clic, aucun engagement." },
  { cat:"Tarifs", q:"Y a-t-il des frais cachés ou commissions sur mes ventes ?", a:"Aucun. Pretalk ne prend aucune commission sur vos ventes ou contrats. Vous payez uniquement votre abonnement mensuel ou annuel, c'est tout." },
  { cat:"Juridique", q:"Les contrats IA sont-ils juridiquement valides ?", a:"Les templates sont rédigés par des juristes spécialisés en droit des services. Pour les missions complexes (+€10k), nous recommandons une validation par votre avocat." },
];

// ── MEGA MENU NAV FEATURES ────────────────────────────────
export const NAV_FEATURES = [
  { label:"Audit IA",       desc:"Analyse prospect en 90s",           href:"/fonctionnalites#audit",     iconPath:"M9 9a3 3 0 106 0 3 3 0 00-6 0zM17 17l-4-4", color:"bg-violet-50 text-violet-600" },
  { label:"Lead Scoring",   desc:"Score 0-100 automatique",           href:"/fonctionnalites#scoring",   iconPath:"M3 13l4-5 3 2.5 4-6 3 3",                   color:"bg-green-50 text-green-600" },
  { label:"Form Builder IA",desc:"Formulaires qualifiants IA",        href:"/fonctionnalites#forms",     iconPath:"M7 8h10M7 12h6M7 16h8",                    color:"bg-gray-50 text-gray-600" },
  { label:"Devis & Contrats",desc:"Propositions Anchor Pricing",      href:"/fonctionnalites#proposals", iconPath:"M9 12h6M9 16h4M5 8h14",                    color:"bg-amber-50 text-amber-600" },
  { label:"Analytics & ROI",desc:"MRR, pipeline, heures sauvées",     href:"/fonctionnalites#analytics", iconPath:"M3 14l4-6 4 3 3-5 4 4",                    color:"bg-violet-50 text-violet-600" },
  { label:"CRM Pipeline",   desc:"Kanban leads & suivi client",       href:"/fonctionnalites#crm",       iconPath:"M4 6h16M4 12h16M4 18h8",                   color:"bg-green-50 text-green-600" },
];
