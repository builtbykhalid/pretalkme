import React, { useState, useEffect } from 'react';
import Logo from '../ui/Logo';
import { Bell, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MainHeaderProps {
  forceScrolled?: boolean;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ forceScrolled = false }) => {
  const [scrolled, setScrolled] = useState(forceScrolled);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (forceScrolled) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [forceScrolled]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 py-5 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm text-dark' : 'bg-linear-to-b from-dark/55 to-transparent text-white'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center w-full relative">
        <Logo size="lg" logoColor="primary" textColor={scrolled ? 'text-dark' : 'text-white'} className="font-black text-2xl tracking-tight shrink-0" />
        
        <div className={`hidden lg:flex items-center gap-8 font-semibold text-sm absolute left-1/2 -translate-x-1/2 ${scrolled ? 'text-dark/70' : 'text-white/70'}`}>
          <a href="/#fonctionnalites" className="hover:text-primary-500 transition-colors">Fonctionnalités</a>
          <a href="/tarifs" className="hover:text-primary-500 transition-colors">Tarifs</a>
          <a href="/#comment-ca-marche" className="hover:text-primary-500 transition-colors">Comment ça marche</a>
          <a href="/blog" className="hover:text-primary-500 transition-colors">Blog</a>
        </div>

        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          {!loading && user ? (
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden ${scrolled ? 'border-neutral-200' : 'border-white/20'}`}
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-500 flex items-center justify-center text-dark font-bold text-sm uppercase">
                      {user.email?.[0] || 'U'}
                    </div>
                  )}
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-neutral-100 flex flex-col gap-0.5 mb-2">
                        <p className="text-sm font-bold text-dark truncate">{user.user_metadata?.full_name || 'Utilisateur'}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <a href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors">
                        <LayoutDashboard size={18} />
                        Mon Dashboard
                      </a>
                      <button 
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5 md:gap-8">
              <a href="/app/login" className={`font-semibold text-sm hover:text-primary-500 transition-colors ${scrolled ? 'text-dark' : 'text-white'}`}>Connexion</a>
              <a href="/app/login" className="bg-primary-500 text-dark font-bold px-5 py-2.5 rounded hover:bg-primary-400 transition-colors no-underline">Essayer gratuitement</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainHeader;
