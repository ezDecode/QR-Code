/**
 * Content Security Policy Configuration
 * Helps prevent XSS, injection attacks, and other security vulnerabilities
 */

// Base CSP directives for the QR Code application
const CSP_DIRECTIVES = {
  // Default source for all content
  'default-src': ["'self'"],
  
  // Script sources - restrict to self and specific trusted domains
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for Next.js development
    "https://vercel.live", // Vercel analytics
    "https://vitals.vercel-analytics.com", // Vercel analytics
  ],
  
  // Style sources
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for dynamic styles
    "https://fonts.googleapis.com",
  ],
  
  // Image sources - allow data URLs for QR codes
  'img-src': [
    "'self'",
    "data:", // Required for QR code generation
    "blob:", // Required for clipboard operations
    "https:", // Allow HTTPS images
  ],
  
  // Font sources
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:", // For font data URLs
  ],
  
  // Connection sources for AJAX, WebSocket, etc.
  'connect-src': [
    "'self'",
    "https://vitals.vercel-analytics.com", // Vercel analytics
    "https://vercel.live", // Vercel live
  ],
  
  // Media sources
  'media-src': ["'none'"],
  
  // Object sources (plugins)
  'object-src': ["'none'"],
  
  // Frame sources
  'frame-src': ["'none'"],
  
  // Worker sources
  'worker-src': ["'self'", "blob:"],
  
  // Child sources (deprecated but included for compatibility)
  'child-src': ["'none'"],
  
  // Manifest sources
  'manifest-src': ["'self'"],
  
  // Form action sources
  'form-action': ["'self'"],
  
  // Frame ancestors (clickjacking protection)
  'frame-ancestors': ["'none'"],
  
  // Base URI restrictions
  'base-uri': ["'self'"],
  
  // Upgrade insecure requests
  'upgrade-insecure-requests': [],
  
  // Block mixed content
  'block-all-mixed-content': [],
}

// Development-specific additions
const DEVELOPMENT_ADDITIONS = {
  'script-src': [
    "'unsafe-eval'", // Required for hot reload
    "webpack:", // Webpack dev server
  ],
  'connect-src': [
    "ws:", // WebSocket for hot reload
    "wss:", // Secure WebSocket
    "http://localhost:*", // Local development
    "http://127.0.0.1:*", // Local development
  ],
}

// Production-specific additions
const PRODUCTION_ADDITIONS = {
  'script-src': [
    // Remove unsafe-eval in production if possible
  ],
}

/**
 * Generate CSP header value
 */
export function generateCSP(isDevelopment = false): string {
  const directives = { ...CSP_DIRECTIVES }
  
  // Apply environment-specific additions
  if (isDevelopment) {
    Object.entries(DEVELOPMENT_ADDITIONS).forEach(([key, values]) => {
      directives[key] = [...(directives[key] || []), ...values]
    })
  } else {
    Object.entries(PRODUCTION_ADDITIONS).forEach(([key, values]) => {
      directives[key] = [...(directives[key] || []), ...values]
    })
  }
  
  // Convert to CSP string
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive
      }
      return `${directive} ${sources.join(' ')}`
    })
    .join('; ')
}

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSP(process.env.NODE_ENV === 'development'),
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filtering
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
  ].join(', '),
  
  // Strict Transport Security (HTTPS only)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
  }),
}

/**
 * Next.js security headers configuration
 */
export const nextSecurityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: SECURITY_HEADERS['Content-Security-Policy'],
  },
  {
    key: 'X-Content-Type-Options',
    value: SECURITY_HEADERS['X-Content-Type-Options'],
  },
  {
    key: 'X-XSS-Protection',
    value: SECURITY_HEADERS['X-XSS-Protection'],
  },
  {
    key: 'X-Frame-Options',
    value: SECURITY_HEADERS['X-Frame-Options'],
  },
  {
    key: 'Referrer-Policy',
    value: SECURITY_HEADERS['Referrer-Policy'],
  },
  {
    key: 'Permissions-Policy',
    value: SECURITY_HEADERS['Permissions-Policy'],
  },
  ...(SECURITY_HEADERS['Strict-Transport-Security'] ? [
    {
      key: 'Strict-Transport-Security',
      value: SECURITY_HEADERS['Strict-Transport-Security'],
    }
  ] : []),
]

/**
 * CSP nonce generation for inline scripts
 */
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for older browsers
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Validate CSP directive
 */
export function validateCSPDirective(directive: string, source: string): boolean {
  // Basic validation for CSP sources
  const validSourcePatterns = [
    /^'self'$/,
    /^'unsafe-inline'$/,
    /^'unsafe-eval'$/,
    /^'none'$/,
    /^https?:\/\/.+$/,
    /^wss?:\/\/.+$/,
    /^data:$/,
    /^blob:$/,
    /^'nonce-.+'$/,
    /^'sha(256|384|512)-.+'$/,
  ]
  
  return validSourcePatterns.some(pattern => pattern.test(source))
}

/**
 * Report CSP violations (for monitoring)
 */
export function handleCSPViolation(violation: any): void {
  // Log CSP violations for security monitoring
  console.warn('CSP Violation:', {
    blockedURI: violation.blockedURI,
    violatedDirective: violation.violatedDirective,
    originalPolicy: violation.originalPolicy,
    sourceFile: violation.sourceFile,
    lineNumber: violation.lineNumber,
    columnNumber: violation.columnNumber,
  })
  
  // In production, you might want to send this to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to monitoring service
    // monitoringService.reportCSPViolation(violation)
  }
}