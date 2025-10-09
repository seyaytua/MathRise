# 第2段階プロンプト（統合版）

このプロンプトは、個別レッスンを生成します。

## 使い方

1. `output/<単元名>/stage1/lesson-map.json` を開く
2. 生成したいレッスンの情報を抽出
3. このプロンプトの [レッスン情報] 部分に挿入
4. 教科書の該当ページを準備
5. このプロンプトを実行
6. 生成されたJSONを `output/<単元名>/stage2/lesson-XXX.json` に保存

---

# 第2段階プロンプト（テスト用）

## 役割
あなたは高校数学の教材作成の専門家です。
「行間を埋める」学習を実現する、詳細なレッスンを作成してください。

## 入力情報

**レッスンID**: lesson-006  
**タイトル**: 平方完成の基本  
**重要度**: high  
**推定時間**: 20分  
**前提知識**: lesson-001（二次関数とは）、lesson-002（二次関数のグラフ）  

**トピック情報**（第0段階の出力より）:
```json
{
  "topicId": "topic-002",
  "topicName": "平方完成",
  "importance": "high",
  "estimatedLessons": 3,
  "isPeak": true,
  "peakCondition": ["condition1", "condition3"],
  "rationale": "二次関数の核となる変形技法。「なぜそうなるか」の深い理解が必要。多くの学生がつまずくポイント。",
  "prerequisiteTopics": ["topic-001"]
}
教科書の該当箇所:

平方完成
二次関数 
y
=
a
x
2
+
b
x
+
c
y=ax 
2
 +bx+c を、
y
=
a
(
x
−
p
)
2
+
q
y=a(x−p) 
2
 +q の形に変形することを平方完成という。

例題1: 
x
2
+
6
x
+
5
x 
2
 +6x+5 を平方完成せよ。

解答:

x
2
+
6
x
+
5
=
(
x
+
3
)
2
−
4
x 
2
 +6x+5=(x+3) 
2
 −4
例題2: 
x
2
−
4
x
+
1
x 
2
 −4x+1 を平方完成せよ。

解答:

x
2
−
4
x
+
1
=
(
x
−
2
)
2
−
3
x 
2
 −4x+1=(x−2) 
2
 −3
例題3: 
2
x
2
+
8
x
+
3
2x 
2
 +8x+3 を平方完成せよ。

解答:

2
x
2
+
8
x
+
3
=
2
(
x
+
2
)
2
−
5
2x 
2
 +8x+3=2(x+2) 
2
 −5
生成指示
以下の制約を必ず守って、レッスンJSONを生成してください。

⚠️ 必須制約
1. 問いと答えの一致
問いで「何を」「いくつ」と聞いたら、答えは「数値」または「式の一部」
問いで「式を完成させよ」と聞いたら、答えは「完全な式」
answerTypeを適切に設定（number/math/text）
良い例:

Copy{
  "stepId": "s1",
  "prompt": "6の半分はいくつですか？",
  "answer": "3",
  "answerType": "number"
}
悪い例:

Copy{
  "stepId": "s1",
  "prompt": "何を足して引けばよいですか？",
  "answer": "(x+3)^2-4",
  "answerType": "math"
}
2. 説明の長さ
各段落は3-4文以内
全体で600文字以内
重要なポイントのみに絞る
3. 数式の記法
文中の数式: $...$（インライン数式）
独立行の数式: $$...$$（ブロック数式）
良い例:

Copy二次関数 $y = ax^2 + bx + c$ を平方完成すると、頂点の座標が一目でわかります。


$$y = a(x - p)^2 + q$$

この形では、頂点が $(p, q)$ であることが明確です。
悪い例:

Copy二次関数 $$y = ax^2 + bx + c$$ を平方完成すると、頂点の座標が一目でわかります。


$$y = a(x - p)^2 + q$$

この形では、頂点が $$(p, q)$$ であることが明確です。
4. step-by-step問題
各ステップは1つの明確な問い
ヒントは2-3個
段階的に詳しく
高重要度テンプレート（山場）
Copy{
  "id": "lesson-006",
  "title": "平方完成の基本 ⭐山場⭐",
  "importance": "high",
  "estimatedTime": 20,
  "prerequisites": ["lesson-001", "lesson-002"],
  "tags": ["二次関数", "平方完成", "山場"],
  
  "content": {
    "introduction": "なぜこの概念が重要か（2-3段落）",
    "prerequisiteCheck": "前提知識の確認（1-2段落）",
    "explanation": "<p>詳細な説明（6-10段落）</p>",
    "keyConcepts": ["核心概念1", "核心概念2"],
    "visualAids": [
      {
        "type": "image",
        "url": "path/to/image.png",
        "caption": "説明"
      }
    ]
  },
  
  "problems": [
    {
      "problemId": "p006",
      "type": "step-by-step",
      "question": "$$x^2 + 6x + 5$$ を平方完成せよ",
      
      "steps": [
        {
          "stepId": "s1",
          "prompt": "ステップ1の問い",
          "answer": "答え1",
          "answerType": "number",
          "hints": [
            "ヒント1",
            "ヒント2"
          ],
          "feedback": {
            "correct": "正解時のメッセージ",
            "incorrect": "不正解時のメッセージ"
          }
        }
      ],
      
      "commonMistakes": [
        {
          "pattern": "間違った答えのパターン",
          "explanation": "なぜその間違いをするのか、正しい考え方は何か"
        }
      ]
    }
  ]
}
出力形式
上記のテンプレートに従って、lesson-006の完全なJSONを生成してください。

重要:

finalAnswer フィールドは生成しないでください（step-by-step問題では不要）
すべての数式は $ または $$ で囲んでください
説明は600文字以内に収めてください
確認事項
生成後、以下を確認してください：

 問いと答えの型が一致しているか
 説明の長さは600文字以内か
 数式の記法は正しいか（文中は$、独立行は$$）
 step-by-step問題のステップ数は3-5か
 各ステップにヒントが2-3個あるか
 commonMistakes が2-3個あるか

# 第2段階プロンプト（テスト用）

## 役割
あなたは高校数学の教材作成の専門家です。
「行間を埋める」学習を実現する、詳細なレッスンを作成してください。

## 入力情報

**レッスンID**: lesson-006  
**タイトル**: 平方完成の基本  
**重要度**: high  
**推定時間**: 20分  
**前提知識**: lesson-001（二次関数とは）、lesson-002（二次関数のグラフ）  

**トピック情報**（第0段階の出力より）:
```json
{
  "topicId": "topic-002",
  "topicName": "平方完成",
  "importance": "high",
  "estimatedLessons": 3,
  "isPeak": true,
  "peakCondition": ["condition1", "condition3"],
  "rationale": "二次関数の核となる変形技法。「なぜそうなるか」の深い理解が必要。多くの学生がつまずくポイント。",
  "prerequisiteTopics": ["topic-001"]
}
教科書の該当箇所:

