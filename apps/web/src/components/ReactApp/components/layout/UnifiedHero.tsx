import React from 'react';
import { Reveal } from '../../../Landing/ui';

interface UnifiedHeroProps {
  badge: string;
  title: string;
  accent: string;
  description: string;
  children?: React.ReactNode;
}

export const UnifiedHero: React.FC<UnifiedHeroProps> = ({ badge, title, accent, description, children }) => {
  return (
    <section className="pt-32 pb-16 px-6 md:px-8 max-w-7xl mx-auto scroll-mt-24 bg-white">
      <div className="text-center space-y-6">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/20 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] bg-white shadow-sm mx-auto mb-4">
            {badge}
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="text-4xl md:text-6xl font-black text-dark tracking-tighter leading-tight">
            {title} <span className="text-primary-500">{accent}</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="text-neutral-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            {description}
          </p>
        </Reveal>
        {children && (
          <Reveal delay={240}>
            <div className="pt-4">
              {children}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default UnifiedHero;
