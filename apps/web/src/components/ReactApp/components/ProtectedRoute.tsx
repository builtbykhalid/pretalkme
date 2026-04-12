import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Logo from './ui/Logo';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'consultant';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const { userProfile } = useApp() as any;
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-white via-neutral-50 to-neutral-100 flex flex-col items-center justify-center gap-6">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-primary-500/6 rounded-full blur-[100px] pointer-events-none" />
        <Logo size="xl" logoColor="primary" textColor="text-neutral-900" className="text-2xl" />
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-accent-300/30" />
            <div className="absolute inset-0 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-neutral-500 text-sm font-medium animate-pulse">Chargement de votre espace...</p>
        </div>
        <div className="absolute bottom-8 text-neutral-400 text-xs text-center px-4">
          <a href="https://pretalk.me" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">Pretalk</a> powered by <a href="https://elevyup.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 transition-colors">elevyup</a>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isOnboardingRoute = location.pathname === '/onboarding';
  const effectiveRole = String((userProfile?.role || user.role || '')).toLowerCase();
  const isAdminRole = ['admin', 'super_admin', 'moderator'].includes(effectiveRole);

  // When opening /admin, AuthContext may still hold a temporary role before profile hydration.
  // Avoid redirecting too early and creating a false lockout for real admins.
  if (requiredRole === 'admin' && !isAdminRole && !userProfile?.role) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-white via-neutral-50 to-neutral-100 flex flex-col items-center justify-center gap-6">
        <Logo size="xl" logoColor="primary" textColor="text-neutral-900" className="text-2xl" />
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-accent-300/30" />
            <div className="absolute inset-0 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-neutral-500 text-sm font-medium animate-pulse">Vérification des permissions admin...</p>
        </div>
      </div>
    );
  }

  if (!isOnboardingRoute && !isAdminRole) {
    // Consider onboarding complete if the localStorage flag is set OR if the
    // user already has a meaningful profile in the database (handles localStorage
    // being wiped, incognito mode, new device, etc.)
    // We check for job_title or bio specifically, as first_name/full_name are set automatically on signup.
    const onboardingKey = `onboarding_completed_${user.id}`;
    const flagInStorage = !!localStorage.getItem(onboardingKey);
    const profileIsConfigured = !!(userProfile?.job_title || userProfile?.bio);

    if (!flagInStorage && !profileIsConfigured) {
      return <Navigate to="/onboarding" replace />;
    }

    // Re-hydrate the flag if profile is configured but flag was lost
    if (!flagInStorage && profileIsConfigured) {
      localStorage.setItem(onboardingKey, 'true');
    }
  }

  if (requiredRole === 'admin' && !isAdminRole) {
    console.warn(`Access denied. Required role: ${requiredRole}, effective role: ${effectiveRole || 'unknown'}`);
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === 'consultant' && isAdminRole) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

