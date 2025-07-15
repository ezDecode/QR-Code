"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations, languages, type Translations, type Language, type TranslationKey } from "./translations"

type I18nContextType = {
  t: (key: TranslationKey) => string
  currentLanguage: string
  setLanguage: (lang: string) => void
  languages: Language[]
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en")

  useEffect(() => {
    // Try to get language from localStorage or browser settings
    const savedLanguage = localStorage.getItem("qr-reader-language")
    const browserLanguage = navigator.language.split("-")[0]

    // Check if the browser language is supported
    const isLanguageSupported = Object.keys(translations).includes(browserLanguage)

    // Set language in this order: saved preference > browser language > default (en)
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage)
    } else if (isLanguageSupported) {
      setCurrentLanguage(browserLanguage)
    }

    // Update html lang attribute
    document.documentElement.lang = currentLanguage
  }, [currentLanguage])

  const setLanguage = (lang: string) => {
    if (Object.keys(translations).includes(lang)) {
      setCurrentLanguage(lang)
      localStorage.setItem("qr-reader-language", lang)
      document.documentElement.lang = lang
    }
  }

  const t = (key: TranslationKey): string => {
    const currentTranslations = translations[currentLanguage] as Translations
    return currentTranslations[key] || translations.en[key] || key
  }

  return <I18nContext.Provider value={{ t, currentLanguage, setLanguage, languages }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
