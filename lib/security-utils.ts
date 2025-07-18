export interface SecurityAnalysis {
  isSafe: boolean
  riskLevel: 'low' | 'medium' | 'high'
  warnings: string[]
  recommendations: string[]
}

// Performance optimization: Security analysis cache
const securityAnalysisCache = new Map<string, SecurityAnalysisCacheEntry>()
const SECURITY_CACHE_MAX_SIZE = 50 // Smaller cache for security analysis
const SECURITY_CACHE_TTL = 10 * 60 * 1000 // 10 minutes TTL for security analysis

interface SecurityAnalysisCacheEntry {
  data: SecurityAnalysis
  timestamp: number
}

// Common URL shortener domains (expanded list)
const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly',
  'adf.ly', 'short.link', 'tiny.cc', 'lnkd.in', 'rebrand.ly', 'cutt.ly',
  'bl.ink', 'clck.ru', 'short.io', 'v.gd', 'x.co', 'po.st', 'soo.gd',
  'trib.al', 'u.to', 'qr.ae', 'go2l.ink', 'x.gd', 'ift.tt', 'amzn.to',
  'youtu.be', 'fb.me', 'ln.is', 'db.tt', 'qr.net', 'owl.li', 'adcrun.ch',
  'ity.im', 'q.gs', 'viid.me', 'bc.vc', 'twitthis.com', 'u.bb', 'yourls.org',
  'prettylinkpro.com', 'scrnch.me', 'filoops.info', 'vzturl.com', 'qr.net',
  'link.zip', 'short.gy', 'tiny.one', 'rb.gy', 'chilp.it', 'short.cm'
]

// Suspicious TLDs commonly used for malicious purposes (expanded list)
const SUSPICIOUS_TLDS = [
  'tk', 'ml', 'ga', 'cf', 'click', 'download', 'zip', 'review', 'country',
  'science', 'work', 'party', 'gq', 'men', 'date', 'racing', 'loan',
  'stream', 'cricket', 'accountant', 'faith', 'win', 'bid', 'trade',
  'webcam', 'top', 'kim', 'pw', 'space', 'website', 'online', 'site',
  'tech', 'club', 'info', 'biz', 'mobi', 'name', 'pro', 'tel', 'travel',
  'xxx', 'adult', 'porn', 'sex', 'casino', 'bet', 'poker', 'game'
]

// Safe domains whitelist (expanded list)
const SAFE_DOMAINS = [
  'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
  'linkedin.com', 'github.com', 'stackoverflow.com', 'wikipedia.org',
  'amazon.com', 'microsoft.com', 'apple.com', 'netflix.com', 'reddit.com',
  'discord.com', 'zoom.us', 'dropbox.com', 'spotify.com', 'twitch.tv',
  'paypal.com', 'ebay.com', 'adobe.com', 'salesforce.com', 'oracle.com',
  'ibm.com', 'intel.com', 'nvidia.com', 'amd.com', 'hp.com', 'dell.com',
  'mozilla.org', 'cloudflare.com', 'aws.amazon.com', 'azure.microsoft.com',
  'cloud.google.com', 'heroku.com', 'vercel.com', 'netlify.com', 'firebase.google.com'
]

// Common redirect parameters (expanded list)
const REDIRECT_PARAMS = [
  'redirect', 'url', 'next', 'return', 'returnUrl', 'continue', 'goto',
  'target', 'destination', 'forward', 'link', 'ref', 'referer', 'referrer',
  'callback', 'success', 'failure', 'error', 'exit', 'out', 'external',
  'redir', 'redirect_uri', 'return_to', 'back', 'from', 'source', 'origin'
]

// Suspicious keywords in URLs
const SUSPICIOUS_KEYWORDS = [
  'phishing', 'scam', 'fraud', 'fake', 'malware', 'virus', 'trojan',
  'ransomware', 'spam', 'hack', 'crack', 'warez', 'keygen', 'serial',
  'patch', 'loader', 'activator', 'bypass', 'exploit', 'payload',
  'backdoor', 'rootkit', 'botnet', 'ddos', 'attack', 'breach'
]

