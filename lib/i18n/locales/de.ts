import { Translations } from '../translations'

// German translations
const de: Translations = {
  // UI Elements - General
  'ui.button.generate': 'Generieren',
  'ui.button.clear': 'Löschen',
  'ui.button.copy': 'Kopieren',
  'ui.button.download': 'Herunterladen',
  'ui.button.share': 'Teilen',
  'ui.button.close': 'Schließen',
  'ui.button.cancel': 'Abbrechen',
  'ui.button.confirm': 'Bestätigen',
  'ui.button.save': 'Speichern',
  'ui.button.delete': 'Löschen',
  'ui.button.edit': 'Bearbeiten',
  'ui.button.back': 'Zurück',
  'ui.button.next': 'Weiter',
  'ui.button.previous': 'Vorherige',
  
  // UI Elements - Labels
  'ui.label.text': 'Text',
  'ui.label.size': 'Größe',
  'ui.label.color': 'Farbe',
  'ui.label.background': 'Hintergrund',
  'ui.label.search': 'Suchen',
  'ui.label.filter': 'Filtern',
  'ui.label.sort': 'Sortieren',
  'ui.label.language': 'Sprache',
  'ui.label.settings': 'Einstellungen',
  'ui.label.history': 'Verlauf',
  'ui.label.favorites': 'Favoriten',
  'ui.label.actions': 'Aktionen',
  
  // UI Elements - Placeholders
  'ui.placeholder.enterText': 'Text eingeben, um QR-Code zu generieren',
  'ui.placeholder.search': 'Verlauf durchsuchen...',
  'ui.placeholder.noResults': 'Keine Ergebnisse gefunden',
  'ui.placeholder.loading': 'Laden...',
  
  // Navigation and Headers
  'nav.title': 'QR-Code Generator',
  'nav.subtitle': 'QR-Codes sofort generieren',
  'nav.history': 'Verlauf',
  'nav.settings': 'Einstellungen',
  'nav.about': 'Über',
  
  // QR Generator
  'qr.title': 'QR-Code Generieren',
  'qr.subtitle': 'Geben Sie beliebigen Text, URL oder Daten ein, um einen QR-Code zu erstellen',
  'qr.generated': 'QR-Code erfolgreich generiert',
  'qr.generating': 'QR-Code wird generiert...',
  'qr.error': 'Fehler beim Generieren des QR-Codes',
  'qr.empty': 'Bitte geben Sie etwas Text ein',
  'qr.tooLong': 'Text ist zu lang für QR-Code',
  
  // History
  'history.title': 'QR-Code Verlauf',
  'history.empty': 'Noch keine QR-Codes generiert',
  'history.clear': 'Verlauf Löschen',
  'history.clearConfirm': 'Sind Sie sicher, dass Sie den gesamten Verlauf löschen möchten?',
  'history.export': 'Verlauf Exportieren',
  'history.import': 'Verlauf Importieren',
  'history.search': 'Verlauf durchsuchen',
  'history.filter.all': 'Alle',
  'history.filter.favorites': 'Favoriten',
  'history.sort.newest': 'Neueste Zuerst',
  'history.sort.oldest': 'Älteste Zuerst',
  'history.sort.alphabetical': 'Alphabetisch',
  
  // Content Types
  'content.type.url': 'Website-URL',
  'content.type.email': 'E-Mail-Adresse',
  'content.type.phone': 'Telefonnummer',
  'content.type.sms': 'SMS-Nachricht',
  'content.type.wifi': 'WiFi-Netzwerk',
  'content.type.vcard': 'Kontaktkarte',
  'content.type.text': 'Einfacher Text',
  
  // Content Actions
  'action.openLink': 'Link Öffnen',
  'action.copyUrl': 'URL Kopieren',
  'action.sendEmail': 'E-Mail Senden',
  'action.copyEmail': 'E-Mail Kopieren',
  'action.call': 'Anrufen',
  'action.copyNumber': 'Nummer Kopieren',
  'action.sendSms': 'SMS Senden',
  'action.connectWifi': 'Mit WiFi Verbinden',
  'action.addContact': 'Kontakt Hinzufügen',
  'action.copyText': 'Text Kopieren',
  
  // Security
  'security.safe': 'Sicher',
  'security.warning': 'Warnung',
  'security.danger': 'Gefahr',
  'security.risk.low': 'Geringes Risiko',
  'security.risk.medium': 'Mittleres Risiko',
  'security.risk.high': 'Hohes Risiko',
  'security.warning.http': 'Unverschlüsselte Verbindung (HTTP)',
  'security.warning.shortener': 'URL-Verkürzer erkannt',
  'security.warning.ip': 'IP-Adresse statt Domain',
  'security.warning.suspicious': 'Verdächtige Domain',
  'security.warning.redirect': 'Enthält Weiterleitungsparameter',
  'security.warning.subdomain': 'Komplexe Subdomain-Struktur',
  'security.recommendation.https': 'Verwenden Sie HTTPS für sichere Verbindungen',
  'security.recommendation.verify': 'Überprüfen Sie das Ziel vor dem Klicken',
  'security.recommendation.caution': 'Mit Vorsicht fortfahren',
  
  // Messages - Success
  'message.success.generated': 'QR-Code erfolgreich generiert',
  'message.success.copied': 'In die Zwischenablage kopiert',
  'message.success.downloaded': 'Erfolgreich heruntergeladen',
  'message.success.shared': 'Erfolgreich geteilt',
  'message.success.saved': 'Erfolgreich gespeichert',
  'message.success.deleted': 'Erfolgreich gelöscht',
  'message.success.exported': 'Verlauf erfolgreich exportiert',
  'message.success.imported': 'Verlauf erfolgreich importiert',
  'message.success.languageChanged': 'Sprache erfolgreich geändert',
  
  // Messages - Error
  'message.error.invalid': 'Ungültige Eingabe',
  'message.error.failed': 'Vorgang fehlgeschlagen',
  'message.error.network': 'Netzwerkfehler',
  'message.error.storage': 'Speicherfehler',
  'message.error.permission': 'Berechtigung verweigert',
  'message.error.unsupported': 'Nicht unterstütztes Format',
  'message.error.tooLarge': 'Datei zu groß',
  'message.error.parsing': 'Fehler beim Analysieren des Inhalts',
  
  // Time and Dates
  'time.now': 'jetzt',
  'time.minute': 'Minute',
  'time.minutes': 'Minuten',
  'time.hour': 'Stunde',
  'time.hours': 'Stunden',
  'time.day': 'Tag',
  'time.days': 'Tage',
  'time.week': 'Woche',
  'time.weeks': 'Wochen',
  'time.month': 'Monat',
  'time.months': 'Monate',
  'time.year': 'Jahr',
  'time.years': 'Jahre',
  'time.ago': 'vor',
  
  // Accessibility
  'a11y.qrCode': 'QR-Code Bild',
  'a11y.menu': 'Menü',
  'a11y.close': 'Schließen',
  'a11y.expand': 'Erweitern',
  'a11y.collapse': 'Einklappen',
  'a11y.loading': 'Laden',
  'a11y.error': 'Fehler',
  'a11y.success': 'Erfolg'
}

export default de