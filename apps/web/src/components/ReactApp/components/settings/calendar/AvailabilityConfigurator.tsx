import { useState, useEffect } from 'react';
import { Settings2, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DEFAULT_BOOKING_CONFIG } from '../../../types/booking';

const DAYS_MAP: Record<number, string> = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    0: 'sunday',
};

export default function AvailabilityConfigurator() {
    const { userProfile, updateProfile } = useApp();
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userProfile) {
            const config = userProfile.booking_config || DEFAULT_BOOKING_CONFIG;
            const avail = config.availability || DEFAULT_BOOKING_CONFIG.availability;

            const arr = [1, 2, 3, 4, 5, 6, 0].map(id => {
                const dayKey = DAYS_MAP[id];
                const dayData = avail[dayKey] || { enabled: false, slots: [] };
                return {
                    day_of_week: id,
                    active: dayData.enabled,
                    start_time: dayData.slots?.[0]?.start || '09:00',
                    end_time: dayData.slots?.[0]?.end || '17:00'
                };
            });
            setAvailabilities(arr);
            setLoading(false);
        }
    }, [userProfile]);

    const toggleDay = (dayId: number) => {
        const newAvail = availabilities.map(a =>
            a.day_of_week === dayId ? { ...a, active: !a.active } : a
        );
        setAvailabilities(newAvail);
        saveToProfile(newAvail);
    };

    const updateTime = (dayId: number, field: 'start_time' | 'end_time', value: string) => {
        const newAvail = availabilities.map(a =>
            a.day_of_week === dayId ? { ...a, [field]: value } : a
        );
        setAvailabilities(newAvail);
        saveToProfile(newAvail);
    };

    const saveToProfile = async (currentAvail: any[]) => {
        if (!userProfile) return;

        const availability: any = {};
        currentAvail.forEach(a => {
            const dayKey = DAYS_MAP[a.day_of_week];
            availability[dayKey] = {
                enabled: a.active,
                slots: a.active ? [{ start: a.start_time, end: a.end_time }] : []
            };
        });

        const newConfig = {
            ...(userProfile.booking_config || DEFAULT_BOOKING_CONFIG),
            availability
        };

        try {
            await updateProfile({ booking_config: newConfig });
        } catch (err) {
            console.error('Failed to update availability:', err);
        }
    };

    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

    return (
        <div className="space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark tracking-tight flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary-500" />
                Heures de travail
            </h3>

            <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-neutral-100">
                    {[1, 2, 3, 4, 5, 6, 0].map(dayId => {
                        const dayLabel = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][dayId];
                        const avail = availabilities.find(a => a.day_of_week === dayId);
                        if (!avail) return null;

                        return (
                            <div key={dayId} className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${avail.active ? 'bg-white' : 'bg-neutral-50/50'}`}>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleDay(dayId)}
                                        className={`w-10 h-6 rounded-full relative transition-all duration-300 ${avail.active ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${avail.active ? 'left-5' : 'left-1'}`} />
                                    </button>
                                    <span className={`text-sm font-bold ${avail.active ? 'text-dark' : 'text-neutral-400'}`}>
                                        {dayLabel}
                                    </span>
                                </div>

                                {avail.active ? (
                                    <div className="flex items-center gap-2 pl-12 sm:pl-0">
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={avail.start_time}
                                                onChange={(e) => updateTime(dayId, 'start_time', e.target.value)}
                                                className="pl-3 pr-2 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-dark focus:ring-2 focus:ring-primary-500 outline-none w-28"
                                            />
                                        </div>
                                        <span className="text-neutral-400 font-medium">-</span>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={avail.end_time}
                                                onChange={(e) => updateTime(dayId, 'end_time', e.target.value)}
                                                className="pl-3 pr-2 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold text-dark focus:ring-2 focus:ring-primary-500 outline-none w-28"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pl-12 sm:pl-0 text-sm font-medium text-neutral-400 italic">
                                        Indisponible
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800 text-sm mt-4">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                <p>N'oubliez pas que les créneaux déjà réservés ne seront plus proposés, même si ces horaires sont actifs.</p>
            </div>
        </div>
    );
}
