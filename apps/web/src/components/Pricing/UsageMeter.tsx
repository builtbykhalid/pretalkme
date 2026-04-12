import React from 'react';
import { usePlanLimits } from '../ReactApp/hooks/usePlanLimits';

interface UsageMeterProps {
  metric: 'leads' | 'forms_published' | 'pdf_generations' | 'email_sends' | 'ai_generations';
  label: string;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({ metric, label }) => {
  const { checkLimit, loading } = usePlanLimits();

  if (loading) {
    return <div className="h-20 w-full bg-slate-100 animate-pulse rounded-lg" />;
  }

  const { current, limit } = checkLimit(metric as any);
  const percentage = Math.min(100, limit > 0 ? (current / limit) * 100 : 0);
  const isNearLimit = percentage > 80;
  const isFull = percentage >= 100;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs font-bold text-slate-500">
          {limit === Infinity ? `${current} / ∞` : `${current} / ${limit}`}
        </span>
      </div>
      
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${
            isFull ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {isNearLimit && !isFull && (
        <p className="text-[10px] text-amber-600 font-medium mt-2 animate-pulse">
          Quota bientôt atteint !
        </p>
      )}
      {isFull && (
        <p className="text-[10px] text-rose-600 font-medium mt-2">
          Limite atteinte. Passez au plan supérieur.
        </p>
      )}
    </div>
  );
};

export const MultiUsageDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UsageMeter metric="leads" label="Leads qualifiés" />
      <UsageMeter metric="forms_published" label="Formulaires actifs" />
      <UsageMeter metric="pdf_generations" label="Rapports PDF" />
      <UsageMeter metric="email_sends" label="Emails envoyés" />
      <UsageMeter metric="ai_generations" label="Analyses IA" />
    </div>
  );
};
