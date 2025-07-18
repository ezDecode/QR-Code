/**
 * Performance utilities for optimizing user interactions and operations
 */

/**
 * Debounce function to limit the rate of function calls
 * Useful for search inputs, resize events, and other high-frequency operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // Set new timeout
    timeoutId = setTimeout(() => {
      func.apply(null, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle function to limit function calls to at most once per specified interval
 * Useful for scroll events and other continuous operations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCallTime >= interval) {
      // Execute immediately if enough time has passed
      lastCallTime = now
      func.apply(null, args)
    } else if (!timeoutId) {
      // Schedule execution for the remaining time
      const remainingTime = interval - (now - lastCallTime)
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now()
        func.apply(null, args)
        timeoutId = null
      }, remainingTime)
    }
  }
}

/**
 * Memory management utility to limit array size and prevent memory leaks
 */
export function limitArraySize<T>(array: T[], maxSize: number): T[] {
  if (array.length <= maxSize) {
    return array
  }
  
  // Keep the most recent items
  return array.slice(-maxSize)
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  private readonly maxSamples = 100
  
  /**
   * Start timing an operation
   */
  startTiming(operationName: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      this.recordMetric(operationName, duration)
    }
  }
  
  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const samples = this.metrics.get(name)!
    samples.push(value)
    
    // Limit samples to prevent memory growth
    if (samples.length > this.maxSamples) {
      samples.shift()
    }
  }
  
  /**
   * Get average performance for an operation
   */
  getAverage(operationName: string): number {
    const samples = this.metrics.get(operationName)
    if (!samples || samples.length === 0) {
      return 0
    }
    
    const sum = samples.reduce((acc, val) => acc + val, 0)
    return sum / samples.length
  }
  
  /**
   * Get all performance metrics
   */
  getAllMetrics(): Record<string, { average: number, samples: number }> {
    const result: Record<string, { average: number, samples: number }> = {}
    
    for (const [name, samples] of this.metrics) {
      result[name] = {
        average: this.getAverage(name),
        samples: samples.length
      }
    }
    
    return result
  }
  
  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Utility to batch DOM updates for better performance
 */
export function batchDOMUpdates(callback: () => void): void {
  // Use requestAnimationFrame to batch DOM updates
  requestAnimationFrame(() => {
    callback()
  })
}

/**
 * Utility to check if an operation should be performed based on visibility
 * Helps avoid unnecessary work when components are not visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (!element) return false
  
  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth
  
  return (
    rect.top < windowHeight &&
    rect.bottom > 0 &&
    rect.left < windowWidth &&
    rect.right > 0
  )
}

/**
 * Utility for efficient array filtering with early termination
 */
export function efficientFilter<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean,
  maxResults?: number
): T[] {
  const results: T[] = []
  
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      results.push(array[i])
      
      // Early termination if max results reached
      if (maxResults && results.length >= maxResults) {
        break
      }
    }
  }
  
  return results
}