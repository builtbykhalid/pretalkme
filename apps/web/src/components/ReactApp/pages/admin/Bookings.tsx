import { useState, useEffect } from 'react';
import { Calendar, Search, FileText, Loader2, ArrowUpDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Booking } from '../../types/booking';

export default function AdminBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    useEffect(() => {
        fetchBookings();
    }, [sortOrder]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          profiles:user_id (email, first_name, last_name, company_name)
        `)
                .order('scheduled_at', { ascending: sortOrder === 'asc' });

            if (error) {
                console.error('Error fetching bookings:', error);
            } else {
                setBookings(data || []);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const term = searchTerm.toLowerCase();
        return (
            booking.guest_name?.toLowerCase().includes(term) ||
            booking.guest_email.toLowerCase().includes(term) ||
            booking.id.toLowerCase().includes(term)
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmé';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            case 'completed': return 'Terminé';
            case 'no_show': return 'No Show';
            default: return status;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-dark tracking-tight flex items-center gap-3">
                    <Calendar size={28} className="text-primary-600" />
                    Rendez-vous
                </h1>
                <p className="text-sm text-neutral-500 mt-2">Gérez tous les rendez-vous de la plateforme</p>
            </div>

            {/* Controls */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, ID..."
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
                    Date de RDV {sortOrder === 'desc' ? '(Décroissant)' : '(Croissant)'}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
                        <p className="text-neutral-500 font-medium">Chargement des rendez-vous...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 border border-neutral-100">
                            <FileText size={24} className="text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-bold text-dark">Aucun rendez-vous trouvé</h3>
                        <p className="text-neutral-500 mt-1 max-w-sm">Il n'y a aucun rendez-vous correspondant à votre recherche sur la plateforme.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 border-b border-neutral-200">
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500">Date & Heure</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500">Invité</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500">Hôte (Coach)</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500">Durée</th>
                                    <th className="py-4 px-6 text-xs font-bold text-neutral-500 text-center">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="py-4 px-6 align-top">
                                            <div className="font-bold text-dark">
                                                {new Date(booking.scheduled_at).toLocaleDateString('fr-FR', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-sm font-medium text-neutral-500 mt-1">
                                                {new Date(booking.scheduled_at).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 align-top">
                                            <div className="font-bold text-dark">{booking.guest_name || 'Anonyme'}</div>
                                            <div className="text-sm text-neutral-500">{booking.guest_email}</div>
                                        </td>
                                        <td className="py-4 px-6 align-top">
                                            {(booking as any).profiles ? (
                                                <>
                                                    <div className="font-bold text-dark text-sm truncate max-w-[150px]" title={((booking as any).profiles as any)?.company_name}>
                                                        {((booking as any).profiles as any)?.company_name || 'Sans entreprise'}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 mt-0.5 truncate max-w-[150px]" title={((booking as any).profiles as any)?.email}>
                                                        {((booking as any).profiles as any)?.email}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-sm text-neutral-400 italic">Hôte inconnu</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 align-top">
                                            <div className="text-sm font-bold text-dark bg-neutral-100 px-2 py-1 rounded inline-block">
                                                {booking.duration_minutes} min
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 align-top text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                                {getStatusLabel(booking.status)}
                                            </span>
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
