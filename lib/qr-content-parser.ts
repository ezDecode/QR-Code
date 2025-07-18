import { LucideIcon, Link, Mail, Phone, MessageSquare, Wifi, User, Copy, ExternalLink, PhoneCall } from 'lucide-react';

// Performance optimization: Content parsing cache
const contentParsingCache = new Map<string, ParsedQrContent>()
const CACHE_MAX_SIZE = 100 // Limit cache size to prevent memory issues
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes TTL

interface CacheEntry {
  data: ParsedQrContent
  timestamp: number
}

export interface QrAction {
  label: string;
  action: () => void;
  icon: LucideIcon;
  variant?: 'default' | 'destructive' | 'outline';
}

export interface ParsedQrContent {
  type: 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'text';
  parsedData: any;
  actions: QrAction[];
  securityAnalysis?: any; // Will be implemented in task 2
}

// URL parsing interfaces
interface UrlData {
  url: string;
  domain: string;
  protocol: string;
}

// Email parsing interfaces
interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

// Phone parsing interfaces
interface PhoneData {
  phone: string;
  formatted: string;
}

// SMS parsing interfaces
interface SmsData {
  phone: string;
  message?: string;
}

// WiFi parsing interfaces
interface WiFiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

// vCard parsing interfaces
interface VCardData {
  name?: string;
  organization?: string;
  phone?: string;
  email?: string;
  url?: string;
  [key: string]: string | undefined;
}

/**
 * Parse URL content and extract protocol and domain information
 */
function parseUrl(content: string): UrlData | null {
  try {
    // Check if it's a valid URL
    const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    if (!urlRegex.test(content)) {
      return null;
    }

    const url = new URL(content);
    return {
      url: content,
      domain: url.hostname,
      protocol: url.protocol.replace(':', '')
    };
  } catch {
    return null;
  }
}

/**
 * Parse email content including mailto links and standalone addresses
 */
function parseEmail(content: string): EmailData | null {
  // Check for mailto: protocol
  if (content.toLowerCase().startsWith('mailto:')) {
    try {
      const url = new URL(content);
      const email = url.pathname;
      
      // Validate that we have a valid email address
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return null;
      }
      
      const params = new URLSearchParams(url.search);
      
      return {
        email,
        subject: params.get('subject') || undefined,
        body: params.get('body') || undefined
      };
    } catch {
      return null;
    }
  }

  // Check for standalone email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(content)) {
    return {
      email: content
    };
  }

  return null;
}

/**
 * Parse phone numbers with international format support
 */
function parsePhone(content: string): PhoneData | null {
  // Remove all non-digit characters except + at the start
  const cleaned = content.replace(/[^\d+]/g, '');
  
  // Check for various phone number patterns
  const phonePatterns = [
    /^\+\d{1,3}\d{4,14}$/, // International format
    /^\d{10,15}$/, // Domestic format
    /^tel:\+?\d+$/i // tel: protocol
  ];

  let phoneNumber = cleaned;
  
  // Handle tel: protocol
  if (content.toLowerCase().startsWith('tel:')) {
    phoneNumber = content.substring(4).replace(/[^\d+]/g, '');
  }

  const isValid = phonePatterns.some(pattern => pattern.test(phoneNumber));
  
  if (isValid && phoneNumber.length >= 7) {
    return {
      phone: phoneNumber,
      formatted: formatPhoneNumber(phoneNumber)
    };
  }

  return null;
}

/**
 * Format phone number for display
 */
function formatPhoneNumber(phone: string): string {
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Simple US format for 10-digit numbers
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  
  return phone;
}

/**
 * Parse SMS content with phone and message extraction
 */
