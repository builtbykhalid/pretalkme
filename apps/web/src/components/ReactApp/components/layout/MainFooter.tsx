import React from 'react';
import Logo from '../ui/Logo';
import { Linkedin, Twitter } from 'lucide-react';

export const MainFooter: React.FC = () => {
  return (
    <footer className="px-6 md:px-8 max-w-7xl mx-auto py-24 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2 space-y-6">
          <Logo size="lg" logoColor="primary" textColor="text-dark" className="font-black text-2xl md:text-3xl tracking-tight" />
          <p className="text-neutral-500 max-w-md font-medium leading-relaxed">Gagnez le rendez-vous avant qu'il ne commence. L'espace de travail tout-en-un pour les consultants d'élite.</p>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500 hover:text-dark cursor-pointer transition-all shadow-sm"><Linkedin size={18} /></div>
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500 hover:text-dark cursor-pointer transition-all shadow-sm"><Twitter size={18} /></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-8 md:col-span-2">
          <div>
            <h5 className="font-black text-dark mb-6 text-lg">Plateforme</h5>
            <ul className="space-y-4 text-neutral-500 text-sm font-semibold">
              <li><a href="/fonctionnalites" className="hover:text-primary-500">Fonctionnalités</a></li>
              <li><a href="/comment-ca-marche" className="hover:text-primary-500">Comment ça marche</a></li>
              <li><a href="/tarifs" className="hover:text-primary-500">Tarifs</a></li>
              <li><a href="/blog" className="hover:text-primary-500">Blog / Études de cas</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-dark mb-6 text-lg">Entreprise</h5>
            <ul className="space-y-4 text-neutral-500 text-sm font-semibold">
              <li><a href="/faq" className="hover:text-primary-500">FAQ</a></li>
              <li><a href="/contact" className="hover:text-primary-500">Contact</a></li>
              <li><a href="/legal/mentions-legales" className="hover:text-primary-500">Mentions Légales</a></li>
              <li><a href="/legal/cgv" className="hover:text-primary-500">CGV / CGU</a></li>
              <li><a href="/legal/confidentialite" className="hover:text-primary-500">Confidentialité</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="text-center text-neutral-400 text-xs md:text-sm font-medium border-t border-neutral-100 pt-12">
        &copy; {new Date().getFullYear()} PreTalk - Tous droits réservés.
      </div>
    </footer>
  );
};

export default MainFooter;
