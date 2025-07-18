"use client"

import { useState, useCallback, useMemo } from "react"
import { debounce, performanceMonitor } from "@/lib/performance-utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trash2,
  Download,
  Calendar,
  ExternalLink,
  Copy,
  Search,
  Star,
  StarOff,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  User,
  FileText,
  Clock,
  AlertTriangle,
  Shield,
  ShieldAlert
} from "lucide-react"
import type { QrHistoryItem } from "@/hooks/use-history"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/hooks/use-i18n"

interface EnhancedHistoryPanelProps {
  history: QrHistoryItem[]
  onSelect: (item: QrHistoryItem) => void
  onRemove: (id: string) => void
  onClear: () => void
  onToggleFavorite: (id: string) => void
  searchHistory: (query: string) => QrHistoryItem[]
  filterByType: (type: QrHistoryItem['contentType']) => QrHistoryItem[]
  getFavorites: () => QrHistoryItem[]
}

const typeIcons = {
  url: ExternalLink,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  wifi: Wifi,
  vcard: User,
  text: FileText
}

const typeLabels = {
  url: 'URL',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
  wifi: 'WiFi',
  vcard: 'Contact',
  text: 'Text'
}

const typeColors = {
  url: 'bg-blue-100 text-blue-800',
  email: 'bg-green-100 text-green-800',
  phone: 'bg-purple-100 text-purple-800',
  sms: 'bg-orange-100 text-orange-800',
  wifi: 'bg-cyan-100 text-cyan-800',
  vcard: 'bg-pink-100 text-pink-800',
  text: 'bg-gray-100 text-gray-800'
}