平方完成
二次関数 
y
=
a
x
2
+
b
x
+
c
y=ax 
2
 +bx+c を、
y
=
a
(
x
−
p
)
2
+
q
y=a(x−p) 
2
 +q の形に変形することを平方完成という。

例題1: 
x
2
+
6
x
+
5
x 
2
 +6x+5 を平方完成せよ。

解答:

x
2
+
6
x
+
5
=
(
x
+
3
)
2
−
4
x 
2
 +6x+5=(x+3) 
2
 −4
例題2: 
x
2
−
4
x
+
1
x 
2
 −4x+1 を平方完成せよ。

解答:

x
2
−
4
x
+
1
=
(
x
−
2
)
2
−
3
x 
2
 −4x+1=(x−2) 
2
 −3
例題3: 
2
x
2
+
8
x
+
3
2x 
2
 +8x+3 を平方完成せよ。

解答:

2
x
2
+
8
x
+
3
=
2
(
x
+
2
)
2
−
5
2x 
2
 +8x+3=2(x+2) 
2
 −5
生成指示
以下の制約を必ず守って、レッスンJSONを生成してください。

⚠️ 必須制約
1. 問いと答えの一致
問いで「何を」「いくつ」と聞いたら、答えは「数値」または「式の一部」
問いで「式を完成させよ」と聞いたら、答えは「完全な式」
answerTypeを適切に設定（number/math/text）
良い例:

Copy{
  "stepId": "s1",
  "prompt": "6の半分はいくつですか？",
  "answer": "3",
  "answerType": "number"
}
悪い例:

Copy{
  "stepId": "s1",
  "prompt": "何を足して引けばよいですか？",
  "answer": "(x+3)^2-4",
  "answerType": "math"
}
2. 説明の長さ
各段落は3-4文以内
全体で600文字以内
重要なポイントのみに絞る
3. 数式の記法
文中の数式: $...$（インライン数式）
独立行の数式: $$...$$（ブロック数式）
良い例:

Copy二次関数 $y = ax^2 + bx + c$ を平方完成すると、頂点の座標が一目でわかります。


$$y = a(x - p)^2 + q$$

この形では、頂点が $(p, q)$ であることが明確です。
悪い例:

Copy二次関数 $$y = ax^2 + bx + c$$ を平方完成すると、頂点の座標が一目でわかります。


$$y = a(x - p)^2 + q$$

この形では、頂点が $$(p, q)$$ であることが明確です。
4. step-by-step問題
各ステップは1つの明確な問い
ヒントは2-3個
段階的に詳しく
高重要度テンプレート（山場）
Copy{
  "id": "lesson-006",
  "title": "平方完成の基本 ⭐山場⭐",
  "importance": "high",
  "estimatedTime": 20,
  "prerequisites": ["lesson-001", "lesson-002"],
  "tags": ["二次関数", "平方完成", "山場"],
  
  "content": {
    "introduction": "なぜこの概念が重要か（2-3段落）",
    "prerequisiteCheck": "前提知識の確認（1-2段落）",
    "explanation": "<p>詳細な説明（6-10段落）</p>",
    "keyConcepts": ["核心概念1", "核心概念2"],
    "visualAids": [
      {
        "type": "image",
        "url": "path/to/image.png",
        "caption": "説明"
      }
    ]
  },
  
  "problems": [
    {
      "problemId": "p006",
      "type": "step-by-step",
      "question": "$$x^2 + 6x + 5$$ を平方完成せよ",
      
      "steps": [
        {
          "stepId": "s1",
          "prompt": "ステップ1の問い",
          "answer": "答え1",
          "answerType": "number",
          "hints": [
            "ヒント1",
            "ヒント2"
          ],
          "feedback": {
            "correct": "正解時のメッセージ",
            "incorrect": "不正解時のメッセージ"
          }
        }
      ],
      
      "commonMistakes": [
        {
          "pattern": "間違った答えのパターン",
          "explanation": "なぜその間違いをするのか、正しい考え方は何か"
        }
      ]
    }
  ]
}
出力形式
上記のテンプレートに従って、lesson-006の完全なJSONを生成してください。

重要:

finalAnswer フィールドは生成しないでください（step-by-step問題では不要）
すべての数式は $ または $$ で囲んでください
説明は600文字以内に収めてください
確認事項
生成後、以下を確認してください：

 問いと答えの型が一致しているか
 説明の長さは600文字以内か
 数式の記法は正しいか（文中は$、独立行は$$）
 step-by-step問題のステップ数は3-5か
 各ステップにヒントが2-3個あるか
 commonMistakes が2-3個あるか
