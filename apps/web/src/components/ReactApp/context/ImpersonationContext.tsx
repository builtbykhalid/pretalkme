import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';

export interface ImpersonationState {
  isImpersonating: boolean;
  adminId: string | null;
  adminEmail: string | null;
  impersonatedUserId: string | null;
  impersonatedUserEmail: string | null;
}

interface ImpersonationContextType {
  impersonation: ImpersonationState;
  exitImpersonation: () => void;
}

export const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const ImpersonationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [impersonation, setImpersonation] = useState<ImpersonationState>({
    isImpersonating: false,
    adminId: null,
    adminEmail: null,
    impersonatedUserId: null,
    impersonatedUserEmail: null,
  });

  useEffect(() => {
    // Check if there's an active impersonation session
    const session = sessionStorage.getItem('admin_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setImpersonation({
          isImpersonating: true,
          adminId: parsed.admin_id,
          adminEmail: parsed.admin_email,
          impersonatedUserId: parsed.impersonated_user_id,
          impersonatedUserEmail: parsed.impersonated_user_email,
        });
      } catch (e) {
        console.error('Failed to parse impersonation session:', e);
      }
    }
  }, []);

  const exitImpersonation = () => {
    sessionStorage.removeItem('admin_session');
    setImpersonation({
      isImpersonating: false,
      adminId: null,
      adminEmail: null,
      impersonatedUserId: null,
      impersonatedUserEmail: null,
    });
    window.location.href = '/admin/users';
  };

  return (
    <ImpersonationContext.Provider value={{ impersonation, exitImpersonation }}>
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within ImpersonationProvider');
  }
  return context;
};





