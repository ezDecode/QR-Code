import { Translations } from '../translations'

// Spanish translations
const es: Translations = {
  // UI Elements - General
  'ui.button.generate': 'Generar',
  'ui.button.clear': 'Limpiar',
  'ui.button.copy': 'Copiar',
  'ui.button.download': 'Descargar',
  'ui.button.share': 'Compartir',
  'ui.button.close': 'Cerrar',
  'ui.button.cancel': 'Cancelar',
  'ui.button.confirm': 'Confirmar',
  'ui.button.save': 'Guardar',
  'ui.button.delete': 'Eliminar',
  'ui.button.edit': 'Editar',
  'ui.button.back': 'Atrás',
  'ui.button.next': 'Siguiente',
  'ui.button.previous': 'Anterior',
  
  // UI Elements - Labels
  'ui.label.text': 'Texto',
  'ui.label.size': 'Tamaño',
  'ui.label.color': 'Color',
  'ui.label.background': 'Fondo',
  'ui.label.search': 'Buscar',
  'ui.label.filter': 'Filtrar',
  'ui.label.sort': 'Ordenar',
  'ui.label.language': 'Idioma',
  'ui.label.settings': 'Configuración',
  'ui.label.history': 'Historial',
  'ui.label.favorites': 'Favoritos',
  'ui.label.actions': 'Acciones',
  
  // UI Elements - Placeholders
  'ui.placeholder.enterText': 'Ingresa texto para generar código QR',
  'ui.placeholder.search': 'Buscar en historial...',
  'ui.placeholder.noResults': 'No se encontraron resultados',
  'ui.placeholder.loading': 'Cargando...',
  
  // Navigation and Headers
  'nav.title': 'Generador de Códigos QR',
  'nav.subtitle': 'Genera códigos QR al instante',
  'nav.history': 'Historial',
  'nav.settings': 'Configuración',
  'nav.about': 'Acerca de',
  
  // QR Generator
  'qr.title': 'Generar Código QR',
  'qr.subtitle': 'Ingresa cualquier texto, URL o datos para crear un código QR',
  'qr.generated': 'Código QR generado exitosamente',
  'qr.generating': 'Generando código QR...',
  'qr.error': 'Error al generar código QR',
  'qr.empty': 'Por favor ingresa algún texto',
  'qr.tooLong': 'El texto es demasiado largo para el código QR',
  
  // History
  'history.title': 'Historial de Códigos QR',
  'history.empty': 'Aún no se han generado códigos QR',
  'history.clear': 'Limpiar Historial',
  'history.clearConfirm': '¿Estás seguro de que quieres limpiar todo el historial?',
  'history.export': 'Exportar Historial',
  'history.import': 'Importar Historial',
  'history.search': 'Buscar en historial',
  'history.filter.all': 'Todos',
  'history.filter.favorites': 'Favoritos',
  'history.sort.newest': 'Más Recientes',
  'history.sort.oldest': 'Más Antiguos',
  'history.sort.alphabetical': 'Alfabético',
  
  // Content Types
  'content.type.url': 'URL del Sitio Web',
  'content.type.email': 'Dirección de Correo',
  'content.type.phone': 'Número de Teléfono',
  'content.type.sms': 'Mensaje SMS',
  'content.type.wifi': 'Red WiFi',
  'content.type.vcard': 'Tarjeta de Contacto',
  'content.type.text': 'Texto Plano',
  
  // Content Actions
  'action.openLink': 'Abrir Enlace',
  'action.copyUrl': 'Copiar URL',
  'action.sendEmail': 'Enviar Correo',
  'action.copyEmail': 'Copiar Correo',
  'action.call': 'Llamar',
  'action.copyNumber': 'Copiar Número',
  'action.sendSms': 'Enviar SMS',
  'action.connectWifi': 'Conectar a WiFi',
  'action.addContact': 'Agregar Contacto',
  'action.copyText': 'Copiar Texto',
  
  // Security
  'security.safe': 'Seguro',
  'security.warning': 'Advertencia',
  'security.danger': 'Peligro',
  'security.risk.low': 'Riesgo Bajo',
  'security.risk.medium': 'Riesgo Medio',
  'security.risk.high': 'Riesgo Alto',
  'security.warning.http': 'Conexión no cifrada (HTTP)',
  'security.warning.shortener': 'Acortador de URL detectado',
  'security.warning.ip': 'Dirección IP en lugar de dominio',
  'security.warning.suspicious': 'Dominio sospechoso',
  'security.warning.redirect': 'Contiene parámetros de redirección',
  'security.warning.subdomain': 'Estructura de subdominio compleja',
  'security.recommendation.https': 'Usa HTTPS para conexiones seguras',
  'security.recommendation.verify': 'Verifica el destino antes de hacer clic',
  'security.recommendation.caution': 'Procede con precaución',
  
  // Messages - Success
  'message.success.generated': 'Código QR generado exitosamente',
  'message.success.copied': 'Copiado al portapapeles',
  'message.success.downloaded': 'Descargado exitosamente',
  'message.success.shared': 'Compartido exitosamente',
  'message.success.saved': 'Guardado exitosamente',
  'message.success.deleted': 'Eliminado exitosamente',
  'message.success.exported': 'Historial exportado exitosamente',
  'message.success.imported': 'Historial importado exitosamente',
  'message.success.languageChanged': 'Idioma cambiado exitosamente',
  
  // Messages - Error
  'message.error.invalid': 'Entrada inválida',
  'message.error.failed': 'Operación fallida',
  'message.error.network': 'Error de red',
  'message.error.storage': 'Error de almacenamiento',
  'message.error.permission': 'Permiso denegado',
  'message.error.unsupported': 'Formato no soportado',
  'message.error.tooLarge': 'Archivo demasiado grande',
  'message.error.parsing': 'Error al analizar contenido',
  
  // Time and Dates
  'time.now': 'ahora',
  'time.minute': 'minuto',
  'time.minutes': 'minutos',
  'time.hour': 'hora',
  'time.hours': 'horas',
  'time.day': 'día',
  'time.days': 'días',
  'time.week': 'semana',
  'time.weeks': 'semanas',
  'time.month': 'mes',
  'time.months': 'meses',
  'time.year': 'año',
  'time.years': 'años',
  'time.ago': 'hace',
  
  // Accessibility
  'a11y.qrCode': 'Imagen de código QR',
  'a11y.menu': 'Menú',
  'a11y.close': 'Cerrar',
  'a11y.expand': 'Expandir',
  'a11y.collapse': 'Contraer',
  'a11y.loading': 'Cargando',
  'a11y.error': 'Error',
  'a11y.success': 'Éxito'
}

export default es