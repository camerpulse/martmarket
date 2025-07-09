import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Translation {
  [key: string]: string;
}

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string, context?: string) => string;
  availableLanguages: { code: string; name: string; flag: string }[];
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const DEFAULT_LANGUAGE = 'en';
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' }
];

// Fallback translations for core UI elements
const FALLBACK_TRANSLATIONS: { [language: string]: Translation } = {
  en: {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.vendors': 'Vendors',
    'nav.forum': 'Forum',
    'nav.wishlist': 'Wishlist',
    'nav.profile': 'Profile',
    'nav.orders': 'Orders',
    'nav.messages': 'Messages',
    'marketplace.title': 'AI-Powered Anonymous Marketplace',
    'marketplace.subtitle': 'Trade securely with Bitcoin-only transactions, verified vendors, and AI-driven trust scoring.',
    'vendor.trust_score': 'Trust Score',
    'vendor.verified': 'Verified',
    'product.add_to_wishlist': 'Add to Wishlist',
    'product.buy_now': 'Buy Now',
    'product.out_of_stock': 'Out of Stock'
  },
  es: {
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    'nav.vendors': 'Vendedores',
    'nav.forum': 'Foro',
    'nav.wishlist': 'Lista de Deseos',
    'nav.profile': 'Perfil',
    'nav.orders': 'Pedidos',
    'nav.messages': 'Mensajes',
    'marketplace.title': 'Mercado Anónimo Impulsado por IA',
    'marketplace.subtitle': 'Comercia de forma segura con transacciones solo en Bitcoin, vendedores verificados y puntuación de confianza impulsada por IA.',
    'vendor.trust_score': 'Puntuación de Confianza',
    'vendor.verified': 'Verificado',
    'product.add_to_wishlist': 'Agregar a Lista de Deseos',
    'product.buy_now': 'Comprar Ahora',
    'product.out_of_stock': 'Agotado'
  }
  // Add more languages as needed
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or browser setting
    const saved = localStorage.getItem('opesmarket_language');
    if (saved) return saved;
    
    const browserLang = navigator.language.split('-')[0];
    return AVAILABLE_LANGUAGES.find(lang => lang.code === browserLang)?.code || DEFAULT_LANGUAGE;
  });
  
  const [translations, setTranslations] = useState<Translation>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const loadTranslations = async (language: string) => {
    try {
      setLoading(true);
      console.log('🌍 Loading translations for language:', language);
      
      // Load translations from database
      const { data, error } = await supabase
        .from('translations')
        .select('translation_key, translation_value, context')
        .eq('language_code', language);

      if (error) throw error;

      console.log('📊 Raw translation data from DB:', data);

      // Build translation object
      const dbTranslations: Translation = {};
      data?.forEach(item => {
        // The translation_key already includes the full path, no need to add context
        dbTranslations[item.translation_key] = item.translation_value;
      });

      console.log('🔧 Built DB translations object:', dbTranslations);

      // Merge with fallback translations
      const fallback = FALLBACK_TRANSLATIONS[language] || FALLBACK_TRANSLATIONS[DEFAULT_LANGUAGE];
      console.log('🔄 Fallback translations:', fallback);
      
      const finalTranslations = { ...fallback, ...dbTranslations };
      console.log('✅ Final merged translations:', finalTranslations);
      
      setTranslations(finalTranslations);
      
    } catch (error) {
      console.error('❌ Error loading translations:', error);
      // Use fallback translations on error
      const fallbackOnly = FALLBACK_TRANSLATIONS[language] || FALLBACK_TRANSLATIONS[DEFAULT_LANGUAGE];
      console.log('🚨 Using fallback only:', fallbackOnly);
      setTranslations(fallbackOnly);
    } finally {
      setLoading(false);
    }
  };

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('opesmarket_language', language);
  };

  const t = (key: string, fallback?: string): string => {
    console.log('🔍 Translation requested for key:', key);
    console.log('📝 Available translations keys:', Object.keys(translations));
    console.log('🎯 Current language:', currentLanguage);
    
    // First try the exact key
    if (translations[key]) {
      console.log('✅ Found exact match:', translations[key]);
      return translations[key];
    }
    
    // Then try without context (in case key includes context)
    const keyParts = key.split('.');
    if (keyParts.length > 1) {
      const baseKey = keyParts.slice(0, -1).join('.');
      if (translations[baseKey]) {
        console.log('✅ Found base key match:', translations[baseKey]);
        return translations[baseKey];
      }
    }
    
    // Return fallback or key itself
    const result = fallback || key;
    console.log('❌ No translation found, returning:', result);
    return result;
  };

  const value: TranslationContextType = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages: AVAILABLE_LANGUAGES,
    loading
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};