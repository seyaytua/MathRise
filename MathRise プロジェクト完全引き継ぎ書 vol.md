MathRise プロジェクト完全引き継ぎ書　　vol.1
📋 プロジェクト概要
プロジェクト名
MathRise - 数学学習Webアプリケーション

コンセプト
Progateスタイルの「行間を埋める」能動的学習を通じて、高校数学（数学Ⅰ〜Ⅲ、A〜C）を深く理解できる学習プラットフォーム

技術スタック
フロントエンド: HTML5, CSS3, Vanilla JavaScript (ES6+)
数式表示: MathJax 3.x
データ管理: localStorage
ホスティング: GitHub Pages
リポジトリ: https://github.com/seyaytua/MathRise
🎯 現在の状態
Phase 1: 基盤構築 ✅ 完了
基本UIの実装
レッスン切り替え機能
進捗管理システム
localStorageによる永続化
Phase 2: アーキテクチャ刷新 ✅ 完了
エンジン化されたアプリ本体
重要度別テンプレートシステム（低/中/高）
進捗管理システムの拡張
統計ダッシュボード
数式入力ツールバー
リアルタイム数式プレビュー
📁 プロジェクト構造
App_progate/
├── index.html              # エントリーポイント
├── README.md               # プロジェクト説明
├── ROADMAP.md             # 開発ロードマップ
├── DESIGN.md              # 設計ドキュメント
│
├── css/
│   ├── main.css           # 基本スタイル、レイアウト
│   ├── templates.css      # 重要度別テンプレート
│   ├── components.css     # 問題、ボタン、数式入力等
│   └── dashboard.css      # 統計ダッシュボード
│
├── js/
│   ├── app.js             # メインアプリケーション
│   ├── loader.js          # JSONデータローダー
│   ├── renderer.js        # レッスン表示エンジン
│   ├── progress.js        # 進捗管理システム
│   └── dashboard.js       # 統計ダッシュボード
│
└── courses/
    └── math-1-sample.json # サンプル教材データ
