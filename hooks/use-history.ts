"use client"

import { useState, useEffect, useCallback } from "react"
import { parseQrContent, QrAction, ParsedQrContent } from "@/lib/qr-content-parser"
import { checkUrlSafety, SecurityAnalysis } from "@/lib/security-utils"
import { secureStorage, LegacyStorageUtils } from "@/lib/secure-storage"
import { limitArraySize, performanceMonitor } from "@/lib/performance-utils"

export interface QrHistoryItem {
  id: string
  text: string
  timestamp: number
  imageUrl?: string
  contentType: 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'text'
  isFavorite: boolean
  parsedData: any
  actions: QrAction[]
  securityAnalysis?: SecurityAnalysis
}

// Memory management constants
const MAX_HISTORY_SIZE = 100 // Maximum items to keep in memory
const STORAGE_HISTORY_SIZE = 50 // Maximum items to save to storage
const CLEANUP_THRESHOLD = 120 // Trigger cleanup when exceeding this size

export function useQrHistory() {
  const [history, setHistory] = useState<QrHistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)

  // Memory management: Clean up old history items
  const cleanupHistory = useCallback((items: QrHistoryItem[]): QrHistoryItem[] => {
    const endTiming = performanceMonitor.startTiming('history-cleanup')
    
    try {
      if (items.length <= MAX_HISTORY_SIZE) {
        return items
      }

      // Sort by timestamp (newest first) and favorites
      const sorted = [...items].sort((a, b) => {
        // Favorites get priority
        if (a.isFavorite && !b.isFavorite) return -1
        if (!a.isFavorite && b.isFavorite) return 1
        
        // Then by timestamp (newest first)
        return b.timestamp - a.timestamp
      })

      // Keep favorites and most recent items up to MAX_HISTORY_SIZE
      const cleaned = sorted.slice(0, MAX_HISTORY_SIZE)
      
      console.debug(`History cleanup: ${items.length} -> ${cleaned.length} items`)
      return cleaned
    } finally {
      endTiming()
    }
  }, [])

  // Load history from secure storage on initial render with migration
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Check if migration is needed
        const keysToMigrate = LegacyStorageUtils.needsMigration(["qr-code-history"])
        if (keysToMigrate.length > 0) {
          console.log("Migrating history to secure storage...")
          await LegacyStorageUtils.migrateToSecureStorage(keysToMigrate)
        }

        const data = await secureStorage.getItem("qr-code-history")
        
        if (data && Array.isArray(data)) {
          setHistory(data)
          setStorageError(null)
        } else {
          // Initialize with empty history
          setHistory([])
        }
      } catch (error) {
        console.error("Critical error loading history:", error)
        setStorageError("Failed to load history")
        setHistory([])
      } finally {
        setIsLoaded(true)
      }
    }

    loadHistory()
  }, [])

  // Save history to secure storage whenever it changes
  useEffect(() => {
    if (isLoaded && history.length >= 0) {
      const saveHistory = async () => {
        const endTiming = performanceMonitor.startTiming('history-save')
        
        try {
          // Apply memory management before saving
          let historyToSave = history
          
          // Clean up memory if threshold exceeded
          if (history.length > CLEANUP_THRESHOLD) {
            historyToSave = cleanupHistory(history)
            setHistory(historyToSave) // Update state with cleaned history
          }
          
          // Limit storage size to prevent quota issues
          const storageHistory = limitArraySize(historyToSave, STORAGE_HISTORY_SIZE)
          
          const success = await secureStorage.setItem("qr-code-history", storageHistory)
          
          if (!success) {
            console.warn("Failed to save history to secure storage")
            setStorageError("Failed to save history")
            
            // Try to save a smaller subset
            if (storageHistory.length > 10) {
              const trimmedHistory = limitArraySize(storageHistory, 10)
              const retrySuccess = await secureStorage.setItem("qr-code-history", trimmedHistory)
              
              if (retrySuccess) {
                console.info("Saved trimmed history due to storage limitations")
                setHistory(trimmedHistory)
                setStorageError("Storage limit exceeded - history trimmed to recent items")
              }
            }
          } else {
            setStorageError(null)
          }
        } catch (error) {
          console.error("Critical error saving history:", error)
          setStorageError("Failed to save history")
        } finally {
          endTiming()
        }
      }

      saveHistory()
    }
  }, [history, isLoaded, cleanupHistory])

  // Add a new QR code to history with comprehensive error handling
  const addToHistory = (text: string, imageUrl?: string) => {
    try {
      // Input validation
      if (!text || typeof text !== 'string' || !text.trim()) {
        console.warn('addToHistory: Invalid text input provided')
        return
      }

      // Parse the content to get type, parsed data, and actions with error handling
      let parsedContent: ParsedQrContent
      try {
        parsedContent = parseQrContent(text)
      } catch (parseError) {
        console.warn('addToHistory: Content parsing failed, using fallback:', parseError)
        // Fallback to basic text parsing
        parsedContent = {
          type: 'text',
          parsedData: { text: text.trim() },
          actions: []
        }
      }
      
      // Get security analysis for URLs with error handling
      let securityAnalysis: SecurityAnalysis | undefined
      if (parsedContent.type === 'url' && parsedContent.parsedData?.url) {
        try {
          securityAnalysis = checkUrlSafety(parsedContent.parsedData.url)
        } catch (securityError) {
          console.warn('addToHistory: Security analysis failed:', securityError)
          // Continue without security analysis
          securityAnalysis = undefined
        }
      }

      // Create new history item with parsed data
      const newItem: QrHistoryItem = {
        id: Date.now().toString(),
        text: text.trim(),
        timestamp: Date.now(),
        imageUrl: imageUrl || undefined,
        contentType: parsedContent.type,
        parsedData: parsedContent.parsedData || { text: text.trim() },
        actions: parsedContent.actions || [],
        securityAnalysis,
        isFavorite: false,
      }

      // Add to beginning of history (most recent first) with error handling
      setHistory((prev) => {
        try {
          // Ensure prev is an array
          const safeHistory = Array.isArray(prev) ? prev : []
          
          // Check if this exact text already exists in history
          const existingIndex = safeHistory.findIndex((item) => 
            item && typeof item.text === 'string' && item.text === text.trim()
          )

          if (existingIndex >= 0) {
            // Move to top and update with new parsed data
            const updated = [...safeHistory]
            const [existing] = updated.splice(existingIndex, 1)
            
            if (existing) {
              return [{ 
                ...existing, 
                timestamp: Date.now(), 
                imageUrl: imageUrl || existing.imageUrl,
                contentType: parsedContent.type,
                parsedData: parsedContent.parsedData || existing.parsedData,
                actions: parsedContent.actions || existing.actions,
                securityAnalysis: securityAnalysis || existing.securityAnalysis
              }, ...updated]
            }
          }

          // Limit history to 50 items to prevent memory issues
          const newHistory = [newItem, ...safeHistory]
          if (newHistory.length > 50) {
            return newHistory.slice(0, 50)
          }
          return newHistory
        } catch (historyError) {
          console.error('addToHistory: Error updating history state:', historyError)
          // Return safe fallback - just the new item
          return [newItem]
        }
      })
    } catch (error) {
      console.error('addToHistory: Critical error adding to history:', error)
      // Don't throw - just log and continue
    }
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

  // Search history including parsed content
  const searchHistory = (query: string) => {
    if (!query.trim()) return history

    const lowercaseQuery = query.toLowerCase()
    return history.filter((item) => {
      // Search in original text
      if (item.text.toLowerCase().includes(lowercaseQuery)) {
        return true
      }
      
      // Search in content type
      if (item.contentType && item.contentType.toLowerCase().includes(lowercaseQuery)) {
        return true
      }
      
      // Search in parsed data based on content type
      if (item.parsedData) {
        switch (item.contentType) {
          case 'url':
            return item.parsedData.domain?.toLowerCase().includes(lowercaseQuery) ||
                   item.parsedData.protocol?.toLowerCase().includes(lowercaseQuery)
          
          case 'email':
            return item.parsedData.email?.toLowerCase().includes(lowercaseQuery) ||
                   item.parsedData.subject?.toLowerCase().includes(lowercaseQuery)
          
          case 'phone':
            return item.parsedData.phone?.includes(query) ||
                   item.parsedData.formatted?.includes(query)
          
          case 'sms':
            return item.parsedData.phone?.includes(query) ||
                   item.parsedData.message?.toLowerCase().includes(lowercaseQuery)
          
          case 'wifi':
            return item.parsedData.ssid?.toLowerCase().includes(lowercaseQuery) ||
                   item.parsedData.security?.toLowerCase().includes(lowercaseQuery)
          
          case 'vcard':
            return item.parsedData.name?.toLowerCase().includes(lowercaseQuery) ||
                   item.parsedData.organization?.toLowerCase().includes(lowercaseQuery) ||
                   item.parsedData.email?.toLowerCase().includes(lowercaseQuery) ||
                   item.parsedData.phone?.includes(query)
          
          case 'text':
            return item.parsedData.text?.toLowerCase().includes(lowercaseQuery)
          
          default:
            return false
        }
      }
      
      return false
    })
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