function parseSms(content: string): SmsData | null {
  // Check for sms: protocol
  if (content.toLowerCase().startsWith('sms:')) {
    try {
      const url = new URL(content);
      const phone = url.pathname;
      
      // Validate that we have a phone number
      if (!phone || phone.length === 0) {
        return null;
      }
      
      const params = new URLSearchParams(url.search);
      
      return {
        phone,
        message: params.get('body') || undefined
      };
    } catch {
      return null;
    }
  }

  // Check for SMSTO: protocol (alternative format)
  if (content.toLowerCase().startsWith('smsto:')) {
    const parts = content.substring(6).split(':');
    const phone = parts[0];
    
    // Validate that we have a phone number
    if (!phone || phone.length === 0) {
      return null;
    }
    
    return {
      phone,
      message: parts[1] || undefined
    };
  }

  return null;
}

/**
 * Parse WiFi credentials from WIFI: protocol format
 */
function parseWifi(content: string): WiFiData | null {
  if (!content.toLowerCase().startsWith('wifi:')) {
    return null;
  }

  try {
    const wifiString = content.substring(5);
    const params: { [key: string]: string } = {};
    
    // Parse WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
    const parts = wifiString.split(';');
    
    for (const part of parts) {
      if (part.includes(':')) {
        const [key, ...valueParts] = part.split(':');
        params[key] = valueParts.join(':');
      }
    }

    const ssid = params.S || '';
    const password = params.P || '';
    const security = (params.T as 'WPA' | 'WEP' | 'nopass') || 'WPA';
    const hidden = params.H === 'true';

    if (ssid) {
      return {
        ssid,
        password,
        security,
        hidden
      };
    }
  } catch {
    // Fall through to return null
  }

  return null;
}

/**
 * Parse vCard content with contact field extraction
 */
function parseVCard(content: string): VCardData | null {
  if (!content.includes('BEGIN:VCARD') || !content.includes('END:VCARD')) {
    return null;
  }

  try {
    const lines = content.split(/\r?\n/);
    const vcard: VCardData = {};

    for (const line of lines) {
      if (line.startsWith('FN:')) {
        vcard.name = line.substring(3);
      } else if (line.startsWith('ORG:')) {
        vcard.organization = line.substring(4);
      } else if (line.startsWith('TEL:') || line.includes('TEL;')) {
        vcard.phone = line.split(':')[1];
      } else if (line.startsWith('EMAIL:') || line.includes('EMAIL;')) {
        vcard.email = line.split(':')[1];
      } else if (line.startsWith('URL:')) {
        vcard.url = line.substring(4);
      }
    }

    // Return vCard data if we found at least one field
    if (Object.keys(vcard).length > 0) {
      return vcard;
    }
  } catch {
    // Fall through to return null
  }

  return null;
}

/**
 * Generate actions for URL content
 */
function generateUrlActions(data: UrlData): QrAction[] {
  return [
    {
      label: 'Open Link',
      action: () => window.open(data.url, '_blank'),
      icon: ExternalLink
    },
    {
      label: 'Copy URL',
      action: () => navigator.clipboard.writeText(data.url),
      icon: Copy
    }
  ];
}

/**
 * Generate actions for email content
 */
function generateEmailActions(data: EmailData): QrAction[] {
  const actions: QrAction[] = [
    {
      label: 'Copy Email',
      action: () => navigator.clipboard.writeText(data.email),
      icon: Copy
    }
  ];

  // Add send email action
  const mailtoUrl = data.subject || data.body 
    ? `mailto:${data.email}?${new URLSearchParams({
        ...(data.subject && { subject: data.subject }),
        ...(data.body && { body: data.body })
      }).toString()}`
    : `mailto:${data.email}`;

  actions.unshift({
    label: 'Send Email',
    action: () => window.open(mailtoUrl),
    icon: Mail
  });

  return actions;
}

/**
 * Generate actions for phone content
 */
function generatePhoneActions(data: PhoneData): QrAction[] {
  return [
    {
      label: 'Call',
      action: () => window.open(`tel:${data.phone}`),
      icon: PhoneCall
    },
    {
      label: 'Copy Number',
      action: () => navigator.clipboard.writeText(data.phone),
      icon: Copy
    }
  ];
}

