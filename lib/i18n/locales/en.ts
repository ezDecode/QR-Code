import { Translations } from '../translations'

// English translations (base/fallback language)
const en: Translations = {
  // UI Elements - General
  'ui.button.generate': 'Generate',
  'ui.button.clear': 'Clear',
  'ui.button.copy': 'Copy',
  'ui.button.download': 'Download',
  'ui.button.share': 'Share',
  'ui.button.close': 'Close',
  'ui.button.cancel': 'Cancel',
  'ui.button.confirm': 'Confirm',
  'ui.button.save': 'Save',
  'ui.button.delete': 'Delete',
  'ui.button.edit': 'Edit',
  'ui.button.back': 'Back',
  'ui.button.next': 'Next',
  'ui.button.previous': 'Previous',
  
  // UI Elements - Labels
  'ui.label.text': 'Text',
  'ui.label.size': 'Size',
  'ui.label.color': 'Color',
  'ui.label.background': 'Background',
  'ui.label.search': 'Search',
  'ui.label.filter': 'Filter',
  'ui.label.sort': 'Sort',
  'ui.label.language': 'Language',
  'ui.label.settings': 'Settings',
  'ui.label.history': 'History',
  'ui.label.favorites': 'Favorites',
  'ui.label.actions': 'Actions',
  
  // UI Elements - Placeholders
  'ui.placeholder.enterText': 'Enter text to generate QR code',
  'ui.placeholder.search': 'Search history...',
  'ui.placeholder.noResults': 'No results found',
  'ui.placeholder.loading': 'Loading...',
  
  // Navigation and Headers
  'nav.title': 'QR Code Generator',
  'nav.subtitle': 'Generate QR codes instantly',
  'nav.history': 'History',
  'nav.settings': 'Settings',
  'nav.about': 'About',
  
  // QR Generator
  'qr.title': 'Generate QR Code',
  'qr.subtitle': 'Enter any text, URL, or data to create a QR code',
  'qr.generated': 'QR code generated successfully',
  'qr.generating': 'Generating QR code...',
  'qr.error': 'Failed to generate QR code',
  'qr.empty': 'Please enter some text',
  'qr.tooLong': 'Text is too long for QR code',
  
  // History
  'history.title': 'QR Code History',
  'history.empty': 'No QR codes generated yet',
  'history.clear': 'Clear History',
  'history.clearConfirm': 'Are you sure you want to clear all history?',
  'history.export': 'Export History',
  'history.import': 'Import History',
  'history.search': 'Search history',
  'history.filter.all': 'All',
  'history.filter.favorites': 'Favorites',
  'history.sort.newest': 'Newest First',
  'history.sort.oldest': 'Oldest First',
  'history.sort.alphabetical': 'Alphabetical',
  
  // Content Types
  'content.type.url': 'Website URL',
  'content.type.email': 'Email Address',
  'content.type.phone': 'Phone Number',
  'content.type.sms': 'SMS Message',
  'content.type.wifi': 'WiFi Network',
  'content.type.vcard': 'Contact Card',
  'content.type.text': 'Plain Text',
  
  // Content Actions
  'action.openLink': 'Open Link',
  'action.copyUrl': 'Copy URL',
  'action.sendEmail': 'Send Email',
  'action.copyEmail': 'Copy Email',
  'action.call': 'Call',
  'action.copyNumber': 'Copy Number',
  'action.sendSms': 'Send SMS',
  'action.connectWifi': 'Connect to WiFi',
  'action.addContact': 'Add Contact',
  'action.copyText': 'Copy Text',
  
  // Security
  'security.safe': 'Safe',
  'security.warning': 'Warning',
  'security.danger': 'Danger',
  'security.risk.low': 'Low Risk',
  'security.risk.medium': 'Medium Risk',
  'security.risk.high': 'High Risk',
  'security.warning.http': 'Unencrypted connection (HTTP)',
  'security.warning.shortener': 'URL shortener detected',
  'security.warning.ip': 'IP address instead of domain',
  'security.warning.suspicious': 'Suspicious domain',
  'security.warning.redirect': 'Contains redirect parameters',
  'security.warning.subdomain': 'Complex subdomain structure',
  'security.recommendation.https': 'Use HTTPS for secure connections',
  'security.recommendation.verify': 'Verify the destination before clicking',
  'security.recommendation.caution': 'Proceed with caution',
  
  // Messages - Success
  'message.success.generated': 'QR code generated successfully',
  'message.success.copied': 'Copied to clipboard',
  'message.success.downloaded': 'Downloaded successfully',
  'message.success.shared': 'Shared successfully',
  'message.success.saved': 'Saved successfully',
  'message.success.deleted': 'Deleted successfully',
  'message.success.exported': 'History exported successfully',
  'message.success.imported': 'History imported successfully',
  'message.success.languageChanged': 'Language changed successfully',
  
  // Messages - Error
  'message.error.invalid': 'Invalid input',
  'message.error.failed': 'Operation failed',
  'message.error.network': 'Network error',
  'message.error.storage': 'Storage error',
  'message.error.permission': 'Permission denied',
  'message.error.unsupported': 'Unsupported format',
  'message.error.tooLarge': 'File too large',
  'message.error.parsing': 'Failed to parse content',
  
  // Time and Dates
  'time.now': 'now',
  'time.minute': 'minute',
  'time.minutes': 'minutes',
  'time.hour': 'hour',
  'time.hours': 'hours',
  'time.day': 'day',
  'time.days': 'days',
  'time.week': 'week',
  'time.weeks': 'weeks',
  'time.month': 'month',
  'time.months': 'months',
  'time.year': 'year',
  'time.years': 'years',
  'time.ago': 'ago',
  
  // Accessibility
  'a11y.qrCode': 'QR Code image',
  'a11y.menu': 'Menu',
  'a11y.close': 'Close',
  'a11y.expand': 'Expand',
  'a11y.collapse': 'Collapse',
  'a11y.loading': 'Loading',
  'a11y.error': 'Error',
  'a11y.success': 'Success'
}

export default en