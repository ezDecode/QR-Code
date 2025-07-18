import { Translations } from '../translations'

// French translations
const fr: Translations = {
  // UI Elements - General
  'ui.button.generate': 'Générer',
  'ui.button.clear': 'Effacer',
  'ui.button.copy': 'Copier',
  'ui.button.download': 'Télécharger',
  'ui.button.share': 'Partager',
  'ui.button.close': 'Fermer',
  'ui.button.cancel': 'Annuler',
  'ui.button.confirm': 'Confirmer',
  'ui.button.save': 'Enregistrer',
  'ui.button.delete': 'Supprimer',
  'ui.button.edit': 'Modifier',
  'ui.button.back': 'Retour',
  'ui.button.next': 'Suivant',
  'ui.button.previous': 'Précédent',
  
  // UI Elements - Labels
  'ui.label.text': 'Texte',
  'ui.label.size': 'Taille',
  'ui.label.color': 'Couleur',
  'ui.label.background': 'Arrière-plan',
  'ui.label.search': 'Rechercher',
  'ui.label.filter': 'Filtrer',
  'ui.label.sort': 'Trier',
  'ui.label.language': 'Langue',
  'ui.label.settings': 'Paramètres',
  'ui.label.history': 'Historique',
  'ui.label.favorites': 'Favoris',
  'ui.label.actions': 'Actions',
  
  // UI Elements - Placeholders
  'ui.placeholder.enterText': 'Entrez du texte pour générer un code QR',
  'ui.placeholder.search': 'Rechercher dans l\'historique...',
  'ui.placeholder.noResults': 'Aucun résultat trouvé',
  'ui.placeholder.loading': 'Chargement...',
  
  // Navigation and Headers
  'nav.title': 'Générateur de Codes QR',
  'nav.subtitle': 'Générez des codes QR instantanément',
  'nav.history': 'Historique',
  'nav.settings': 'Paramètres',
  'nav.about': 'À propos',
  
  // QR Generator
  'qr.title': 'Générer un Code QR',
  'qr.subtitle': 'Entrez n\'importe quel texte, URL ou données pour créer un code QR',
  'qr.generated': 'Code QR généré avec succès',
  'qr.generating': 'Génération du code QR...',
  'qr.error': 'Échec de la génération du code QR',
  'qr.empty': 'Veuillez entrer du texte',
  'qr.tooLong': 'Le texte est trop long pour le code QR',
  
  // History
  'history.title': 'Historique des Codes QR',
  'history.empty': 'Aucun code QR généré pour le moment',
  'history.clear': 'Effacer l\'Historique',
  'history.clearConfirm': 'Êtes-vous sûr de vouloir effacer tout l\'historique ?',
  'history.export': 'Exporter l\'Historique',
  'history.import': 'Importer l\'Historique',
  'history.search': 'Rechercher dans l\'historique',
  'history.filter.all': 'Tous',
  'history.filter.favorites': 'Favoris',
  'history.sort.newest': 'Plus Récents',
  'history.sort.oldest': 'Plus Anciens',
  'history.sort.alphabetical': 'Alphabétique',
  
  // Content Types
  'content.type.url': 'URL du Site Web',
  'content.type.email': 'Adresse E-mail',
  'content.type.phone': 'Numéro de Téléphone',
  'content.type.sms': 'Message SMS',
  'content.type.wifi': 'Réseau WiFi',
  'content.type.vcard': 'Carte de Contact',
  'content.type.text': 'Texte Brut',
  
  // Content Actions
  'action.openLink': 'Ouvrir le Lien',
  'action.copyUrl': 'Copier l\'URL',
  'action.sendEmail': 'Envoyer un E-mail',
  'action.copyEmail': 'Copier l\'E-mail',
  'action.call': 'Appeler',
  'action.copyNumber': 'Copier le Numéro',
  'action.sendSms': 'Envoyer un SMS',
  'action.connectWifi': 'Se Connecter au WiFi',
  'action.addContact': 'Ajouter un Contact',
  'action.copyText': 'Copier le Texte',
  
  // Security
  'security.safe': 'Sûr',
  'security.warning': 'Avertissement',
  'security.danger': 'Danger',
  'security.risk.low': 'Risque Faible',
  'security.risk.medium': 'Risque Moyen',
  'security.risk.high': 'Risque Élevé',
  'security.warning.http': 'Connexion non chiffrée (HTTP)',
  'security.warning.shortener': 'Raccourcisseur d\'URL détecté',
  'security.warning.ip': 'Adresse IP au lieu du domaine',
  'security.warning.suspicious': 'Domaine suspect',
  'security.warning.redirect': 'Contient des paramètres de redirection',
  'security.warning.subdomain': 'Structure de sous-domaine complexe',
  'security.recommendation.https': 'Utilisez HTTPS pour des connexions sécurisées',
  'security.recommendation.verify': 'Vérifiez la destination avant de cliquer',
  'security.recommendation.caution': 'Procédez avec prudence',
  
  // Messages - Success
  'message.success.generated': 'Code QR généré avec succès',
  'message.success.copied': 'Copié dans le presse-papiers',
  'message.success.downloaded': 'Téléchargé avec succès',
  'message.success.shared': 'Partagé avec succès',
  'message.success.saved': 'Enregistré avec succès',
  'message.success.deleted': 'Supprimé avec succès',
  'message.success.exported': 'Historique exporté avec succès',
  'message.success.imported': 'Historique importé avec succès',
  'message.success.languageChanged': 'Langue changée avec succès',
  
  // Messages - Error
  'message.error.invalid': 'Entrée invalide',
  'message.error.failed': 'Opération échouée',
  'message.error.network': 'Erreur réseau',
  'message.error.storage': 'Erreur de stockage',
  'message.error.permission': 'Permission refusée',
  'message.error.unsupported': 'Format non supporté',
  'message.error.tooLarge': 'Fichier trop volumineux',
  'message.error.parsing': 'Échec de l\'analyse du contenu',
  
  // Time and Dates
  'time.now': 'maintenant',
  'time.minute': 'minute',
  'time.minutes': 'minutes',
  'time.hour': 'heure',
  'time.hours': 'heures',
  'time.day': 'jour',
  'time.days': 'jours',
  'time.week': 'semaine',
  'time.weeks': 'semaines',
  'time.month': 'mois',
  'time.months': 'mois',
  'time.year': 'année',
  'time.years': 'années',
  'time.ago': 'il y a',
  
  // Accessibility
  'a11y.qrCode': 'Image de code QR',
  'a11y.menu': 'Menu',
  'a11y.close': 'Fermer',
  'a11y.expand': 'Développer',
  'a11y.collapse': 'Réduire',
  'a11y.loading': 'Chargement',
  'a11y.error': 'Erreur',
  'a11y.success': 'Succès'
}

export default fr