/**
 * Generate actions for SMS content
 */
function generateSmsActions(data: SmsData): QrAction[] {
  const smsUrl = data.message 
    ? `sms:${data.phone}?body=${encodeURIComponent(data.message)}`
    : `sms:${data.phone}`;

  return [
    {
      label: 'Send SMS',
      action: () => window.open(smsUrl),
      icon: MessageSquare
    },
    {
      label: 'Copy Number',
      action: () => navigator.clipboard.writeText(data.phone),
      icon: Copy
    }
  ];
}

/**
 * Generate actions for WiFi content
 */
function generateWifiActions(data: WiFiData): QrAction[] {
  return [
    {
      label: 'Copy Network Name',
      action: () => navigator.clipboard.writeText(data.ssid),
      icon: Copy
    },
    {
      label: 'Copy Password',
      action: () => navigator.clipboard.writeText(data.password),
      icon: Copy,
      variant: 'outline' as const
    }
  ];
}

/**
 * Generate actions for vCard content
 */
function generateVCardActions(data: VCardData): QrAction[] {
  const actions: QrAction[] = [];

  if (data.phone) {
    actions.push({
      label: 'Call',
      action: () => window.open(`tel:${data.phone}`),
      icon: PhoneCall
    });
  }

  if (data.email) {
    actions.push({
      label: 'Send Email',
      action: () => window.open(`mailto:${data.email}`),
      icon: Mail
    });
  }

  if (data.url) {
    actions.push({
      label: 'Visit Website',
      action: () => window.open(data.url, '_blank'),
      icon: ExternalLink
    });
  }

  // Always add copy contact action
  actions.push({
    label: 'Copy Contact',
    action: () => {
      const contactText = Object.entries(data)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      navigator.clipboard.writeText(contactText);
    },
    icon: Copy,
    variant: 'outline' as const
  });

  return actions;
}

/**
 * Generate actions for plain text content
 */
function generateTextActions(content: string): QrAction[] {
  return [
    {
      label: 'Copy Text',
      action: () => navigator.clipboard.writeText(content),
      icon: Copy
    }
  ];
}

/**
 * Clean up expired cache entries to prevent memory leaks
 */
function cleanupCache(): void {
  const now = Date.now()
  const expiredKeys: string[] = []
  
  for (const [key, entry] of contentParsingCache) {
    if (now - (entry as any).timestamp > CACHE_TTL) {
      expiredKeys.push(key)
    }
  }
  
  expiredKeys.forEach(key => contentParsingCache.delete(key))
  
  // If cache is still too large, remove oldest entries
  if (contentParsingCache.size > CACHE_MAX_SIZE) {
    const entries = Array.from(contentParsingCache.entries())
    entries.sort((a, b) => (a[1] as any).timestamp - (b[1] as any).timestamp)
    
    const toRemove = entries.slice(0, contentParsingCache.size - CACHE_MAX_SIZE)
    toRemove.forEach(([key]) => contentParsingCache.delete(key))
  }
}

/**
 * Main function to parse QR content and determine appropriate actions
 * Implements caching for performance optimization
 */
