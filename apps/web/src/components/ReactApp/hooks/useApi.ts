import axios from 'axios';
import { supabase } from '../lib/supabase';

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Interceptor: inject Supabase JWT in each request
apiInstance.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response interceptor: standardized error handling
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Plan limit or feature unavailable
    }
    return Promise.reject(error);
  }
);

export function useApi() {
  return {
    api: apiInstance
  };
}

export { apiInstance as api };
