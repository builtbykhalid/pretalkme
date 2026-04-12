import {
    BarChart3,
    CheckCircle2,
    Clock,
    Zap,
    Slack,
    Database,
    Mail,
    RefreshCw,
    FileText,
    Users,
    Calendar,
    Webhook,
    Search,
    Code,
    Briefcase,
    Scale,
    LayoutDashboard,
    Bot,
    // GripVertical,
    // HelpCircle,
    Settings,
    UserCircle,
    DollarSign
} from 'lucide-react';

export const MOCK_STATS = [
    { label: 'Revenus Potentiels', value: '12 450 €', change: '+12%', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Leads Qualifiés', value: '24', change: '+5', icon: CheckCircle2, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'En Attente', value: '3', change: 'Urgent', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Taux de Conversion', value: '18.2%', change: '+2.1%', icon: Zap, color: 'text-accent-600', bg: 'bg-accent-50' },
];

export const RECENT_LEADS = [
    { id: 1, name: 'Alice Martin', company: 'TechFlow SAS', score: 92, status: 'qualified', date: 'Il y a 2h', avatar: 'AM', project: 'Audit SEO Complet', insight: 'Budget validé & Urgence' },
    { id: 2, name: 'Jean Dupont', company: 'Boulangerie Bio', score: 45, status: 'lost', date: 'Il y a 5h', avatar: 'JD', project: 'Site Vitrine', insight: 'Hors cible (Budget < 500€)' },
    { id: 3, name: 'Sarah Connor', company: 'Skynet Corp', score: 88, status: 'proposal_sent', date: 'Hier', avatar: 'SC', project: 'Sécurité Réseau', insight: 'Décisionnaire identifié' },
    { id: 4, name: 'Lucas B.', company: 'Freelance', score: 72, status: 'contacted', date: 'Hier', avatar: 'LB', project: 'Coaching Vente', insight: 'Intérêt fort mais hésant' },
    { id: 5, name: 'Emma Wilson', company: 'StartUp Nation', score: 95, status: 'won', date: '2 jours', avatar: 'EW', project: 'Levée de Fonds', insight: 'Match parfait avec offre Premium' },
    { id: 6, name: 'Paul Hochard', company: 'Menuiserie PH', score: 30, status: 'lost', date: '3 jours', avatar: 'PH', project: 'Flyers', insight: 'Demande hors expertise' },
];

export const MY_FORMS = [
    { id: 1, title: 'Audit SEO Gratuit', status: 'Active', views: 1240, leads: 85, conversion: '6.8%', updated: 'Il y a 2j', color: 'bg-primary-600' },
    { id: 2, title: 'Cahier des Charges App Mobile', status: 'Active', views: 450, leads: 12, conversion: '2.6%', updated: 'Il y a 1sem', color: 'bg-emerald-600' },
    { id: 3, title: 'Diagnostic RH (Interne)', status: 'Draft', views: 0, leads: 0, conversion: '0%', updated: 'Il y a 2h', color: 'bg-neutral-400' },
];

export const WORKFLOWS = [
    { id: 1, title: 'Alerte Slack "Pépite"', trigger: 'Score > 80', action: 'Envoyer message Slack', status: 'active', icon: Slack, color: 'text-accent-600', bg: 'bg-accent-100' },
    { id: 2, title: 'Sauvegarde Notion', trigger: 'Nouveau Lead', action: 'Créer page Notion', status: 'active', icon: Database, color: 'text-neutral-600', bg: 'bg-neutral-100' },
    { id: 3, title: 'Email de Refus Poli', trigger: 'Score < 30', action: 'Envoyer Email Template #3', status: 'paused', icon: Mail, color: 'text-rose-600', bg: 'bg-rose-100' },
    { id: 4, title: 'Sync CRM HubSpot', trigger: 'Lead Validé', action: 'Créer Deal HubSpot', status: 'active', icon: RefreshCw, color: 'text-orange-600', bg: 'bg-orange-100' },
];

export const INTEGRATIONS = [
    { id: 'google_sheets', name: 'Google Sheets', desc: 'Synchronisez chaque réponse dans une ligne.', icon: Database, connected: true },
    { id: 'notion', name: 'Notion', desc: 'Créez une base de données de prospects.', icon: FileText, connected: true },
    { id: 'slack', name: 'Slack', desc: 'Recevez des notifications en temps réel.', icon: Slack, connected: true },
    { id: 'hubspot', name: 'HubSpot', desc: 'Envoyez les leads qualifiés dans votre CRM.', icon: Users, connected: false },
    { id: 'calendly', name: 'Calendly', desc: 'Proposez un RDV si le score est élevé.', icon: Calendar, connected: false },
    { id: 'zapier', name: 'Zapier / Make', desc: 'Connectez 5000+ apps via Webhook.', icon: Webhook, connected: false },
];

export const PRECONFIGURED_AGENTS = [
    { id: 1, name: 'Agent Audit SEO', category: 'Marketing', desc: 'Analyse technique et sémantique de site web. Détecte les opportunités de mots-clés.', icon: Search, color: 'text-primary-600', bg: 'bg-primary-100' },
    { id: 2, name: 'Agent Tech Lead', category: 'Développement', desc: 'Estime la complexité technique, recommande une stack (React/Node) et chiffre le projet.', icon: Code, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 3, name: 'Agent Sales Coach', category: 'Vente', desc: 'Qualifie le BANT (Budget, Authority, Need, Timing) et détecte les signaux d\'achat.', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-100' },
    { id: 4, name: 'Agent Juridique', category: 'Légal', desc: 'Pré-analyse de contrats et vérification de conformité RGPD de premier niveau.', icon: Scale, color: 'text-rose-600', bg: 'bg-rose-100' },
];

import type { LucideIcon } from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
    badge?: string;
}

export interface SidebarSection {
    id: string;
    label: string;
    collapsible?: boolean;
    items: NavItem[];
}

export const SIDEBAR_CONFIG: SidebarSection[] = [
    {
        id: 'principal',
        label: 'Principal',
        collapsible: false,
        items: [
            { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
            { id: 'leads', label: 'Leads & Scoring', icon: Users, path: '/leads', badge: '3' },
            { id: 'statistics', label: 'Statistiques', icon: BarChart3, path: '/statistics' },
            { id: 'finances', label: 'Finances & ROI', icon: DollarSign, path: '/finances' },
        ]
    },
    {
        id: 'tools',
        label: 'Mes outils',
        items: [
            { id: 'forms', label: 'Formulaires', icon: FileText, path: '/forms' },
            { id: 'agents', label: 'Agents IA', icon: Bot, path: '/agents', badge: 'Nouveau' },
            { id: 'templates', label: 'Templates', icon: FileText, path: '/templates' },
            { id: 'disponibilites', label: 'Disponibilités', icon: Calendar, path: '/disponibilites', badge: 'Nouveau' },
            { id: 'services', label: 'Services', icon: Briefcase, path: '/services', badge: 'Nouveau' },
            { id: 'my-profile', label: 'Profil', icon: UserCircle, path: '/my-profile' },
        ]
    },
    {
        id: 'more',
        label: 'More',
        items: [
            { id: 'automations', label: 'Automations', icon: Zap, path: '/automations' },
            { id: 'settings', label: 'Compte', icon: Settings, path: '/settings' },
        ]
    },
];

// Backwards-compatible flat list (deprecated)
export const NAV_ITEMS = SIDEBAR_CONFIG.flatMap(s => s.items);

