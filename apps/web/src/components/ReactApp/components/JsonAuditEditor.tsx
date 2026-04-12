import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';

export interface AuditRecommendation {
    titre: string;
    description: string;
    priorite: 'haute' | 'moyenne' | 'basse' | string;
}

export interface AuditAnalysis {
    points_forts: string[];
    points_faibles: string[];
    opportunites: string[];
}

export interface AuditJSONData {
    score?: number;
    resume_executif: string;
    analyse_detaillee: AuditAnalysis;
    recommandations: AuditRecommendation[];
    prochaines_etapes: string;
}

interface JsonAuditEditorProps {
    data: AuditJSONData;
    onChange: (data: AuditJSONData) => void;
}

export default function JsonAuditEditor({ data, onChange }: JsonAuditEditorProps) {

    const updateField = (field: keyof AuditJSONData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const updateAnalysis = (field: keyof AuditAnalysis, value: string[]) => {
        onChange({
            ...data,
            analyse_detaillee: {
                ...data.analyse_detaillee,
                [field]: value
            }
        });
    };

    const handleArrayChange = (array: string[], index: number, value: string, field: keyof AuditAnalysis) => {
        const newArray = [...array];
        newArray[index] = value;
        updateAnalysis(field, newArray);
    };

    const addToArray = (array: string[], field: keyof AuditAnalysis) => {
        updateAnalysis(field, [...array, '']);
    };

    const removeFromArray = (array: string[], index: number, field: keyof AuditAnalysis) => {
        const newArray = array.filter((_, i) => i !== index);
        updateAnalysis(field, newArray);
    };

    const updateRecommendation = (index: number, field: keyof AuditRecommendation, value: string) => {
        const newRecs = [...data.recommandations];
        newRecs[index] = { ...newRecs[index], [field]: value };
        updateField('recommandations', newRecs);
    };

    const addRecommendation = () => {
        updateField('recommandations', [
            ...(data.recommandations || []),
            { titre: '', description: '', priorite: 'moyenne' }
        ]);
    };

    const removeRecommendation = (index: number) => {
        const newRecs = data.recommandations.filter((_, i) => i !== index);
        updateField('recommandations', newRecs);
    };

    const renderStringArray = (title: string, array: string[] = [], field: keyof AuditAnalysis) => (
        <div className="mb-6 space-y-3 min-w-0 overflow-x-hidden">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-sm text-dark">{title}</h4>
                <button onClick={() => addToArray(array, field)} className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-1">
                    <Plus size={14} /> Ajouter
                </button>
            </div>
            {array.map((item, i) => (
                <div key={i} className="flex gap-2 items-start relative group min-w-0 overflow-x-hidden">
                    <textarea
                        value={item}
                        onChange={(e) => handleArrayChange(array, i, e.target.value, field)}
                        className="w-full min-w-0 p-3 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white shadow-sm resize-none break-words"
                        rows={2}
                    />
                    <button
                        onClick={() => removeFromArray(array, i, field)}
                        className="p-2 text-neutral-400 hover:text-red-500 bg-white border border-neutral-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity mt-1 shadow-sm"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8 text-left min-w-0 overflow-x-hidden">

            {/* Executive Summary */}
            <div className="space-y-2">
                <label className="font-bold text-sm text-dark">Résumé Exécutif</label>
                <textarea
                    value={data.resume_executif || ''}
                    onChange={(e) => updateField('resume_executif', e.target.value)}
                    className="w-full p-4 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 bg-neutral-50 shadow-inner resize-y"
                    rows={4}
                    placeholder="Synthèse de 2 ou 3 lignes..."
                />
            </div>

            {/* Arrays */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 min-w-0 overflow-x-hidden">
                {renderStringArray('Points Forts', data.analyse_detaillee?.points_forts, 'points_forts')}
                {renderStringArray('Points Faibles', data.analyse_detaillee?.points_faibles, 'points_faibles')}
                <div className="lg:col-span-2">
                    {renderStringArray('Opportunités', data.analyse_detaillee?.opportunites, 'opportunites')}
                </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-100">
                    <h3 className="font-bold text-lg text-dark">Recommandations Stratégiques</h3>
                    <button onClick={addRecommendation} className="text-xs font-bold text-white bg-dark px-4 py-2 rounded-xl hover:bg-black transition-colors flex items-center gap-2">
                        <Plus size={14} /> Nouvelle Recommandation
                    </button>
                </div>

                {(data.recommandations || []).map((rec, i) => (
                    <div key={i} className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4 relative group min-w-0 overflow-x-hidden">
                        <button
                            onClick={() => removeRecommendation(i)}
                            className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>

                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-neutral-500 ">Titre de la recommandation</label>
                                <input
                                    type="text"
                                    value={rec.titre || ''}
                                    onChange={(e) => updateRecommendation(i, 'titre', e.target.value)}
                                    className="w-full min-w-0 p-2.5 font-bold text-sm border-b-2 border-transparent bg-neutral-50 focus:bg-white focus:border-primary-500 rounded-lg outline-none transition-colors"
                                    placeholder="Ex: Optimiser le SEO local"
                                />
                            </div>
                            <div className="w-32 space-y-1">
                                <label className="text-xs font-bold text-neutral-500 ">Priorité</label>
                                <select
                                    value={rec.priorite || 'moyenne'}
                                    onChange={(e) => updateRecommendation(i, 'priorite', e.target.value)}
                                    className="w-full p-2.5 text-sm font-bold border border-neutral-200 bg-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="haute">Haute</option>
                                    <option value="moyenne">Moyenne</option>
                                    <option value="basse">Basse</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 ">Description et actions</label>
                            <textarea
                                value={rec.description || ''}
                                onChange={(e) => updateRecommendation(i, 'description', e.target.value)}
                                className="w-full min-w-0 p-3 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white break-words"
                                rows={3}
                                placeholder="Détail de la recommandation..."
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Next Steps */}
            <div className="space-y-2 mt-8">
                <label className="font-bold text-sm text-dark">Prochaines Étapes</label>
                <textarea
                    value={data.prochaines_etapes || ''}
                    onChange={(e) => updateField('prochaines_etapes', e.target.value)}
                    className="w-full p-4 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 bg-neutral-50 shadow-inner resize-y"
                    rows={3}
                    placeholder="Quelles sont les suites à donner ?"
                />
            </div>
        </div>
    );
}
