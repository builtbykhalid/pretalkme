import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Share2, 
  Layout, 
  QrCode, 
  Chrome 
} from 'lucide-react';

const ONBOARDING_CARDS = [
  {
    id: 'deeplink',
    title: 'Qualifiez et convertissez vos prospects avec l\'IA',
    icon: Share2,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    actionLabel: 'Créer un formulaire IA',
    path: '/forms/new'
  },
  {
    id: 'linkinbio',
    title: 'Un portail unique pour vos services et liens',
    icon: Layout,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    actionLabel: 'Personnaliser ma page',
    path: '/profile'
  },
  {
    id: 'qr',
    title: 'Paiements et réservations simplifiés',
    icon: QrCode,
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-800',
    actionLabel: 'Voir mes services',
    path: '/services'
  },
  {
    id: 'extension',
    title: 'Accédez à Pretalk depuis votre navigateur',
    icon: Chrome,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    actionLabel: 'Installer l\'extension',
    path: '#'
  }
];

export default function DashboardOnboarding() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#0D0D0D]">Accueil</h1>
      </div>

      <div className="relative group">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
        >
          {ONBOARDING_CARDS.map((card) => (
            <div 
              key={card.id}
              className="min-w-[300px] md:min-w-[380px] bg-white rounded-[2.5rem] border border-[#F2F2F2] p-10 snap-start flex flex-col gap-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 group/card ring-1 ring-black/[0.02]"
            >
              <div className="h-56 overflow-hidden rounded-[1.8rem] bg-[#F9F9F9] flex items-center justify-center p-10 relative group-hover/card:bg-white transition-colors duration-500">
                {/* Glow Effect on Hover */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                
                {/* Icon with Floating Animation */}
                <div className={`${card.iconBg} p-7 rounded-[2rem] relative shadow-lg shadow-black/[0.01] group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500 transition-timing-cubic-bezier(0.34, 1.56, 0.64, 1)`}>
                  <card.icon size={52} className={`${card.iconColor} relative z-10`} strokeWidth={2.5} />
                  
                  {/* Decorative Elements */}
                  <div className="absolute -inset-1 bg-white/20 blur-sm rounded-[2rem] opacity-0 group-hover/card:opacity-100 transition-opacity" />
                  
                  {card.id === 'deeplink' && (
                    <div className="absolute -right-5 -top-5 w-10 h-10 bg-white rounded-full border border-[#F2F2F2] flex items-center justify-center shadow-md animate-pulse">
                      <div className="w-5 h-5 rounded-full border-[3px] border-primary-500" />
                    </div>
                  )}
                </div>
                
                {/* Subtle background dots pattern */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0D0D0D 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
              </div>

              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-[#0D0D0D] leading-[1.2] min-h-[64px] tracking-tight">
                  {card.title}
                </h3>
                
                <button
                  onClick={() => card.path !== '#' && navigate(card.path)}
                  className="w-full md:w-auto px-8 py-4 bg-primary-500 text-white rounded-2xl text-sm font-bold hover:bg-primary-600 transition-all active:scale-95 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group/btn"
                >
                  {card.actionLabel}
                  <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Controls */}
        <div className="absolute -bottom-12 right-0 flex gap-2">
          <button 
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center transition-all ${canScrollLeft ? 'bg-white text-[#0D0D0D] hover:bg-[#F4F4F4] shadow-sm' : 'bg-gray-50 text-gray-300 opacity-50 cursor-not-allowed'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <button 
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center transition-all ${canScrollRight ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm ring-4 ring-primary-50' : 'bg-gray-50 text-gray-300 opacity-50 cursor-not-allowed'}`}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
