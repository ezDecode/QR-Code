/**
 * Utility functions for safe localStorage operations with error handling
 */

export interface StorageResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Check if localStorage is available and accessible
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (error) {
    console.warn('localStorage is not available:', error)
    return false
  }
}

/**
 * Safely get an item from localStorage with error handling
 */
export function getFromStorage<T>(key: string, defaultValue?: T): StorageResult<T> {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        data: defaultValue,
        error: 'localStorage is not available'
      }
    }

    const item = localStorage.getItem(key)
    if (item === null) {
      return {
        success: true,
        data: defaultValue
      }
    }

    const parsedData = JSON.parse(item) as T
    return {
      success: true,
      data: parsedData
    }
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error)
    return {
      success: false,
      data: defaultValue,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Safely set an item in localStorage with error handling
 */
export function setToStorage<T>(key: string, value: T): StorageResult<T> {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available'
      }
    }

    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
    
    return {
      success: true,
      data: value
    }
  } catch (error) {
    console.error(`Error writing to localStorage (key: ${key}):`, error)
    
    // Handle quota exceeded error specifically
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: 'Storage quota exceeded. Please clear some data and try again.'
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Safely remove an item from localStorage with error handling
 */
export function removeFromStorage(key: string): StorageResult<void> {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available'
      }
    }

    localStorage.removeItem(key)
    return {
      success: true
    }
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Safely clear all localStorage with error handling
 */
export function clearStorage(): StorageResult<void> {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        success: false,
        error: 'localStorage is not available'
      }
    }

    localStorage.clear()
    return {
      success: true
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  isAvailable: boolean
  usedSpace?: number
  totalSpace?: number
  usagePercentage?: number
} {
  try {
    if (!isLocalStorageAvailable()) {
      return { isAvailable: false }
    }

    // Estimate used space by serializing all localStorage data
    let usedSpace = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        usedSpace += localStorage[key].length + key.length
      }
    }

    // Most browsers have a 5-10MB limit for localStorage
    const estimatedTotalSpace = 5 * 1024 * 1024 // 5MB in bytes
    const usagePercentage = (usedSpace / estimatedTotalSpace) * 100

    return {
      isAvailable: true,
      usedSpace,
      totalSpace: estimatedTotalSpace,
      usagePercentage: Math.min(usagePercentage, 100)
    }
  } catch (error) {
    console.error('Error getting storage info:', error)
    return { isAvailable: false }
  }
}