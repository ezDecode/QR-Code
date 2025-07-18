"use client"

import { Languages, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/hooks/use-i18n"
import { languages } from "@/lib/i18n/translations"
import { useToast } from "@/hooks/use-toast"

export function LanguageSelector() {
  const { currentLanguage, setLanguage, t } = useI18n()
  const { toast } = useToast()

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode)
    toast({
      title: t('message.success.languageChanged'),
      description: `${t('ui.label.language')}: ${languages.find(l => l.code === languageCode)?.nativeName}`,
      variant: "success"
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="neo-brutalist-input flex gap-2 items-center bg-white text-black hover:bg-gray-100 px-3 py-2 h-10"
          title={t('ui.label.language')}
        >
          <Languages className="h-4 w-4" />
          <span className="font-medium hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="neo-brutalist-card min-w-[200px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer hover:bg-muted/50"
          >
            <div className="flex flex-col">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-xs text-muted-foreground">{language.name}</span>
            </div>
            {currentLanguage.code === language.code && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}