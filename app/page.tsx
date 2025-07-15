"use client"

import { useState } from "react"
import { Zap, Github } from "lucide-react"
import QrGenerator from "@/components/qr-generator"
import { HistoryModal } from "@/components/history-modal"
import { useQrHistory } from "@/hooks/use-history"

export default function Home() {
  const {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    searchHistory,
    filterByType,
    getFavorites
  } = useQrHistory()

  const [historyModalOpen, setHistoryModalOpen] = useState(false)

  const handleHistorySelect = (item: any) => {
    // History selection for generator-focused app - currently just logs
    console.log('Selected history item:', item.text)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-accent" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">QR CODE GENERATOR</h1>
          </div>
          <div className="flex items-center gap-2">
            <HistoryModal
              history={history}
              onSelect={handleHistorySelect}
              onRemove={removeFromHistory}
              onClear={clearHistory}
              onToggleFavorite={toggleFavorite}
              searchHistory={searchHistory}
              filterByType={filterByType}
              getFavorites={getFavorites}
              open={historyModalOpen}
              onOpenChange={setHistoryModalOpen}
            />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-brutalist-input flex gap-2 items-center bg-white text-black hover:bg-gray-100 px-3 py-2 h-10"
            >
              <Github className="h-4 w-4" />
              <span className="font-medium hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* QR Generator */}
        <QrGenerator
          onGenerated={(text, dataUrl) => {
            // Add generated QR to history
            addToHistory(text, dataUrl, 'text')
          }}
        />

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm font-bold">FREE ONLINE QR CODE GENERATOR</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Generate QR codes instantly. All processing happens in your browser - no data is sent to servers.
          </p>
        </div>
      </div>
    </main>
  )
}
