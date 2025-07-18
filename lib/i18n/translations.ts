// Language definitions and translation objects for the QR Code Generator app

export interface Language {
  code: string
  name: string
  nativeName: string
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' }
]

export interface Translations {
  // UI Elements - General
  'ui.button.generate': string
  'ui.button.clear': string
  'ui.button.copy': string
  'ui.button.download': string
  'ui.button.share': string
  'ui.button.close': string
  'ui.button.cancel': string
  'ui.button.confirm': string
  'ui.button.save': string
  'ui.button.delete': string
  'ui.button.edit': string
  'ui.button.back': string
  'ui.button.next': string
  'ui.button.previous': string
  
  // UI Elements - Labels
  'ui.label.text': string
  'ui.label.size': string
  'ui.label.color': string
  'ui.label.background': string
  'ui.label.search': string
  'ui.label.filter': string
  'ui.label.sort': string
  'ui.label.language': string
  'ui.label.settings': string
  'ui.label.history': string
  'ui.label.favorites': string
  'ui.label.actions': string
  
  // UI Elements - Placeholders
  'ui.placeholder.enterText': string
  'ui.placeholder.search': string
  'ui.placeholder.noResults': string
  'ui.placeholder.loading': string
  
  // Navigation and Headers
  'nav.title': string
  'nav.subtitle': string
  'nav.history': string
  'nav.settings': string
  'nav.about': string
  
  // QR Generator
  'qr.title': string
  'qr.subtitle': string
  'qr.generated': string
  'qr.generating': string
  'qr.error': string
  'qr.empty': string
  'qr.tooLong': string
  
  // History
  'history.title': string
  'history.empty': string
  'history.clear': string
  'history.clearConfirm': string
  'history.export': string
  'history.import': string
  'history.search': string
  'history.filter.all': string
  'history.filter.favorites': string
  'history.sort.newest': string
  'history.sort.oldest': string
  'history.sort.alphabetical': string
  
  // Content Types
  'content.type.url': string
  'content.type.email': string
  'content.type.phone': string
  'content.type.sms': string
  'content.type.wifi': string
  'content.type.vcard': string
  'content.type.text': string
  
  // Content Actions
  'action.openLink': string
  'action.copyUrl': string
  'action.sendEmail': string
  'action.copyEmail': string
  'action.call': string
  'action.copyNumber': string
  'action.sendSms': string
  'action.connectWifi': string
  'action.addContact': string
  'action.copyText': string
  
  // Security
  'security.safe': string
  'security.warning': string
  'security.danger': string
  'security.risk.low': string
  'security.risk.medium': string
  'security.risk.high': string
  'security.warning.http': string
  'security.warning.shortener': string
  'security.warning.ip': string
  'security.warning.suspicious': string
  'security.warning.redirect': string
  'security.warning.subdomain': string
  'security.recommendation.https': string
  'security.recommendation.verify': string
  'security.recommendation.caution': string
  
  // Messages - Success
  'message.success.generated': string
  'message.success.copied': string
  'message.success.downloaded': string
  'message.success.shared': string
  'message.success.saved': string
  'message.success.deleted': string
  'message.success.exported': string
  'message.success.imported': string
  'message.success.languageChanged': string
  
  // Messages - Error
  'message.error.invalid': string
  'message.error.failed': string
  'message.error.network': string
  'message.error.storage': string
  'message.error.permission': string
  'message.error.unsupported': string
  'message.error.tooLarge': string
  'message.error.parsing': string
  
  // Time and Dates
  'time.now': string
  'time.minute': string
  'time.minutes': string
  'time.hour': string
  'time.hours': string
  'time.day': string
  'time.days': string
  'time.week': string
  'time.weeks': string
  'time.month': string
  'time.months': string
  'time.year': string
  'time.years': string
  'time.ago': string
  
  // Accessibility
  'a11y.qrCode': string
  'a11y.menu': string
  'a11y.close': string
  'a11y.expand': string
  'a11y.collapse': string
  'a11y.loading': string
  'a11y.error': string
  'a11y.success': string
}

// Lazy loading cache for translations with performance monitoring
const translationCache = new Map<string, Translations>()
const loadingPromises = new Map<string, Promise<Translations>>()
const performanceMetrics = new Map<string, number>()

/**
 * Performance-optimized dynamic import function for translations
 * Implements caching, deduplication, and performance monitoring
 */
