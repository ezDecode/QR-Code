"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  QrCode, 
  Download, 
  Copy, 
  Share2, 
  Wifi, 
  Mail, 
  Phone, 
  MessageSquare,
  User,
  Globe,
  FileText,
  AlertTriangle,
  Shield,
  ShieldCheck
} from "lucide-react"
import QRCode from "qrcode"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/hooks/use-i18n"
import { parseQrContent, type ParsedQrContent } from "@/lib/qr-content-parser"
import { checkUrlSafety, type SecurityAnalysis } from "@/lib/security-utils"
import { appPerformanceMonitor, timeAsyncOperation } from "@/lib/performance-monitor"

interface QrGeneratorProps {
  onGenerated?: (text: string, dataUrl: string, parsedContent?: ParsedQrContent) => void
}

interface WiFiConfig {
  ssid: string
  password: string
  security: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

interface ContactConfig {
  name: string
  phone: string
  email: string
  organization: string
  url: string
}

export default function QrGenerator({ onGenerated }: QrGeneratorProps) {
  const { toast, success, error, warning, validationError, parseError, securityWarning } = useToast()
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [activeTab, setActiveTab] = useState("text")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQr, setGeneratedQr] = useState<string | null>(null)
  const [generatedText, setGeneratedText] = useState<string>("")
  const [parsedContent, setParsedContent] = useState<ParsedQrContent | null>(null)
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null)
  
  // Form states
  const [textInput, setTextInput] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [emailConfig, setEmailConfig] = useState({
    email: "",
    subject: "",
    body: ""
  })
  const [smsConfig, setSmsConfig] = useState({
    phone: "",
    message: ""
  })
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({
    ssid: "",
    password: "",
    security: 'WPA',
    hidden: false
  })
  const [contactConfig, setContactConfig] = useState<ContactConfig>({
    name: "",
    phone: "",
    email: "",
    organization: "",
    url: ""
  })

  const generateQrCode = async (text: string) => {
    const endTiming = appPerformanceMonitor.startTiming('qr-generation', { 
      textLength: text?.length || 0,
      contentType: 'unknown'
    })
    
    try {
      // Input validation with helpful error messages
      if (!text || typeof text !== 'string') {
        validationError('QR code text')
        return
      }

      const trimmedText = text.trim()
      if (trimmedText.length === 0) {
        validationError('QR code text - cannot be empty')
        return
      }

      if (trimmedText.length > 4296) {
        validationError('QR code text - too long (max 4296 characters)')
        return
      }

      setIsGenerating(true)
      let parsed: ParsedQrContent | null = null
      let security: SecurityAnalysis | null = null

      // Parse the content to determine type and actions with error handling
      try {
        parsed = await timeAsyncOperation('content-parsing', async () => {
          return parseQrContent(trimmedText)
        }, { textLength: trimmedText.length })
        
        setParsedContent(parsed)
      } catch (parseErr) {
        console.warn('Content parsing failed:', parseErr)
        parseError('QR content')
        // Continue with basic functionality
        parsed = {
          type: 'text',
          parsedData: { text: trimmedText },
          actions: []
        }
        setParsedContent(parsed)
      }

      // Perform security analysis for URLs with comprehensive error handling
      if (parsed && parsed.type === 'url' && parsed.parsedData?.url) {
        try {
          security = await timeAsyncOperation('security-analysis', async () => {
            return checkUrlSafety(parsed.parsedData.url)
          }, { url: parsed.parsedData.url })
          
          setSecurityAnalysis(security)
          
          // Show security warnings if high risk
          if (security.riskLevel === 'high') {
            securityWarning(`High risk URL detected: ${security.warnings[0] || 'Multiple security concerns'}`)
          } else if (security.riskLevel === 'medium' && security.warnings.length > 0) {
            warning('Security Notice', security.warnings[0])
          }
        } catch (securityError) {
          console.warn('Security analysis failed:', securityError)
          setSecurityAnalysis(null)
          // Don't show error to user - security analysis is optional
        }
      } else {
        setSecurityAnalysis(null)
      }

      // Generate QR code with error handling
      try {
        const dataUrl = await timeAsyncOperation('qr-code-generation', async () => {
          return QRCode.toDataURL(trimmedText, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
          })
        }, { 
          textLength: trimmedText.length,
          contentType: parsed?.type || 'unknown'
        })
        
        setGeneratedQr(dataUrl)
        setGeneratedText(trimmedText)
        
        // Call onGenerated callback with error handling
        if (onGenerated && typeof onGenerated === 'function') {
          try {
            onGenerated(trimmedText, dataUrl, parsed)
          } catch (callbackError) {
            console.warn('onGenerated callback failed:', callbackError)
            // Don't show error to user - callback failure shouldn't break UX
          }
        }
        
        success(t('message.success.generated'), t('qr.generated'))
      } catch (qrError) {
        console.error('QR code generation failed:', qrError)
        error(t('message.error.failed'), 'Failed to generate QR code. Please try again.', qrError as Error)
      }
    } catch (error) {
      console.error('Critical error in generateQrCode:', error)
      error('Unexpected Error', 'An unexpected error occurred. Please refresh the page and try again.', error as Error)
    } finally {
      setIsGenerating(false)
      endTiming()
    }
  }

  const handleTextGenerate = () => {
    try {
      if (!textInput.trim()) {
        validationError('text input - cannot be empty')
        return
      }
      generateQrCode(textInput)
    } catch (err) {
      console.error('Error in handleTextGenerate:', err)
      error('Generation Failed', 'Failed to generate QR code from text', err as Error)
    }
  }

  const handleUrlGenerate = () => {
    try {
      const trimmedUrl = urlInput.trim()
      if (!trimmedUrl) {
        validationError('URL input - cannot be empty')
        return
      }

      // Basic URL validation
      let url = trimmedUrl
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      // Validate the final URL format
      try {
        new URL(url)
      } catch (urlError) {
        validationError('URL format - please enter a valid URL')
        return
      }

      generateQrCode(url)
    } catch (err) {
      console.error('Error in handleUrlGenerate:', err)
      error('Generation Failed', 'Failed to generate QR code from URL', err as Error)
    }
  }

  const handleEmailGenerate = () => {
    try {
      const email = emailConfig.email.trim()
      if (!email) {
        validationError('email address - cannot be empty')
        return
      }

      // Basic email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(email)) {
        validationError('email format - please enter a valid email address')
        return
      }

      let emailText = `mailto:${email}`
      const params = new URLSearchParams()
      
      if (emailConfig.subject?.trim()) params.append('subject', emailConfig.subject.trim())
      if (emailConfig.body?.trim()) params.append('body', emailConfig.body.trim())
      
      const paramString = params.toString()
      if (paramString) {
        emailText += '?' + paramString
      }
      
      generateQrCode(emailText)
    } catch (err) {
      console.error('Error in handleEmailGenerate:', err)
      error('Generation Failed', 'Failed to generate QR code from email', err as Error)
    }
  }

  const handleSmsGenerate = () => {
    try {
      const phone = smsConfig.phone.trim()
      if (!phone) {
        validationError('phone number - cannot be empty')
        return
      }

      // Basic phone validation (allow various formats)
      const phonePattern = /^[\+]?[0-9\s\-\(\)]{7,}$/
      if (!phonePattern.test(phone)) {
        validationError('phone number format - please enter a valid phone number')
        return
      }

      let smsText = `sms:${phone}`
      if (smsConfig.message?.trim()) {
        smsText += `?body=${encodeURIComponent(smsConfig.message.trim())}`
      }
      
      generateQrCode(smsText)
    } catch (err) {
      console.error('Error in handleSmsGenerate:', err)
      error('Generation Failed', 'Failed to generate QR code from SMS', err as Error)
    }
  }

  const handleWifiGenerate = () => {
    try {
      const ssid = wifiConfig.ssid.trim()
      if (!ssid) {
        validationError('WiFi network name (SSID) - cannot be empty')
        return
      }

      // Validate SSID length (max 32 characters for most systems)
      if (ssid.length > 32) {
        validationError('WiFi network name - too long (max 32 characters)')
        return
      }

      const password = wifiConfig.password.trim()
      
      // Validate password requirements for WPA/WEP
      if (wifiConfig.security !== 'nopass') {
        if (!password) {
          validationError(`WiFi password - required for ${wifiConfig.security} security`)
          return
        }
        if (wifiConfig.security === 'WPA' && password.length < 8) {
          validationError('WiFi password - WPA requires at least 8 characters')
          return
        }
      }

      const wifiText = `WIFI:T:${wifiConfig.security};S:${ssid};P:${password};H:${wifiConfig.hidden};`
      generateQrCode(wifiText)
    } catch (err) {
      console.error('Error in handleWifiGenerate:', err)
      error('Generation Failed', 'Failed to generate QR code from WiFi', err as Error)
    }
  }

  const handleContactGenerate = () => {
    try {
      const name = contactConfig.name.trim()
      if (!name) {
        validationError('contact name - cannot be empty')
        return
      }

      // Validate email if provided
      if (contactConfig.email.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(contactConfig.email.trim())) {
          validationError('email format - please enter a valid email address')
          return
        }
      }

      // Validate phone if provided
      if (contactConfig.phone.trim()) {
        const phonePattern = /^[\+]?[0-9\s\-\(\)]{7,}$/
        if (!phonePattern.test(contactConfig.phone.trim())) {
          validationError('phone number format - please enter a valid phone number')
          return
        }
      }

      // Validate URL if provided
      if (contactConfig.url.trim()) {
        try {
          let url = contactConfig.url.trim()
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
          }
          new URL(url)
          contactConfig.url = url // Update with corrected URL
        } catch (urlError) {
          validationError('website URL format - please enter a valid URL')
          return
        }
      }

      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        contactConfig.organization.trim() && `ORG:${contactConfig.organization.trim()}`,
        contactConfig.phone.trim() && `TEL:${contactConfig.phone.trim()}`,
        contactConfig.email.trim() && `EMAIL:${contactConfig.email.trim()}`,
        contactConfig.url.trim() && `URL:${contactConfig.url.trim()}`,
        'END:VCARD'
      ].filter(Boolean).join('\n')
      
      generateQrCode(vcard)
    } catch (err) {
      console.error('Error in handleContactGenerate:', err)
      error('Contact Generation Failed', 'Failed to generate contact QR code. Please check your input.', err as Error)
    }
  }

  const downloadQr = () => {
    try {
      if (!generatedQr) {
        error('Download Failed', 'No QR code available to download')
        return
      }
      
      const link = document.createElement('a')
      link.download = 'qrcode.png'
      link.href = generatedQr
      link.click()
      
      success(t('message.success.downloaded'), 'QR code downloaded successfully')
    } catch (err) {
      console.error('Download failed:', err)
      error('Download Failed', 'Failed to download QR code. Please try again.', err as Error)
    }
  }

  const copyQrImage = async () => {
    try {
      if (!generatedQr) {
        error('Copy Failed', 'No QR code available to copy')
        return
      }

      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.write) {
        error('Copy Failed', 'Clipboard functionality is not supported in your browser')
        return
      }
      
      const response = await fetch(generatedQr)
      if (!response.ok) {
        throw new Error(`Failed to fetch QR code: ${response.status}`)
      }
      
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      
      success(t('message.success.copied'), 'QR code copied to clipboard')
    } catch (err) {
      console.error('Copy failed:', err)
      if (err instanceof Error && err.name === 'NotAllowedError') {
        error('Copy Failed', 'Permission denied. Please allow clipboard access and try again.')
      } else {
        error('Copy Failed', 'Failed to copy QR code to clipboard. Please try again.', err as Error)
      }
    }
  }

  const shareQr = async () => {
    try {
      if (!generatedQr) {
        error('Share Failed', 'No QR code available to share')
        return
      }

      if (!navigator.share) {
        error('Share Failed', 'Sharing is not supported in your browser')
        return
      }
      
      const response = await fetch(generatedQr)
      if (!response.ok) {
        throw new Error(`Failed to fetch QR code: ${response.status}`)
      }
      
      const blob = await response.blob()
      const file = new File([blob], 'qrcode.png', { type: 'image/png' })
      
      await navigator.share({
        title: t('nav.title'),
        text: t('qr.generated'),
        files: [file]
      })
      
      // Note: We don't show success toast for share because the user might cancel
    } catch (err) {
      console.error('Share failed:', err)
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled sharing - don't show error
        return
      } else if (err instanceof Error && err.name === 'NotSupportedError') {
        error('Share Failed', 'File sharing is not supported. Try downloading instead.')
      } else {
        error('Share Failed', 'Failed to share QR code. Please try again.', err as Error)
      }
    }
  }

  return (
    <Card className="neo-brutalist-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          {t('qr.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="text" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">{t('content.type.text')}</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">{t('content.type.url')}</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">{t('content.type.email')}</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span className="hidden sm:inline">{t('content.type.sms')}</span>
            </TabsTrigger>
            <TabsTrigger value="wifi" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              <span className="hidden sm:inline">{t('content.type.wifi')}</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">{t('content.type.vcard')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3">
            <div>
              <Label htmlFor="text-input">{t('ui.label.text')}</Label>
              <Textarea
                id="text-input"
                placeholder={t('ui.placeholder.enterText')}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="neo-brutalist-textarea"
                rows={3}
              />
            </div>
            <Button 
              onClick={handleTextGenerate}
              disabled={isGenerating || !textInput.trim()}
              className="neo-brutalist-button font-bold text-white w-full"
            >
              {t('ui.button.generate')}
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-3">
            <div>
              <Label htmlFor="url-input">{t('content.type.url')}</Label>
              <Input
                id="url-input"
                placeholder="https://example.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="neo-brutalist-input"
              />
            </div>
            <Button 
              onClick={handleUrlGenerate}
              disabled={isGenerating || !urlInput.trim()}
              className="neo-brutalist-button font-bold text-white w-full"
            >
              {t('ui.button.generate')}
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-3">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="email-address">{t('content.type.email')}</Label>
                <Input
                  id="email-address"
                  type="email"
                  placeholder="recipient@example.com"
                  value={emailConfig.email}
                  onChange={(e) => setEmailConfig({...emailConfig, email: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="email-subject">Subject (Optional)</Label>
                <Input
                  id="email-subject"
                  placeholder="Email subject"
                  value={emailConfig.subject}
                  onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="email-body">Message (Optional)</Label>
                <Textarea
                  id="email-body"
                  placeholder="Email message"
                  value={emailConfig.body}
                  onChange={(e) => setEmailConfig({...emailConfig, body: e.target.value})}
                  className="neo-brutalist-textarea"
                  rows={2}
                />
              </div>
            </div>
            <Button 
              onClick={handleEmailGenerate}
              disabled={isGenerating || !emailConfig.email.trim()}
              className="neo-brutalist-button font-bold text-white w-full"
            >
              {t('ui.button.generate')}
            </Button>
          </TabsContent>

          <TabsContent value="sms" className="space-y-3">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="sms-phone">{t('content.type.phone')}</Label>
                <Input
                  id="sms-phone"
                  placeholder="+1234567890"
                  value={smsConfig.phone}
                  onChange={(e) => setSmsConfig({...smsConfig, phone: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="sms-message">Message (Optional)</Label>
                <Textarea
                  id="sms-message"
                  placeholder="SMS message"
                  value={smsConfig.message}
                  onChange={(e) => setSmsConfig({...smsConfig, message: e.target.value})}
                  className="neo-brutalist-textarea"
                  rows={2}
                />
              </div>
            </div>
            <Button
              onClick={handleSmsGenerate}
              disabled={isGenerating || !smsConfig.phone.trim()}
              className="neo-brutalist-button font-bold text-white w-full"
            >
              {t('ui.button.generate')}
            </Button>
          </TabsContent>

          <TabsContent value="wifi" className="space-y-3">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                <Input
                  id="wifi-ssid"
                  placeholder="MyWiFiNetwork"
                  value={wifiConfig.ssid}
                  onChange={(e) => setWifiConfig({...wifiConfig, ssid: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="wifi-password">Password</Label>
                <Input
                  id="wifi-password"
                  type="password"
                  placeholder="WiFi password"
                  value={wifiConfig.password}
                  onChange={(e) => setWifiConfig({...wifiConfig, password: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="wifi-security">Security Type</Label>
                <Select
                  value={wifiConfig.security}
                  onValueChange={(value: 'WPA' | 'WEP' | 'nopass') => setWifiConfig({...wifiConfig, security: value})}
                >
                  <SelectTrigger className="neo-brutalist-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">No Password</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleWifiGenerate}
              disabled={isGenerating || !wifiConfig.ssid.trim()}
              className="neo-brutalist-button font-bold text-white w-full"
            >
              {t('ui.button.generate')}
            </Button>
          </TabsContent>

          <TabsContent value="contact" className="space-y-3">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="contact-name">Full Name</Label>
                <Input
                  id="contact-name"
                  placeholder="John Doe"
                  value={contactConfig.name}
                  onChange={(e) => setContactConfig({...contactConfig, name: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">{t('content.type.phone')}</Label>
                <Input
                  id="contact-phone"
                  placeholder="+1234567890"
                  value={contactConfig.phone}
                  onChange={(e) => setContactConfig({...contactConfig, phone: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">{t('content.type.email')}</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="john@example.com"
                  value={contactConfig.email}
                  onChange={(e) => setContactConfig({...contactConfig, email: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="contact-org">Organization</Label>
                <Input
                  id="contact-org"
                  placeholder="Company Name"
                  value={contactConfig.organization}
                  onChange={(e) => setContactConfig({...contactConfig, organization: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="contact-url">Website</Label>
                <Input
                  id="contact-url"
                  placeholder="https://example.com"
                  value={contactConfig.url}
                  onChange={(e) => setContactConfig({...contactConfig, url: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
            </div>
            <Button
              onClick={handleContactGenerate}
              disabled={isGenerating || !contactConfig.name.trim()}
              className="neo-brutalist-button font-bold text-white w-full"
            >
              {t('ui.button.generate')}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Generated QR Code Display */}
        {generatedQr && (
          <div className="neo-brutalist-section p-4 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-bold">{t('qr.generated')}</h3>
              {parsedContent && (
                <Badge variant="outline" className="text-xs">
                  {parsedContent.type.toUpperCase()}
                </Badge>
              )}
            </div>
            
            <div className="flex justify-center">
              <img src={generatedQr} alt="Generated QR Code" className="max-w-64 h-auto" />
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono break-all">
              {generatedText}
            </div>

            {/* Security Analysis Display for URLs */}
            {securityAnalysis && parsedContent?.type === 'url' && (
              <div className={`p-3 rounded border-2 ${
                securityAnalysis.riskLevel === 'high' 
                  ? 'border-red-500 bg-red-50' 
                  : securityAnalysis.riskLevel === 'medium'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {securityAnalysis.riskLevel === 'high' ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : securityAnalysis.riskLevel === 'medium' ? (
                    <Shield className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  )}
                  <span className={`font-semibold text-sm ${
                    securityAnalysis.riskLevel === 'high' 
                      ? 'text-red-700' 
                      : securityAnalysis.riskLevel === 'medium'
                      ? 'text-yellow-700'
                      : 'text-green-700'
                  }`}>
                    {t('security.warning')}: {t(`security.risk.${securityAnalysis.riskLevel}` as keyof typeof t)}
                  </span>
                </div>
                
                {securityAnalysis.warnings.length > 0 && (
                  <div className="text-xs space-y-1">
                    {securityAnalysis.warnings.map((warning, index) => (
                      <div key={index} className="text-left">
                        • {warning}
                      </div>
                    ))}
                  </div>
                )}
                
                {securityAnalysis.recommendations.length > 0 && (
                  <div className="text-xs mt-2 space-y-1">
                    <div className="font-medium">Recommendations:</div>
                    {securityAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="text-left">
                        • {rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content-Specific Action Buttons */}
            {parsedContent && parsedContent.actions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">{t('ui.label.actions')}</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {parsedContent.actions.map((action, index) => {
                    const IconComponent = action.icon
                    return (
                      <Button
                        key={index}
                        onClick={() => {
                          try {
                            action.action()
                            toast({
                              title: t('message.success.generated'),
                              description: `${action.label} ${t('message.success.generated')}`,
                              variant: "success"
                            })
                          } catch (error) {
                            toast({
                              title: t('message.error.failed'),
                              description: `${t('message.error.failed')} ${action.label}`,
                              variant: "destructive"
                            })
                          }
                        }}
                        variant={action.variant || "outline"}
                        size="sm"
                        className="neo-brutalist-input hover:bg-white"
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Standard QR Actions */}
            <div className="space-y-2">
              <div className="text-sm font-medium">{t('ui.label.actions')}</div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={downloadQr}
                  variant="outline"
                  size="sm"
                  className="neo-brutalist-input hover:bg-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('ui.button.download')}
                </Button>
                <Button
                  onClick={copyQrImage}
                  variant="outline"
                  size="sm"
                  className="neo-brutalist-input hover:bg-white"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('ui.button.copy')}
                </Button>
                {navigator.share && (
                  <Button
                    onClick={shareQr}
                    variant="outline"
                    size="sm"
                    className="neo-brutalist-input hover:bg-white"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t('ui.button.share')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
