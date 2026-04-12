import React from 'react';
import LandingLayout from './LandingLayout';
import UnifiedHero from './UnifiedHero';

interface LegalTemplateProps {
  title: string;
  badge: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export const LegalTemplate: React.FC<LegalTemplateProps> = ({ title, badge, lastUpdated, children }) => {
  return (
    <LandingLayout forceScrolled={true}>
      <div className="bg-white">
        <UnifiedHero 
          badge={badge}
          title={title}
          accent="Officielles."
          description={`Dernière mise à jour : ${lastUpdated}. Ces documents régissent l'utilisation de Pretalk et nos engagements mutuels.`}
        />
        
        <article className="max-w-4xl mx-auto px-6 pb-24 prose prose-neutral prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary-600">
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-12 text-neutral-600 font-medium leading-relaxed space-y-8">
            {children}
            
            <div className="pt-12 border-t border-gray-200 mt-12 text-sm text-neutral-400 italic">
              Pretalk.me est une solution propulsée par <a href="https://elevyup.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 underline decoration-primary-500/30">elevyup.com</a>.
            </div>
          </div>
        </article>
      </div>
    </LandingLayout>
  );
};

export default LegalTemplate;
