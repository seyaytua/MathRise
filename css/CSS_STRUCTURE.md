# 📁 CSS構造ドキュメント

**最終更新:** 2025年10月9日  
**バージョン:** 2.0.0

---

## 📂 ディレクトリ構造

css/ ├── base/ # 基礎スタイル │ ├── reset.css # ブラウザリセット │ ├── variables.css # CSS変数定義 │ └── typography.css # タイポグラフィ │ ├── layout/ # レイアウト │ ├── header.css # ヘッダー │ ├── footer.css # フッター │ ├── sidebar.css # サイドバー │ └── container.css # コンテナ │ ├── components/ # 再利用可能コンポーネント │ ├── buttons.css # ボタン │ ├── cards.css # カード │ ├── modals.css # モーダル │ ├── forms.css # フォーム │ ├── navigation.css # ナビゲーション │ ├── badges.css # バッジ │ ├── progress-bars.css # 進捗バー │ └── notifications.css # 通知 │ ├── features/ # 機能別スタイル │ ├── lessons.css # レッスン表示 │ ├── problems.css # 問題コンポーネント │ ├── math-layout.css # 数式レイアウト │ ├── cartridge.css # カセット選択UI │ └── achievements.css # 実績システム │ ├── pages/ # ページ固有スタイル │ ├── home.css # ホーム画面 │ ├── learning.css # 学習画面 │ └── dashboard.css # 統計画面 │ ├── utilities/ # ユーティリティ │ ├── animations.css # アニメーション │ ├── spacing.css # スペーシング │ └── helpers.css # ヘルパークラス │ └── themes.css # テーマ切り替え


---

## 📋 読み込み順序

### index.html（学習画面）

