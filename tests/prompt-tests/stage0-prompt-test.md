# 第0段階プロンプト（テスト用）

## 🎯 役割

あなたは高校数学の教材設計の専門家です。
学習指導要領を分析し、**重要トピック（keyTopics）**を抽出してください。

---

## 📋 入力

### 学習指導要領
[curriculum-math1-quadratic.md の内容を貼り付け]

### 教科書の目次
[textbook-toc-math1-quadratic.md の内容を貼り付け]

---

## 🎯 タスク

以下のJSON形式で、重要トピックを出力してください。

---

## 📊 重要度の判定基準

### 低重要度（low）
- **特徴**: 既習事項の確認、基本的な用語・定義
- **学習指導要領の記述**: 「知る」「触れる」
- **例**: 関数とは、グラフとは

### 中重要度（medium）
- **特徴**: 新しい概念の導入、標準的な問題
- **学習指導要領の記述**: 「理解する」「求める」
- **例**: 二次関数のグラフ、平行移動

### 高重要度（high）- 山場候補
- **特徴**: 核心概念、つまずきやすいポイント
- **学習指導要領の記述**: 「活用する」「考察する」、または「配慮事項」「つまずきやすいポイント」に記載
- **例**: 平方完成、判別式、二次不等式の場合分け

---

## ⛰️ 山場の判定（3つの条件）

以下のいずれかに該当すれば「山場候補」と判定：

### 条件1: 新しい重要概念の導入
- 学習指導要領に「新たに」「初めて」の記述
- 中学校で未習の内容
- 数学Ⅰの他の単元で未出

**例**: 平方完成、判別式

### 条件2: 複数の概念の統合
- 学習指導要領に「〜を用いて〜を求める」の記述
- 2つ以上の既習内容の組み合わせ
- 学習指導要領に「関連付けて」の記述

**例**: 平方完成を使った最大値・最小値

### 条件3: つまずきやすいポイント
- 学習指導要領の「配慮事項」「つまずきやすいポイント」に記載
- 符号の扱い、場合分けが必要
- 解説書に「丁寧に指導」の記述

**例**: 定義域が制限されている場合の最大値・最小値、二次不等式の場合分け

---

## 📤 出力フォーマット

