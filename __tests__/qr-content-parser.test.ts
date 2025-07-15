import { parseQrContent } from '../lib/qr-content-parser'

describe('QR Content Parser', () => {
  test('should parse URL correctly', () => {
    const result = parseQrContent('https://example.com')
    expect(result.type).toBe('url')
    expect(result.parsedData.url).toBe('https://example.com')
    expect(result.actions).toHaveLength(2)
    expect(result.actions[0].label).toBe('Open Link')
  })

  test('should parse email correctly', () => {
    const result = parseQrContent('mailto:test@example.com?subject=Hello&body=World')
    expect(result.type).toBe('email')
    expect(result.parsedData.email).toBe('test@example.com')
    expect(result.parsedData.subject).toBe('Hello')
    expect(result.parsedData.body).toBe('World')
  })

  test('should parse phone number correctly', () => {
    const result = parseQrContent('+1234567890')
    expect(result.type).toBe('phone')
    expect(result.parsedData.phone).toBe('+1234567890')
    expect(result.actions[0].label).toBe('Call')
  })

  test('should parse WiFi QR code correctly', () => {
    const result = parseQrContent('WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;')
    expect(result.type).toBe('wifi')
    expect(result.parsedData.ssid).toBe('MyNetwork')
    expect(result.parsedData.password).toBe('MyPassword')
    expect(result.parsedData.security).toBe('WPA')
    expect(result.parsedData.hidden).toBe(false)
  })

  test('should parse SMS correctly', () => {
    const result = parseQrContent('sms:+1234567890?body=Hello World')
    expect(result.type).toBe('sms')
    expect(result.parsedData.phone).toBe('+1234567890')
    expect(result.parsedData.message).toBe('Hello World')
  })

  test('should parse vCard correctly', () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Example Corp
TEL:+1234567890
EMAIL:john@example.com
END:VCARD`
    
    const result = parseQrContent(vcard)
    expect(result.type).toBe('vcard')
    expect(result.parsedData.name).toBe('John Doe')
    expect(result.parsedData.organization).toBe('Example Corp')
    expect(result.parsedData.phone).toBe('+1234567890')
    expect(result.parsedData.email).toBe('john@example.com')
  })

  test('should handle plain text', () => {
    const result = parseQrContent('Just some plain text')
    expect(result.type).toBe('text')
    expect(result.parsedData.text).toBe('Just some plain text')
    expect(result.actions[0].label).toBe('Copy Text')
  })

  test('should handle simple email address', () => {
    const result = parseQrContent('test@example.com')
    expect(result.type).toBe('email')
    expect(result.parsedData.email).toBe('test@example.com')
  })

  test('should handle URL without protocol', () => {
    const result = parseQrContent('example.com')
    expect(result.type).toBe('text') // Should be treated as text since no protocol
  })

  test('should handle empty input', () => {
    const result = parseQrContent('')
    expect(result.type).toBe('text')
    expect(result.parsedData.text).toBe('')
  })
})