```html
<!-- 基礎 -->
<link rel="stylesheet" href="css/base/reset.css">
<link rel="stylesheet" href="css/base/variables.css">
<link rel="stylesheet" href="css/base/typography.css">

<!-- レイアウト -->
<link rel="stylesheet" href="css/layout/header.css">
<link rel="stylesheet" href="css/layout/sidebar.css">
<link rel="stylesheet" href="css/layout/container.css">

<!-- コンポーネント -->
<link rel="stylesheet" href="css/components/buttons.css">
<link rel="stylesheet" href="css/components/cards.css">
<link rel="stylesheet" href="css/components/forms.css">
<link rel="stylesheet" href="css/components/navigation.css">
<link rel="stylesheet" href="css/components/badges.css">
<link rel="stylesheet" href="css/components/progress-bars.css">
<link rel="stylesheet" href="css/components/notifications.css">

<!-- 機能 -->
<link rel="stylesheet" href="css/features/lessons.css">
<link rel="stylesheet" href="css/features/problems.css">
<link rel="stylesheet" href="css/features/math-layout.css">

<!-- ページ -->
<link rel="stylesheet" href="css/pages/learning.css">
<link rel="stylesheet" href="css/pages/dashboard.css">

<!-- ユーティリティ -->
<link rel="stylesheet" href="css/utilities/animations.css">
<link rel="stylesheet" href="css/utilities/spacing.css">
<link rel="stylesheet" href="css/utilities/helpers.css">

<!-- テーマ -->
<link rel="stylesheet" href="css/themes.css">
home.html（ホーム画面）
Copy<!-- 基礎 -->
<link rel="stylesheet" href="css/base/reset.css">
<link rel="stylesheet" href="css/base/variables.css">
<link rel="stylesheet" href="css/base/typography.css">

<!-- レイアウト -->
<link rel="stylesheet" href="css/layout/header.css">
<link rel="stylesheet" href="css/layout/footer.css">
<link rel="stylesheet" href="css/layout/container.css">

<!-- コンポーネント -->
<link rel="stylesheet" href="css/components/buttons.css">
<link rel="stylesheet" href="css/components/cards.css">
<link rel="stylesheet" href="css/components/modals.css">
<link rel="stylesheet" href="css/components/badges.css">
<link rel="stylesheet" href="css/components/progress-bars.css">
<link rel="stylesheet" href="css/components/notifications.css">

<!-- 機能 -->
<link rel="stylesheet" href="css/features/cartridge.css">
<link rel="stylesheet" href="css/features/achievements.css">

<!-- ページ -->
<link rel="stylesheet" href="css/pages/home.css">

<!-- ユーティリティ -->
<link rel="stylesheet" href="css/utilities/animations.css">
<link rel="stylesheet" href="css/utilities/spacing.css">
<link rel="stylesheet" href="css/utilities/helpers.css">

<!-- テーマ -->
<link rel="stylesheet" href="css/themes.css">
🎯 各ファイルの役割
base/
reset.css: ブラウザのデフォルトスタイルをリセット
variables.css: 全CSS変数を一元管理（色、スペース、フォントなど）
typography.css: 見出し、段落、コードなどの基本テキストスタイル
layout/
header.css: 学習画面・Switch風ヘッダーのスタイル
footer.css: Switch風フッターのスタイル
sidebar.css: サイドバー、レッスンリストのスタイル
container.css: コンテナ、グリッド、ローディングのスタイル
components/
buttons.css: 全ボタンバリエーション（プライマリ、セカンダリなど）
cards.css: コースカード、統計カード、問題カード
modals.css: モーダル、カセット挿入演出
forms.css: 入力欄、選択肢、トグルスイッチ
navigation.css: ナビゲーション、ページング、タブ
badges.css: バッジ、実績表示
progress-bars.css: 各種進捗バー
notifications.css: 通知、トースト、アラート
features/
lessons.css: レッスン表示、重要度別スタイル
problems.css: 問題コンポーネント、段階的問題
math-layout.css: MathJax数式の調整
cartridge.css: カセット選択UIとアニメーション
achievements.css: 実績システム全般
pages/
home.css: ホーム画面固有のスタイル
learning.css: 学習画面固有のスタイル
dashboard.css: 統計画面（ダッシュボード）のスタイル
utilities/
animations.css: 全アニメーション定義
spacing.css: マージン・パディングのユーティリティクラス
helpers.css: 表示制御、Flexbox、Gridなどのヘルパー
themes.css
テーマ切り替えロジック
ライト/ダークテーマの管理
🔧 カスタマイズガイド
色の変更
css/base/variables.css の :root セクションで色を変更

Copy:root {
  --primary: #2196F3;  /* プライマリカラー */
  --secondary: #FF9800; /* セカンダリカラー */
  /* ... */
}
スペーシングの調整
css/base/variables.css のスペース変数を変更

Copy:root {
  --space-md: 1rem;  /* 基本スペース */
  --space-lg: 1.5rem; /* 大きめスペース */
  /* ... */
}
新しいコンポーネントの追加
適切なディレクトリにファイルを作成
HTMLファイルに <link> タグを追加
既存の命名規則に従う
⚠️ 注意事項
読み込み順序を守る: 基礎 → レイアウト → コンポーネント → 機能 → ページ → ユーティリティ → テーマ
変数を直接編集しない: variables.css 以外で色やスペースを直接指定しない
BEM風の命名: .block__element--modifier の形式を推奨
レスポンシブ: モバイルファーストで設計済み
📈 パフォーマンス
総ファイル数: 27
総行数: 約6,500行
平均ファイルサイズ: 約240行
読み込み時間: < 100ms（キャッシュ後）
🔄 バージョン履歴
v2.0.0 (2025-10-09)
CSS構造の完全リファクタリング
モジュール化による保守性向上
再利用性の大幅改善
v1.0.0 (以前)
初期バージョン
単一ファイルまたは大規模ファイル
📞 サポート
問題が発生した場合:

verify_css_structure.sh を実行
ブラウザのキャッシュをクリア
開発者ツールでCSSの読み込みを確認
作成者: MathRise Team
ライセンス: MIT 
