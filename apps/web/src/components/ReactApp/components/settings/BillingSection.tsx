import React, { useState } from 'react';
import { Check, Zap, Rocket, Star, ShieldCheck } from 'lucide-react';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useAuth } from '../../context/AuthContext';

// 🍋 Lemon Squeezy Store URL
const STORE_URL = 'https://pretalk.lemonsqueezy.com/checkout/buy';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Star,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    description: 'Parfait pour les solopreneurs qui débutent.',
    features: ['30 leads par mois', '3 formulaires actifs', 'Templates standard', 'Export CSV'],
    variants: {
      monthly: '1504145',
      annual: '1504174'
    },
    monthlyPrice: 19,
    annualPrice: 15
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-100',
    description: 'Pour les consultants qui veulent passer au niveau supérieur.',
    features: ['Leads illimités (Soft Limit)', '10 formulaires actifs', 'Branding personnalisé', 'IA avancée (Scoring+', 'Support prioritaire'],
    variants: {
      monthly: '1504190',
      annual: '1504194'
    },
    popular: true,
    monthlyPrice: 29,
    annualPrice: 23
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: Rocket,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    description: 'Pour les agences et équipes en pleine croissance.',
    features: ['Tout le plan Pro', 'White-label complet', 'Gestion d\'équipe (5 membres)', 'Automations avancées', 'API Access (bientôt)'],
    variants: {
      monthly: '1504200',
      annual: '1504233'
    },
    monthlyPrice: 99,
    annualPrice: 79
  }
];

export const BillingSection: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const { plan, loading } = usePlanLimits();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const handleUpgrade = (variantId: string) => {
    if (!user) {
      window.location.href = '/app/login';
      return;
    }
    // Construct the LS checkout URL with custom user_id for webhook sync
    const checkoutUrl = `${STORE_URL}/${variantId}?checkout[custom][user_id]=${user.id}&checkout[email]=${encodeURIComponent(user.email || '')}`;
    window.open(checkoutUrl, '_blank');
  };

  if (loading && user) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6">
      {!hideHeader && (
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#0D0D0D]">Des tarifs simples, sans surprise.</h2>
          <p className="text-neutral-500 font-medium">
            Démultipliez votre capacité de prospection avec l'intelligence artificielle de Pretalk. 
            {billingCycle === 'annual' ? <span className="text-emerald-600 ml-1">Économisez jusque 20% en annuel !</span> : ''}
          </p>
        </div>
      )}
      
      {/* Toggle Billing Cycle */}
      <div className="flex items-center justify-center pt-4">
        <div className="flex bg-[#F4F4F4] p-1 rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-white text-dark shadow-sm' : 'text-neutral-500 hover:text-dark'}`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-white text-dark shadow-sm' : 'text-neutral-500 hover:text-dark'}`}
          >
            Annuel
            <span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((p) => {
          const isActive = !!(user && plan === p.id);
          const currentPrice = billingCycle === 'monthly' ? p.monthlyPrice : p.annualPrice;
          const variantId = billingCycle === 'monthly' ? p.variants.monthly : p.variants.annual;

          return (
            <div 
              key={p.id}
              className={`relative flex flex-col p-8 bg-white rounded-3xl border-2 transition-all duration-500 ${p.popular ? 'border-primary-500 shadow-2xl shadow-primary-500/10 scale-105 z-10' : 'border-[#EEEEEE] hover:border-neutral-300'}`}
            >
              {p.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Plus populaire
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 ${p.bgColor} ${p.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                  <p.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-dark mb-2">{p.name}</h3>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">{p.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-dark">{currentPrice}€</span>
                  <span className="text-neutral-400 text-sm font-bold">/mois</span>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  {billingCycle === 'annual' && (
                    <p className="text-[10px] text-emerald-600 font-bold italic">Facturé annuellement (soit {currentPrice * 12}€/an)</p>
                  )}
                  <p className="text-[11px] text-primary-600 font-black uppercase tracking-wider">14 jours d'essai gratuit</p>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-50 text-emerald-600 rounded-full p-0.5">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-sm text-neutral-600 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(variantId)}
                disabled={isActive}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl ${isActive 
                  ? 'bg-[#F4F4F4] text-[#9A9A9A] cursor-not-allowed border border-[#EEEEEE]' 
                  : p.popular 
                    ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/20' 
                    : 'bg-dark text-white hover:bg-black'}`}
              >
                {isActive ? 'Plan actuel' : user ? `Passer à ${p.name}` : `Choisir ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
