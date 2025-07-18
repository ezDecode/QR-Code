/**
 * Enhanced performance monitoring system for the QR Code Generator app
 * Tracks key operations and provides insights for optimization
 */

interface PerformanceEntry {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

interface PerformanceStats {
  count: number
  totalTime: number
  averageTime: number
  minTime: number
  maxTime: number
  lastExecuted: number
}

class AppPerformanceMonitor {
  private entries: PerformanceEntry[] = []
  private readonly maxEntries = 1000
  private readonly reportingInterval = 30000 // 30 seconds
  private reportingTimer: NodeJS.Timeout | null = null
  
  constructor() {
    // Start periodic reporting in development
    if (process.env.NODE_ENV === 'development') {
      this.startPeriodicReporting()
    }
  }

  /**
   * Start timing an operation
   */
  startTiming(operationName: string, metadata?: Record<string, any>): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      this.recordEntry({
        name: operationName,
        duration,
        timestamp: Date.now(),
        metadata
      })
    }
  }

  /**
   * Record a performance entry
   */
  private recordEntry(entry: PerformanceEntry): void {
    this.entries.push(entry)
    
    // Limit entries to prevent memory growth
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries)
    }
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operationName: string): PerformanceStats | null {
    const operationEntries = this.entries.filter(entry => entry.name === operationName)
    
    if (operationEntries.length === 0) {
      return null
    }

    const durations = operationEntries.map(entry => entry.duration)
    const totalTime = durations.reduce((sum, duration) => sum + duration, 0)
    
    return {
      count: operationEntries.length,
      totalTime,
      averageTime: totalTime / operationEntries.length,
      minTime: Math.min(...durations),
      maxTime: Math.max(...durations),
      lastExecuted: Math.max(...operationEntries.map(entry => entry.timestamp))
    }
  }

  /**
   * Get all performance statistics
   */
  getAllStats(): Record<string, PerformanceStats> {
    const operationNames = [...new Set(this.entries.map(entry => entry.name))]
    const stats: Record<string, PerformanceStats> = {}
    
    for (const name of operationNames) {
      const operationStats = this.getStats(name)
      if (operationStats) {
        stats[name] = operationStats
      }
    }
    
    return stats
  }

  /**
   * Get slow operations (above threshold)
   */
  getSlowOperations(thresholdMs: number = 100): PerformanceEntry[] {
    return this.entries.filter(entry => entry.duration > thresholdMs)
  }

  /**
   * Get recent performance data
   */
  getRecentEntries(timeWindowMs: number = 60000): PerformanceEntry[] {
    const cutoffTime = Date.now() - timeWindowMs
    return this.entries.filter(entry => entry.timestamp > cutoffTime)
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const stats = this.getAllStats()
    const slowOps = this.getSlowOperations()
    
    let report = '=== QR App Performance Report ===\n\n'
    
    // Overall statistics
    report += 'Operation Statistics:\n'
    for (const [name, stat] of Object.entries(stats)) {
      report += `  ${name}:\n`
      report += `    Count: ${stat.count}\n`
      report += `    Average: ${stat.averageTime.toFixed(2)}ms\n`
      report += `    Min/Max: ${stat.minTime.toFixed(2)}ms / ${stat.maxTime.toFixed(2)}ms\n`
      report += `    Total Time: ${stat.totalTime.toFixed(2)}ms\n\n`
    }
    
    // Slow operations
    if (slowOps.length > 0) {
      report += 'Slow Operations (>100ms):\n'
      slowOps.slice(-10).forEach(entry => {
        report += `  ${entry.name}: ${entry.duration.toFixed(2)}ms\n`
      })
      report += '\n'
    }
    
    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      report += 'Memory Usage:\n'
      report += `  Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB\n`
      report += `  Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB\n`
      report += `  Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB\n\n`
    }
    
    return report
  }

  /**
   * Start periodic performance reporting
   */
  private startPeriodicReporting(): void {
    this.reportingTimer = setInterval(() => {
      const report = this.generateReport()
      console.group('🚀 Performance Report')
      console.log(report)
      console.groupEnd()
    }, this.reportingInterval)
  }

  /**
   * Stop periodic reporting
   */
  stopPeriodicReporting(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer)
      this.reportingTimer = null
    }
  }

  /**
   * Clear all performance data
   */
  clear(): void {
    this.entries = []
  }

  /**
   * Export performance data for analysis
   */
  exportData(): PerformanceEntry[] {
    return [...this.entries]
  }

  /**
   * Check if any operations are consistently slow
   */
  getPerformanceAlerts(): string[] {
    const alerts: string[] = []
    const stats = this.getAllStats()
    
    for (const [name, stat] of Object.entries(stats)) {
      // Alert if average time is over 200ms
      if (stat.averageTime > 200) {
        alerts.push(`${name} is averaging ${stat.averageTime.toFixed(2)}ms (slow)`)
      }
      
      // Alert if max time is over 1000ms
      if (stat.maxTime > 1000) {
        alerts.push(`${name} had a peak time of ${stat.maxTime.toFixed(2)}ms (very slow)`)
      }
      
      // Alert if operation is called very frequently
      if (stat.count > 100 && stat.averageTime > 50) {
        alerts.push(`${name} is called frequently (${stat.count} times) and may need optimization`)
      }
    }
    
    return alerts
  }
}

// Global performance monitor instance
export const appPerformanceMonitor = new AppPerformanceMonitor()

// Convenience function for timing operations
export function timeOperation<T>(
  operationName: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  const endTiming = appPerformanceMonitor.startTiming(operationName, metadata)
  
  try {
    const result = operation()
    return result
  } finally {
    endTiming()
  }
}

// Convenience function for timing async operations
export async function timeAsyncOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const endTiming = appPerformanceMonitor.startTiming(operationName, metadata)
  
  try {
    const result = await operation()
    return result
  } finally {
    endTiming()
  }
}

// Hook for React components to monitor render performance
export function usePerformanceMonitor(componentName: string) {
  const startTiming = () => appPerformanceMonitor.startTiming(`${componentName}-render`)
  
  return { startTiming }
}

// Performance monitoring for bundle size
export function logBundleInfo(): void {
  if (process.env.NODE_ENV === 'development') {
    // Log information about loaded modules
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    
    console.group('📦 Bundle Information')
    scripts.forEach((script, index) => {
      const src = (script as HTMLScriptElement).src
      if (src.includes('/_next/')) {
        console.log(`Script ${index + 1}: ${src}`)
      }
    })
    console.groupEnd()
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Log bundle info on load
  window.addEventListener('load', () => {
    setTimeout(logBundleInfo, 1000)
  })
  
  // Monitor page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      appPerformanceMonitor.startTiming('page-visibility-return')()
    }
  })
}