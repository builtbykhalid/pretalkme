import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Layout, Megaphone, Quote } from 'lucide-react';
import TestimonialsManager from './TestimonialsManager';
import { useFeedback } from '../../context/FeedbackContext';

type Announcement = {
    id: string;
    layout_type: 'top_banner' | 'split_modal' | 'sidebar_card';
    title: string;
    content_title: string;
    content_text: string | null;
    cta_text: string | null;
    cta_link: string | null;
    image_url: string | null;
    theme_color: string;
    target_audience: 'all' | 'free_only' | 'pro_only';
    is_active: boolean;
    delay_seconds: number;
    target_path: string | null;
    dismiss_behavior: 'once' | 'per_session' | 'always';
    repeat_after_hours: number | null;
    created_at: string;
    stats?: { views: number; clicks: number; dismisses: number };
};

export default function AdminMarketing() {
    const [activeTab, setActiveTab] = useState<'announcements' | 'testimonials'>('announcements');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { confirm, showFeedback } = useFeedback();

    const defaultFormState: Partial<Announcement> = {
        layout_type: 'top_banner',
        title: '',
        content_title: '',
        content_text: '',
        cta_text: '',
        cta_link: '',
        image_url: '',
        theme_color: '#4f46e5',
        target_audience: 'all',
        delay_seconds: 0,
        target_path: '',
        dismiss_behavior: 'once',
        repeat_after_hours: 0,
        is_active: true,
    };

    const [formData, setFormData] = useState<Partial<Announcement>>(defaultFormState);

    useEffect(() => {
        if (activeTab === 'announcements') {
            fetchAnnouncements();
        }
    }, [activeTab]);

    const fetchAnnouncements = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('in_app_announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching announcements:', error);
        } else {
            // Fetch stats for all announcements
            const { data: eventsData, error: statsError } = await supabase
                .from('announcement_events')
                .select('announcement_id, event_type');

            if (statsError) {
                console.error('Error fetching stats:', statsError);
            }

            const annsWithStats = (data as Announcement[] || []).map(ann => {
                const annEvents = eventsData?.filter(e => e.announcement_id === ann.id) || [];
                return {
                    ...ann,
                    stats: {
                        views: annEvents.filter(e => e.event_type === 'view').length,
                        clicks: annEvents.filter(e => e.event_type === 'click').length,
                        dismisses: annEvents.filter(e => e.event_type === 'dismiss').length,
                    }
                };
            });

            setAnnouncements(annsWithStats);
        }
        setLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Default image to null if empty so constraints are happy
        const submissionData = { ...formData };
        if (!submissionData.image_url) submissionData.image_url = null;
        if (!submissionData.cta_link) submissionData.cta_link = null;
        if (!submissionData.cta_text) submissionData.cta_text = null;
        if (!submissionData.content_text) submissionData.content_text = null;
        if (!submissionData.target_path) submissionData.target_path = null;

        // Ensure delay is a number
        submissionData.delay_seconds = Number(submissionData.delay_seconds) || 0;

        let error;

        if (editingId) {
            const { error: updateError } = await supabase
                .from('in_app_announcements')
                .update(submissionData)
                .eq('id', editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('in_app_announcements')
                .insert([submissionData]);
            error = insertError;
        }

        if (error) {
            console.error('Error saving announcement:', error);
            showFeedback('error', { message: 'Erreur lors de la sauvegarde de l\'annonce' });
        } else {
            setIsFormOpen(false);
            setEditingId(null);
            setFormData(defaultFormState);
            fetchAnnouncements();
        }
        setSubmitting(false);
    };

    const handleEdit = (announcement: Announcement) => {
        setFormData({
            ...announcement,
            target_path: announcement.target_path || '',
        });
        setEditingId(announcement.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('in_app_announcements')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (!error) {
            setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            type: 'delete',
            title: 'Supprimer cette annonce ?',
            message: 'Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible.',
            confirmLabel: 'Supprimer'
        });
        if (!confirmed) return;

        const { error } = await supabase
            .from('in_app_announcements')
            .delete()
            .eq('id', id);

        if (!error) {
            setAnnouncements(announcements.filter(a => a.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-dark tracking-tight flex items-center gap-3">
                        <Megaphone className="text-primary-600" /> Marketing Hub
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">Gérez la communication et la preuve sociale in-app.</p>
                </div>

                <div className="bg-neutral-100 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'announcements' ? 'bg-white text-dark shadow-sm' : 'text-neutral-500 hover:text-dark'}`}
                    >
                        Annonces
                    </button>
                    <button
                        onClick={() => setActiveTab('testimonials')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'testimonials' ? 'bg-white text-dark shadow-sm' : 'text-neutral-500 hover:text-dark'}`}
                    >
                        Témoignages
                    </button>
                </div>
            </div>

            {activeTab === 'testimonials' ? (
                <TestimonialsManager />
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-dark tracking-tight flex items-center gap-2">
                            <Megaphone className="text-primary-600" size={24} /> Gestion des Annonces
                        </h2>
                        <button
                            onClick={() => {
                                setFormData(defaultFormState);
                                setEditingId(null);
                                setIsFormOpen(!isFormOpen);
                            }}
                            className="bg-dark hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-neutral-200 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} /> Nouvelle Annonce
                        </button>
                    </div>

                    {isFormOpen && (
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4">
                            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                                <h2 className="text-lg font-semibold text-dark">{editingId ? 'Modifier l\'annonce' : 'Créer une Annonce'}</h2>
                            </div>
                            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="space-y-4">
                                        <h3 className="text-sm text-neutral-400 tracking-wider">Configuration</h3>

                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-1">Titre interne (admin)</label>
                                            <input required name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="Ex: Promo Black Friday 2026" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-1">Type de Layout</label>
                                            <select name="layout_type" value={formData.layout_type} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium">
                                                <option value="top_banner">Bannière Haute (Top Banner)</option>
                                                <option value="split_modal">Modale Séparée (Split Modal)</option>
                                                <option value="sidebar_card">Encart Barre Latérale (Sidebar Card)</option>
                                                <option value="bottom_right_card">Encart Bas Droite (Bottom Right Card)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-1">Audience Cible</label>
                                            <select name="target_audience" value={formData.target_audience} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium">
                                                <option value="all">Tous les utilisateurs</option>
                                                <option value="free_only">Uniquement les plans gratuits (Upsell)</option>
                                                <option value="pro_only">Uniquement les plans pros (Fidélisation)</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-1">Délai d'affichage (sec)</label>
                                                <input name="delay_seconds" value={formData.delay_seconds} onChange={handleInputChange} type="number" min="0" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="0" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-1">Afficher uniquement sur</label>
                                                <input name="target_path" value={formData.target_path || ''} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="Ex: /app/finances (vide = partout)" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                            <div>
                                                <span className="block text-sm font-bold text-dark">Activer immédiatement</span>
                                                <span className="block text-xs text-neutral-500 font-medium">L'annonce sera visible par les utilisateurs dès sa création</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                            </label>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-neutral-100">
                                            <h3 className="text-sm text-neutral-400 tracking-wider">Logique de Répétition</h3>
                                            
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-1">Comportement de fermeture</label>
                                                <select name="dismiss_behavior" value={formData.dismiss_behavior} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium">
                                                    <option value="once">Définitive (Une seule fois)</option>
                                                    <option value="per_session">Par Session (Réapparaît après actualisation)</option>
                                                    <option value="always">Toujours (Réapparaît à chaque chargement de page)</option>
                                                </select>
                                                <p className="text-[10px] text-neutral-400 mt-1 italic">Définit si l'utilisateur revoit l'annonce après l'avoir fermée.</p>
                                            </div>

                                            {formData.dismiss_behavior !== 'once' && (
                                                <div className="animate-in slide-in-from-left-2">
                                                    <label className="block text-sm font-bold text-dark mb-1">Répéter après (heures)</label>
                                                    <input name="repeat_after_hours" value={formData.repeat_after_hours || 0} onChange={handleInputChange} type="number" min="0" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="0 = immédiat" />
                                                    <p className="text-[10px] text-neutral-400 mt-1 italic">Laisse un délai minimum avant de remontrer l'annonce.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm text-neutral-400 tracking-wider">Contenu Client</h3>

                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-1">Titre de l'annonce</label>
                                            <input required name="content_title" value={formData.content_title} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="Ex: -50% pour le Black Friday !" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-1">Message / Description</label>
                                            <textarea name="content_text" value={formData.content_text || ''} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium h-24 resize-none" placeholder="Texte d'explication..." />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-1">Label Bouton</label>
                                                <input name="cta_text" value={formData.cta_text || ''} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="Ex: En profiter" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-1">Lien Bouton (URL)</label>
                                                <input name="cta_link" value={formData.cta_link || ''} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="https://..." />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-1">URL Image (Optionnel)</label>
                                                <input name="image_url" value={formData.image_url || ''} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="https://..." />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-1">Couleur d'accent (HEX)</label>
                                                <div className="flex gap-2">
                                                    <input name="theme_color" value={formData.theme_color} onChange={handleInputChange} type="color" className="p-1 h-11 w-11 bg-neutral-50 border border-neutral-200 rounded-xl" />
                                                    <input name="theme_color" value={formData.theme_color} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium " />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsFormOpen(false);
                                            setEditingId(null);
                                            setFormData(defaultFormState);
                                        }}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? 'Sauvegarde...' : (editingId ? 'Mettre à jour l\'annonce' : 'Créer l\'annonce')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-neutral-500 font-medium">Chargement des annonces...</div>
                        ) : announcements.length === 0 ? (
                            <div className="p-12 pl-12 text-center flex flex-col items-center justify-center border-dashed border-2 m-4 border-neutral-200 rounded-xl bg-neutral-50/50">
                                <Megaphone className="text-neutral-300 w-12 h-12 mb-3" />
                                <h3 className="text-lg font-semibold text-dark mb-1">Aucune annonce</h3>
                                <p className="text-neutral-500 text-sm">Créez votre première annonce pour interagir avec vos utilisateurs.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 divide-y divide-neutral-100">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center text-white font-semibold shadow-md border-2 border-white" style={{ backgroundColor: announcement.theme_color }}>
                                                {announcement.layout_type === 'top_banner' ? 'B' : announcement.layout_type === 'split_modal' ? 'M' : announcement.layout_type === 'sidebar_card' ? 'S' : 'BR'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-dark text-base truncate">{announcement.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs  ${announcement.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                                                        }`}>
                                                        {announcement.is_active ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 mb-1.5 flex-wrap">
                                                    <span className="flex items-center gap-1 bg-neutral-100 py-0.5 px-2 rounded-md">
                                                        <Layout size={12} /> {announcement.layout_type}
                                                    </span>
                                                    <span className="flex items-center gap-1 bg-neutral-100 py-0.5 px-2 rounded-md ">
                                                        Audience: {announcement.target_audience}
                                                    </span>
                                                    {announcement.target_path && (
                                                        <span className="flex items-center gap-1 bg-neutral-100 py-0.5 px-2 rounded-md font-mono">
                                                            {announcement.target_path}
                                                        </span>
                                                    )}
                                                    {announcement.delay_seconds > 0 && (
                                                        <span className="flex items-center gap-1 bg-neutral-100 py-0.5 px-2 rounded-md">
                                                            Délai: {announcement.delay_seconds}s
                                                        </span>
                                                    )}
                                                    <span className={`flex items-center gap-1 py-0.5 px-2 rounded-md ${announcement.dismiss_behavior === 'once' ? 'bg-rose-50 text-rose-600' : announcement.dismiss_behavior === 'per_session' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        Logic: {announcement.dismiss_behavior === 'once' ? 'Permanent' : announcement.dismiss_behavior === 'per_session' ? 'Session' : 'Always'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-600 truncate max-w-xl">{announcement.content_title}</p>

                                                {announcement.stats && (
                                                    <div className="mt-3 flex gap-4 text-xs font-bold text-neutral-500">
                                                        <span className="flex items-center gap-1" title="Vues">👁️ {announcement.stats.views} vues</span>
                                                        {announcement.cta_text && (
                                                            <span className="flex items-center gap-1 text-emerald-600" title="Clics bouton">👆 {announcement.stats.clicks} clics</span>
                                                        )}
                                                        <span className="flex items-center gap-1 text-rose-500" title="Ignorées">❌ {announcement.stats.dismisses} fermées</span>
                                                        {announcement.stats.views > 0 && announcement.cta_text && (
                                                            <span className="flex items-center gap-1 text-primary-500">
                                                                ⭐ {Math.round((announcement.stats.clicks / announcement.stats.views) * 100)}% CTR
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => toggleStatus(announcement.id, announcement.is_active)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${announcement.is_active
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                    }`}
                                            >
                                                {announcement.is_active ? 'Désactiver' : 'Activer'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(announcement)}
                                                className="p-2 text-neutral-500 hover:bg-neutral-100 hover:text-dark rounded-xl transition-all border border-transparent"
                                                title="Éditer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(announcement.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
