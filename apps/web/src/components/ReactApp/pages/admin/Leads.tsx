import { useState, useEffect } from 'react';
import { Users, Search, FileText, Loader2, ArrowUpDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLeads() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    useEffect(() => {
        fetchLeads();
    }, [sortOrder]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select(`
          *,
          profiles:user_id (email, first_name, last_name, company_name),
          forms:form_id (title)
        `)
                .order('created_at', { ascending: sortOrder === 'asc' });

            if (error) {
                console.error('Error fetching leads:', error);
            } else {
                setLeads(data || []);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const getExtractedData = (lead: any) => {
        const staticAns = lead.static_answers || {};
        const respInfo = lead.respondent_info || {};

        const inferFromStatic = (staticAnswers: any, keywords: string[]) => {
            if (!staticAnswers) return null;
            const entries = Object.entries(staticAnswers);
            for (const [key, value] of entries) {
                const lowerKey = key.toLowerCase();
                if (keywords.some(kw => lowerKey.includes(kw.toLowerCase()))) {
                    return value;
                }
            }
            return null;
        };

        // Extraction logic from the AppContext
        const nameFromStatic = inferFromStatic(staticAns, ['name', 'nom', 'firstName', 'first_name', 'q11', 'q12']);
        const nameFromResp = respInfo.name || (respInfo.firstName ? `${respInfo.firstName} ${respInfo.lastName || ''}` : null);
        const name = nameFromResp || lead.name || nameFromStatic || (respInfo.email ? String(respInfo.email).split('@')[0] : null) || 'Anonyme';

        const email = respInfo.email || inferFromStatic(staticAns, ['email', 'q13', 'q_email']) || '';
        const company = respInfo.company || inferFromStatic(staticAns, ['company', 'entreprise', 'societe', 'q1']) || 'N/A';
        const project = lead.forms?.title || 'Formulaire';

        const staticCount = Object.keys(staticAns).length;
        let dynamicCount = 0;
        if (Array.isArray(lead.dynamic_answers)) dynamicCount = lead.dynamic_answers.length;
        else if (lead.dynamic_answers && typeof lead.dynamic_answers === 'object') dynamicCount = Object.keys(lead.dynamic_answers).length;

        return { name, email, company, project, answersCount: staticCount + dynamicCount };
    };

    const filteredLeads = leads.filter(lead => {
        const term = searchTerm.toLowerCase();
        const { name, email, company } = getExtractedData(lead);
        return (
            name?.toLowerCase().includes(term) ||
            email?.toLowerCase().includes(term) ||
            company?.toLowerCase().includes(term) ||
            lead.id.toLowerCase().includes(term)
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'reviewed': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'sent': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-neutral-100 text-neutral-700 border-neutral-200';
            default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new': return 'Nouveau';
            case 'reviewed': return 'En cours';
            case 'sent': return 'Qualifié';
            case 'rejected': return 'Refusé';
            default: return status || 'Nouveau';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-dark tracking-tight flex items-center gap-3">
                    <Users size={28} className="text-primary-600" />
                    Pretalks (Leads)
                </h1>
                <p className="text-sm text-neutral-500 mt-2">Gérez tous les leads collectés sur la plateforme</p>
            </div>

            {/* Controls */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, entreprise..."
                        className="w-full pl-12 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-medium transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="px-4 py-2.5 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-neutral-50 hover:border-neutral-300 transition-colors w-full sm:w-auto justify-center shadow-sm"
                >
                    <ArrowUpDown size={16} />
                    Date de création {sortOrder === 'desc' ? '(Décroissant)' : '(Croissant)'}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
                        <p className="text-neutral-500 font-medium">Chargement des leads...</p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 border border-neutral-100">
                            <FileText size={24} className="text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-bold text-dark">Aucun lead trouvé</h3>
                        <p className="text-neutral-500 mt-1 max-w-sm">Il n'y a aucun lead correspondant à votre recherche sur la plateforme.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 border-b border-neutral-200">
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500">Date</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500">Prospect</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500">Formulaire</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500">Hôte</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500 text-center">Score</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500 text-center">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredLeads.map((lead) => {
                                    const { name, email, company, project, answersCount } = getExtractedData(lead);
                                    return (
                                        <tr key={lead.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="py-4 px-6 align-top">
                                                <div className="font-bold text-dark">
                                                    {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-sm font-medium text-neutral-500 mt-1">
                                                    {new Date(lead.created_at).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 align-top">
                                                <div className="font-bold text-dark">{name}</div>
                                                <div className="text-sm text-neutral-500">{email || 'Sans email'}</div>
                                                <div className="text-xs font-medium text-neutral-400 mt-1">{company}</div>
                                            </td>
                                            <td className="py-4 px-6 align-top">
                                                <div className="font-bold text-dark text-sm">{project}</div>
                                                <div className="text-xs text-neutral-500 mt-1 italic">{answersCount} réponses</div>
                                            </td>
                                            <td className="py-4 px-6 align-top">
                                                {lead.profiles ? (
                                                    <>
                                                        <div className="font-bold text-dark text-sm truncate max-w-[150px]" title={(lead.profiles as any)?.company_name}>
                                                            {(lead.profiles as any)?.company_name || 'Sans entreprise'}
                                                        </div>
                                                        <div className="text-xs text-neutral-500 mt-0.5 truncate max-w-[150px]" title={(lead.profiles as any)?.email}>
                                                            {(lead.profiles as any)?.email}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-neutral-400 italic">Hôte inconnu</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 align-top text-center">
                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${lead.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                    lead.score >= 50 ? 'bg-amber-100 text-amber-700' :
                                                        lead.score > 0 ? 'bg-red-100 text-red-700' :
                                                            'bg-neutral-100 text-neutral-500'
                                                    }`}>
                                                    {lead.score || 0}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 align-top text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(lead.status)}`}>
                                                    {getStatusLabel(lead.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