// Suspicious patterns in URLs
const SUSPICIOUS_PATTERNS = [
  /[0-9]{1,3}-[0-9]{1,3}-[0-9]{1,3}-[0-9]{1,3}/, // IP-like patterns in domain
  /[a-z0-9]{20,}/, // Very long random strings
  /(.)\1{4,}/, // Repeated characters (5 or more)
  /[0-9]{10,}/, // Long number sequences
  /[a-z]-[a-z]-[a-z]/, // Suspicious dash patterns
]

/**
 * Clean up expired security analysis cache entries
 */
function cleanupSecurityCache(): void {
  const now = Date.now()
  const expiredKeys: string[] = []
  
  for (const [key, entry] of securityAnalysisCache) {
    if (now - entry.timestamp > SECURITY_CACHE_TTL) {
      expiredKeys.push(key)
    }
  }
  
  expiredKeys.forEach(key => securityAnalysisCache.delete(key))
  
  // If cache is still too large, remove oldest entries
  if (securityAnalysisCache.size > SECURITY_CACHE_MAX_SIZE) {
    const entries = Array.from(securityAnalysisCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toRemove = entries.slice(0, securityAnalysisCache.size - SECURITY_CACHE_MAX_SIZE)
    toRemove.forEach(([key]) => securityAnalysisCache.delete(key))
  }
}

/**
 * Analyzes a URL for potential security risks with caching for performance
 * @param url The URL to analyze
 * @returns SecurityAnalysis object with risk assessment
 */
export function checkUrlSafety(url: string): SecurityAnalysis {
  try {
    // Input validation
    if (typeof url !== 'string') {
      console.warn('checkUrlSafety: Invalid URL input:', typeof url)
      return {
        isSafe: false,
        riskLevel: 'high',
        warnings: ['Invalid URL provided'],
        recommendations: ['Please provide a valid URL']
      }
    }

    const trimmedUrl = url.trim()
    
    // Check cache first for performance optimization
    const cacheKey = trimmedUrl.toLowerCase() // Normalize for caching
    
    if (trimmedUrl.length === 0) {
      const emptyResult = {
        isSafe: false,
        riskLevel: 'high' as const,
        warnings: ['Empty URL provided'],
        recommendations: ['Please provide a valid URL']
      }
      
      // Cache the empty result
      securityAnalysisCache.set(cacheKey, {
        data: emptyResult,
        timestamp: Date.now()
      })
      
      return emptyResult
    }
    const cachedEntry = securityAnalysisCache.get(cacheKey)
    
    if (cachedEntry) {
      const now = Date.now()
      if (now - cachedEntry.timestamp < SECURITY_CACHE_TTL) {
        // Cache hit - return cached result
        return cachedEntry.data
      } else {
        // Cache expired - remove entry
        securityAnalysisCache.delete(cacheKey)
      }
    }

    // Clean up cache periodically
    if (Math.random() < 0.2) { // 20% chance to trigger cleanup for security cache
      cleanupSecurityCache()
    }

    // Initialize analysis variables
    const warnings: string[] = []
    const recommendations: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    let isSafe = true

    // Basic URL validation and parsing
    let urlObj: URL
    try {
      urlObj = new URL(trimmedUrl)
    } catch (urlError) {
      console.warn('checkUrlSafety: URL parsing failed:', urlError)
      const errorResult = {
        isSafe: false,
        riskLevel: 'high' as const,
        warnings: ['Invalid URL format'],
        recommendations: ['Please check that the URL is correctly formatted']
      }
      
      // Cache the error result
      securityAnalysisCache.set(cacheKey, {
        data: errorResult,
        timestamp: Date.now()
      })
      
      return errorResult
    }

    const hostname = urlObj.hostname.toLowerCase()
    const protocol = urlObj.protocol
    const pathname = urlObj.pathname
    const searchParams = urlObj.searchParams

    // Check protocol (HTTP vs HTTPS)
    try {
      if (protocol === 'http:') {
        warnings.push('This URL does not use HTTPS encryption')
        recommendations.push('Look for an HTTPS version of this site')
        riskLevel = 'medium'
        isSafe = false
      } else if (protocol !== 'https:') {
        // Handle other protocols like FTP, file, etc.
        warnings.push('URL uses an unsupported or potentially unsafe protocol')
        recommendations.push('Use HTTPS URLs when possible for better security')
        riskLevel = 'medium'
        isSafe = false
      }
    } catch (error) {
      console.warn('checkUrlSafety: Protocol check failed:', error)
    }

    // Check for URL shorteners with error handling
    try {
      if (isUrlShortener(hostname)) {
        warnings.push('This is a shortened URL - the actual destination is hidden')
        recommendations.push('Be cautious with shortened URLs from unknown sources')
        riskLevel = 'medium'
        isSafe = false
      }
    } catch (error) {
      console.warn('checkUrlSafety: URL shortener check failed:', error)
    }

    // Check for IP addresses with error handling
    try {
      if (isIpAddress(hostname)) {
        warnings.push('URL uses an IP address instead of a domain name')
        recommendations.push('Legitimate websites typically use domain names, not IP addresses')
        riskLevel = 'high'
        isSafe = false
      }
    } catch (error) {
      console.warn('checkUrlSafety: IP address check failed:', error)
    }

    // Check for suspicious TLDs with error handling
    try {
      if (hasSuspiciousTld(hostname)) {
        warnings.push('URL uses a domain extension commonly associated with suspicious sites')
        recommendations.push('Exercise extra caution with this domain extension')
        riskLevel = 'medium'
        isSafe = false
      }
    } catch (error) {
      console.warn('checkUrlSafety: TLD check failed:', error)
    }

    // Check for redirect parameters with error handling
    try {
      if (hasRedirectParameters(searchParams)) {
        warnings.push('URL contains parameters that might redirect to another site')
        recommendations.push('Check where this URL actually leads before clicking')
        riskLevel = 'medium'
        isSafe = false
      }
    } catch (error) {
      console.warn('checkUrlSafety: Redirect parameter check failed:', error)
    }

    // Check subdomain complexity with error handling
    try {
      if (hasExcessiveSubdomains(hostname)) {
        warnings.push('URL has an unusually complex subdomain structure')
        recommendations.push('Complex subdomains can be used to deceive users')
        riskLevel = 'medium'
        isSafe = false
      }
    } catch (error) {
      console.warn('checkUrlSafety: Subdomain check failed:', error)
    }

    // Final risk level calculation
    if (warnings.length === 0) {
      riskLevel = 'low'
      // Only mark as safe if it's HTTPS and has no warnings, but not necessarily in safe domain list
      isSafe = protocol === 'https:'
    } else if (warnings.length >= 3 || riskLevel === 'high') {
      riskLevel = 'high'
      isSafe = false
    } else if (warnings.length >= 1) {
      riskLevel = 'medium'
      isSafe = false
    }

    // Check for suspicious keywords with error handling
    try {
      if (hasSuspiciousKeywords(trimmedUrl)) {
        warnings.push('URL contains suspicious keywords that may indicate malicious content')
        recommendations.push('Be extremely cautious - this URL may be dangerous')
        riskLevel = 'high'
        isSafe = false
      }
    } catch (error) {
      console.warn('checkUrlSafety: Suspicious keyword check failed:', error)
    }

    // Check for suspicious patterns with error handling
    try {
      if (hasSuspiciousPatterns(trimmedUrl)) {
        warnings.push('URL contains suspicious patterns commonly used in malicious links')
        recommendations.push('This URL structure is commonly associated with threats')
        riskLevel = 'high'
        isSafe = false
      }
    } catch (error) {
      console.warn('checkUrlSafety: Suspicious pattern check failed:', error)
    }

    // Check for homograph attacks (IDN spoofing) with error handling
    try {
      if (hasHomographAttack(hostname)) {
        warnings.push('URL may use lookalike characters to impersonate legitimate sites')
        recommendations.push('Check carefully - this domain may be impersonating a trusted site')
        riskLevel = 'high'
        isSafe = false
      }
    } catch (error) {
      console.warn('checkUrlSafety: Homograph attack check failed:', error)
    }

    // Check against safe domain whitelist - override for known safe domains with HTTPS
    try {
      if (isSafeDomain(hostname) && protocol === 'https:') {
        // Only override if no high-risk indicators were found
        if (riskLevel !== 'high') {
          isSafe = true
          riskLevel = 'low'
        }
      }
    } catch (error) {
      console.warn('checkUrlSafety: Safe domain check failed:', error)
    }

    const result = {
      isSafe,
      riskLevel,
      warnings,
      recommendations
    }

    // Cache the result for future use
    securityAnalysisCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    return result
  } catch (error) {
    console.error('checkUrlSafety: Critical security analysis error:', error)
    // Return safe fallback with high risk
    const errorResult = {
      isSafe: false,
      riskLevel: 'high' as const,
      warnings: ['Security analysis failed - treat with caution'],
      recommendations: ['Unable to verify URL safety - proceed with extreme caution']
    }
    
    // Cache the error result
    securityAnalysisCache.set(cacheKey, {
      data: errorResult,
      timestamp: Date.now()
    })
    
    return errorResult
  }
}

/**
 * Checks if a hostname is a known URL shortener
 */
function isUrlShortener(hostname: string): boolean {
  return URL_SHORTENERS.some(shortener => 
    hostname === shortener || hostname.endsWith('.' + shortener)
  )
}

/**
 * Checks if a hostname is an IP address
 */
function isIpAddress(hostname: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6 pattern - handle bracketed format [::1] and unbracketed format
  const cleanHostname = hostname.replace(/^\[|\]$/g, '') // Remove brackets if present
  const ipv6Pattern = /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i
  
  return ipv4Pattern.test(hostname) || ipv6Pattern.test(cleanHostname)
}

/**
 * Checks if a hostname uses a suspicious TLD
 */
function hasSuspiciousTld(hostname: string): boolean {
  const parts = hostname.split('.')
  const tld = parts[parts.length - 1]
  return SUSPICIOUS_TLDS.includes(tld.toLowerCase())
}

/**
 * Checks if URL has redirect parameters
 */
function hasRedirectParameters(searchParams: URLSearchParams): boolean {
  for (const param of REDIRECT_PARAMS) {
    if (searchParams.has(param)) {
      return true
    }
  }
  return false
}

/**
 * Checks if hostname has excessive subdomains (more than 4 levels)
 */
function hasExcessiveSubdomains(hostname: string): boolean {
  const parts = hostname.split('.')
  return parts.length > 4
}

/**
 * Checks if hostname is in the safe domains whitelist
 */
function isSafeDomain(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase()
  return SAFE_DOMAINS.some(safeDomain => 
    lowerHostname === safeDomain || lowerHostname.endsWith('.' + safeDomain)
  )
}

/**
 * Checks if URL contains suspicious keywords
 */
function hasSuspiciousKeywords(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return SUSPICIOUS_KEYWORDS.some(keyword => lowerUrl.includes(keyword))
}

/**
 * Checks if URL matches suspicious patterns
 */
function hasSuspiciousPatterns(url: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(url))
}

