"use client"

import { useState } from "react"
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
  Clock
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { QrHistoryItem } from "@/hooks/use-history"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
        variant: "success",
      })
    })
  }

  const exportHistory = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Content', 'Favorite'],
      ...history.map(item => [
        new Date(item.timestamp).toISOString(),
        item.contentType || 'text',
        `"${item.text.replace(/"/g, '""')}"`,
        item.isFavorite ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Exported!",
      description: "History exported to CSV file",
      variant: "success",
    })
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

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.text.toLowerCase().includes(query) ||
        (item.contentType && item.contentType.toLowerCase().includes(query))
      )
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
          History
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
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="neo-brutalist-input hover:bg-white rounded-none"
                onClick={onClear}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
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
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neo-brutalist-input pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="neo-brutalist-input w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="url">URLs</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="wifi">WiFi</SelectItem>
              <SelectItem value="vcard">Contact</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All ({history.length})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="neo-brutalist-section p-4 text-center">
          <p className="text-muted-foreground">
            {activeTab === "favorites" ? "No favorites yet" : 
             searchQuery ? "No results found" : "No history yet"}
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
                        {item.contentType && (
                          <Badge className={`${typeColors[item.contentType]} text-xs`}>
                            {typeLabels[item.contentType]}
                          </Badge>
                        )}
                        {item.isFavorite && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <button 
                        className="text-left w-full font-medium hover:underline text-sm" 
                        onClick={() => onSelect(item)}
                      >
                        {truncateText(item.text)}
                      </button>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                      </div>
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
