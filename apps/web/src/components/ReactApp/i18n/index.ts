import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des traductions
import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import es from './locales/es.json';

// Les langues disponibles
export const LANGUAGES = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

// Configuration i18next
if (typeof window !== 'undefined') {
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources: {
                fr: { translation: fr },
                en: { translation: en },
                ar: { translation: ar },
                es: { translation: es },
            },
            fallbackLng: 'fr',
            supportedLngs: ['fr', 'en', 'ar', 'es'],

            detection: {
                order: ['localStorage', 'navigator', 'htmlTag'],
                caches: ['localStorage'],
                lookupLocalStorage: 'pretalk_language',
            },

            interpolation: {
                escapeValue: false, // React déjà sécurisé contre XSS
            },

            react: {
                useSuspense: false,
            },
        });
} else {
    // Basic init for SSR without browser detector
    i18n
        .use(initReactI18next)
        .init({
            resources: {
                fr: { translation: fr },
                en: { translation: en },
                ar: { translation: ar },
                es: { translation: es },
            },
            fallbackLng: 'fr',
            supportedLngs: ['fr', 'en', 'ar', 'es'],
            interpolation: { escapeValue: false },
            react: { useSuspense: false },
        });
}

// Fonction pour changer la langue et mettre à jour la direction du document
export const changeLanguage = (lng: LanguageCode) => {
    i18n.changeLanguage(lng);
    const language = LANGUAGES.find(l => l.code === lng);
    if (language && typeof window !== 'undefined') {
        document.documentElement.dir = language.dir;
        document.documentElement.lang = lng;
    }
};

// Initialiser la direction au chargement
if (typeof window !== 'undefined') {
    const currentLang = LANGUAGES.find(l => l.code === i18n.language);
    if (currentLang) {
        document.documentElement.dir = currentLang.dir;
        document.documentElement.lang = currentLang.code;
    }
}

export default i18n;
