#!/bin/bash

echo "🔍 CSS構造検証スクリプト"
echo "=========================="
echo ""

# カラーコード
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 必須ファイルリスト
declare -a required_files=(
    "css/base/reset.css"
    "css/base/variables.css"
    "css/base/typography.css"
    "css/layout/header.css"
    "css/layout/footer.css"
    "css/layout/sidebar.css"
    "css/layout/container.css"
    "css/components/buttons.css"
    "css/components/cards.css"
    "css/components/modals.css"
    "css/components/forms.css"
    "css/components/navigation.css"
    "css/components/badges.css"
    "css/components/progress-bars.css"
    "css/components/notifications.css"
    "css/features/lessons.css"
    "css/features/problems.css"
    "css/features/math-layout.css"
    "css/features/cartridge.css"
    "css/features/achievements.css"
    "css/pages/home.css"
    "css/pages/learning.css"
    "css/pages/dashboard.css"
    "css/utilities/animations.css"
    "css/utilities/spacing.css"
    "css/utilities/helpers.css"
    "css/themes.css"
)

# ファイル存在チェック
echo "📂 ファイル存在チェック"
echo "----------------------"
missing_count=0
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file ${RED}(見つかりません)${NC}"
        ((missing_count++))
    fi
done
echo ""

# 結果サマリー
total_files=${#required_files[@]}
found_files=$((total_files - missing_count))

echo "📊 結果サマリー"
echo "-------------"
echo "総ファイル数: $total_files"
echo -e "存在するファイル: ${GREEN}$found_files${NC}"
echo -e "不足ファイル: ${RED}$missing_count${NC}"
echo ""

# HTMLファイルチェック
echo "📄 HTMLファイルチェック"
echo "--------------------"
if [ -f "index.html" ]; then
    echo -e "${GREEN}✓${NC} index.html"
else
    echo -e "${RED}✗${NC} index.html"
fi

if [ -f "home.html" ]; then
    echo -e "${GREEN}✓${NC} home.html"
else
    echo -e "${RED}✗${NC} home.html"
fi
echo ""

# バックアップファイルチェック
echo "💾 バックアップファイルチェック"
echo "----------------------------"
if [ -d "css_backup" ]; then
    backup_count=$(ls -1 css_backup/*.css 2>/dev/null | wc -l)
    echo -e "${GREEN}✓${NC} css_backup/ ディレクトリ存在"
    echo "  バックアップファイル数: $backup_count"
else
    echo -e "${YELLOW}⚠${NC} css_backup/ ディレクトリなし"
fi
echo ""

# 最終判定
echo "🎯 最終判定"
echo "----------"
if [ $missing_count -eq 0 ]; then
    echo -e "${GREEN}✅ すべてのファイルが正常に配置されています！${NC}"
    exit 0
else
    echo -e "${RED}❌ $missing_count 個のファイルが不足しています${NC}"
    exit 1
fi
