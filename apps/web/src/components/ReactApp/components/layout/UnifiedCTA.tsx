import React from 'react';
import { ArrowRight, Play as PlayIcon } from 'lucide-react';
import { ST, Reveal, Btn } from '../../../Landing/ui';
import { useAuth } from '../../context/AuthContext';

export const UnifiedCTA: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <section className="relative py-16 md:py-20 px-6 md:px-8 bg-[#221A40] text-center overflow-hidden">
      <div className="absolute -top-87.5 left-1/2 -translate-x-1/2 w-250 h-250 bg-[radial-gradient(circle,rgba(72,217,81,0.15)_0%,transparent_60%)] pointer-events-none animate-pulse-slow"/>
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#48D951] mb-4">Propulsez votre activité</p>
          <ST light className="mb-4 leading-tight">
            <span className="text-white/60">C'est qu'il est temps<br className="hidden md:block"/>d'essayer l'excellence.</span>
          </ST>
          <p className="text-[17px] md:text-[19px] text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
            Rejoignez <span className="text-white font-bold">340+ consultants</span>. 14 jours d'essai gratuit + Garantie satisfait ou remboursé sous 30 jours.
          </p>
        </Reveal>
        <Reveal delay={160}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!loading && user ? (
              <Btn href="/dashboard" to={undefined} onClick={undefined} variant="green" size="lg" className="w-full sm:w-auto shadow-2xl shadow-primary-500/40">
                Accéder au Dashboard <ArrowRight className="ml-2" />
              </Btn>
            ) : (
              <>
                <Btn href="/app/login" to={undefined} onClick={undefined} variant="green" size="lg" className="w-full sm:w-auto shadow-2xl shadow-primary-500/40">
                  Démarrer l'essai gratuit <ArrowRight className="ml-2" />
                </Btn>
                <Btn href="/contact" to={undefined} onClick={undefined} variant="outline-dark" size="lg" className="w-full sm:w-auto backdrop-blur-md border-white/10 text-white">
                  <PlayIcon size={18} className="mr-2" /> Voir une démo live
                </Btn>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default UnifiedCTA;
