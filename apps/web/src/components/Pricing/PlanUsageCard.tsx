import { usePlanLimits } from '../ReactApp/hooks/usePlanLimits';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, AlertTriangle } from 'lucide-react';

export const PlanUsageCard: React.FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  const { plan, usage, limits, loading, checkLimit } = usePlanLimits();
  const navigate = useNavigate();

  if (loading) return null;

  const leadStatus = checkLimit('leads');
  const leadPercentage = Math.min(100, leadStatus.limit > 0 ? (leadStatus.current / leadStatus.limit) * 100 : 0);
  
  const isTrial = plan === 'trial';
  const isExpired = plan === 'expired';

  // Calculate trial days remaining
  let trialDaysLeft = 0;
  if (isTrial && usage?.trial_ends_at) {
      const end = new Date(usage.trial_ends_at);
      const now = new Date();
      trialDaysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (collapsed) {
    return (
      <div 
        className="flex flex-col items-center gap-2 py-4 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors"
        onClick={() => navigate('/settings/billing')}
        title={isTrial ? `Essai : ${trialDaysLeft}j restants` : `Plan ${plan}`}
      >
        <div className={`p-2 rounded-lg ${isTrial ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
          {isTrial ? <Clock size={18} /> : <Zap size={18} />}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isTrial ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700'}`}>
            <Zap size={14} className="fill-current" />
          </div>
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Plan {plan}
          </span>
        </div>
        {isTrial && (
          <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
            {trialDaysLeft}j restants
          </span>
        )}
      </div>

      {!isExpired ? (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-medium text-slate-500">Leads qualifiés</span>
              <span className="text-[11px] font-bold text-slate-700">
                {leadStatus.limit === Infinity ? leadStatus.current : `${leadStatus.current}/${leadStatus.limit}`}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 rounded-full ${leadPercentage > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                style={{ width: `${leadPercentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => navigate('/settings/billing')}
            className="w-full py-2 bg-white border border-slate-200 text-slate-900 text-[11px] font-bold rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            Gérer mon abonnement
          </button>
        </div>
      ) : (
        <div className="text-center">
            <div className="flex justify-center mb-2">
                <AlertTriangle size={24} className="text-rose-500" />
            </div>
            <p className="text-xs font-bold text-rose-600 mb-2">Plan Expiré</p>
            <button
                onClick={() => navigate('/settings/billing')}
                className="w-full py-2 bg-rose-600 text-white text-[11px] font-bold rounded-lg hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95"
            >
                Réactiver maintenant
            </button>
        </div>
      )}
    </div>
  );
};
