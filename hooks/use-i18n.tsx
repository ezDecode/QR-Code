"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { 
  languages, 
  type Language, 
  type Translations, 
  translations,
  getBrowserLanguage,
  isLanguageSupported 
} from '@/lib/i18n/translations'
import { getFromStorage, setToStorage } from '@/lib/storage-utils'

interface I18nContextType {
  currentLanguage: Language
  setLanguage: (languageCode: string) => void
  t: (key: keyof Translations) => string
  formatDate: (date: Date) => string
  formatNumber: (num: number) => string
  formatRelativeTime: (date: Date) => string
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]) // Default to English
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(() => {
    // Import synchronous translations for immediate access
    try {
      const { translations } = require('@/lib/i18n/translations')
      return translations.en || {} as Translations
    } catch {
      return {} as Translations
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load translations for current language (now synchronous)
  const loadCurrentTranslations = useCallback((languageCode: string) => {
    try {
      setIsLoading(true)
      const languageTranslations = translations[languageCode]
      if (languageTranslations) {
        setCurrentTranslations(languageTranslations)
      } else {
        // Fallback to English if language not found
        console.warn(`Language ${languageCode} not found, falling back to English`)
        setCurrentTranslations(translations.en || {} as Translations)
      }
    } catch (error) {
      console.error('Failed to load translations:', error)
      // Ultimate fallback to English
      setCurrentTranslations(translations.en || {} as Translations)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize language from browser/localStorage with comprehensive error handling
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        let selectedLanguageCode = 'en'
        
        // Check localStorage first with error handling
        try {
          const result = getFromStorage<string>('qr-app-language')
          if (result.success && result.data && typeof result.data === 'string') {
            const language = languages.find(lang => lang.code === result.data)
            if (language) {
              selectedLanguageCode = language.code
              setCurrentLanguage(language)
            }
          } else if (result.error) {
            console.warn('Failed to access localStorage for language preference:', result.error)
          }
        } catch (storageError) {
          console.warn('Failed to access localStorage for language preference:', storageError)
        }

        // If no stored preference, detect browser language
        if (selectedLanguageCode === 'en') {
          try {
            const browserLanguageCode = getBrowserLanguage()
            if (browserLanguageCode !== 'en') {
              const detectedLanguage = languages.find(lang => lang.code === browserLanguageCode)
              if (detectedLanguage) {
                selectedLanguageCode = browserLanguageCode
                setCurrentLanguage(detectedLanguage)
              }
            }
          } catch (navigatorError) {
            console.warn('Failed to detect browser language:', navigatorError)
          }
        }

        // Update document language
        try {
          if (typeof document !== 'undefined') {
            document.documentElement.lang = selectedLanguageCode
          }
        } catch (domError) {
          console.warn('Failed to set document language:', domError)
        }

        // Load translations for selected language
        loadCurrentTranslations(selectedLanguageCode)
      } catch (error) {
        console.error('Critical error initializing language:', error)
        // Load English as ultimate fallback
        loadCurrentTranslations('en')
      }
    }

    initializeLanguage()
  }, [loadCurrentTranslations])

  const setLanguage = useCallback((languageCode: string) => {
    try {
      // Input validation
      if (!languageCode || typeof languageCode !== 'string') {
        console.warn('setLanguage: Invalid language code provided:', languageCode)
        return
      }

      const language = languages.find(lang => lang.code === languageCode)
      if (!language) {
        console.warn('setLanguage: Language not found:', languageCode)
        return
      }

      setCurrentLanguage(language)
      
      // Update document language with error handling
      try {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language.code
        }
      } catch (domError) {
        console.warn('Failed to set document language:', domError)
      }
      
      // Save to storage with error handling
      const result = setToStorage('qr-app-language', languageCode)
      if (!result.success && result.error) {
        console.warn('Failed to save language preference:', result.error)
      }

      // Load translations for new language
      loadCurrentTranslations(languageCode)
    } catch (error) {
      console.error('Critical error setting language:', error)
    }
  }, [loadCurrentTranslations])

  const t = useCallback((key: keyof Translations): string => {
    try {
      // Use loaded translations
      if (currentTranslations && currentTranslations[key]) {
        return currentTranslations[key]
      }
      
      // Fallback to key itself if translation not found
      console.warn(`Translation missing for key: ${key} in language: ${currentLanguage.code}`)
      return key
    } catch (error) {
      console.warn('Translation error:', error)
      return key
    }
  }, [currentTranslations, currentLanguage.code])

  const formatDate = (date: Date): string => {
    try {
      return new Intl.DateTimeFormat(currentLanguage.code, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch (error) {
      return date.toLocaleDateString()
    }
  }

  const formatNumber = (num: number): string => {
    try {
      return new Intl.NumberFormat(currentLanguage.code).format(num)
    } catch (error) {
      return num.toString()
    }
  }

  const formatRelativeTime = (date: Date): string => {
    try {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) {
        return t('time.now')
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60)
      if (diffInMinutes < 60) {
        const unit = diffInMinutes === 1 ? t('time.minute') : t('time.minutes')
        return `${diffInMinutes} ${unit} ${t('time.ago')}`
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) {
        const unit = diffInHours === 1 ? t('time.hour') : t('time.hours')
        return `${diffInHours} ${unit} ${t('time.ago')}`
      }
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        const unit = diffInDays === 1 ? t('time.day') : t('time.days')
        return `${diffInDays} ${unit} ${t('time.ago')}`
      }
      
      const diffInWeeks = Math.floor(diffInDays / 7)
      if (diffInWeeks < 4) {
        const unit = diffInWeeks === 1 ? t('time.week') : t('time.weeks')
        return `${diffInWeeks} ${unit} ${t('time.ago')}`
      }
      
      const diffInMonths = Math.floor(diffInDays / 30)
      if (diffInMonths < 12) {
        const unit = diffInMonths === 1 ? t('time.month') : t('time.months')
        return `${diffInMonths} ${unit} ${t('time.ago')}`
      }
      
      const diffInYears = Math.floor(diffInDays / 365)
      const unit = diffInYears === 1 ? t('time.year') : t('time.years')
      return `${diffInYears} ${unit} ${t('time.ago')}`
    } catch (error) {
      return formatDate(date)
    }
  }

  const contextValue: I18nContextType = {
    currentLanguage,
    setLanguage,
    t,
    formatDate,
    formatNumber,
    formatRelativeTime,
    isLoading
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}