export async function loadTranslation(languageCode: string): Promise<Translations> {
  const startTime = performance.now()
  
  // Return cached translation if available
  if (translationCache.has(languageCode)) {
    const cached = translationCache.get(languageCode)!
    const loadTime = performance.now() - startTime
    console.debug(`Translation cache hit for ${languageCode}: ${loadTime.toFixed(2)}ms`)
    return cached
  }

  // Return existing loading promise to prevent duplicate requests
  if (loadingPromises.has(languageCode)) {
    console.debug(`Reusing existing loading promise for ${languageCode}`)
    return loadingPromises.get(languageCode)!
  }

  // Create new loading promise
  const loadingPromise = (async () => {
    try {
      let translationModule
      
      // Dynamic imports with tree-shaking optimization
      switch (languageCode) {
        case 'en':
          translationModule = await import('./locales/en')
          break
        case 'es':
          translationModule = await import('./locales/es')
          break
        case 'fr':
          translationModule = await import('./locales/fr')
          break
        case 'de':
          translationModule = await import('./locales/de')
          break
        case 'ja':
          translationModule = await import('./locales/ja')
          break
        default:
          console.warn(`Unsupported language code: ${languageCode}, falling back to English`)
          translationModule = await import('./locales/en')
      }
      
      const translation = translationModule.default
      
      // Cache the loaded translation
      translationCache.set(languageCode, translation)
      
      // Record performance metrics
      const loadTime = performance.now() - startTime
      performanceMetrics.set(languageCode, loadTime)
      console.debug(`Translation loaded for ${languageCode}: ${loadTime.toFixed(2)}ms`)
      
      return translation
    } catch (error) {
      console.error(`Failed to load translation for ${languageCode}:`, error)
      
      // Fallback to English if not already trying English
      if (languageCode !== 'en') {
        console.warn(`Falling back to English translation`)
        return loadTranslation('en')
      }
      
      // If even English fails, return empty object with error logging
      console.error('Critical: Failed to load English fallback translation')
      return {} as Translations
    } finally {
      // Clean up loading promise
      loadingPromises.delete(languageCode)
    }
  })()

  // Store the loading promise
  loadingPromises.set(languageCode, loadingPromise)
  
  return loadingPromise
}

/**
 * Preload translations for better performance
 * Can be called during app initialization or idle time
 */
export async function preloadTranslations(languageCodes: string[] = ['en']): Promise<void> {
  const startTime = performance.now()
  
  try {
    const preloadPromises = languageCodes.map(code => loadTranslation(code))
    await Promise.all(preloadPromises)
    
    const totalTime = performance.now() - startTime
    console.debug(`Preloaded ${languageCodes.length} translations in ${totalTime.toFixed(2)}ms`)
  } catch (error) {
    console.warn('Failed to preload some translations:', error)
  }
}

/**
 * Clear translation cache to free memory
 * Useful for memory management in long-running applications
 */
export function clearTranslationCache(keepLanguages: string[] = ['en']): void {
  const sizeBefore = translationCache.size
  
  for (const [languageCode] of translationCache) {
    if (!keepLanguages.includes(languageCode)) {
      translationCache.delete(languageCode)
      performanceMetrics.delete(languageCode)
    }
  }
  
  const sizeAfter = translationCache.size
  console.debug(`Translation cache cleared: ${sizeBefore} -> ${sizeAfter} entries`)
}

/**
 * Get performance metrics for translation loading
 */
export function getTranslationMetrics(): Record<string, number> {
  return Object.fromEntries(performanceMetrics)
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(languageCode: string): boolean {
  return languages.some(lang => lang.code === languageCode)
}

/**
 * Get available languages (alias for languages array)
 */
export function getAvailableLanguages(): Language[] {
  return languages
}

/**
 * Get the best matching language from browser preferences
 */
export function getBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en'
  
  const browserLanguages = navigator.languages || [navigator.language]
  
  for (const browserLang of browserLanguages) {
    const langCode = browserLang.split('-')[0].toLowerCase()
    if (isLanguageSupported(langCode)) {
      return langCode
    }
  }
  
  return 'en' // Default fallback
}

// Type for translation keys (for type safety)
export type TranslationKey = keyof Translations

/**
 * Get saved language preference from localStorage
 */
export function getSavedLanguage(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  
  try {
    const saved = localStorage.getItem('qr-reader-language')
    return saved && isLanguageSupported(saved) ? saved : null
  } catch (error) {
    console.warn('Failed to get saved language:', error)
    return null
  }
}

/**
 * Save language preference to localStorage
 */
export function saveLanguagePreference(languageCode: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }
  
  try {
    if (isLanguageSupported(languageCode)) {
      localStorage.setItem('qr-reader-language', languageCode)
    }
  } catch (error) {
    console.warn('Failed to save language preference:', error)
  }
}

/**
 * Update HTML lang attribute
 */
export function updateHtmlLang(languageCode: string): void {
  if (typeof document === 'undefined') {
    return
  }
  
  try {
    document.documentElement.lang = languageCode
  } catch (error) {
    console.warn('Failed to update HTML lang attribute:', error)
  }
}

// Import all translations synchronously for immediate access
import en from './locales/en'
import es from './locales/es'
import fr from './locales/fr'
import de from './locales/de'
import ja from './locales/ja'

// Static translations object for immediate access
export const translations: Record<string, Translations> = {
  en,
  es,
  fr,
  de,
  ja
}