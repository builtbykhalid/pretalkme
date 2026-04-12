import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export type EventType = 'page_view' | 'form_start' | 'form_complete' | 'link_click';

interface TrackEventProps {
  profileId: string;
  formId?: string;
  eventType: EventType;
  customMetadata?: any;
}

export const useAnalytics = () => {
  const location = useLocation();

  const trackEvent = async ({ profileId, formId, eventType, customMetadata = {} }: TrackEventProps) => {
    try {
      // Basic OS/Device detection
      const ua = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
      const language = navigator.language;
      
      // Parse UTMs from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get('utm_source');
      const utm_medium = urlParams.get('utm_medium');
      const utm_campaign = urlParams.get('utm_campaign');
      const referrer = document.referrer;

      // Extract visitor_id from localStorage (simple persistent ID)
      let visitorId = localStorage.getItem('pretalk_visitor_id');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('pretalk_visitor_id', visitorId);
      }

      // Optional: Get location (cached for performance)
      let locationData = {};
      const cachedGeo = sessionStorage.getItem('pretalk_geo');
      if (cachedGeo) {
        locationData = JSON.parse(cachedGeo);
      } else {
        try {
          // Try ipapi.co with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const res = await fetch('https://ipapi.co/json/', {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          });
          
          clearTimeout(timeoutId);
          
          if (res.ok) {
            const data = await res.json();
            locationData = {
              country: data.country_name,
              city: data.city,
              region: data.region_code
            };
            sessionStorage.setItem('pretalk_geo', JSON.stringify(locationData));
          }
        } catch (e) {
          // Silently fail - CORS errors, timeouts, etc. are expected
          // Analytics will continue with empty locationData
        }
      }

      const metadata = {
        visitor_id: visitorId,
        source: utm_source || (referrer ? new URL(referrer).hostname : 'Direct'),
        medium: utm_medium,
        campaign: utm_campaign,
        referrer: referrer,
        language: language,
        url: window.location.href,
        device: isMobile ? 'mobile' : 'desktop',
        user_agent: ua,
        ...locationData,
        ...customMetadata
      };

      const { error } = await supabase
        .from('public_analytics_events')
        .insert({
          profile_id: profileId,
          form_id: formId,
          event_type: eventType,
          metadata: metadata
        });

      if (error) console.error('[Analytics] Error tracking event:', error);
    } catch (err) {
      console.warn('[Analytics] Failed to track event:', err);
    }
  };

  return { trackEvent };
};
