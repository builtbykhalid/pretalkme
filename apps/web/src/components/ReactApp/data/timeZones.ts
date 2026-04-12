// Extended time zones data
export interface TimeZoneOption {
  value: string; // e.g., "Europe/Paris"
  label: string; // e.g., "Paris (UTC+1/+2)"
  offset: string; // e.g., "UTC+1"
}

export const EXTENDED_TIMEZONE_OPTIONS: TimeZoneOption[] = [
  // Europe
  { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/London', label: 'Londres (UTC+0/+1)', offset: 'UTC+0' },
  { value: 'Europe/Brussels', label: 'Bruxelles (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Zurich', label: 'Zurich (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Rome', label: 'Rome (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Vienna', label: 'Vienne (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Stockholm', label: 'Stockholm (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Oslo', label: 'Oslo (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Copenhagen', label: 'Copenhague (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Prague', label: 'Prague (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Warsaw', label: 'Varsovie (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Budapest', label: 'Budapest (UTC+1/+2)', offset: 'UTC+1' },
  { value: 'Europe/Bucharest', label: 'Bucarest (UTC+2/+3)', offset: 'UTC+2' },
  { value: 'Europe/Athens', label: 'Athènes (UTC+2/+3)', offset: 'UTC+2' },
  { value: 'Europe/Helsinki', label: 'Helsinki (UTC+2/+3)', offset: 'UTC+2' },
  { value: 'Europe/Istanbul', label: 'Istanbul (UTC+3)', offset: 'UTC+3' },
  { value: 'Europe/Moscow', label: 'Moscou (UTC+3)', offset: 'UTC+3' },

  // North America
  { value: 'America/New_York', label: 'New York (UTC-5/-4)', offset: 'UTC-5' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8/-7)', offset: 'UTC-8' },
  { value: 'America/Chicago', label: 'Chicago (UTC-6/-5)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Denver (UTC-7/-6)', offset: 'UTC-7' },
  { value: 'America/Phoenix', label: 'Phoenix (UTC-7)', offset: 'UTC-7' },
  { value: 'America/Anchorage', label: 'Anchorage (UTC-9/-8)', offset: 'UTC-9' },
  { value: 'America/Honolulu', label: 'Honolulu (UTC-10)', offset: 'UTC-10' },
  { value: 'America/Montreal', label: 'Montréal (UTC-5/-4)', offset: 'UTC-5' },
  { value: 'America/Toronto', label: 'Toronto (UTC-5/-4)', offset: 'UTC-5' },
  { value: 'America/Vancouver', label: 'Vancouver (UTC-8/-7)', offset: 'UTC-8' },
  { value: 'America/Mexico_City', label: 'Mexico City (UTC-6/-5)', offset: 'UTC-6' },

  // South America
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)', offset: 'UTC-3' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (UTC-3)', offset: 'UTC-3' },
  { value: 'America/Bogota', label: 'Bogota (UTC-5)', offset: 'UTC-5' },
  { value: 'America/Lima', label: 'Lima (UTC-5)', offset: 'UTC-5' },
  { value: 'America/Santiago', label: 'Santiago (UTC-4/-3)', offset: 'UTC-4' },

  // Africa
  { value: 'Africa/Casablanca', label: 'Casablanca (UTC+0/+1)', offset: 'UTC+0' },
  { value: 'Africa/Tunis', label: 'Tunis (UTC+1)', offset: 'UTC+1' },
  { value: 'Africa/Algiers', label: 'Alger (UTC+1)', offset: 'UTC+1' },
  { value: 'Africa/Lagos', label: 'Lagos (UTC+1)', offset: 'UTC+1' },
  { value: 'Africa/Cairo', label: 'Le Caire (UTC+2)', offset: 'UTC+2' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (UTC+2)', offset: 'UTC+2' },
  { value: 'Africa/Nairobi', label: 'Nairobi (UTC+3)', offset: 'UTC+3' },
  { value: 'Africa/Addis_Ababa', label: 'Addis-Abeba (UTC+3)', offset: 'UTC+3' },

  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)', offset: 'UTC+4' },
  { value: 'Asia/Riyadh', label: 'Riyad (UTC+3)', offset: 'UTC+3' },
  { value: 'Asia/Tehran', label: 'Téhéran (UTC+3:30/+4:30)', offset: 'UTC+3:30' },
  { value: 'Asia/Baghdad', label: 'Bagdad (UTC+3)', offset: 'UTC+3' },
  { value: 'Asia/Jerusalem', label: 'Jérusalem (UTC+2/+3)', offset: 'UTC+2' },
  { value: 'Asia/Amman', label: 'Amman (UTC+2/+3)', offset: 'UTC+2' },
  { value: 'Asia/Beirut', label: 'Beyrouth (UTC+2/+3)', offset: 'UTC+2' },
  { value: 'Asia/Damascus', label: 'Damas (UTC+2/+3)', offset: 'UTC+2' },
  { value: 'Asia/Kuwait', label: 'Koweït (UTC+3)', offset: 'UTC+3' },
  { value: 'Asia/Qatar', label: 'Doha (UTC+3)', offset: 'UTC+3' },
  { value: 'Asia/Bahrain', label: 'Bahreïn (UTC+3)', offset: 'UTC+3' },
  { value: 'Asia/Muscat', label: 'Mascate (UTC+4)', offset: 'UTC+4' },
  { value: 'Asia/Yemen', label: 'Yémen (UTC+3)', offset: 'UTC+3' },
  { value: 'Asia/Kolkata', label: 'New Delhi (UTC+5:30)', offset: 'UTC+5:30' },
  { value: 'Asia/Karachi', label: 'Karachi (UTC+5)', offset: 'UTC+5' },
  { value: 'Asia/Dhaka', label: 'Dhaka (UTC+6)', offset: 'UTC+6' },
  { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7)', offset: 'UTC+7' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (UTC+8)', offset: 'UTC+8' },
  { value: 'Asia/Shanghai', label: 'Shanghai (UTC+8)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)', offset: 'UTC+9' },
  { value: 'Asia/Seoul', label: 'Séoul (UTC+9)', offset: 'UTC+9' },
  { value: 'Asia/Singapore', label: 'Singapour (UTC+8)', offset: 'UTC+8' },
  { value: 'Asia/Jakarta', label: 'Jakarta (UTC+7)', offset: 'UTC+7' },
  { value: 'Asia/Manila', label: 'Manille (UTC+8)', offset: 'UTC+8' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10/+11)', offset: 'UTC+10' },
  { value: 'Australia/Melbourne', label: 'Melbourne (UTC+10/+11)', offset: 'UTC+10' },
  { value: 'Australia/Perth', label: 'Perth (UTC+8)', offset: 'UTC+8' },
  { value: 'Pacific/Auckland', label: 'Auckland (UTC+12/+13)', offset: 'UTC+12' },

  // Pacific
  { value: 'Pacific/Honolulu', label: 'Honolulu (UTC-10)', offset: 'UTC-10' },
  { value: 'Pacific/Fiji', label: 'Fidji (UTC+12/+13)', offset: 'UTC+12' },

  // UTC
  { value: 'UTC', label: 'UTC (Temps universel)', offset: 'UTC+0' }
];
