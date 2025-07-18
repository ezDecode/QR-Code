import { Translations } from '../translations'

// Japanese translations
const ja: Translations = {
  // UI Elements - General
  'ui.button.generate': '生成',
  'ui.button.clear': 'クリア',
  'ui.button.copy': 'コピー',
  'ui.button.download': 'ダウンロード',
  'ui.button.share': '共有',
  'ui.button.close': '閉じる',
  'ui.button.cancel': 'キャンセル',
  'ui.button.confirm': '確認',
  'ui.button.save': '保存',
  'ui.button.delete': '削除',
  'ui.button.edit': '編集',
  'ui.button.back': '戻る',
  'ui.button.next': '次へ',
  'ui.button.previous': '前へ',
  
  // UI Elements - Labels
  'ui.label.text': 'テキスト',
  'ui.label.size': 'サイズ',
  'ui.label.color': '色',
  'ui.label.background': '背景',
  'ui.label.search': '検索',
  'ui.label.filter': 'フィルター',
  'ui.label.sort': '並び替え',
  'ui.label.language': '言語',
  'ui.label.settings': '設定',
  'ui.label.history': '履歴',
  'ui.label.favorites': 'お気に入り',
  'ui.label.actions': 'アクション',
  
  // UI Elements - Placeholders
  'ui.placeholder.enterText': 'QRコードを生成するテキストを入力',
  'ui.placeholder.search': '履歴を検索...',
  'ui.placeholder.noResults': '結果が見つかりません',
  'ui.placeholder.loading': '読み込み中...',
  
  // Navigation and Headers
  'nav.title': 'QRコードジェネレーター',
  'nav.subtitle': 'QRコードを瞬時に生成',
  'nav.history': '履歴',
  'nav.settings': '設定',
  'nav.about': 'について',
  
  // QR Generator
  'qr.title': 'QRコード生成',
  'qr.subtitle': 'テキスト、URL、またはデータを入力してQRコードを作成',
  'qr.generated': 'QRコードが正常に生成されました',
  'qr.generating': 'QRコードを生成中...',
  'qr.error': 'QRコードの生成に失敗しました',
  'qr.empty': 'テキストを入力してください',
  'qr.tooLong': 'QRコードには長すぎるテキストです',
  
  // History
  'history.title': 'QRコード履歴',
  'history.empty': 'まだQRコードが生成されていません',
  'history.clear': '履歴をクリア',
  'history.clearConfirm': '本当にすべての履歴をクリアしますか？',
  'history.export': '履歴をエクスポート',
  'history.import': '履歴をインポート',
  'history.search': '履歴を検索',
  'history.filter.all': 'すべて',
  'history.filter.favorites': 'お気に入り',
  'history.sort.newest': '新しい順',
  'history.sort.oldest': '古い順',
  'history.sort.alphabetical': 'アルファベット順',
  
  // Content Types
  'content.type.url': 'ウェブサイトURL',
  'content.type.email': 'メールアドレス',
  'content.type.phone': '電話番号',
  'content.type.sms': 'SMSメッセージ',
  'content.type.wifi': 'WiFiネットワーク',
  'content.type.vcard': '連絡先カード',
  'content.type.text': 'プレーンテキスト',
  
  // Content Actions
  'action.openLink': 'リンクを開く',
  'action.copyUrl': 'URLをコピー',
  'action.sendEmail': 'メールを送信',
  'action.copyEmail': 'メールをコピー',
  'action.call': '電話をかける',
  'action.copyNumber': '番号をコピー',
  'action.sendSms': 'SMSを送信',
  'action.connectWifi': 'WiFiに接続',
  'action.addContact': '連絡先を追加',
  'action.copyText': 'テキストをコピー',
  
  // Security
  'security.safe': '安全',
  'security.warning': '警告',
  'security.danger': '危険',
  'security.risk.low': '低リスク',
  'security.risk.medium': '中リスク',
  'security.risk.high': '高リスク',
  'security.warning.http': '暗号化されていない接続（HTTP）',
  'security.warning.shortener': 'URL短縮サービスが検出されました',
  'security.warning.ip': 'ドメインの代わりにIPアドレス',
  'security.warning.suspicious': '疑わしいドメイン',
  'security.warning.redirect': 'リダイレクトパラメータが含まれています',
  'security.warning.subdomain': '複雑なサブドメイン構造',
  'security.recommendation.https': '安全な接続にはHTTPSを使用してください',
  'security.recommendation.verify': 'クリックする前に宛先を確認してください',
  'security.recommendation.caution': '注意して進んでください',
  
  // Messages - Success
  'message.success.generated': 'QRコードが正常に生成されました',
  'message.success.copied': 'クリップボードにコピーしました',
  'message.success.downloaded': '正常にダウンロードしました',
  'message.success.shared': '正常に共有しました',
  'message.success.saved': '正常に保存しました',
  'message.success.deleted': '正常に削除しました',
  'message.success.exported': '履歴を正常にエクスポートしました',
  'message.success.imported': '履歴を正常にインポートしました',
  'message.success.languageChanged': '言語を正常に変更しました',
  
  // Messages - Error
  'message.error.invalid': '無効な入力',
  'message.error.failed': '操作が失敗しました',
  'message.error.network': 'ネットワークエラー',
  'message.error.storage': 'ストレージエラー',
  'message.error.permission': '権限が拒否されました',
  'message.error.unsupported': 'サポートされていない形式',
  'message.error.tooLarge': 'ファイルが大きすぎます',
  'message.error.parsing': 'コンテンツの解析に失敗しました',
  
  // Time and Dates
  'time.now': '今',
  'time.minute': '分',
  'time.minutes': '分',
  'time.hour': '時間',
  'time.hours': '時間',
  'time.day': '日',
  'time.days': '日',
  'time.week': '週',
  'time.weeks': '週',
  'time.month': 'ヶ月',
  'time.months': 'ヶ月',
  'time.year': '年',
  'time.years': '年',
  'time.ago': '前',
  
  // Accessibility
  'a11y.qrCode': 'QRコード画像',
  'a11y.menu': 'メニュー',
  'a11y.close': '閉じる',
  'a11y.expand': '展開',
  'a11y.collapse': '折りたたみ',
  'a11y.loading': '読み込み中',
  'a11y.error': 'エラー',
  'a11y.success': '成功'
}

export default ja