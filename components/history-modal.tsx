"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import EnhancedHistoryPanel from "@/components/enhanced-history-panel"
import type { QrHistoryItem } from "@/hooks/use-history"

interface HistoryModalProps {
  history: QrHistoryItem[]
  onSelect: (item: QrHistoryItem) => void
  onRemove: (id: string) => void
  onClear: () => void
  onToggleFavorite: (id: string) => void
  searchHistory: (query: string) => QrHistoryItem[]
  filterByType: (type: QrHistoryItem['contentType']) => QrHistoryItem[]
  getFavorites: () => QrHistoryItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistoryModal({
  history,
  onSelect,
  onRemove,
  onClear,
  onToggleFavorite,
  searchHistory,
  filterByType,
  getFavorites,
  open,
  onOpenChange
}: HistoryModalProps) {
  const handleItemSelect = (item: QrHistoryItem) => {
    onSelect(item)
    onOpenChange(false) // Close modal after selecting an item
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="neo-brutalist-input hover:bg-white rounded-none flex gap-2 items-center border-[3px] border-black"
          onClick={() => onOpenChange(true)}
        >
          <History className="h-4 w-4" />
          <span className="font-medium">History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="neo-brutalist-card border-[3px] border-black shadow-lg p-6 max-w-4xl w-[95%]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase">History</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <EnhancedHistoryPanel
            history={history}
            onSelect={handleItemSelect}
            onRemove={onRemove}
            onClear={onClear}
            onToggleFavorite={onToggleFavorite}
            searchHistory={searchHistory}
            filterByType={filterByType}
            getFavorites={getFavorites}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
