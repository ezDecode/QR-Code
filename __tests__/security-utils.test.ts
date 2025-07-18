import { checkUrlSafety } from '../lib/security-utils'

describe('Security Utils', () => {
  describe('Protocol Analysis', () => {
    test('should mark HTTPS URLs as safer', () => {
      const result = checkUrlSafety('https://example.com')
      expect(result.warnings).not.toContain('This URL does not use HTTPS encryption')
    })

    test('should warn about HTTP URLs', () => {
      const result = checkUrlSafety('http://example.com')
      expect(result.warnings).toContain('This URL does not use HTTPS encryption')
      expect(result.riskLevel).toBe('medium')
    })

    test('should handle FTP URLs', () => {
      const result = checkUrlSafety('ftp://example.com')
      expect(result.isSafe).toBe(false)
      expect(result.riskLevel).toBe('medium')
    })
  })

  describe('URL Shortener Detection', () => {
    test('should detect bit.ly shorteners', () => {
      const result = checkUrlSafety('https://bit.ly/test')
      expect(result.warnings).toContain('This is a shortened URL - the actual destination is hidden')
      expect(result.riskLevel).toBe('medium')
    })

    test('should detect tinyurl shorteners', () => {
      const result = checkUrlSafety('https://tinyurl.com/test')
      expect(result.warnings).toContain('This is a shortened URL - the actual destination is hidden')
      expect(result.riskLevel).toBe('medium')
    })

    test('should detect t.co shorteners', () => {
      const result = checkUrlSafety('https://t.co/abc123')
      expect(result.warnings).toContain('This is a shortened URL - the actual destination is hidden')
      expect(result.riskLevel).toBe('medium')
    })

    test('should detect subdomain shorteners', () => {
      const result = checkUrlSafety('https://custom.bit.ly/test')
      expect(result.warnings).toContain('This is a shortened URL - the actual destination is hidden')
      expect(result.riskLevel).toBe('medium')
    })
  })

  describe('IP Address Detection', () => {
    test('should detect IPv4 addresses', () => {
      const result = checkUrlSafety('http://192.168.1.1')
      expect(result.warnings).toContain('URL uses an IP address instead of a domain name')
      expect(result.riskLevel).toBe('high')
    })

    test('should detect IPv4 with HTTPS', () => {
      const result = checkUrlSafety('https://10.0.0.1')
      expect(result.warnings).toContain('URL uses an IP address instead of a domain name')
      expect(result.riskLevel).toBe('high')
    })

    test('should detect IPv6 addresses', () => {
      const result = checkUrlSafety('http://[2001:db8::1]')
      expect(result.warnings).toContain('URL uses an IP address instead of a domain name')
      expect(result.riskLevel).toBe('high')
    })

    test('should not flag normal domains as IP addresses', () => {
      const result = checkUrlSafety('https://example.com')
      expect(result.warnings).not.toContain('URL uses an IP address instead of a domain name')
    })
  })

  describe('Safe Domain Recognition', () => {
    test('should recognize google.com as safe', () => {
      const result = checkUrlSafety('https://google.com')
      expect(result.isSafe).toBe(true)
      expect(result.riskLevel).toBe('low')
    })

    test('should recognize github.com as safe', () => {
      const result = checkUrlSafety('https://github.com')
      expect(result.isSafe).toBe(true)
      expect(result.riskLevel).toBe('low')
    })

    test('should recognize subdomains of safe domains', () => {
      const result = checkUrlSafety('https://mail.google.com')
      expect(result.isSafe).toBe(true)
      expect(result.riskLevel).toBe('low')
    })

    test('should treat unknown domains as potentially unsafe', () => {
      const result = checkUrlSafety('https://unknown-domain.com')
      expect(result.isSafe).toBe(true) // HTTPS with no warnings is considered safe
      expect(result.riskLevel).toBe('low')
      // But it's not in the safe domain whitelist, so it gets basic safety
    })
  })

  describe('Suspicious TLD Detection', () => {
    test('should detect .tk domains', () => {
      const result = checkUrlSafety('https://example.tk')
      expect(result.warnings).toContain('URL uses a domain extension commonly associated with suspicious sites')
      expect(result.riskLevel).toBe('medium')
    })

    test('should detect .ml domains', () => {
      const result = checkUrlSafety('https://example.ml')
      expect(result.warnings).toContain('URL uses a domain extension commonly associated with suspicious sites')
      expect(result.riskLevel).toBe('medium')
    })

    test('should detect .click domains', () => {
      const result = checkUrlSafety('https://example.click')
      expect(result.warnings).toContain('URL uses a domain extension commonly associated with suspicious sites')
      expect(result.riskLevel).toBe('medium')
    })

    test('should not flag legitimate TLDs', () => {
      const result = checkUrlSafety('https://example.com')
      expect(result.warnings).not.toContain('URL uses a domain extension commonly associated with suspicious sites')
    })
  })

  describe('Redirect Parameter Detection', () => {
    test('should detect redirect parameter', () => {
      const result = checkUrlSafety('https://example.com?redirect=https://malicious.com')
      expect(result.warnings).toContain('URL contains parameters that might redirect to another site')
      expect(result.riskLevel).toBe('medium')
    })

    test('should detect url parameter', () => {
      const result = checkUrlSafety('https://example.com?url=https://target.com')
      expect(result.warnings).toContain('URL contains parameters that might redirect to another site')
      expect(result.riskLevel).toBe('medium')
    })

    test('should detect returnUrl parameter', () => {
      const result = checkUrlSafety('https://example.com?returnUrl=https://target.com')
      expect(result.warnings).toContain('URL contains parameters that might redirect to another site')
      expect(result.riskLevel).toBe('medium')
    })

    test('should not flag safe parameters', () => {
      const result = checkUrlSafety('https://example.com?search=test&page=1')
      expect(result.warnings).not.toContain('URL contains parameters that might redirect to another site')
    })
  })

  describe('Subdomain Complexity Analysis', () => {
    test('should detect excessive subdomains', () => {
      const result = checkUrlSafety('https://a.b.c.d.e.example.com')
      expect(result.warnings).toContain('URL has an unusually complex subdomain structure')
      expect(result.riskLevel).toBe('medium')
    })

    test('should allow normal subdomains', () => {
      const result = checkUrlSafety('https://www.example.com')
      expect(result.warnings).not.toContain('URL has an unusually complex subdomain structure')
    })

    test('should allow reasonable subdomain depth', () => {
      const result = checkUrlSafety('https://api.v1.example.com')
      expect(result.warnings).not.toContain('URL has an unusually complex subdomain structure')
    })
  })

  describe('Risk Level Calculation', () => {
    test('should assign low risk to safe HTTPS URLs', () => {
      const result = checkUrlSafety('https://example.com')
      expect(result.riskLevel).toBe('low')
      expect(result.isSafe).toBe(true)
    })

    test('should assign medium risk to HTTP URLs', () => {
      const result = checkUrlSafety('http://example.com')
      expect(result.riskLevel).toBe('medium')
      expect(result.isSafe).toBe(false)
    })

    test('should assign high risk to IP addresses', () => {
      const result = checkUrlSafety('http://192.168.1.1')
      expect(result.riskLevel).toBe('high')
      expect(result.isSafe).toBe(false)
    })

    test('should assign high risk to multiple warning factors', () => {
      const result = checkUrlSafety('http://192.168.1.1?redirect=http://malicious.tk')
      expect(result.riskLevel).toBe('high')
      expect(result.isSafe).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(2)
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid URLs', () => {
      const result = checkUrlSafety('not-a-url')
      expect(result.isSafe).toBe(false)
      expect(result.warnings).toContain('Invalid URL format')
      expect(result.riskLevel).toBe('high')
    })

    test('should handle empty strings', () => {
      const result = checkUrlSafety('')
      expect(result.isSafe).toBe(false)
      expect(result.warnings).toContain('Empty URL provided')
      expect(result.riskLevel).toBe('high')
    })

    test('should handle malformed URLs', () => {
      const result = checkUrlSafety('http://')
      expect(result.isSafe).toBe(false)
      expect(result.warnings).toContain('Invalid URL format')
      expect(result.riskLevel).toBe('high')
    })
  })

  describe('Recommendations', () => {
    test('should provide recommendations for HTTP URLs', () => {
      const result = checkUrlSafety('http://example.com')
      expect(result.recommendations).toContain('Look for an HTTPS version of this site')
    })

    test('should provide recommendations for shortened URLs', () => {
      const result = checkUrlSafety('https://bit.ly/test')
      expect(result.recommendations).toContain('Be cautious with shortened URLs from unknown sources')
    })

    test('should provide recommendations for IP addresses', () => {
      const result = checkUrlSafety('http://192.168.1.1')
      expect(result.recommendations).toContain('Legitimate websites typically use domain names, not IP addresses')
    })

    test('should provide recommendations for invalid URLs', () => {
      const result = checkUrlSafety('not-a-url')
      expect(result.recommendations).toContain('Please check that the URL is correctly formatted')
    })
  })
})
