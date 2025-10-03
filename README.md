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