🔧 実装済み機能
1. コア機能
✅ JSONベースの教材読み込み
✅ 重要度別レッスン表示（🟢低 / 🟡中 / 🔴高）
✅ MathJax数式表示（左詰め）
✅ 数式入力ツールバー（x², x³, √, ±, ÷, ×, ( ), π）
✅ リアルタイム数式プレビュー
✅ 答え合わせ機能
✅ ヒント表示
✅ レッスン完了判定
✅ 前へ/次へナビゲーション
✅ キーボードショートカット（←/→）
2. 進捗管理
✅ localStorageによる永続化
✅ レッスン完了マーク（✓）
✅ 問題ごとの試行回数・正答率記録
✅ コース全体の進捗率表示
✅ 最終学習日・学習開始日記録
3. 統計ダッシュボード
✅ 完了レッスン数
✅ 正答率
✅ 解答数
✅ 達成度
✅ レッスン別進捗グラフ
✅ 達成バッジシステム（8種類）
✅ レッスン別詳細テーブル
✅ データエクスポート/インポート
✅ 進捗リセット機能
4. UI/UX
✅ レスポンシブデザイン
✅ サイドバーナビゲーション
✅ レッスン完了通知アニメーション
✅ 問題完了時のビジュアルフィードバック
✅ スムーズなページ遷移
🐛 既知の問題と修正履歴
修正済み
✅ 進捗バーが更新されない → レッスン完了判定ロジック実装
✅ レイアウト崩れ（読み込み時） → Flexbox設定の安定化
✅ 数式とテキストの高さがズレる → vertical-align調整
✅ 数式がセンタリングされる → 左詰めに変更
残存する問題
⚠️ 「⭐ 山場 ⭐」のデザインがダサい → 要改善
📊 データ構造
コースJSON構造
Copy{
  "courseId": "math-1-sample",
  "courseName": "数学Ⅰ（サンプル）",
  "version": "1.0.0",
  "units": [
    {
      "unitId": "unit-sample",
      "unitName": "二次関数の基礎",
      "importance": "high",
      "lessons": [
        {
          "id": "lesson-001",
          "title": "関数とは",
          "importance": "low",  // low, medium, high
          "content": {
            "explanation": "<p>HTMLとLaTeX数式</p>",
            "keyConcepts": ["概念1", "概念2"]
          },
          "problems": [
            {
              "problemId": "p001",
              "type": "simple",
              "question": "$f(x) = 2x + 1$ のとき...",
              "answer": "7",
              "hints": ["ヒント1"],
              "feedback": {
                "correct": "正解メッセージ",
                "incorrect": "不正解メッセージ"
              }
            }
          ]
        }
      ]
    }
  ]
}
進捗データ構造（localStorage）
Copy{
  "version": "1.0.0",
  "lastAccessed": "ISO日時",
  "courses": {
    "math-1-sample": {
      "totalLessons": 3,
      "completedLessons": ["lesson-001"],
      "currentLesson": 0,
      "lessonProgress": {
        "lesson-001": {
          "problems": {
            "p001": {
              "attempts": 2,
              "correctAttempts": 1,
              "firstCorrect": "ISO日時",
              "lastAttempt": "ISO日時"
            }
          },
          "attempts": 2,
          "correctAnswers": 1
        }
      },
      "startedAt": "ISO日時",
      "lastStudied": "ISO日時"
    }
  }
}
🎨 スタイリング規則
カラーパレット
Copy--primary: #2196F3;      /* 青 - メインカラー */
--secondary: #FF9800;    /* オレンジ - アクセント */
--success: #4CAF50;      /* 緑 - 成功・低重要度 */
--error: #F44336;        /* 赤 - エラー・高重要度 */
--warning: #FFC107;      /* 黄 - 警告・中重要度 */
--bg-main: #F5F5F5;      /* 背景 */
--bg-white: #FFFFFF;     /* 白背景 */
--text-dark: #212121;    /* 濃いテキスト */
--text-light: #757575;   /* 薄いテキスト */
--border: #E0E0E0;       /* ボーダー */
重要度別スタイル
低重要度（🟢）: 緑ボーダー、シンプル
中重要度（🟡）: 黄ボーダー、背景色あり
高重要度（🔴）: 赤ボーダー、「⭐ 山場 ⭐」表示
数式表示ルール
インライン数式: $...$ → 左詰め、vertical-align: middle
ディスプレイ数式: $$...$$ → 左詰め、2remインデント
プレビュー: リアルタイムLaTeX変換
🚀 次の課題（Phase 3以降）
優先度：高 🔥
「⭐ 山場 ⭐」デザイン改善

現在: テキストのみ、ダサい
改善案:
アイコンとグラデーション背景
アニメーション効果
より目立つが洗練されたデザイン
プロンプトエンジニアリング（Phase 3）

第1段階プロンプト: 指導要領から全体マップ生成
第2段階プロンプト: 重要度別教材自動生成
「行間を埋める」問い生成ロジック
コンテンツ生成（Phase 4）

数学Ⅰ完全版の作成
プロンプトを使った自動生成
優先度：中 ⚡
UI/UX改善

ダークモード
フォントサイズ調整
アクセシビリティ対応
アニメーション強化
機能拡張

検索機能
ブックマーク
復習モード（間違えた問題）
学習時間トラッキング
段階的問題（step-by-step）の実装

現在: データ構造のみ定義済み
必要: レンダラーの実装
優先度：低 📝
他科目への展開

数学A, Ⅱ, B, Ⅲ, C
物理、化学など
コミュニティ機能

アカウントシステム
クラウド同期
教師用機能
💻 開発環境セットアップ
必要なツール
macOS (M2 Apple Silicon)
Python 3（ローカルサーバー用）
Git
テキストエディタ（VS Code推奨）
モダンブラウザ（Chrome/Safari）
ローカル起動手順
Copy# プロジェクトディレクトリに移動
cd ~/App_progate

# ローカルサーバー起動
python3 -m http.server 8000

# ブラウザで開く
open http://localhost:8000
Git操作
Copy# 変更を確認
git status

# ステージング
git add .

# コミット
git commit -m "feat: 新機能の説明"

# プッシュ
git push origin main
GitHub Pages URL
https://seyaytua.github.io/MathRise/

🔍 デバッグ方法
よくある問題と解決法
1. MathJaxが表示されない

Copy// ブラウザコンソールで確認
console.log(window.MathJax);

