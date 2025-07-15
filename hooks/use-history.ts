"use client"

import { useState, useEffect } from "react"

export interface QrHistoryItem {
  id: string
  text: string
  timestamp: number
  imageUrl?: string
  contentType?: 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'text'
  isFavorite?: boolean
  parsedData?: any
}

export function useQrHistory() {
  const [history, setHistory] = useState<QrHistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem("qr-code-history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("Failed to parse history:", error)
        // Reset history if corrupted
        localStorage.removeItem("qr-code-history")
      }
    }
    setIsLoaded(true)
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("qr-code-history", JSON.stringify(history))
    }
  }, [history, isLoaded])

  // Add a new QR code to history
  const addToHistory = (text: string, imageUrl?: string, contentType?: QrHistoryItem['contentType'], parsedData?: any) => {
    // Don't add empty text
    if (!text.trim()) return

    // Create new history item
    const newItem: QrHistoryItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
      imageUrl,
      contentType,
      parsedData,
      isFavorite: false,
    }

    // Add to beginning of history (most recent first)
    setHistory((prev) => {
      // Check if this exact text already exists in history
      const existingIndex = prev.findIndex((item) => item.text === text)

      if (existingIndex >= 0) {
        // Move to top and update timestamp if exists
        const updated = [...prev]
        const [existing] = updated.splice(existingIndex, 1)
        return [{ ...existing, timestamp: Date.now(), imageUrl, contentType, parsedData }, ...updated]
      }

      // Limit history to 50 items
      const newHistory = [newItem, ...prev]
      if (newHistory.length > 50) {
        return newHistory.slice(0, 50)
      }
      return newHistory
    })
  }

  // Remove an item from history
  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  // Clear all history
  const clearHistory = () => {
    setHistory([])
  }

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    )
  }

  // Search history
  const searchHistory = (query: string) => {
    if (!query.trim()) return history

    const lowercaseQuery = query.toLowerCase()
    return history.filter((item) =>
      item.text.toLowerCase().includes(lowercaseQuery) ||
      (item.contentType && item.contentType.toLowerCase().includes(lowercaseQuery))
    )
  }

  // Filter by content type
  const filterByType = (type: QrHistoryItem['contentType']) => {
    if (!type) return history
    return history.filter((item) => item.contentType === type)
  }

  // Get favorites
  const getFavorites = () => {
    return history.filter((item) => item.isFavorite)
  }

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    searchHistory,
    filterByType,
    getFavorites,
    isLoaded,
  }
}
