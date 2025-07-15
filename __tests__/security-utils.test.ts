import { checkUrlSafety } from '../lib/security-utils'

describe('Security Utils', () => {
  test('should mark HTTPS URLs as safer', () => {
    const result = checkUrlSafety('https://example.com')
    expect(result.warnings).not.toContain('This URL does not use HTTPS encryption')
  })

  test('should warn about HTTP URLs', () => {
    const result = checkUrlSafety('http://example.com')
    expect(result.warnings).toContain('This URL does not use HTTPS encryption')
    expect(result.riskLevel).toBe('medium')
  })

  test('should detect URL shorteners', () => {
    const result = checkUrlSafety('https://bit.ly/test')
    expect(result.warnings).toContain('This is a shortened URL - the actual destination is hidden')
    expect(result.riskLevel).toBe('medium')
  })

  test('should detect IP addresses', () => {
    const result = checkUrlSafety('http://192.168.1.1')
    expect(result.warnings).toContain('URL uses an IP address instead of a domain name')
    expect(result.riskLevel).toBe('high')
  })

  test('should recognize safe domains', () => {
    const result = checkUrlSafety('https://google.com')
    expect(result.isSafe).toBe(true)
    expect(result.riskLevel).toBe('low')
  })

  test('should detect suspicious TLDs', () => {
    const result = checkUrlSafety('https://example.tk')
    expect(result.warnings).toContain('URL uses a domain extension commonly associated with suspicious sites')
    expect(result.riskLevel).toBe('medium')
  })

  test('should detect redirect parameters', () => {
    const result = checkUrlSafety('https://example.com?redirect=https://malicious.com')
    expect(result.warnings).toContain('URL contains parameters that might redirect to another site')
    expect(result.riskLevel).toBe('medium')
  })

  test('should handle invalid URLs', () => {
    const result = checkUrlSafety('not-a-url')
    expect(result.isSafe).toBe(false)
    expect(result.warnings).toContain('Invalid URL format')
    expect(result.riskLevel).toBe('high')
  })

  test('should detect excessive subdomains', () => {
    const result = checkUrlSafety('https://a.b.c.d.e.example.com')
    expect(result.warnings).toContain('URL has an unusually complex subdomain structure')
    expect(result.riskLevel).toBe('medium')
  })
})
