import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Quote, User, Check, X, Edit2, Save } from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';

type Testimonial = {
    id: string;
    content: string;
    author_name: string;
    author_handle: string | null;
    avatar_url: string | null;
    is_active: boolean;
    display_on_login: boolean;
    display_on_onboarding: boolean;
    display_on_home: boolean;
    created_at: string;
};

export default function TestimonialsManager() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { confirm, showFeedback } = useFeedback();

    const defaultFormState: Partial<Testimonial> = {
        content: '',
        author_name: '',
        author_handle: '',
        avatar_url: '',
        is_active: true,
        display_on_login: true,
        display_on_onboarding: true,
        display_on_home: true,
    };

    const [formData, setFormData] = useState<Partial<Testimonial>>(defaultFormState);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching testimonials:', error);
        } else {
            setTestimonials(data || []);
        }
        setLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const submissionData = { ...formData };
        if (!submissionData.avatar_url) delete submissionData.avatar_url;
        if (!submissionData.author_handle) delete submissionData.author_handle;

        let error;
        if (editingId) {
            const { error: updateError } = await supabase
                .from('testimonials')
                .update(submissionData)
                .eq('id', editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('testimonials')
                .insert([submissionData]);
            error = insertError;
        }

        if (error) {
            console.error('Error saving testimonial:', error);
            showFeedback('error', { message: 'Erreur lors de la sauvegarde: ' + error.message });
        } else {
            setIsFormOpen(false);
            setEditingId(null);
            setFormData(defaultFormState);
            fetchTestimonials();
        }
        setSubmitting(false);
    };

    const handleEdit = (testimonial: Testimonial) => {
        setFormData(testimonial);
        setEditingId(testimonial.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            type: 'delete',
            title: 'Supprimer ce témoignage ?',
            message: 'Voulez-vous vraiment supprimer ce témoignage ? Cette action est irréversible.',
            confirmLabel: 'Supprimer'
        });
        if (!confirmed) return;

        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (!error) {
            setTestimonials(testimonials.filter(t => t.id !== id));
        } else {
            showFeedback('error', { message: 'Erreur lors de la suppression' });
        }
    };

    const toggleBoolean = async (id: string, field: keyof Testimonial, currentValue: boolean) => {
        const { error } = await supabase
            .from('testimonials')
            .update({ [field]: !currentValue })
            .eq('id', id);

        if (!error) {
            setTestimonials(testimonials.map(t => t.id === id ? { ...t, [field]: !currentValue } : t));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-dark tracking-tight flex items-center gap-2">
                        <Quote className="text-primary-600" size={24} /> Gestion des Témoignages
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">Gérez les avis clients affichés sur les pages publiques.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData(defaultFormState);
                        setEditingId(null);
                        setIsFormOpen(!isFormOpen);
                    }}
                    className="bg-dark hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-neutral-200 transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> Nouveau Témoignage
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4">
                    <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                        <h3 className="text-lg font-semibold text-dark">{editingId ? 'Modifier le témoignage' : 'Créer un Témoignage'}</h3>
                    </div>
                    <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">Nom de l'auteur</label>
                                    <input required name="author_name" value={formData.author_name} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="Ex: Sophie Martinet" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">Handle / Rôle</label>
                                    <input name="author_handle" value={formData.author_handle || ''} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="Ex: @sophie_consulting" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">URL Avatar (Optionnel)</label>
                                    <input name="avatar_url" value={formData.avatar_url || ''} onChange={handleInputChange} type="text" className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium" placeholder="https://..." />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-1">Témoignage (Texte)</label>
                                    <textarea required name="content" value={formData.content} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm font-medium h-32 resize-none" placeholder="Le texte du témoignage..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="w-4 h-4 text-primary-600 rounded" />
                                        <label htmlFor="is_active" className="text-sm font-bold text-dark">Actif</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="display_on_login" name="display_on_login" checked={formData.display_on_login} onChange={handleInputChange} className="w-4 h-4 text-primary-600 rounded" />
                                        <label htmlFor="display_on_login" className="text-sm font-bold text-dark">Page Connexion</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="display_on_onboarding" name="display_on_onboarding" checked={formData.display_on_onboarding} onChange={handleInputChange} className="w-4 h-4 text-primary-600 rounded" />
                                        <label htmlFor="display_on_onboarding" className="text-sm font-bold text-dark">Onboarding</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="display_on_home" name="display_on_home" checked={formData.display_on_home} onChange={handleInputChange} className="w-4 h-4 text-primary-600 rounded" />
                                        <label htmlFor="display_on_home" className="text-sm font-bold text-dark">Home Page</label>
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
                                {submitting ? 'Sauvegarde...' : (editingId ? 'Mettre à jour' : 'Créer')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-neutral-500 font-medium">Chargement des témoignages...</div>
                ) : testimonials.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 m-4 border-neutral-200 rounded-xl bg-neutral-50/50">
                        <Quote className="text-neutral-300 w-12 h-12 mb-3" />
                        <h3 className="text-lg font-semibold text-dark mb-1">Aucun témoignage</h3>
                        <p className="text-neutral-500 text-sm">Ajoutez votre premier témoignage pour l'afficher sur le site.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200">
                                    <th className="p-4 text-xs font-semibold text-neutral-500">Auteur</th>
                                    <th className="p-4 text-xs font-semibold text-neutral-500">Message</th>
                                    <th className="p-4 text-xs font-semibold text-neutral-500">Visibilité</th>
                                    <th className="p-4 text-xs font-semibold text-neutral-500">Statut</th>
                                    <th className="p-4 text-xs font-semibold text-neutral-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {testimonials.map((t) => (
                                    <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0 overflow-hidden">
                                                    {t.avatar_url ? (
                                                        <img src={t.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-dark text-sm">{t.author_name}</p>
                                                    <p className="text-xs text-neutral-500">{t.author_handle}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-neutral-600 line-clamp-2 max-w-md">{t.content}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleBoolean(t.id, 'display_on_login', t.display_on_login)}
                                                    className={`px-2 py-1 rounded text-xs font-bold ${t.display_on_login ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-400'}`}
                                                    title="Toggle Login"
                                                >
                                                    Login
                                                </button>
                                                <button
                                                    onClick={() => toggleBoolean(t.id, 'display_on_onboarding', t.display_on_onboarding)}
                                                    className={`px-2 py-1 rounded text-xs font-bold ${t.display_on_onboarding ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-400'}`}
                                                    title="Toggle Onboarding"
                                                >
                                                    Onboarding
                                                </button>
                                                <button
                                                    onClick={() => toggleBoolean(t.id, 'display_on_home', t.display_on_home)}
                                                    className={`px-2 py-1 rounded text-xs font-bold ${t.display_on_home ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-400'}`}
                                                    title="Toggle Home"
                                                >
                                                    Home
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleBoolean(t.id, 'is_active', t.is_active)}
                                                className={`px-3 py-1 rounded-full text-xs ${t.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}
                                            >
                                                {t.is_active ? 'Actif' : 'Inactif'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(t)} className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
