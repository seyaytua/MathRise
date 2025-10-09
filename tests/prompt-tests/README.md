# プロンプトテスト

このディレクトリには、MathRiseのプロンプトをテストするためのファイルが含まれています。

## 📁 ディレクトリ構造

tests/prompt-tests/ ├── README.md # このファイル ├── curriculum-math1-quadratic.md # 学習指導要領（数学Ⅰ・二次関数） ├── textbook-toc-math1-quadratic.md # 教科書の目次 ├── run-stage0-test.sh # 第0段階テスト実行スクリプト ├── stage0-output/ # 第0段階の出力 │ └── keyTopics.json # 生成される重要トピックJSON ├── stage1-output/ # 第1段階の出力 │ └── math-1-quadratic-map.json # 生成される全体マップJSON └── stage2-output/ # 第2段階の出力 └── lesson-XXX.json # 生成されるレッスンJSON


## 🧪 テストの実行方法

### 第0段階: 学習指導要領の読み込み

**目的**: 学習指導要領から重要トピックを抽出し、山場を特定する

**入力**:
- `curriculum-math1-quadratic.md`
- `textbook-toc-math1-quadratic.md`

**プロンプト**:
- `docs/PROMPT_GUIDE.md` の「第0段階プロンプト」を使用

**出力**:
- `stage0-output/keyTopics.json`

**実行方法**:
1. 別のClaude会話を開く
2. `docs/PROMPT_GUIDE.md` の第0段階プロンプトをコピー
3. 以下のファイルの内容を入力として追加:
   - `curriculum-math1-quadratic.md`
   - `textbook-toc-math1-quadratic.md`
4. 生成されたJSONを `stage0-output/keyTopics.json` に保存

**確認項目**:
- [ ] 山場の判定が適切か
- [ ] 重要度の判定が適切か
- [ ] 判定理由が記載されているか

---

### 第1段階: 全体マップ生成

**目的**: レッスン一覧を作成し、学習経路を設計する

**入力**:
- `stage0-output/keyTopics.json`
- `textbook-toc-math1-quadratic.md`

**プロンプト**:
- `docs/PROMPT_GUIDE.md` の「第1段階プロンプト」を使用

**出力**:
- `stage1-output/math-1-quadratic-map.json`

**確認項目**:
- [ ] レッスン一覧が適切か
- [ ] 山場が確定されているか
- [ ] バランスが適切か（低:中:高 = 3:4:3）

---

### 第2段階: レッスン生成

**目的**: 個別のレッスンを詳細に生成する

**入力**:
- `stage1-output/math-1-quadratic-map.json`
- 教科書の具体的な例題

**プロンプト**:
- `docs/PROMPT_GUIDE.md` の「第2段階プロンプト」を使用

**出力**:
- `stage2-output/lesson-XXX.json`

**確認項目**:
- [ ] 数学的正確性
- [ ] 入力の多様性
- [ ] 表示の見やすさ

---

## 📊 テスト結果の記録

各テストの結果は、以下のフォーマットで記録してください:

```markdown
## テスト実行記録

### 日時: YYYY-MM-DD HH:MM

### 第0段階
- **入力**: curriculum-math1-quadratic.md, textbook-toc-math1-quadratic.md
- **出力**: stage0-output/keyTopics.json
- **結果**: ✅ 成功 / ⚠️ 警告あり / ❌ 失敗
- **問題点**:
  - [問題点1]
  - [問題点2]
- **改善案**:
  - [改善案1]
  - [改善案2]

### 第1段階
- **入力**: stage0-output/keyTopics.json
- **出力**: stage1-output/math-1-quadratic-map.json
- **結果**: ✅ 成功 / ⚠️ 警告あり / ❌ 失敗
- **問題点**:
  - [問題点1]
- **改善案**:
  - [改善案1]

### 第2段階
- **入力**: stage1-output/math-1-quadratic-map.json
- **出力**: stage2-output/lesson-006.json
- **結果**: ✅ 成功 / ⚠️ 警告あり / ❌ 失敗
- **問題点**:
  - [問題点1]
- **改善案**:
  - [改善案1]
🔄 次のステップ
✅ テスト環境の構築（完了）
⏭️ 第0段階プロンプトの実行
⏭️ 第1段階プロンプトの実行
⏭️ 第2段階プロンプトの実行
⏭️ 結果の分析と改善
最終更新: 2025-10-06 作成者: Claude (Anthropic) 
