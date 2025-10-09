# 第1段階プロンプト（テスト用）

## 🎯 役割

あなたは高校数学の教材設計の専門家です。
第0段階で抽出された重要トピックを基に、**レッスン一覧（全体マップ）**を作成してください。

---

## 📋 入力

### keyTopics.json
[stage0-output/keyTopics.json の内容を貼り付け]

### 教科書の目次
[textbook-toc-math1-quadratic.md の内容を貼り付け]

---

## 🎯 タスク

以下のJSON形式で、レッスン一覧を出力してください。

---

## 📊 レッスン設計の原則

### 1. トピックとレッスンの関係

1つのトピックは、1つ以上のレッスンに分割される場合があります。

**例**:
- topic-004「平方完成」(推定3レッスン) →
  - lesson-004-1: 平方完成の基本
  - lesson-004-2: 平方完成の練習
  - lesson-004-3: 平方完成の応用

### 2. 山場の前に基礎固め

山場（high重要度）の前には、必ず基礎固めのレッスンを配置します。

**例**:
- lesson-003: グラフの平行移動（medium）
- lesson-004-1: 平方完成の基本（high・山場）← 前に基礎固め

### 3. バランスの調整

**目安**:
- 低:中:高 = 3:4:3
- 山場: 30-40%

**調整方法**:
- 低重要度が少ない場合 → 復習レッスンを追加
- 高重要度が多い場合 → 一部を中重要度に変更

---

## 📤 出力フォーマット

```json
{
  "courseId": "math-1",
  "unitId": "unit-01",
  "unitName": "二次関数",
  "version": "1.0.0",
  "generatedBy": "Claude Sonnet 4",
  "generatedDate": "YYYY-MM-DD",
  
  "metadata": {
    "totalLessons": 23,
    "peakLessons": 8,
    "importanceDistribution": {
      "low": 7,
      "medium": 9,
      "high": 7
    },
    "estimatedHours": 11.5
  },
  
  "lessons": [
    {
      "id": "lesson-001",
      "title": "関数とグラフ",
      "topicId": "topic-001",
      "importance": "low",
      "isPeak": false,
      "estimatedTime": 5,
      "prerequisites": [],
      "tags": ["関数", "基礎"],
      "rationale": "既習事項の確認。基本的な定義のみ。"
    },
    {
      "id": "lesson-004-1",
      "title": "平方完成の基本",
      "topicId": "topic-004",
      "importance": "high",
      "isPeak": true,
      "peakCondition": "条件1: 新しい重要概念の導入、条件3: つまずきやすいポイント",
      "estimatedTime": 20,
      "prerequisites": ["lesson-003"],
      "tags": ["平方完成", "山場"],
      "rationale": "二次関数の核となる概念。定数項の調整を徹底的に学ぶ。"
    }
  ]
}
重要な注意事項
✅ 必ず含めるべきもの
各レッスンに topicId

どのトピックから生成されたか明示
山場レッスンに peakCondition

第0段階の peakCondition をそのまま使用
前提レッスンの明示

prerequisites で学習の順序を明確に
調整のポイント
トピックの分割

estimatedLessons が2以上の場合、複数レッスンに分割
例: topic-004 (3レッスン) → lesson-004-1, lesson-004-2, lesson-004-3
基礎固めの追加

山場の前に、必ず基礎固めレッスンを配置
重要度は medium または low
バランスの調整

低:中:高 = 3:4:3 を目指す
山場は 30-40% を維持
📝 実行方法
別のClaude会話を開く
このプロンプトをコピー
以下のファイルの内容を入力として追加:
stage0-output/keyTopics.json
textbook-toc-math1-quadratic.md
生成されたJSONを確認
stage1-output/math-1-quadratic-map.json に保存
最終更新: 2025-10-06
バージョン: 1.0（テスト用）