export function parseQrContent(content: string): ParsedQrContent {
  try {
    // Input validation
    if (!content || typeof content !== 'string') {
      console.warn('parseQrContent: Invalid input provided:', typeof content)
      return {
        type: 'text',
        parsedData: { text: '' },
        actions: generateTextActions('')
      };
    }

    const trimmedContent = content.trim();
    
    if (trimmedContent.length === 0) {
      return {
        type: 'text',
        parsedData: { text: '' },
        actions: generateTextActions('')
      };
    }

    // Check cache first for performance optimization
    const cacheKey = trimmedContent
    const cachedEntry = contentParsingCache.get(cacheKey) as CacheEntry | undefined
    
    if (cachedEntry) {
      const now = Date.now()
      if (now - cachedEntry.timestamp < CACHE_TTL) {
        // Cache hit - return cached result
        return cachedEntry.data
      } else {
        // Cache expired - remove entry
        contentParsingCache.delete(cacheKey)
      }
    }

    // Clean up cache periodically
    if (Math.random() < 0.1) { // 10% chance to trigger cleanup
      cleanupCache()
    }

    let result: ParsedQrContent;

    // Try to parse as URL with error handling
    try {
      const urlData = parseUrl(trimmedContent);
      if (urlData) {
        result = {
          type: 'url',
          parsedData: urlData,
          actions: generateUrlActions(urlData)
        };
        // Cache and return result
        contentParsingCache.set(cacheKey, { data: result, timestamp: Date.now() } as CacheEntry);
        return result;
      }
    } catch (error) {
      console.warn('parseQrContent: URL parsing failed:', error)
    }

    // Try to parse as email with error handling
    try {
      const emailData = parseEmail(trimmedContent);
      if (emailData) {
        result = {
          type: 'email',
          parsedData: emailData,
          actions: generateEmailActions(emailData)
        };
        // Cache and return result
        contentParsingCache.set(cacheKey, { data: result, timestamp: Date.now() } as CacheEntry);
        return result;
      }
    } catch (error) {
      console.warn('parseQrContent: Email parsing failed:', error)
    }

    // Try to parse as SMS with error handling
    try {
      const smsData = parseSms(trimmedContent);
      if (smsData) {
        result = {
          type: 'sms',
          parsedData: smsData,
          actions: generateSmsActions(smsData)
        };
        // Cache and return result
        contentParsingCache.set(cacheKey, { data: result, timestamp: Date.now() } as CacheEntry);
        return result;
      }
    } catch (error) {
      console.warn('parseQrContent: SMS parsing failed:', error)
    }

    // Try to parse as WiFi with error handling
    try {
      const wifiData = parseWifi(trimmedContent);
      if (wifiData) {
        result = {
          type: 'wifi',
          parsedData: wifiData,
          actions: generateWifiActions(wifiData)
        };
        // Cache and return result
        contentParsingCache.set(cacheKey, { data: result, timestamp: Date.now() } as CacheEntry);
        return result;
      }
    } catch (error) {
      console.warn('parseQrContent: WiFi parsing failed:', error)
    }

    // Try to parse as vCard (before phone to avoid conflicts) with error handling
    try {
      const vcardData = parseVCard(trimmedContent);
      if (vcardData) {
        result = {
          type: 'vcard',
          parsedData: vcardData,
          actions: generateVCardActions(vcardData)
        };
        // Cache and return result
        contentParsingCache.set(cacheKey, { data: result, timestamp: Date.now() } as CacheEntry);
        return result;
      }
    } catch (error) {
      console.warn('parseQrContent: vCard parsing failed:', error)
    }

    // Try to parse as phone with error handling
    try {
      const phoneData = parsePhone(trimmedContent);
      if (phoneData) {
        result = {
          type: 'phone',
          parsedData: phoneData,
          actions: generatePhoneActions(phoneData)
        };
        // Cache and return result
        contentParsingCache.set(cacheKey, { data: result, timestamp: Date.now() } as CacheEntry);
        return result;
      }
    } catch (error) {
      console.warn('parseQrContent: Phone parsing failed:', error)
    }

    // Fallback to plain text
    result = {
      type: 'text',
      parsedData: { text: trimmedContent },
      actions: generateTextActions(trimmedContent)
    };

    // Cache the result for future use
    contentParsingCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    } as CacheEntry);

    return result;
  } catch (error) {
    console.error('parseQrContent: Critical parsing error:', error)
    
    // Return safe fallback
    return {
      type: 'text',
      parsedData: { text: typeof content === 'string' ? content : '' },
      actions: generateTextActions(typeof content === 'string' ? content : '')
    };
  }
}