/**
 * Checks for potential homograph attacks (IDN spoofing)
 * Detects mixed scripts and suspicious Unicode characters
 */
function hasHomographAttack(hostname: string): boolean {
  try {
    // Check for mixed scripts (Latin + Cyrillic, etc.)
    const hasLatin = /[a-zA-Z]/.test(hostname)
    const hasCyrillic = /[\u0400-\u04FF]/.test(hostname)
    const hasGreek = /[\u0370-\u03FF]/.test(hostname)
    const hasArabic = /[\u0600-\u06FF]/.test(hostname)
    
    // Count different script types
    const scriptCount = [hasLatin, hasCyrillic, hasGreek, hasArabic].filter(Boolean).length
    
    // Mixed scripts are suspicious
    if (scriptCount > 1) {
      return true
    }
    
    // Check for common homograph characters
    const homographChars = [
      '\u043E', // Cyrillic 'o' that looks like Latin 'o'
      '\u0430', // Cyrillic 'a' that looks like Latin 'a'
      '\u0440', // Cyrillic 'p' that looks like Latin 'p'
      '\u0435', // Cyrillic 'e' that looks like Latin 'e'
      '\u043C', // Cyrillic 'm' that looks like Latin 'm'
      '\u0445', // Cyrillic 'x' that looks like Latin 'x'
      '\u0441', // Cyrillic 'c' that looks like Latin 'c'
      '\u03BF', // Greek 'o' that looks like Latin 'o'
      '\u03B1', // Greek 'a' that looks like Latin 'a'
    ]
    
    return homographChars.some(char => hostname.includes(char))
  } catch (error) {
    console.warn('hasHomographAttack: Error checking for homograph attack:', error)
    return false
  }
}