export default function EnhancedHistoryPanel({
  history,
  onSelect,
  onRemove,
  onClear,
  onToggleFavorite,
  searchHistory,
  filterByType,
  getFavorites
}: EnhancedHistoryPanelProps) {
  const { toast, success, error, validationError } = useToast()
  const { t, formatRelativeTime } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  // Debounced search to improve performance
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      const endTiming = performanceMonitor.startTiming('history-search')
      setDebouncedSearchQuery(query)
      endTiming()
    }, 300), // 300ms delay
    []
  )

  // Update debounced search when search query changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    debouncedSearch(value)
  }, [debouncedSearch])

  const copyToClipboard = async (text: string) => {
    try {
      if (!text || typeof text !== 'string') {
        validationError('text to copy')
        return
      }

      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        error('Copy Failed', 'Clipboard functionality is not supported in your browser')
        return
      }

      await navigator.clipboard.writeText(text)
      success(t('message.success.copied'), 'Text copied to clipboard')
    } catch (copyError) {
      console.error('Copy failed:', copyError)
      if (copyError instanceof Error && copyError.name === 'NotAllowedError') {
        error('Copy Failed', 'Permission denied. Please allow clipboard access and try again.')
      } else {
        error('Copy Failed', 'Failed to copy text to clipboard. Please try again.', copyError as Error)
      }
    }
  }

  const exportHistory = () => {
    try {
      if (!history || history.length === 0) {
        error('Export Failed', 'No history data available to export')
        return
      }

      // Safely format CSV content with error handling
      const csvContent = [
        ['Timestamp', 'Type', 'Content', 'Parsed Data', 'Security Risk', 'Favorite'],
        ...history.map(item => {
          try {
            // Format parsed data based on content type with null checks
            let parsedDataStr = ''
            if (item.parsedData) {
              switch (item.contentType) {
                case 'url':
                  parsedDataStr = `Domain: ${item.parsedData.domain || 'N/A'}, Protocol: ${item.parsedData.protocol || 'N/A'}`
                  break
                case 'email':
                  parsedDataStr = `Email: ${item.parsedData.email || 'N/A'}${item.parsedData.subject ? `, Subject: ${item.parsedData.subject}` : ''}`
                  break
                case 'phone':
                  parsedDataStr = `Phone: ${item.parsedData.phone || 'N/A'}, Formatted: ${item.parsedData.formatted || 'N/A'}`
                  break
                case 'sms':
                  parsedDataStr = `Phone: ${item.parsedData.phone || 'N/A'}${item.parsedData.message ? `, Message: ${item.parsedData.message}` : ''}`
                  break
                case 'wifi':
                  parsedDataStr = `SSID: ${item.parsedData.ssid || 'N/A'}, Security: ${item.parsedData.security || 'N/A'}`
                  break
                case 'vcard':
                  const vcardFields = Object.entries(item.parsedData || {})
                    .filter(([_, value]) => value)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')
                  parsedDataStr = vcardFields || 'N/A'
                  break
                case 'text':
                  parsedDataStr = item.parsedData.text || 'N/A'
                  break
                default:
                  parsedDataStr = 'N/A'
              }
            }

            return [
              item.timestamp ? new Date(item.timestamp).toISOString() : 'N/A',
              item.contentType || 'text',
              `"${(item.text || '').replace(/"/g, '""')}"`,
              `"${parsedDataStr.replace(/"/g, '""')}"`,
              item.securityAnalysis ? item.securityAnalysis.riskLevel : 'N/A',
              item.isFavorite ? 'Yes' : 'No'
            ]
          } catch (itemError) {
            console.warn('Error processing history item for export:', itemError)
            return [
              'Error',
              'Error',
              '"Error processing item"',
              '"Error processing item"',
              'N/A',
              'No'
            ]
          }
        })
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-history-${new Date().toISOString().split('T')[0]}.csv`

      // Add error handling for download
      a.onerror = () => {
        URL.revokeObjectURL(url)
        error('Export Failed', 'Failed to download the export file')
      }

      a.click()

      // Clean up the URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)

      success(t('message.success.exported'), 'History exported successfully')
    } catch (exportError) {
      console.error('Export failed:', exportError)
      error('Export Failed', 'Failed to export history. Please try again.', exportError as Error)
    }
  }

  const getFilteredHistory = () => {
    let filtered = history

    // Apply tab filter
    if (activeTab === "favorites") {
      filtered = getFavorites()
    }

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.contentType === selectedType)
    }

    // Apply search filter using the enhanced search function with debounced query
    if (debouncedSearchQuery.trim()) {
      filtered = searchHistory(debouncedSearchQuery).filter(item => {
        // Also apply tab and type filters to search results
        const matchesTab = activeTab === "all" || (activeTab === "favorites" && item.isFavorite)
        const matchesType = selectedType === "all" || item.contentType === selectedType
        return matchesTab && matchesType
      })
    }

    return filtered
  }

  const truncateText = (text: string, maxLength = 40) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const filteredHistory = getFilteredHistory()
  const favorites = getFavorites()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('history.title')}
        </h2>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="neo-brutalist-input hover:bg-white rounded-none"
                onClick={exportHistory}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('history.export')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="neo-brutalist-input hover:bg-white rounded-none"
                onClick={onClear}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('history.clear')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('history.search')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="neo-brutalist-input pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="neo-brutalist-input w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('history.filter.all')}</SelectItem>
              <SelectItem value="url">{t('content.type.url')}</SelectItem>
              <SelectItem value="email">{t('content.type.email')}</SelectItem>
              <SelectItem value="phone">{t('content.type.phone')}</SelectItem>
              <SelectItem value="sms">{t('content.type.sms')}</SelectItem>
              <SelectItem value="wifi">{t('content.type.wifi')}</SelectItem>
              <SelectItem value="vcard">{t('content.type.vcard')}</SelectItem>
              <SelectItem value="text">{t('content.type.text')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">{t('history.filter.all')} ({history.length})</TabsTrigger>
            <TabsTrigger value="favorites">{t('history.filter.favorites')} ({favorites.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="neo-brutalist-section p-4 text-center">
          <p className="text-muted-foreground">
            {activeTab === "favorites" ? t('history.empty') :
              searchQuery ? t('ui.placeholder.noResults') : t('history.empty')}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] neo-brutalist-section p-0">
          <div className="space-y-0 divide-y-[3px] divide-black">
            {filteredHistory.map((item) => {
              const TypeIcon = typeIcons[item.contentType || 'text']
              return (
                <div key={item.id} className="p-3 hover:bg-muted/10">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIcon className="h-3 w-3" />
                        <Badge className={`${typeColors[item.contentType]} text-xs`}>
                          {typeLabels[item.contentType]}
                        </Badge>
                        {item.isFavorite && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                        {/* Security warning for URLs */}
                        {item.securityAnalysis && (
                          <Badge
                            className={`text-xs ${item.securityAnalysis.riskLevel === 'high'
                              ? 'bg-red-100 text-red-800'
                              : item.securityAnalysis.riskLevel === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                              }`}
                          >
                            {item.securityAnalysis.riskLevel === 'high' && <ShieldAlert className="h-2 w-2 mr-1" />}
                            {item.securityAnalysis.riskLevel === 'medium' && <AlertTriangle className="h-2 w-2 mr-1" />}
                            {item.securityAnalysis.riskLevel === 'low' && <Shield className="h-2 w-2 mr-1" />}
                            {item.securityAnalysis.riskLevel.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      <button
                        className="text-left w-full font-medium hover:underline text-sm"
                        onClick={() => onSelect(item)}
                      >
                        {truncateText(item.text)}
                      </button>

                      {/* Content-specific parsed data display */}
                      {item.parsedData && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.contentType === 'url' && (
                            <span>Domain: {item.parsedData.domain}</span>
                          )}
                          {item.contentType === 'email' && (
                            <span>Email: {item.parsedData.email}</span>
                          )}
                          {item.contentType === 'phone' && (
                            <span>Phone: {item.parsedData.formatted}</span>
                          )}
                          {item.contentType === 'sms' && (
                            <span>To: {item.parsedData.phone}{item.parsedData.message && ` • Message: ${truncateText(item.parsedData.message, 20)}`}</span>
                          )}
                          {item.contentType === 'wifi' && (
                            <span>Network: {item.parsedData.ssid} ({item.parsedData.security})</span>
                          )}
                          {item.contentType === 'vcard' && (
                            <span>{item.parsedData.name || 'Contact'}{item.parsedData.organization && ` • ${item.parsedData.organization}`}</span>
                          )}
                        </div>
                      )}

                      {/* Security warnings for URLs */}
                      {item.securityAnalysis && item.securityAnalysis.warnings.length > 0 && (
                        <div className="mt-1 text-xs text-orange-600">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          {item.securityAnalysis.warnings[0]}
                          {item.securityAnalysis.warnings.length > 1 && ` (+${item.securityAnalysis.warnings.length - 1} more)`}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatRelativeTime(new Date(item.timestamp))}</span>
                      </div>

                      {/* Content-specific action buttons */}
                      {item.actions && item.actions.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {item.actions.slice(0, 2).map((action, index) => {
                            const ActionIcon = action.icon
                            return (
                              <Button
                                key={index}
                                variant={action.variant || "outline"}
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.action()
                                }}
                              >
                                <ActionIcon className="h-3 w-3 mr-1" />
                                {action.label}
                              </Button>
                            )
                          })}
                          {item.actions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.actions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onToggleFavorite(item.id)}
                        title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {item.isFavorite ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(item.text)}
                        title="Copy text"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemove(item.id)}
                        title="Remove from history"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