// 再レンダリング
MathJax.typesetPromise([document.body]);
2. 進捗が保存されない

Copy// localStorageを確認
console.log(localStorage.getItem('mathrise_progress'));

// 手動保存
app.progress.save();
3. レイアウト崩れ

キャッシュクリア: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Win)
開発者ツールでFlexbox確認
4. JSONエラー

Copy# JSON検証
cat courses/math-1-sample.json | python3 -m json.tool
📝 コーディング規約
JavaScript
ES6+ モジュール構文使用
クラスベース設計
async/await for 非同期処理
コメントは日本語OK
CSS
BEM風の命名（緩め）
CSS変数で色管理
モバイルファーストではなくデスクトップファースト
HTML
セマンティックHTML
ARIA属性でアクセシビリティ対応
🎯 具体的な次のタスク
タスク1: 「山場」デザイン改善（1-2時間）
現在のコード（templates.css）:

Copy.lesson-high::before {
  content: '⭐ 山場 ⭐';
  display: block;
  text-align: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--error);
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}
改善案A: グラデーション背景

Copy.lesson-high::before {
  content: '🔥 重要な山場です 🔥';
  display: block;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  color: white;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #F44336 0%, #E91E63 100%);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}
改善案B: バッジスタイル

Copy.lesson-high::before {
  content: '重要';
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: var(--error);
  color: white;
  font-weight: bold;
  border-radius: 20px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
改善案C: アイコン + テキスト

Copy.lesson-high .peak-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(to right, #FF6B6B, #FF8E53);
  border-radius: 8px;
  color: white;
  font-weight: bold;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.lesson-high .peak-badge::before {
  content: '🎯';
  font-size: 1.5rem;
}
実装手順:

css/templates.css を開く
.lesson-high::before を修正
好みのデザインを選択（または組み合わせ）
ブラウザで確認
調整・微調整
タスク2: 段階的問題（step-by-step）の実装（2-3時間）
現在の状態:

データ構造: ✅ 定義済み（math-1-sample.json の lesson-003）
レンダラー: ❌ 未実装
実装すべきこと:

1. renderer.js に追加:

CopycreateStepByStepProblem(problem, index, lessonId) {
  const container = document.createElement('div');
  container.className = 'step-by-step-container';
  
  // 問題文
  const question = document.createElement('div');
  question.className = 'problem-question';
  question.innerHTML = `<strong>段階的問題 ${index + 1}:</strong> ${problem.question}`;
  container.appendChild(question);
  
  // 各ステップ
  problem.steps.forEach((step, stepIndex) => {
    const stepElement = this.createStep(step, stepIndex, problem, lessonId);
    container.appendChild(stepElement);
  });
  
  return container;
}

createStep(step, stepIndex, problem, lessonId) {
  const stepDiv = document.createElement('div');
  stepDiv.className = 'step';
  stepDiv.id = `step-${stepIndex}`;
  
  // ステップヘッダー
  const header = document.createElement('div');
  header.className = 'step-header';
  header.innerHTML = `
    <div class="step-number">${stepIndex + 1}</div>
    <div class="step-prompt">${step.prompt}</div>
  `;
  stepDiv.appendChild(header);
  
  // 入力欄
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'problem-input';
  input.id = `step-answer-${stepIndex}`;
  stepDiv.appendChild(input);
  
  // ボタン
  const checkBtn = document.createElement('button');
  checkBtn.className = 'btn btn-primary';
  checkBtn.textContent = '確認';
  checkBtn.onclick = () => this.checkStepAnswer(step, input.value, stepDiv, stepIndex, problem);
  stepDiv.appendChild(checkBtn);
  
  return stepDiv;
}

checkStepAnswer(step, userAnswer, stepDiv, stepIndex, problem) {
  const normalized = this.normalizeAnswer(userAnswer);
  const correctAnswer = this.normalizeAnswer(step.answer);
  const isCorrect = normalized === correctAnswer;
  
  if (isCorrect) {
    stepDiv.classList.add('completed');
    
    // 次のステップをアンロック
    const nextStep = document.getElementById(`step-${stepIndex + 1}`);
    if (nextStep) {
      nextStep.classList.remove('locked');
    }
    
    // 全ステップ完了チェック
    this.checkAllStepsCompleted(problem);
  }
  
  // フィードバック表示
  this.showStepFeedback(isCorrect, stepDiv, step);
}
2. CSS追加（components.css）:

Copy.step-by-step-container {
  margin: 2rem 0;
}

.step {
  background: white;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 2px solid var(--border);
  transition: all 0.3s;
}

.step.locked {
  opacity: 0.5;
  pointer-events: none;
}

.step.completed {
  border-color: var(--success);
  background: #E8F5E9;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.step-number {
  background: var(--primary);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.step.completed .step-number {
  background: var(--success);
}

.step-prompt {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 500;
}
タスク3: プロンプト設計開始（Phase 3）
目標: 教材自動生成のための「究極のプロンプト」を作成

第1段階プロンプト（全体分析）のテンプレート:

Copy# 数学教材 全体構造分析プロンプト

あなたは高校数学の教材設計の専門家です。以下の指導要領と教科書を分析し、学習の全体マップを作成してください。

## 入力
[指導要領の内容]
[教科書の目次と各単元の概要]

## 分析項目
1. 各単元の学習目標
2. 単元間の依存関係
3. 核となる概念の抽出
4. 重要度の判定（低/中/高）
5. 「山場」となる単元の特定

## 重要度判定基準
- **低**: 既習事項の確認、基本的な用語・手順
- **中**: 概念の理解と応用の橋渡し
- **高**: 核心概念、つまずきやすいポイント、重要な「山場」

## 出力フォーマット
JSON形式で以下の構造:
{
  "courseId": "math-1",
  "courseName": "数学Ⅰ",
  "units": [
    {
      "unitId": "unit-01",
      "unitName": "二次関数",
      "importance": "high",
      "coreConcepts": ["平方完成", "頂点と軸"],
      "peakLessons": ["平方完成の基本"],
      "lessons": [...]
    }
  ]
}
第2段階プロンプト（教材生成）のテンプレート:

Copy# 数学教材 レッスン生成プロンプト

以下の情報に基づいて、詳細な学習レッスンを生成してください。

## 入力
- 全体マップ（第1段階の出力）
- 教科書の該当ページ
- レッスンの重要度

## 生成ルール

### 重要度: 低
- 説明: 2-3段落、簡潔に
- 問題: 1問、シンプル
- ヒント: 1つ

### 重要度: 中
- 説明: 4-6段落、例を交えて
- 核となる概念: 明示
- 問題: 2-3問、段階的に難易度上昇

### 重要度: 高（山場）
- イントロダクション: なぜ重要か
- 詳細な説明: 6-10段落
- 段階的問題: 3-5ステップ
- よくある間違い: 詳細に

## 「行間を埋める」原則
教科書で省略されている思考プロセスを明示化:
- 「明らかに」→ なぜ明らかか説明
- 「したがって」→ 論理のステップを分解
- 暗黙の前提を明示

## 出力フォーマット
JSON形式（前述のデータ構造に従う）
📚 参考資料
内部ドキュメント
ROADMAP.md: 全体の開発計画
DESIGN.md: 詳細な設計思想
README.md: プロジェクト説明
外部リソース
MathJax: https://www.mathjax.org/
Progate: https://prog-8.com/ （UIの参考）
高校数学指導要領: 文部科学省サイト
🤝 引き継ぎチェックリスト
次のAIが確認すべき項目:

 プロジェクト構造を理解した
 実装済み機能を把握した
 データ構造を理解した
 既知の問題を確認した
 次の課題（タスク1-3）を理解した
 ローカル環境でアプリを起動できた
 GitHub Pagesで公開版を確認した
 コードを読んで全体像を把握した
💬 最後に
このプロジェクトは「行間を埋める」学習という明確なビジョンを持っています。単なる問題集ではなく、なぜそうなるかを徹底的に追求する教材を目指しています。

現在はPhase 2が完了し、基盤は整いました。次は見た目の洗練と教材自動生成が鍵です。

頑張ってください！🚀

作成日: 2025-10-03
作成者: Claude (Anthropic)
次の担当者へ: このドキュメントを読んだら、まず「山場」デザインの改善から始めてください。その後、段階的問題の実装、そしてPhase 3のプロンプト設計に進んでください。質問があれば、このドキュメントを参照しながら進めてください。成功を祈ります！