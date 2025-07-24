/**
 * Security Sanitization Utilities
 * Provides input sanitization and XSS protection for QR code content
 */

// Dangerous protocols that should never be allowed
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'about:',
  'chrome:',
  'chrome-extension:',
  'moz-extension:',
  'ms-browser-extension:',
  'ms-appx:',
  'ms-appx-web:',
  'ftp:',
  'ftps:',
  'sftp:'
];

// Safe protocols for QR code content
const SAFE_PROTOCOLS = [
  'http:',
  'https:',
  'mailto:',
  'tel:',
  'sms:',
  'smsto:',
  'geo:',
  'market:',
  'intent:',
  'itms:',
  'itms-apps:',
  'play:'
];

// HTML entities for basic sanitization
const HTML_ENTITIES: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// JavaScript keywords and patterns to detect potential XSS
const XSS_PATTERNS = [
  /javascript:/gi,
  /vbscript:/gi,
  /data:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
  /<script/gi,
  /<\/script/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /<meta/gi,
  /<style/gi,
  /<\/style/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
  /import\s*\(/gi,
  /eval\s*\(/gi,
  /document\./gi,
  /window\./gi,
  /alert\s*\(/gi,
  /confirm\s*\(/gi,
  /prompt\s*\(/gi
];

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    console.warn('sanitizeHtml: Invalid input type:', typeof input);
    return '';
  }

  return input.replace(/[&<>"'`=\/]/g, (match) => HTML_ENTITIES[match] || match);
}

/**
 * Detect potential XSS content in input
 */
export function detectXSS(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const lowerInput = input.toLowerCase();
  
  // Check for dangerous patterns
  return XSS_PATTERNS.some(pattern => pattern.test(lowerInput));
}

/**
 * Validate and sanitize URL for safe usage
 */
export function sanitizeUrl(url: string): string | null {
  try {
    if (typeof url !== 'string') {
      console.warn('sanitizeUrl: Invalid URL type:', typeof url);
      return null;
    }

    const trimmedUrl = url.trim();
    
    if (trimmedUrl.length === 0) {
      return null;
    }

    // Check for dangerous protocols first
    const lowerUrl = trimmedUrl.toLowerCase();
    if (DANGEROUS_PROTOCOLS.some(protocol => lowerUrl.startsWith(protocol))) {
      console.warn('sanitizeUrl: Dangerous protocol detected:', trimmedUrl);
      return null;
    }

    // Check for XSS patterns
    if (detectXSS(trimmedUrl)) {
      console.warn('sanitizeUrl: XSS patterns detected in URL:', trimmedUrl);
      return null;
    }

    // Validate URL structure
    let urlObj: URL;
    try {
      // Add protocol if missing for validation
      let urlToValidate = trimmedUrl;
      if (!trimmedUrl.includes('://') && !trimmedUrl.startsWith('mailto:') && 
          !trimmedUrl.startsWith('tel:') && !trimmedUrl.startsWith('sms:')) {
        urlToValidate = 'https://' + trimmedUrl;
      }
      
      urlObj = new URL(urlToValidate);
      
      // Check if protocol is safe
      if (!SAFE_PROTOCOLS.includes(urlObj.protocol)) {
        console.warn('sanitizeUrl: Unsafe protocol:', urlObj.protocol);
        return null;
      }
      
      return urlToValidate;
    } catch (error) {
      console.warn('sanitizeUrl: Invalid URL format:', trimmedUrl);
      return null;
    }
  } catch (error) {
    console.error('sanitizeUrl: Critical error:', error);
    return null;
  }
}

/**
 * Safely open URL with additional security checks
 */
export function safeOpenUrl(url: string): boolean {
  try {
    const sanitizedUrl = sanitizeUrl(url);
    
    if (!sanitizedUrl) {
      console.warn('safeOpenUrl: URL failed sanitization:', url);
      return false;
    }

    // Additional runtime check before opening
    if (detectXSS(sanitizedUrl)) {
      console.warn('safeOpenUrl: XSS detected in sanitized URL:', sanitizedUrl);
      return false;
    }

    // Use window.open with security parameters
    const newWindow = window.open(sanitizedUrl, '_blank', 'noopener,noreferrer');
    
    if (newWindow) {
      // Prevent access to the parent window
      newWindow.opener = null;
      return true;
    } else {
      console.warn('safeOpenUrl: Failed to open window for:', sanitizedUrl);
      return false;
    }
  } catch (error) {
    console.error('safeOpenUrl: Error opening URL:', error);
    return false;
  }
}

/**
 * Sanitize text content for safe display
 */
export function sanitizeDisplayText(text: string): string {
  if (typeof text !== 'string') {
    console.warn('sanitizeDisplayText: Invalid text type:', typeof text);
    return '';
  }

  // Remove any potentially dangerous content
  let sanitized = sanitizeHtml(text);
  
  // Remove control characters except common whitespace
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  
  // Limit length to prevent DoS
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000) + '...';
  }
  
  return sanitized;
}

/**
 * Validate email address with security considerations
 */
export function sanitizeEmail(email: string): string | null {
  try {
    if (typeof email !== 'string') {
      return null;
    }

    const trimmedEmail = email.trim();
    
    // Basic length check
    if (trimmedEmail.length === 0 || trimmedEmail.length > 254) {
      return null;
    }

    // Check for XSS patterns
    if (detectXSS(trimmedEmail)) {
      console.warn('sanitizeEmail: XSS patterns detected in email:', trimmedEmail);
      return null;
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      return null;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.\./,  // Consecutive dots
      /^\./, // Starting with dot
      /\.$/, // Ending with dot
      /@\./,  // @ followed by dot
      /\.@/   // dot followed by @
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(trimmedEmail))) {
      return null;
    }

    return trimmedEmail;
  } catch (error) {
    console.error('sanitizeEmail: Critical error:', error);
    return null;
  }
}

/**
 * Validate phone number with security considerations
 */
export function sanitizePhone(phone: string): string | null {
  try {
    if (typeof phone !== 'string') {
      return null;
    }

    const trimmedPhone = phone.trim();
    
    // Check for XSS patterns
    if (detectXSS(trimmedPhone)) {
      console.warn('sanitizePhone: XSS patterns detected in phone:', trimmedPhone);
      return null;
    }

    // Remove all non-digit characters except + at the start
    const cleaned = trimmedPhone.replace(/[^\d+]/g, '');
    
    // Basic length validation (minimum 7 digits, maximum 15)
    const digitsOnly = cleaned.replace(/\+/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return null;
    }

    // Validate format
    const phonePattern = /^\+?[1-9]\d{6,14}$/;
    if (!phonePattern.test(cleaned)) {
      return null;
    }

    return cleaned;
  } catch (error) {
    console.error('sanitizePhone: Critical error:', error);
    return null;
  }
}

/**
 * Generic sanitization for QR content based on type
 */
export function sanitizeQrContent(content: string, type: string): string | null {
  try {
    switch (type) {
      case 'url':
        return sanitizeUrl(content);
      case 'email':
        return sanitizeEmail(content);
      case 'phone':
      case 'sms':
        return sanitizePhone(content);
      case 'text':
      default:
        return sanitizeDisplayText(content);
    }
  } catch (error) {
    console.error('sanitizeQrContent: Critical error:', error);
    return null;
  }
}

/**
 * Security audit for QR content
 */
export interface SecurityAudit {
  isSafe: boolean;
  issues: string[];
  sanitizedContent: string | null;
  riskLevel: 'low' | 'medium' | 'high';
}

export function auditQrContent(content: string, type: string): SecurityAudit {
  const issues: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  try {
    // XSS detection
    if (detectXSS(content)) {
      issues.push('Potential XSS content detected');
      riskLevel = 'high';
    }

    // Protocol check for URLs
    if (type === 'url') {
      const lowerContent = content.toLowerCase();
      if (DANGEROUS_PROTOCOLS.some(protocol => lowerContent.startsWith(protocol))) {
        issues.push('Dangerous protocol detected');
        riskLevel = 'high';
      }
    }

    // Length check
    if (content.length > 10000) {
      issues.push('Content exceeds safe length limit');
      riskLevel = 'medium';
    }

    // Control character check
    if (/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/.test(content)) {
      issues.push('Control characters detected');
      riskLevel = 'medium';
    }

    const sanitizedContent = sanitizeQrContent(content, type);
    const isSafe = issues.length === 0 && sanitizedContent !== null;

    return {
      isSafe,
      issues,
      sanitizedContent,
      riskLevel
    };
  } catch (error) {
    console.error('auditQrContent: Critical error:', error);
    return {
      isSafe: false,
      issues: ['Security audit failed'],
      sanitizedContent: null,
      riskLevel: 'high'
    };
  }
}