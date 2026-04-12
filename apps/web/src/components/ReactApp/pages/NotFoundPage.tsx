import React from 'react';
import LandingLayout from '../components/layout/LandingLayout';
import { Btn, ArrowRight } from '../../Landing/ui';

export const NotFoundPage: React.FC = () => {
  return (
    <LandingLayout forceScrolled={true}>
      <div className="pt-60 pb-32 px-6 text-center max-w-2xl mx-auto bg-white">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/20 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] bg-white shadow-sm mx-auto mb-8">
          Erreur 404
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-dark tracking-tighter leading-tight mb-6">
          Oups ! Cette page s'est <span className="text-primary-500">perdue.</span>
        </h1>
        <p className="text-neutral-500 font-medium text-lg leading-relaxed mb-12">
          La page que vous recherchez n'existe pas ou a été déplacée. Pas d'inquiétude, l'IA de Pretalk peut tout résoudre, mais pour l'instant, revenons à la base.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Btn href="/" to={undefined} onClick={undefined} variant="black" size="lg">Retour à l'accueil</Btn>
          <Btn href="/contact" to={undefined} onClick={undefined} variant="outline" size="lg">Nous contacter</Btn>
        </div>
      </div>
    </LandingLayout>
  );
};

export default NotFoundPage;
