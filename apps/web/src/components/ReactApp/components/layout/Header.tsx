import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, X, Calendar, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import NotificationDrawer from '../NotificationDrawer';
import LanguageSwitcher from '../LanguageSwitcher';
import UserAvatar from '../ui/UserAvatar';

interface HeaderProps {
    onMobileMenuClick: () => void;
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

function WhatsAppStatusBadge() {
    const { config } = useApp();
    const isConnected = (config?.whatsapp_status || 'CONNECTED') === 'CONNECTED';
    const phoneNumber = config?.whatsapp_phone || '+212 708-234959';

    return (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-full mr-2 group hover:border-[#00A884] transition-all cursor-pointer">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00A884] animate-pulse' : 'bg-[#EA0038]'}`} />
            <span className="text-[11px] font-bold text-[#54656F] uppercase tracking-tighter group-hover:text-[#111B21]">{phoneNumber}</span>
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest ${isConnected ? 'bg-[#E7F3EF] text-[#00A884]' : 'bg-[#FEEDF1] text-[#EA0038]'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
            </span>
        </div>
    );
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Focus input when search opens
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    // Close search on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && searchOpen) {
                setSearchOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchOpen]);

    return (
        <header className="h-14 bg-white border-b border-[#EEEEEE] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
            {/* Left: Mobile menu + Search toggle */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                    onClick={onMobileMenuClick}
                    className="md:hidden p-2 text-[#9A9A9A] hover:bg-[#F4F4F4] rounded-lg transition-colors"
                >
                    <Menu size={18} />
                </button>

                {searchOpen ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md animate-in fade-in slide-in-from-left-2 duration-200">
                        <Search size={16} className="text-[#AAAAAA] shrink-0" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher un lead, formulaire..."
                            className="flex-1 bg-transparent text-sm text-[#0D0D0D] placeholder:text-[#9A9A9A] focus:outline-none py-1"
                        />
                        <button
                            onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                            className="p-1 text-[#AAAAAA] hover:text-[#6B6B6B] transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-[#9A9A9A] hover:text-[#3D3D3D] hover:bg-[#F4F4F4] rounded-lg transition-colors text-sm"
                    >
                        <Search size={16} />
                        <span className="text-[#AAAAAA]">Rechercher...</span>
                    </button>
                )}
            </div>

            {/* Right: Status + Language + Notifications + Preview + Avatar */}
            <div className="flex items-center gap-2 shrink-0">
                <WhatsAppStatusBadge />
                <LanguageSwitcher variant="minimal" />

                <button
                    onClick={() => navigate('/disponibilites')}
                    className="relative p-2 text-[#9A9A9A] hover:bg-[#F4F4F4] hover:text-[#0D0D0D] rounded-lg transition-colors"
                    title="Disponibilités"
                >
                    <Calendar size={18} />
                </button>

                <button
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative p-2 text-[#9A9A9A] hover:bg-[#F4F4F4] hover:text-[#0D0D0D] rounded-lg transition-colors"
                >
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626] border-2 border-white"></span>
                </button>

                <div onClick={() => navigate('/settings')} className="cursor-pointer hidden sm:block">
                    <UserAvatar size={32} rounded="rounded-lg" />
                </div>
            </div>

            <NotificationDrawer
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </header>
    );
}

