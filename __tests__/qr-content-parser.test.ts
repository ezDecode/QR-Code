import { parseQrContent } from '../lib/qr-content-parser'

// Mock clipboard API for testing
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock window.open for testing
Object.assign(window, {
  open: jest.fn(),
});

describe('QR Content Parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('URL Parsing', () => {
    test('should parse HTTPS URL correctly', () => {
      const result = parseQrContent('https://example.com')
      expect(result.type).toBe('url')
      expect(result.parsedData.url).toBe('https://example.com')
      expect(result.parsedData.domain).toBe('example.com')
      expect(result.parsedData.protocol).toBe('https')
      expect(result.actions).toHaveLength(2)
      expect(result.actions[0].label).toBe('Open Link')
      expect(result.actions[1].label).toBe('Copy URL')
    })

    test('should parse HTTP URL correctly', () => {
      const result = parseQrContent('http://example.com')
      expect(result.type).toBe('url')
      expect(result.parsedData.protocol).toBe('http')
    })

    test('should parse URL with path and query parameters', () => {
      const result = parseQrContent('https://example.com/path?param=value')
      expect(result.type).toBe('url')
      expect(result.parsedData.url).toBe('https://example.com/path?param=value')
      expect(result.parsedData.domain).toBe('example.com')
    })

    test('should parse URL with subdomain', () => {
      const result = parseQrContent('https://sub.example.com')
      expect(result.type).toBe('url')
      expect(result.parsedData.domain).toBe('sub.example.com')
    })

    test('should reject invalid URLs', () => {
      const result = parseQrContent('not-a-url')
      expect(result.type).toBe('text')
    })

    test('should reject URL without protocol', () => {
      const result = parseQrContent('example.com')
      expect(result.type).toBe('text')
    })

    test('should test URL actions', () => {
      const result = parseQrContent('https://example.com')
      
      // Test open link action
      result.actions[0].action()
      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank')
      
      // Test copy URL action
      result.actions[1].action()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com')
    })
  })

  describe('Email Parsing', () => {
    test('should parse mailto with subject and body', () => {
      const result = parseQrContent('mailto:test@example.com?subject=Hello&body=World')
      expect(result.type).toBe('email')
      expect(result.parsedData.email).toBe('test@example.com')
      expect(result.parsedData.subject).toBe('Hello')
      expect(result.parsedData.body).toBe('World')
      expect(result.actions).toHaveLength(2)
      expect(result.actions[0].label).toBe('Send Email')
      expect(result.actions[1].label).toBe('Copy Email')
    })

    test('should parse simple mailto', () => {
      const result = parseQrContent('mailto:test@example.com')
      expect(result.type).toBe('email')
      expect(result.parsedData.email).toBe('test@example.com')
      expect(result.parsedData.subject).toBeUndefined()
      expect(result.parsedData.body).toBeUndefined()
    })

    test('should parse standalone email address', () => {
      const result = parseQrContent('test@example.com')
      expect(result.type).toBe('email')
      expect(result.parsedData.email).toBe('test@example.com')
    })

    test('should parse email with complex domain', () => {
      const result = parseQrContent('user.name+tag@sub.example.co.uk')
      expect(result.type).toBe('email')
      expect(result.parsedData.email).toBe('user.name+tag@sub.example.co.uk')
    })

    test('should reject invalid email formats', () => {
      expect(parseQrContent('invalid-email').type).toBe('text')
      expect(parseQrContent('@example.com').type).toBe('text')
      expect(parseQrContent('test@').type).toBe('text')
    })

    test('should test email actions', () => {
      const result = parseQrContent('mailto:test@example.com?subject=Hello')
      
      // Test send email action
      result.actions[0].action()
      expect(window.open).toHaveBeenCalledWith('mailto:test@example.com?subject=Hello')
      
      // Test copy email action
      result.actions[1].action()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('Phone Number Parsing', () => {
    test('should parse international phone number', () => {
      const result = parseQrContent('+1234567890')
      expect(result.type).toBe('phone')
      expect(result.parsedData.phone).toBe('+1234567890')
      expect(result.parsedData.formatted).toBe('+1234567890')
      expect(result.actions[0].label).toBe('Call')
      expect(result.actions[1].label).toBe('Copy Number')
    })

    test('should parse domestic phone number', () => {
      const result = parseQrContent('1234567890')
      expect(result.type).toBe('phone')
      expect(result.parsedData.phone).toBe('1234567890')
      expect(result.parsedData.formatted).toBe('(123) 456-7890')
    })

    test('should parse tel: protocol', () => {
      const result = parseQrContent('tel:+1234567890')
      expect(result.type).toBe('phone')
      expect(result.parsedData.phone).toBe('+1234567890')
    })

    test('should parse phone with formatting characters', () => {
      const result = parseQrContent('+1 (234) 567-8900')
      expect(result.type).toBe('phone')
      expect(result.parsedData.phone).toBe('+12345678900')
    })

    test('should reject invalid phone numbers', () => {
      expect(parseQrContent('123').type).toBe('text') // Too short
      expect(parseQrContent('abcdefghij').type).toBe('text') // No digits
    })

    test('should test phone actions', () => {
      const result = parseQrContent('+1234567890')
      
      // Test call action
      result.actions[0].action()
      expect(window.open).toHaveBeenCalledWith('tel:+1234567890')
      
      // Test copy number action
      result.actions[1].action()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('+1234567890')
    })
  })

  describe('SMS Parsing', () => {
    test('should parse SMS with message', () => {
      const result = parseQrContent('sms:+1234567890?body=Hello World')
      expect(result.type).toBe('sms')
      expect(result.parsedData.phone).toBe('+1234567890')
      expect(result.parsedData.message).toBe('Hello World')
      expect(result.actions[0].label).toBe('Send SMS')
      expect(result.actions[1].label).toBe('Copy Number')
    })

    test('should parse SMS without message', () => {
      const result = parseQrContent('sms:+1234567890')
      expect(result.type).toBe('sms')
      expect(result.parsedData.phone).toBe('+1234567890')
      expect(result.parsedData.message).toBeUndefined()
    })

    test('should parse SMSTO format', () => {
      const result = parseQrContent('smsto:+1234567890:Hello World')
      expect(result.type).toBe('sms')
      expect(result.parsedData.phone).toBe('+1234567890')
      expect(result.parsedData.message).toBe('Hello World')
    })

    test('should parse SMSTO without message', () => {
      const result = parseQrContent('smsto:+1234567890')
      expect(result.type).toBe('sms')
      expect(result.parsedData.phone).toBe('+1234567890')
      expect(result.parsedData.message).toBeUndefined()
    })

    test('should test SMS actions', () => {
      const result = parseQrContent('sms:+1234567890?body=Hello')
      
      // Test send SMS action
      result.actions[0].action()
      expect(window.open).toHaveBeenCalledWith('sms:+1234567890?body=Hello')
      
      // Test copy number action
      result.actions[1].action()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('+1234567890')
    })
  })

  describe('WiFi Parsing', () => {
    test('should parse WiFi with WPA security', () => {
      const result = parseQrContent('WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;')
      expect(result.type).toBe('wifi')
      expect(result.parsedData.ssid).toBe('MyNetwork')
      expect(result.parsedData.password).toBe('MyPassword')
      expect(result.parsedData.security).toBe('WPA')
      expect(result.parsedData.hidden).toBe(false)
      expect(result.actions).toHaveLength(2)
      expect(result.actions[0].label).toBe('Copy Network Name')
      expect(result.actions[1].label).toBe('Copy Password')
    })

    test('should parse WiFi with WEP security', () => {
      const result = parseQrContent('WIFI:T:WEP;S:TestNetwork;P:password123;H:true;;')
      expect(result.type).toBe('wifi')
      expect(result.parsedData.security).toBe('WEP')
      expect(result.parsedData.hidden).toBe(true)
    })

    test('should parse WiFi without password', () => {
      const result = parseQrContent('WIFI:T:nopass;S:OpenNetwork;P:;H:false;;')
      expect(result.type).toBe('wifi')
      expect(result.parsedData.ssid).toBe('OpenNetwork')
      expect(result.parsedData.password).toBe('')
      expect(result.parsedData.security).toBe('nopass')
    })

    test('should parse WiFi with special characters in SSID', () => {
      const result = parseQrContent('WIFI:T:WPA;S:My Network & More;P:complex:password;H:false;;')
      expect(result.type).toBe('wifi')
      expect(result.parsedData.ssid).toBe('My Network & More')
      expect(result.parsedData.password).toBe('complex:password')
    })

    test('should reject invalid WiFi format', () => {
      expect(parseQrContent('WIFI:invalid').type).toBe('text')
      expect(parseQrContent('WIFI:T:WPA;P:password;;').type).toBe('text') // Missing SSID
    })

    test('should test WiFi actions', () => {
      const result = parseQrContent('WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;')
      
      // Test copy network name action
      result.actions[0].action()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('MyNetwork')
      
      // Test copy password action
      result.actions[1].action()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('MyPassword')
    })
  })

  describe('vCard Parsing', () => {
    test('should parse complete vCard', () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Example Corp
TEL:+1234567890
EMAIL:john@example.com
URL:https://johndoe.com
END:VCARD`
      
      const result = parseQrContent(vcard)
      expect(result.type).toBe('vcard')
      expect(result.parsedData.name).toBe('John Doe')
      expect(result.parsedData.organization).toBe('Example Corp')
      expect(result.parsedData.phone).toBe('+1234567890')
      expect(result.parsedData.email).toBe('john@example.com')
      expect(result.parsedData.url).toBe('https://johndoe.com')
      expect(result.actions.length).toBeGreaterThan(0)
    })

    test('should parse minimal vCard', () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
END:VCARD`
      
      const result = parseQrContent(vcard)
      expect(result.type).toBe('vcard')
      expect(result.parsedData.name).toBe('Jane Smith')
    })

    test('should parse vCard with TEL type', () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL;TYPE=WORK:+1234567890
END:VCARD`
      
      const result = parseQrContent(vcard)
      expect(result.type).toBe('vcard')
      expect(result.parsedData.phone).toBe('+1234567890')
    })

    test('should parse vCard with EMAIL type', () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
EMAIL;TYPE=WORK:john@example.com
END:VCARD`
      
      const result = parseQrContent(vcard)
      expect(result.type).toBe('vcard')
      expect(result.parsedData.email).toBe('john@example.com')
    })

    test('should reject invalid vCard format', () => {
      expect(parseQrContent('BEGIN:VCARD\nFN:John\n').type).toBe('text') // Missing END:VCARD
      expect(parseQrContent('FN:John Doe').type).toBe('text') // Missing BEGIN:VCARD
    })

    test('should test vCard actions', () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
URL:https://johndoe.com
END:VCARD`
      
      const result = parseQrContent(vcard)
      
      // Should have call, email, website, and copy actions
      expect(result.actions.length).toBe(4)
      expect(result.actions[0].label).toBe('Call')
      expect(result.actions[1].label).toBe('Send Email')
      expect(result.actions[2].label).toBe('Visit Website')
      expect(result.actions[3].label).toBe('Copy Contact')
      
      // Test call action
      result.actions[0].action()
      expect(window.open).toHaveBeenCalledWith('tel:+1234567890')
      
      // Test email action
      result.actions[1].action()
      expect(window.open).toHaveBeenCalledWith('mailto:john@example.com')
      
      // Test website action
      result.actions[2].action()
      expect(window.open).toHaveBeenCalledWith('https://johndoe.com', '_blank')
    })
  })

  describe('Text Parsing', () => {
    test('should handle plain text', () => {
      const result = parseQrContent('Just some plain text')
      expect(result.type).toBe('text')
      expect(result.parsedData.text).toBe('Just some plain text')
      expect(result.actions[0].label).toBe('Copy Text')
    })

    test('should handle multiline text', () => {
      const text = 'Line 1\nLine 2\nLine 3'
      const result = parseQrContent(text)
      expect(result.type).toBe('text')
      expect(result.parsedData.text).toBe(text)
    })

    test('should handle text with special characters', () => {
      const text = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      const result = parseQrContent(text)
      expect(result.type).toBe('text')
      expect(result.parsedData.text).toBe(text)
    })

    test('should test text action', () => {
      const result = parseQrContent('Test text')
      
      // Test copy text action
      result.actions[0].action()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test text')
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty input', () => {
      const result = parseQrContent('')
      expect(result.type).toBe('text')
      expect(result.parsedData.text).toBe('')
    })

    test('should handle null input', () => {
      const result = parseQrContent(null as any)
      expect(result.type).toBe('text')
      expect(result.parsedData.text).toBe('')
    })

    test('should handle undefined input', () => {
      const result = parseQrContent(undefined as any)
      expect(result.type).toBe('text')
      expect(result.parsedData.text).toBe('')
    })

    test('should handle non-string input', () => {
      const result = parseQrContent(123 as any)
      expect(result.type).toBe('text')
      expect(result.parsedData.text).toBe('')
    })

    test('should handle whitespace-only input', () => {
      const result = parseQrContent('   \n\t   ')
      expect(result.type).toBe('text')
      expect(result.parsedData.text).toBe('')
    })

    test('should trim input content', () => {
      const result = parseQrContent('  https://example.com  ')
      expect(result.type).toBe('url')
      expect(result.parsedData.url).toBe('https://example.com')
    })

    test('should handle malformed URLs gracefully', () => {
      expect(parseQrContent('https://').type).toBe('text')
      expect(parseQrContent('http://').type).toBe('text')
      expect(parseQrContent('https:// invalid url').type).toBe('text')
    })

    test('should handle malformed email gracefully', () => {
      expect(parseQrContent('mailto:').type).toBe('text')
      expect(parseQrContent('mailto:invalid').type).toBe('text')
    })

    test('should handle malformed phone gracefully', () => {
      expect(parseQrContent('tel:').type).toBe('text')
      expect(parseQrContent('tel:abc').type).toBe('text')
    })

    test('should handle malformed SMS gracefully', () => {
      expect(parseQrContent('sms:').type).toBe('text')
      expect(parseQrContent('smsto:').type).toBe('text')
    })

    test('should handle malformed WiFi gracefully', () => {
      expect(parseQrContent('WIFI:').type).toBe('text')
      expect(parseQrContent('WIFI:invalid').type).toBe('text')
    })

    test('should handle malformed vCard gracefully', () => {
      expect(parseQrContent('BEGIN:VCARD').type).toBe('text')
      expect(parseQrContent('END:VCARD').type).toBe('text')
      expect(parseQrContent('BEGIN:VCARD\nEND:VCARD').type).toBe('text') // Empty vCard
    })
  })
})
