"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { 
  translations, 
  languages, 
  type Translations, 
  type Language, 
  type TranslationKey,
  getBrowserLanguage,
  getSavedLanguage,
  saveLanguagePreference,
  updateHtmlLang,
  isLanguageSupported
} from "./translations"

type I18nContextType = {
  t: (key: TranslationKey) => string
  currentLanguage: string
  setLanguage: (lang: string) => void
  languages: Language[]
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    try {
      // Try to get language from localStorage or browser settings
      const savedLanguage = getSavedLanguage()
      const browserLanguage = getBrowserLanguage()

      // Set language in this order: saved preference > browser language > default (en)
      const initialLanguage = savedLanguage || browserLanguage

      setCurrentLanguage(initialLanguage)
      updateHtmlLang(initialLanguage)
    } catch (error) {
      console.warn('Failed to initialize language settings:', error)
      // Fallback to English if there's any error
      setCurrentLanguage('en')
      updateHtmlLang('en')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update HTML lang attribute when language changes
  useEffect(() => {
    updateHtmlLang(currentLanguage)
  }, [currentLanguage])

  const setLanguage = (lang: string) => {
    try {
      if (isLanguageSupported(lang)) {
        setCurrentLanguage(lang)
        saveLanguagePreference(lang)
        updateHtmlLang(lang)
      } else {
        console.warn(`Language '${lang}' is not supported`)
      }
    } catch (error) {
      console.error('Failed to set language:', error)
    }
  }

  const t = (key: TranslationKey): string => {
    try {
      const currentTranslations = translations[currentLanguage] as Translations
      // Return current language translation, fallback to English, or return the key itself
      return currentTranslations?.[key] || translations.en[key] || key
    } catch (error) {
      console.warn(`Translation error for key '${key}':`, error)
      // Return the key itself as ultimate fallback
      return key
    }
  }

  return (
    <I18nContext.Provider value={{ t, currentLanguage, setLanguage, languages, isLoading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
