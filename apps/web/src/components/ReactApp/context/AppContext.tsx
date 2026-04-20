import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Authentication & State
  user: any | null;
  tenantId: string | null;
  agentRole: 'owner' | 'admin' | 'agent' | 'viewer' | null;
  plan: string;
  config: any | null; // Tenant config
  
  // Loading states
  initializing: boolean;
  
  // Handlers
  refreshTenantData: () => Promise<void>;
  updateTenantConfig: (updates: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [agentRole, setAgentRole] = useState<'owner' | 'admin' | 'agent' | 'viewer' | null>(null);
  const [plan, setPlan] = useState<string>('trial');
  const [config, setConfig] = useState<any | null>(null);
  const [initializing, setInitializing] = useState(true);

  const fetchTenantData = async () => {
    if (!user) {
      setInitializing(false);
      return;
    }

    try {
      // 1. Fetch user assignment from 'users' table (Agent 08 Schema)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tenant_id, role, name, avatar_url')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        console.warn('AppProvider: User not found in users table. Retrying with mock if dev.');
        // If dev mode, we might need to seed a user or use default
        if (import.meta.env.DEV && import.meta.env.VITE_USE_REAL_AUTH !== 'true') {
           setTenantId(import.meta.env.VITE_DEV_TENANT_ID || '0497e239-559e-4d90-998a-6feaa05fa0ad');
           setAgentRole('owner');
        }
        setInitializing(false);
        return;
      }

      setTenantId(userData.tenant_id);
      setAgentRole(userData.role as any);

      // 2. Fetch tenant config from 'tenants' table
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', userData.tenant_id)
        .single();

      if (tenantData) {
        setPlan(tenantData.plan || 'trial');
        setConfig(tenantData);
      }

    } catch (err) {
      console.error('AppProvider: Initialization failed', err);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, [user]);

  const updateTenantConfig = async (updates: any) => {
    if (!tenantId) return;
    const { error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId);
    
    if (!error) {
      setConfig((prev: any) => ({ ...prev, ...updates }));
    }
  };

  return (
    <AppContext.Provider 
      value={{ 
        user,
        tenantId,
        agentRole,
        plan,
        config,
        initializing,
        refreshTenantData: fetchTenantData,
        updateTenantConfig
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
