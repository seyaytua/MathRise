# 数学学習アプリ - Progate風

## 概要
高校数学（数学Ⅰ〜Ⅲ、A〜C）を「行間を埋める」能動的学習で学べるWebアプリケーション

## 特徴
- 🎯 重要度別学習（低/中/高の3段階）
- 📐 美しい数式表示（MathJax）
- 💡 段階的ヒントシステム
- ✓ リアルタイムフィードバック
- 📊 進捗管理

## 技術スタック
- HTML5 / CSS3
- Vanilla JavaScript (ES6+)
- MathJax 3.x
- localStorage

## ローカル実行

```bash
# シンプルなHTTPサーバーで起動
python3 -m http.server 8000

# ブラウザで開く
open http://localhost:8000
GitHub Pages デプロイ
Copy# Gitリポジトリ初期化
git init
git add .
git commit -m "Initial commit"

# GitHubにプッシュ
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/App_progate.git
git push -u origin main

# GitHub Pages設定
# Settings > Pages > Source: main branch
プロジェクト構造
App_progate/
├── index.html          # エントリーポイント
├── css/                # スタイルシート
│   ├── main.css
│   ├── templates.css
│   └── components.css
├── js/                 # JavaScript
│   ├── app.js
│   ├── loader.js
│   └── renderer.js
└── courses/            # 教材データ
    └── math-1-sample.json
ライセンス
MIT License EOF

.gitignore
cat > .gitignore << 'EOF'

macOS
.DS_Store .AppleDouble .LSOverride

Thumbnails
._*

Files that might appear in the root of a volume
.DocumentRevisions-V100 .fseventsd .Spotlight-V100 .TemporaryItems .Trashes .VolumeIcon.icns .com.apple.timemachine.donotpresent

Directories potentially created on remote AFP share
.AppleDB .AppleDesktop Network Trash Folder Temporary Items .apdisk

Editor
.vscode/ .idea/ *.swp *.swo *~

Logs
*.log

Cache
.cache/

---

## 開発者向け情報

開発に参加する方は、[開発者向けガイド](DEVELOPMENT.md) を参照してください。

### デバッグモード

開発時のデバッグを容易にする`DEBUG_MODE`システムが実装されています。

```bash
# DEBUG_MODE を有効化
sed -i.bak 's/const DEBUG_MODE = false;/const DEBUG_MODE = true;/' js/renderer.js

# DEBUG_MODE を無効化
sed -i.bak 's/const DEBUG_MODE = true;/const DEBUG_MODE = false;/' js/renderer.js
詳細は DEVELOPMENT.md を参照してください。


---


---

## 📚 重要なドキュメント

### 🎯 基本コンセプト（最重要）⭐

MathRiseの核心となる設計思想です。**必ず最初に読んでください。**

- **[CORE_CONCEPTS.md](docs/CORE_CONCEPTS.md)** - 基本コンセプトの詳細
  - 3つの設計原則
  - 重要度3段階（低/中/高）
  - 山場の特定方法
  - 絶対に変更してはいけないもの

---

### 🔧 プロンプト関連

教材の自動生成については、以下のドキュメントを参照してください。

#### プロンプトガイド

- **[PROMPT_GUIDE.md](docs/PROMPT_GUIDE.md)** - プロンプト使用ガイド
  - 2段階プロンプトシステムの全体像
  - 第0段階：学習指導要領の読み込み
  - 第1段階：全体マップ生成
  - 第2段階：レッスン生成
  - プロンプトの安定化

#### プロンプトシステムの概要

MathRiseは**2段階プロンプトシステム**で教材を自動生成します：

**第0段階: 学習指導要領の読み込み**
- 学習指導要領を分析
- 山場候補を特定
- 重要度を判定（低/中/高）
- 学習目標と前提知識を抽出

**第1段階: 全体マップ生成**
- レッスン一覧を作成
- 山場を確定
- 学習経路を設計
- 重要度のバランスを調整

**第2段階: レッスン生成**
- 重要度別テンプレートを適用
- step-by-step問題を設計
- 数学的正確性を検証
- 入力の多様性を確保

詳細は [PROMPT_GUIDE.md](docs/PROMPT_GUIDE.md) を参照してください。

---

#### プロンプトルール

- **[PROMPT_RULES.md](docs/PROMPT_RULES.md)** - プロンプトルール
  - 🔴 絶対に変更してはいけないもの
  - 🟡 条件付きで変更できるもの
  - 🟢 自由に変更できるもの
  - 調整パターンと事例

---

#### ユーザー要望管理

- **[USER_REQUESTS.md](docs/USER_REQUESTS.md)** - ユーザー要望管理
  - 要望の記録方法（優先度順）
  - 評価基準（対応可否の判定）
  - 実装状況の追跡

---

### 📐 設計・開発

#### 設計ドキュメント

- **[DESIGN.md](DESIGN.md)** - 設計ドキュメント
  - プロジェクトの全体像
  - アーキテクチャ（ゲーム機とカセットのメタファー）
  - 基本コンセプト（詳細版）
  - プロンプトの安定化
  - データ構造

#### 開発者向けガイド

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - 開発者向けガイド
  - デバッグモードの使い方
  - バックアップの管理
  - コードの修正手順
  - 新しいレッスンの追加
  - トラブルシューティング

#### ロードマップ

- **[ROADMAP.md](ROADMAP.md)** - 開発ロードマップ
  - Phase 1: 基盤構築 ✅
  - Phase 2: アーキテクチャ刷新 🔄
  - Phase 3: プロンプト完成 🔄
  - Phase 4: コンテンツ生成
  - Phase 5: 機能拡張
  - Phase 6: コンテンツ拡充

---

## 🎯 ドキュメントの読む順序

### 初めての方

1. **[CORE_CONCEPTS.md](docs/CORE_CONCEPTS.md)** ⭐最重要
   - MathRiseの核心を理解する

2. **[README.md](README.md)**（このファイル）
   - プロジェクトの概要を把握する

3. **[DESIGN.md](DESIGN.md)**
   - 設計思想とアーキテクチャを理解する

### プロンプトを使う方

1. **[CORE_CONCEPTS.md](docs/CORE_CONCEPTS.md)** ⭐必読
   - 基本コンセプトを完全に理解する

2. **[PROMPT_GUIDE.md](docs/PROMPT_GUIDE.md)**
   - プロンプトの使い方を学ぶ

3. **[PROMPT_RULES.md](docs/PROMPT_RULES.md)**
   - 調整可能な範囲を確認する

### 開発する方

1. **[CORE_CONCEPTS.md](docs/CORE_CONCEPTS.md)** ⭐必読
   - 基本コンセプトを守る

2. **[DEVELOPMENT.md](DEVELOPMENT.md)**
   - 開発手順を確認する

3. **[DESIGN.md](DESIGN.md)**
   - アーキテクチャを理解する

---

## 🔄 最新情報

### 最近の更新（2025-10-06）

- ✅ 基本コンセプトを明確化
- ✅ プロンプトの安定化システムを構築
- ✅ 要望管理システムを導入
- ✅ ドキュメントを整備

### 現在の進捗

- Phase 1: 基盤構築 ✅ 100%
- Phase 2: アーキテクチャ刷新 🔄 75%
- Phase 3: プロンプト完成 🔄 80%

詳細は [ROADMAP.md](ROADMAP.md) を参照してください。

---

**最終更新**: 2025-10-06
**バージョン**: 2.0（基本コンセプトとプロンプト安定化を追加）
