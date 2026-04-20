import { createClient, type SupportedStorage } from '@supabase/supabase-js'

// ==========================================
// Cross-subdomain Cookie Storage
// Writes the Supabase session into a cookie scoped to .pretalk.me so that
// both app.pretalk.me (WhatsApp) and pretalk.me/app (Consultant) share the
// same auth session without re-login.
// Falls back to localStorage when running on localhost.
// ==========================================
const COOKIE_NAME = 'sb-pretalk-auth';
const IS_PROD = typeof window !== 'undefined' && window.location.hostname.endsWith('pretalk.me');
const COOKIE_DOMAIN = IS_PROD ? '.pretalk.me' : '';

function setCookie(name: string, value: string, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const domainPart = COOKIE_DOMAIN ? `; domain=${COOKIE_DOMAIN}` : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${domainPart}; SameSite=Lax${IS_PROD ? '; Secure' : ''}`;
}

function getCookie(name: string): string | null {
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function deleteCookie(name: string) {
    const domainPart = COOKIE_DOMAIN ? `; domain=${COOKIE_DOMAIN}` : '';
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
}

const cookieStorage: SupportedStorage = {
    getItem(key: string) {
        if (typeof document === 'undefined') return null;
        return getCookie(`${COOKIE_NAME}-${key}`);
    },
    setItem(key: string, value: string) {
        if (typeof document === 'undefined') return;
        setCookie(`${COOKIE_NAME}-${key}`, value);
    },
    removeItem(key: string) {
        if (typeof document === 'undefined') return;
        deleteCookie(`${COOKIE_NAME}-${key}`);
    },
};

// Configuration - use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// In dev mode with mock auth, use service role key to bypass RLS for local testing
const devServiceRoleKey = import.meta.env.DEV && import.meta.env.VITE_USE_REAL_AUTH !== 'true'
  ? import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  : null;

const rawUrl = supabaseUrl;
const rawAnonKey = devServiceRoleKey || supabaseAnonKey;

if (!rawUrl || !supabaseAnonKey) {
    console.error('[Supabase] Missing environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}
if (devServiceRoleKey) {
    console.info('[Supabase] DEV MODE: using service role key (RLS bypassed)');
}

const resolvedSupabaseUrl = rawUrl || '';
const resolvedSupabaseAnonKey = rawAnonKey || '';

console.info('[Supabase] Initializing client...');
// console.info('[Supabase] URL:', resolvedSupabaseUrl); // Hidden for security in logs

// ==========================================
// CRITICAL FIX: Intercept Tokens in URL before Supabase clears them
// Supabase-js immediately wipes the URL hash on load, destroying provider_tokens
// We MUST rescue them here at the very edge.
// ==========================================
if (typeof window !== 'undefined' && window.location.hash) {
    console.log('[TokenRescue] Hash detected on load:', window.location.hash.substring(0, 40) + '...');
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, '?'));

    const pToken = hashParams.get('provider_token');
    const pRefreshToken = hashParams.get('provider_refresh_token');

    // Save rescued tokens safely to sessionStorage
    if (pToken || pRefreshToken) {
        console.log('[TokenRescue] Provider tokens intercepted successfully!');
        if (pToken) sessionStorage.setItem('rescued_provider_token', pToken);
        if (pRefreshToken) sessionStorage.setItem('rescued_provider_refresh_token', pRefreshToken);
    }
}
// ==========================================

// Direct REST API helper - uses authenticated session or apikey for anonymous access
export const directApi = {
    baseUrl: `${resolvedSupabaseUrl}/rest/v1`,
    anonHeaders: {
        'apikey': resolvedSupabaseAnonKey,
        'Authorization': `Bearer ${resolvedSupabaseAnonKey}`,
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8',
        'Prefer': 'return=representation'
    } as Record<string, string>,

    async getHeaders() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                return {
                    ...this.anonHeaders,
                    'Authorization': `Bearer ${session.access_token}`
                };
            }
        } catch (error) {
            console.warn('Failed to get session for directApi, using anon key:', error);
        }
        return this.anonHeaders;
    },

    async select(table: string, query: string = '*', filters: Record<string, string> = {}) {
        const headers = await this.getHeaders();
        const params = new URLSearchParams({ select: query, ...filters });
        const res = await fetch(`${this.baseUrl}/${table}?${params}`, {
            method: 'GET',
            headers
        });
        if (!res.ok) {
            const text = await res.text();
            console.error('Select error:', res.status, text);
            throw new Error(`API Error: ${res.status}`);
        }
        return res.json();
    },

    async insert(table: string, data: any) {
        const headers = await this.getHeaders();
        console.log('Inserting into', table, 'with authenticated headers');
        const res = await fetch(`${this.baseUrl}/${table}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(Array.isArray(data) ? data : [data])
        });
        if (!res.ok) {
            const text = await res.text();
            console.error('Insert error:', res.status, text);
            throw new Error(`API Error: ${res.status}`);
        }
        return res.json();
    },

    async update(table: string, data: any, filters: Record<string, string>) {
        const headers = await this.getHeaders();
        const params = new URLSearchParams(filters);
        const res = await fetch(`${this.baseUrl}/${table}?${params}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
    },

    async delete(table: string, filters: Record<string, string>) {
        const headers = await this.getHeaders();
        const params = new URLSearchParams(filters);
        const res = await fetch(`${this.baseUrl}/${table}?${params}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
    }
};

// Create Supabase client — uses cookie storage in prod (cross-subdomain SSO)
// and falls back to localStorage on localhost.
export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: IS_PROD ? cookieStorage : undefined,
        storageKey: IS_PROD ? COOKIE_NAME : undefined,
    }
});

export default supabase;
