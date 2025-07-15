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
  FileText
} from "lucide-react"
import QRCode from "qrcode"
import { useToast } from "@/hooks/use-toast"

interface QrGeneratorProps {
  onGenerated?: (text: string, dataUrl: string) => void
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
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [activeTab, setActiveTab] = useState("text")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQr, setGeneratedQr] = useState<string | null>(null)
  const [generatedText, setGeneratedText] = useState<string>("")
  
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
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to generate QR code",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setGeneratedQr(dataUrl)
      setGeneratedText(text)
      
      if (onGenerated) {
        onGenerated(text, dataUrl)
      }
      
      toast({
        title: "Success!",
        description: "QR code generated successfully",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTextGenerate = () => {
    generateQrCode(textInput)
  }

  const handleUrlGenerate = () => {
    let url = urlInput.trim()
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    generateQrCode(url)
  }

  const handleEmailGenerate = () => {
    let emailText = `mailto:${emailConfig.email}`
    const params = new URLSearchParams()
    
    if (emailConfig.subject) params.append('subject', emailConfig.subject)
    if (emailConfig.body) params.append('body', emailConfig.body)
    
    const paramString = params.toString()
    if (paramString) {
      emailText += '?' + paramString
    }
    
    generateQrCode(emailText)
  }

  const handleSmsGenerate = () => {
    let smsText = `sms:${smsConfig.phone}`
    if (smsConfig.message) {
      smsText += `?body=${encodeURIComponent(smsConfig.message)}`
    }
    generateQrCode(smsText)
  }

  const handleWifiGenerate = () => {
    const wifiText = `WIFI:T:${wifiConfig.security};S:${wifiConfig.ssid};P:${wifiConfig.password};H:${wifiConfig.hidden};`
    generateQrCode(wifiText)
  }

  const handleContactGenerate = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      contactConfig.name && `FN:${contactConfig.name}`,
      contactConfig.organization && `ORG:${contactConfig.organization}`,
      contactConfig.phone && `TEL:${contactConfig.phone}`,
      contactConfig.email && `EMAIL:${contactConfig.email}`,
      contactConfig.url && `URL:${contactConfig.url}`,
      'END:VCARD'
    ].filter(Boolean).join('\n')
    
    generateQrCode(vcard)
  }

  const downloadQr = () => {
    if (!generatedQr) return
    
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = generatedQr
    link.click()
    
    toast({
      title: "Downloaded!",
      description: "QR code saved to your device",
      variant: "success"
    })
  }

  const copyQrImage = async () => {
    if (!generatedQr) return
    
    try {
      const response = await fetch(generatedQr)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      
      toast({
        title: "Copied!",
        description: "QR code image copied to clipboard",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy QR code image",
        variant: "destructive"
      })
    }
  }

  const shareQr = async () => {
    if (!generatedQr || !navigator.share) {
      toast({
        title: "Error",
        description: "Sharing not supported on this device",
        variant: "destructive"
      })
      return
    }
    
    try {
      const response = await fetch(generatedQr)
      const blob = await response.blob()
      const file = new File([blob], 'qrcode.png', { type: 'image/png' })
      
      await navigator.share({
        title: 'QR Code',
        text: 'Generated QR Code',
        files: [file]
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share QR code",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="neo-brutalist-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          Generate QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="text" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">URL</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span className="hidden sm:inline">SMS</span>
            </TabsTrigger>
            <TabsTrigger value="wifi" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              <span className="hidden sm:inline">WiFi</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3">
            <div>
              <Label htmlFor="text-input">Text Content</Label>
              <Textarea
                id="text-input"
                placeholder="Enter any text to generate QR code..."
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
              Generate QR Code
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-3">
            <div>
              <Label htmlFor="url-input">Website URL</Label>
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
              Generate QR Code
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-3">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="email-address">Email Address</Label>
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
              Generate QR Code
            </Button>
          </TabsContent>

          <TabsContent value="sms" className="space-y-3">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="sms-phone">Phone Number</Label>
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
              Generate QR Code
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
              Generate QR Code
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
                <Label htmlFor="contact-phone">Phone Number</Label>
                <Input
                  id="contact-phone"
                  placeholder="+1234567890"
                  value={contactConfig.phone}
                  onChange={(e) => setContactConfig({...contactConfig, phone: e.target.value})}
                  className="neo-brutalist-input"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email</Label>
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
              Generate QR Code
            </Button>
          </TabsContent>
        </Tabs>

        {/* Generated QR Code Display */}
        {generatedQr && (
          <div className="neo-brutalist-section p-4 text-center space-y-3">
            <h3 className="font-bold">Generated QR Code</h3>
            <div className="flex justify-center">
              <img src={generatedQr} alt="Generated QR Code" className="max-w-64 h-auto" />
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono break-all">
              {generatedText}
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={downloadQr}
                variant="outline"
                size="sm"
                className="neo-brutalist-input hover:bg-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={copyQrImage}
                variant="outline"
                size="sm"
                className="neo-brutalist-input hover:bg-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              {navigator.share && (
                <Button
                  onClick={shareQr}
                  variant="outline"
                  size="sm"
                  className="neo-brutalist-input hover:bg-white"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