```json
{
  "unitId": "unit-01",
  "unitName": "二次関数",
  "version": "1.0.0",
  "generatedBy": "Claude Sonnet 4",
  "generatedDate": "YYYY-MM-DD",
  
  "keyTopics": [
    {
      "topicId": "topic-001",
      "topicName": "関数とグラフ",
      "importance": "low",
      "isPeak": false,
      "rationale": "既習事項の確認。基本的な定義のみ。",
      "curriculumReference": "(ア) 関数とグラフ",
      "estimatedLessons": 1
    },
    {
      "topicId": "topic-002",
      "topicName": "平方完成",
      "importance": "high",
      "isPeak": true,
      "peakCondition": "条件1: 新しい重要概念の導入",
      "rationale": "二次関数の核となる概念。学習指導要領に「丁寧に指導する」と記載。多くの学生がつまずく。",
      "curriculumReference": "(イ) 二次関数のグラフ",
      "prerequisiteTopics": ["topic-001"],
      "estimatedLessons": 2
    },
    {
      "topicId": "topic-003",
      "topicName": "最大値・最小値（基本）",
      "importance": "medium",
      "isPeak": false,
      "rationale": "概念の理解が必要。標準的な問題を解く。",
      "curriculumReference": "(ウ) 二次関数の最大・最小",
      "prerequisiteTopics": ["topic-002"],
      "estimatedLessons": 1
    },
    {
      "topicId": "topic-004",
      "topicName": "最大値・最小値（定義域制限）",
      "importance": "high",
      "isPeak": true,
      "peakCondition": "条件3: つまずきやすいポイント",
      "rationale": "学習指導要領の「つまずきやすいポイント」に記載。場合分けが必要。",
      "curriculumReference": "(ウ) 二次関数の最大・最小",
      "prerequisiteTopics": ["topic-003"],
      "estimatedLessons": 2
    }
  ],
  
  "metadata": {
    "totalTopics": 10,
    "peakTopics": 4,
    "importanceDistribution": {
      "low": 3,
      "medium": 3,
      "high": 4
    },
    "estimatedTotalLessons": 15
  }
}
重要な注意事項
✅ 必ず含めるべきもの
各トピックに rationale（判定理由）

なぜその重要度なのか
なぜ山場なのか（該当する場合）
山場候補には peakCondition（条件1/2/3のいずれか）

どの条件に該当するか明示
prerequisiteTopics（前提トピック）

学習の順序を明確に
❌ 生成してはいけないもの
レッスンの詳細な内容

この段階では、トピックの抽出のみ
具体的な問題や例題

第2段階で生成するため
✅ 出力例
Copy{
  "unitId": "unit-01",
  "unitName": "二次関数",
  "version": "1.0.0",
  "generatedBy": "Claude Sonnet 4",
  "generatedDate": "2025-10-06",
  
  "keyTopics": [
    {
      "topicId": "topic-001",
      "topicName": "関数とグラフ",
      "importance": "low",
      "isPeak": false,
      "rationale": "既習事項の確認。基本的な定義のみ。学習指導要領に「関数の概念を理解する」とあるが、中学校で既習。",
      "curriculumReference": "(ア) 関数とグラフ",
      "estimatedLessons": 1
    },
    {
      "topicId": "topic-002",
      "topicName": "y = ax² のグラフ",
      "importance": "low",
      "isPeak": false,
      "rationale": "基本的なグラフの形状の確認。中学校で既習。",
      "curriculumReference": "(イ) 二次関数のグラフ",
      "prerequisiteTopics": ["topic-001"],
      "estimatedLessons": 1
    },
    {
      "topicId": "topic-003",
      "topicName": "グラフの平行移動",
      "importance": "medium",
      "isPeak": false,
      "rationale": "y = a(x - p)² + q の形の理解が必要。新しい概念の導入。",
      "curriculumReference": "(イ) 二次関数のグラフ",
      "prerequisiteTopics": ["topic-002"],
      "estimatedLessons": 2
    },
    {
      "topicId": "topic-004",
      "topicName": "平方完成",
      "importance": "high",
      "isPeak": true,
      "peakCondition": "条件1: 新しい重要概念の導入",
      "rationale": "二次関数の核となる概念。学習指導要領に「丁寧に指導する」と記載。y = ax² + bx + c を y = a(x - p)² + q に変形する技術。多くの学生がつまずく。後続の学習（最大値・最小値、グラフの頂点）で頻繁に使用。",
      "curriculumReference": "(イ) 二次関数のグラフ",
      "prerequisiteTopics": ["topic-003"],
      "estimatedLessons": 2
    },
    {
      "topicId": "topic-005",
      "topicName": "最大値・最小値（基本）",
      "importance": "medium",
      "isPeak": false,
      "rationale": "平方完成を使って最大値・最小値を求める。概念の理解が必要。",
      "curriculumReference": "(ウ) 二次関数の最大・最小",
      "prerequisiteTopics": ["topic-004"],
      "estimatedLessons": 1
    },
    {
      "topicId": "topic-006",
      "topicName": "最大値・最小値（定義域制限）",
      "importance": "high",
      "isPeak": true,
      "peakCondition": "条件3: つまずきやすいポイント",
      "rationale": "学習指導要領の「つまずきやすいポイント」に「定義域が制限されている場合の最大値・最小値」と記載。場合分けが必要で、多くの学生がつまずく。",
      "curriculumReference": "(ウ) 二次関数の最大・最小",
      "prerequisiteTopics": ["topic-005"],
      "estimatedLessons": 2
    },
    {
      "topicId": "topic-007",
      "topicName": "二次方程式の解",
      "importance": "medium",
      "isPeak": false,
      "rationale": "二次方程式の解と二次関数のグラフの関係を理解する。",
      "curriculumReference": "(ア) 二次方程式",
      "prerequisiteTopics": ["topic-004"],
      "estimatedLessons": 1
    },
    {
      "topicId": "topic-008",
      "topicName": "判別式",
      "importance": "high",
      "isPeak": true,
      "peakCondition": "条件1: 新しい重要概念の導入",
      "rationale": "判別式 D = b² - 4ac の導入。学習指導要領に「その意味を十分に理解させる」と記載。解の個数とグラフの関係を理解する重要な概念。",
      "curriculumReference": "(ア) 二次方程式",
      "prerequisiteTopics": ["topic-007"],
      "estimatedLessons": 2
    },
    {
      "topicId": "topic-009",
      "topicName": "二次不等式の解法",
      "importance": "medium",
      "isPeak": false,
      "rationale": "二次不等式の解と二次関数のグラフの関係を理解する。",
      "curriculumReference": "(イ) 二次不等式",
      "prerequisiteTopics": ["topic-008"],
      "estimatedLessons": 1
    },
    {
      "topicId": "topic-010",
      "topicName": "二次不等式の場合分け",
      "importance": "high",
      "isPeak": true,
      "peakCondition": "条件3: つまずきやすいポイント",
      "rationale": "学習指導要領の「つまずきやすいポイント」に「二次不等式の解の場合分け」と記載。判別式の符号による場合分けが必要。",
      "curriculumReference": "(イ) 二次不等式",
      "prerequisiteTopics": ["topic-009"],
      "estimatedLessons": 2
    }
  ],
  
  "metadata": {
    "totalTopics": 10,
    "peakTopics": 4,
    "importanceDistribution": {
      "low": 2,
      "medium": 4,
      "high": 4
    },
    "estimatedTotalLessons": 15
  }
}
実行方法
別のClaude会話を開く

このプロンプトをコピー

以下のファイルの内容を入力として追加:

curriculum-math1-quadratic.md
textbook-toc-math1-quadratic.md
生成されたJSONを確認

品質チェック
stage0-output/keyTopics.json に保存

最終更新: 2025-10-06 バージョン: 1.0（テスト用）
