import React from 'react';
import { usePlanLimits } from '../ReactApp/hooks/usePlanLimits';

interface UpgradeGateProps {
  metric?: string;
  feature?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showOverlay?: boolean;
}

export const UpgradeGate: React.FC<UpgradeGateProps> = ({
  metric,
  feature,
  children,
  fallback,
  showOverlay = true
}) => {
  const { loading, checkLimit, hasFeature, plan } = usePlanLimits();

  if (loading) return <> {children} </>; // Show content while loading or a skeleton

  let allowed = true;
  let reason = '';

  if (metric) {
    const status = checkLimit(metric as any);
    allowed = status.allowed;
    reason = `Limite de ${metric} atteinte (${status.current}/${status.limit})`;
  }

  if (feature && allowed) {
    allowed = hasFeature(feature);
    reason = `La fonctionnalité ${feature} n'est pas incluse dans votre plan ${plan}`;
  }

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showOverlay) {
    return (
      <div className="relative group">
        <div className="opacity-40 pointer-events-none filter blur-[2px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-indigo-100 max-w-sm text-center transform transition-all group-hover:scale-105">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Fonctionnalité Verrouillée</h3>
            <p className="text-slate-600 text-sm mb-6">{reason}</p>
            <button 
              onClick={() => window.location.href = '/settings/billing'}
              className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Passer au niveau supérieur
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
