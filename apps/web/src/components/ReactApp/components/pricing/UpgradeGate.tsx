import React from 'react';
import { ShieldCheck, Zap, ArrowRight, Lock } from 'lucide-react';
import { BillingSection } from '../settings/BillingSection';

interface UpgradeGateProps {
  title: string;
  description: string;
  feature?: string;
  onClose?: () => void;
}

export const UpgradeGate: React.FC<UpgradeGateProps> = ({ title, description, feature, onClose }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-neutral-100 rounded-[32px] text-center max-w-4xl mx-auto shadow-2xl">
      <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Lock size={28} />
      </div>
      
      <div className="space-y-3 mb-10">
        <h2 className="text-3xl font-black text-dark tracking-tight">{title}</h2>
        <p className="text-neutral-500 font-medium text-lg leading-relaxed max-w-xl">
          {description}
        </p>
        {feature && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest mt-4">
            <Zap size={14} /> Requiert le Plan Pro
          </div>
        )}
      </div>

      <div className="w-full border-t border-neutral-100 pt-10">
        <div className="mb-8 text-left">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#9A9A9A] mb-8 text-center underline decoration-primary-500/30">
            Comparez les plans et débloquez votre potentiel
          </h3>
          <BillingSection hideHeader={true} />
        </div>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="mt-6 text-neutral-400 hover:text-dark text-sm font-bold transition-colors"
        >
          Peut-être plus tard
        </button>
      )}
    </div>
  );
};

export default UpgradeGate;
