/**
 * MathRise Generator
 * 学習指導要領から教材JSONを自動生成
 */

class MathRiseGenerator {
    constructor() {
        this.currentStep = 1;
        this.currentStage = 0; // 0, 1, 2
        this.data = {
            subjects: [],
            theme: '',
            mode: 'simple',
            curriculum: '',
            textbookToc: '',
            textbookExamples: '',
            syllabus: '',
            keyTopics: null,
            lessonMap: null,
            lessons: []
        };
    }
    
    /**
     * ステップ2へ移動
     */
    moveToStep2() {
        // 選択された科目を取得
        const checkedSubjects = document.querySelectorAll('input[name="subject"]:checked');
        if (checkedSubjects.length === 0) {
            alert('⚠️ 科目を少なくとも1つ選択してください');
            return;
        }
        
        this.data.subjects = Array.from(checkedSubjects).map(cb => cb.value);
        
        // テーマを取得
        this.data.theme = document.getElementById('theme').value;
        
        // モードを取得
        this.data.mode = document.querySelector('input[name="mode"]:checked').value;
        
        // パネル切り替え
        this.showPanel('panel-step2');
        this.updateProgress(2);
    }
    
    /**
     * ステップ1へ戻る
     */
    backToStep1() {
        this.showPanel('panel-step1');
        this.updateProgress(1);
    }
    
    /**
     * ステップ3へ移動
     */
    moveToStep3() {
        const curriculum = document.getElementById('curriculum').value;
        
        if (!curriculum.trim()) {
            alert('⚠️ 学習指導要領を入力してください');
            return;
        }
        
        this.data.curriculum = curriculum;
        
        // モードに応じて表示/非表示を切り替え
        const mode = this.data.mode;
        
        if (mode === 'simple') {
            // パターンA: 教科書等は不要
            document.getElementById('textbook-toc-group').style.display = 'none';
            document.getElementById('textbook-examples-group').style.display = 'none';
        } else if (mode === 'standard') {
            // パターンB: 目次のみ必要
            document.getElementById('textbook-toc-group').style.display = 'block';
            document.getElementById('textbook-examples-group').style.display = 'none';
        } else if (mode === 'detailed') {
            // パターンC: 全て必要
            document.getElementById('textbook-toc-group').style.display = 'block';
            document.getElementById('textbook-examples-group').style.display = 'block';
        }
        
        // モード名を表示
        const modeNames = {
            'simple': 'パターンA: シンプル',
            'standard': 'パターンB: 標準',
            'detailed': 'パターンC: 詳細'
        };
        document.getElementById('selected-mode-name').textContent = modeNames[mode];
        
        // パネル切り替え
        this.showPanel('panel-step3');
        this.updateProgress(3);
    }
    
    /**
     * ステップ2へ戻る
     */
    backToStep2() {
        this.showPanel('panel-step2');
        this.updateProgress(2);
    }
    
    /**
     * ファイルを読み込み
     */
    loadFile(targetId) {
        const fileInput = document.getElementById(targetId + '-file');
        const file = fileInput.files[0];
        
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById(targetId).value = content;
        };
        reader.readAsText(file);
    }
    
    /**
     * 第0段階: プロンプト生成
     */
    generateStage0Prompt() {
        const curriculum = this.data.curriculum;
        
        if (!curriculum.trim()) {
            alert('⚠️ 学習指導要領を入力してください');
            return;
        }
        
        // モードに応じて追加資料を取得
        if (this.data.mode === 'standard' || this.data.mode === 'detailed') {
            this.data.textbookToc = document.getElementById('textbook-toc').value;
        }
        
        if (this.data.mode === 'detailed') {
            this.data.textbookExamples = document.getElementById('textbook-examples').value;
        }
        
        this.data.syllabus = document.getElementById('syllabus').value;
        
        // プロンプトを構築
        const prompt = this.buildStage0Prompt();
        
        // プロンプトを表示
        document.getElementById('prompt-text').textContent = prompt;
        
        // パネル切り替え
        this.showPanel('panel-prompt');
        this.updateProgress(4);
        
        this.currentStage = 0;
    }
    
    /**
     * プロンプトをコピー
     */
    copyPrompt() {
        const text = document.getElementById('prompt-text').textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert('📋 コピーしました！\n\n新しいClaude会話を開いて、このプロンプトを実行してください。');
        });
    }
    
    /**
     * 結果入力画面を表示
     */
    showResultInput() {
        this.showPanel('panel-result');
        document.getElementById('result-input').value = '';
        document.getElementById('result-input').focus();
    }
    
    /**
     * 結果を読み込み
     */
    loadResult() {
        const resultText = document.getElementById('result-input').value.trim();
        
        if (!resultText) {
            alert('❌ 実行結果を入力してください');
            return;
        }
        
        this.showPanel('panel-loading');
        document.getElementById('loading-message').textContent = '結果を読み込み中...';
        
        const self = this;
        setTimeout(() => {
            try {
                const result = JSON.parse(resultText);
                
                console.log('📥 結果を読み込み:', result);
                console.log('🔢 現在のステージ:', self.currentStage);
                
                // バッチ結果の場合（lessons配列を含む）
                if (result.lessons && Array.isArray(result.lessons)) {
                    console.log('📦 バッチ結果: ' + result.lessons.length + '個のレッスン');
                    
                    // ステージ1の場合：lessonMapとして保存
                    if (self.currentStage === 1) {
                        if (!self.validateStage1(result)) {
                            alert('❌ JSON形式が不正です（第1段階）');
                            self.showPanel('panel-stage1');
                            return;
                        }
                        self.data.lessonMap = result;
                        console.log('✅ 第1段階の結果を保存しました');
                        console.log('📚 総レッスン数:', result.lessons.length);
                        document.getElementById('result-input').value = '';
                        self.updateBatchProgress();
                        self.moveToStage2();
                        return;
                    }
                    
                    // ステージ2の場合：個別レッスンを追加
                    if (self.currentStage === 2) {
                        // 各レッスンを追加
                        result.lessons.forEach((lesson) => {
                            self.data.lessons.push(lesson);
                            console.log('✅ レッスン追加:', lesson.id);
                        });
                        
                        // 進捗を更新
                        self.updateBatchProgress();
                        
                        // 次のバッチがある場合
                        if (self.data.lessons.length < self.data.lessonMap.lessons.length) {
                            alert('✅ ' + result.lessons.length + '個のレッスンを読み込みました。\n\n進捗: ' + self.data.lessons.length + '/' + self.data.lessonMap.lessons.length + '\n\n次のバッチのプロンプトを生成します。');
                            
                            // 入力欄をクリア
                            document.getElementById('result-input').value = '';
                            
                            // 次のバッチのプロンプトを生成
                            self.moveToStage2();
                        } else {
                            // 全て完了
                            alert('🎉 全' + self.data.lessons.length + '個のレッスンの生成が完了しました！');
                            document.getElementById('result-input').value = '';
                            self.checkCompletion();
                        }
                        
                        return;
                    }
                }
                
                // 単一レッスンの場合（後方互換性）
                if (self.currentStage === 0) {
                    if (!self.validateStage0(result)) {
                        alert('❌ JSON形式が不正です（第0段階）');
                        return;
                    }
                    self.data.keyTopics = result;
                    console.log('✅ 第0段階の結果を保存しました');
                    document.getElementById('result-input').value = '';
                    self.moveToStage1();
                } else if (self.currentStage === 1) {
                    if (!self.validateStage1(result)) {
                        alert('❌ JSON形式が不正です（第1段階）');
                        return;
                    }
                    self.data.lessonMap = result;
                    console.log('✅ 第1段階の結果を保存しました');
                    console.log('📚 総レッスン数:', result.lessons.length);
                    document.getElementById('result-input').value = '';
                    self.updateBatchProgress();
                    self.moveToStage2();
                } else if (self.currentStage === 2) {
                    if (!self.validateStage2(result)) {
                        alert('❌ JSON形式が不正です（第2段階）');
                        return;
                    }
                    self.data.lessons.push(result);
                    console.log('✅ レッスンを追加しました:', result.id);
                    self.updateBatchProgress();
                    document.getElementById('result-input').value = '';
                    self.checkCompletion();
                }
            } catch (e) {
                console.error('❌ JSONパースエラー:', e);
                alert('❌ JSON形式が不正です:\n' + e.message);
                self.showPanel('panel-stage' + self.currentStage);
            }
        }, 500);
    }
    
    /**
     * 第1段階へ移動
     */
    moveToStage1() {
        console.log('🔄 第1段階へ移動');
        
        this.showPanel('panel-loading');
        document.getElementById('loading-message').textContent = 
            '第1段階のプロンプトを生成中...';
        
        setTimeout(() => {
            try {
                const prompt = this.buildStage1Prompt();
                console.log('✅ 第1段階のプロンプト生成成功');
                document.getElementById('prompt-text').textContent = prompt;
                this.showPanel('panel-prompt');
                this.updateProgress(4);
                this.currentStage = 1;
            } catch (e) {
                console.error('❌ プロンプト生成エラー:', e);
                alert('❌ プロンプト生成に失敗しました:\n' + e.message);
                this.showPanel('panel-result');
            }
        }, 500);
    }
    
    /**
     * 第2段階へ移動
     */
    moveToStage2() {
        console.log('🔄 第2段階へ移動');
        console.log('📊 lessonMap:', this.data.lessonMap);
        console.log('📚 lessons:', this.data.lessonMap ? this.data.lessonMap.lessons : 'なし');
        console.log('🔢 生成済みレッスン数:', this.data.lessons.length);
        
        if (!this.data.lessonMap || !this.data.lessonMap.lessons) {
            alert('❌ レッスンマップが読み込まれていません');
            return;
        }
        
        this.showPanel('panel-loading');
        document.getElementById('loading-message').textContent = 
            '第2段階のプロンプトを生成中...';
        
        setTimeout(() => {
            try {

                // バッチサイズ選択UIを表示
                const batchGroup = document.getElementById("batch-size-group");
                if (batchGroup) {
                    batchGroup.style.display = "block";
                }

                // 進捗を更新
                this.updateBatchProgress();
                const prompt = this.buildStage2Prompt();
                console.log('✅ 第2段階のプロンプト生成成功');
                document.getElementById('prompt-text').textContent = prompt;
                this.showPanel('panel-prompt');
                this.updateProgress(4);
                this.currentStage = 2;
            } catch (e) {
                console.error('❌ プロンプト生成エラー:', e);
                alert('❌ プロンプト生成に失敗しました:\n' + e.message);
                this.showPanel('panel-result');
            }
        }, 500);
    }
    
    /**
     * 完了チェック
     */
    checkCompletion() {
        const totalLessons = this.data.lessonMap.lessons.length;
        const generatedLessons = this.data.lessons.length;
        
        console.log(`📊 進捗: ${generatedLessons}/${totalLessons}`);
        
        if (generatedLessons < totalLessons) {
            // まだ生成が必要
            alert(`✅ レッスン ${generatedLessons}/${totalLessons} を生成しました\n\n次のレッスンのプロンプトを生成します`);
            this.moveToStage2();
        } else {
            // 全て完了
            console.log('🎉 全レッスンの生成が完了しました');
            this.showComplete();
        }
    }
    
    /**
     * 完成画面を表示
     */
    showComplete() {
        const totalLessons = this.data.lessons.length;
        const peakLessons = this.data.lessons.filter(l => l.importance === 'high').length;
        const totalTime = this.data.lessons.reduce((sum, l) => sum + l.estimatedTime, 0);
        
        document.getElementById('total-lessons').textContent = totalLessons;
        document.getElementById('peak-lessons').textContent = peakLessons;
        document.getElementById('total-time').textContent = (totalTime / 60).toFixed(1) + 'h';
        
        this.showPanel('panel-complete');
        this.updateProgress(5);
    }
    
    /**
     * JSONをダウンロード
     */
    downloadJSON() {
        const courseData = {
            courseId: 'math-custom',
            courseName: '数学（カスタム）',
            version: '1.0.0',
            generatedBy: 'MathRise Generator',
            generatedDate: new Date().toISOString().split('T')[0],
            metadata: {
                subjects: this.data.subjects,
                theme: this.data.theme,
                mode: this.data.mode,
                totalUnits: 1,
                totalLessons: this.data.lessons.length,
                estimatedHours: this.data.lessons.reduce((sum, l) => sum + l.estimatedTime, 0) / 60
            },
            units: [
                {
                    unitId: 'unit-01',
                    unitName: '生成された単元',
                    importance: 'high',
                    lessons: this.data.lessons
                }
            ]
        };
        
        const json = JSON.stringify(courseData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `math-custom-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        alert('📥 ダウンロードしました！\n\nこのファイルを courses/ ディレクトリに配置してください。');
    }
    
    /**
     * リセット
     */
    reset() {
        if (confirm('最初からやり直しますか？\n\n現在のデータは失われます。')) {
            location.reload();
        }
    }
    
    /**
     * 戻る
     */
    goBack() {
        this.showPanel('panel-prompt');
    }
    
    /**
     * パネル切り替え
     */
    showPanel(panelId) {
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        document.getElementById(panelId).classList.remove('hidden');
    }
    
    /**
     * 進捗更新
     */
    updateProgress(step) {
        this.currentStep = step;
        document.querySelectorAll('.progress-tracker .step').forEach((el, i) => {
            if (i < step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }
    
    /**
     * プロンプト構築（第0段階）
     */
    buildStage0Prompt() {
        let prompt = `# 役割
あなたは高校数学の教材設計の専門家です。

# 入力
科目: ${this.data.subjects.join(', ')}
${this.data.theme ? `テーマ: ${this.data.theme}\n` : ''}
学習指導要領:
${this.data.curriculum}
`;

        if (this.data.textbookToc) {
            prompt += `\n教科書の目次:
${this.data.textbookToc}
`;
        }

        if (this.data.syllabus) {
            prompt += `\nシラバス・観点別評価規準例:
${this.data.syllabus}
`;
        }

        prompt += `
# タスク
以下のJSON形式で、重要トピックを抽出してください。

## 重要度の判定基準

### 低重要度（low）
- 既習事項の確認
- 基本的な用語・定義
- 推定学習時間: 3-5分

### 中重要度（medium）
- 新しい概念の導入
- 複数ステップの思考
- 推定学習時間: 8-12分

### 高重要度（high）- 山場
- 科目の核となる概念
- つまずきやすいポイント
- 推定学習時間: 15-20分

## 山場の特定方法

以下のいずれかに該当すれば「山場」:
1. 新しい重要概念の導入
2. 複数の概念の統合
3. つまずきやすいポイント

## 出力形式

\`\`\`json
{
  "topics": [
    {
      "topicId": "topic-001",
      "title": "トピックタイトル",
      "importance": "low/medium/high",
      "estimatedLessons": 2,
      "isPeak": false,
      "peakCondition": null,
      "learningGoals": ["目標1", "目標2"],
      "prerequisites": []
    }
  ]
}
\`\`\`

JSON形式で出力してください。`;
        return prompt;
    }
    
    // バッチサイズを取得
    getBatchSize() {
        const selected = document.querySelector('input[name="batchSize"]:checked');
        if (!selected) return 1;
        
        if (selected.value === 'all') {
            const total = this.data.lessonMap.lessons.length;
            const completed = this.data.lessons.length;
            return total - completed;
        }
        return parseInt(selected.value);
    }
    
    // バッチ進捗を更新
    updateBatchProgress() {
        const total = this.data.lessonMap ? this.data.lessonMap.lessons.length : 0;
        const completed = this.data.lessons.length;
        const batchSize = this.getBatchSize();
        const remaining = total > completed ? Math.ceil((total - completed) / batchSize) : 0;
        
        document.getElementById('batch-progress').textContent = completed + '/' + total;
        document.getElementById('batch-remaining').textContent = remaining;
    }
    
    /**
     * バッチプロンプトを生成（詳細版）
     */
    buildStage2BatchPrompt() {
        const batchSize = this.getBatchSize();
        const startIndex = this.data.lessons.length;
        const total = this.data.lessonMap.lessons.length;
        const endIndex = Math.min(startIndex + batchSize, total);
        const targetLessons = this.data.lessonMap.lessons.slice(startIndex, endIndex);
        
        const lessonsJson = JSON.stringify(targetLessons, null, 2);
        
        let prompt = `# 役割
あなたは高校数学の教材作成の専門家です。

# 入力
以下の${targetLessons.length}個のレッスンを生成してください:

\`\`\`json
${lessonsJson}
\`\`\`
`;

        if (this.data.textbookExamples) {
            prompt += `\n教科書の具体例:
${this.data.textbookExamples}
`;
        }

        prompt += `
# タスク
各レッスンの詳細を生成してください。

## 重要度別の要件

### 高重要度（high）⭐山場
**このレッスンは学習の山場です。以下の要件を厳守してください：**

1. **content構造**
   - "introduction": 導入文（2-3段落、学習者のモチベーションを高める内容）
   - "explanation": 詳細な説明（6-10段落、HTML形式）
     * <h3>、<h4>タグで適切に構造化
     * <p>タグで段落を明確に分ける
     * 数式は $...$ で囲む（インライン形式）
     * <ol>、<ul>でリストを適宜使用
   - "keyConcepts": 重要概念（4-6項目、各項目は完全な文）
   - "visualAids": 視覚的補助（オプション、グラフや図の説明）

2. **problems構造**
   - type: "step-by-step" 必須
   - steps: 4-6ステップ
   - 各ステップに "hints" 配列（2-3個）
   - "feedback" オブジェクトに "commonMistakes" 配列を含める（3-4パターン）
     * 各commonMistakeは { "pattern": "誤答例", "explanation": "なぜ間違いか" }

3. **説明の質**
   - 「なぜそうなるのか」を徹底的に説明
   - 具体例を必ず含める
   - 学習者の疑問を先回りして答える
   - 前のレッスンとの関連を明示

### 中重要度（medium）
1. **content構造**
   - "explanation": 詳細な説明（3-5段落、HTML形式）
   - "keyConcepts": 重要概念（2-4項目）

2. **problems構造**
   - type: "multiple-choice" または "step-by-step"
   - hintsは1-2個
   - feedbackは正解・不正解のみでOK

### 低重要度（low）
1. **content構造**
   - "explanation": 簡潔な説明（2-3段落、HTML形式）

2. **problems構造**
   - type: "simple" または "multiple-choice"
   - hintsは1個でOK
   - feedbackは簡潔に

## 【重要】回答形式の厳密なルール

### 基本原則

**すべての問題の回答は数値または数式で一意に定まる形式にしてください。**

**言葉で答えさせる場合は、必ず選択肢形式にして数値で回答させてください。**

### 回答タイプ別の詳細

#### 1. 数値回答（answerType: "number"）
- 答えが数値の場合に使用
- 例: "answer": "7"
- 例: "answer": "-5"
- 例: "answer": "3.14"

#### 2. 数式回答（answerType: "expression"）
- 答えが数式の場合に使用
- 空白なしで記述
- 例: "answer": "(x+3)^2-4"
- 例: "answer": "2x^2-8x+5"
- 例: "answer": "x^2+6x+9"

#### 3. 選択肢回答（answerType: "choice"）

**言葉で答えさせる場合は必ずこの形式を使用**
- 問題文に選択肢を明記
- 答えは選択肢の番号（数値）
- 例: "answer": "2"

**選択肢の書き方（問題文内）：**
\`\`\`
問題文<br><br>**選択肢:**<br>1. 選択肢1の内容<br>2. 選択肢2の内容<br>3. 選択肢3の内容<br><br>**答え: 1, 2, 3 のいずれかの数字を入力してください**
\`\`\`

**【改行の重要ルール】**
- HTMLの<br>タグを使用して改行を表現
- 問題文と**選択肢:**の間: <br><br> を必ず入れる
- **選択肢:**の直後: <br> を入れる
- 各選択肢の先頭: <br> を入れる（1つ目の選択肢の前にも）
- 選択肢の最後と**答え:**の間: <br><br> を入れる
- 実際の例: "関数の定義として正しいものはどれですか？<br><br>**選択肢:**<br>1. 選択肢1<br>2. 選択肢2<br>3. 選択肢3<br><br>**答え: 1, 2, 3 のいずれかの数字を入力してください**"

### 具体例

#### ❌ 悪い例（改行なし）
\`\`\`json
{
  "prompt": "この放物線の形状はどれですか？**選択肢:**1. 上に凸2. 下に凸**答え: 1 または 2 の数字を入力してください**",
  "answer": "1",
  "answerType": "choice"
}
\`\`\`

#### ✅ 良い例（選択肢形式 - <br>タグあり）
\`\`\`json
{
  "prompt": "この放物線の形状はどれですか？<br><br>**選択肢:**<br>1. 上に凸<br>2. 下に凸<br><br>**答え: 1 または 2 の数字を入力してください**",
  "answer": "1",
  "answerType": "choice"
}
\`\`\`

#### ✅ 良い例（3つの選択肢）
\`\`\`json
{
  "prompt": "$y = -3x^2$ のグラフの形状はどれですか？<br><br>**選択肢:**<br>1. 下に凸で細い放物線<br>2. 上に凸で細い放物線<br>3. 上に凸で広い放物線<br><br>**答え: 1, 2, 3 のいずれかの数字を入力してください**",
  "answer": "2",
  "answerType": "choice"
}
\`\`\`

#### ✅ 良い例（数値回答）
\`\`\`json
{
  "prompt": "$8$ を $2$ で割るといくつですか？",
  "answer": "4",
  "answerType": "number"
}
\`\`\`

#### ✅ 良い例（数式回答）
\`\`\`json
{
  "prompt": "$x^2 + 8x + 5$ を平方完成してください。（$(x+a)^2+b$ の形で答えてください）",
  "answer": "(x+4)^2-11",
  "answerType": "expression"
}
\`\`\`

## 数式の書き方

**【重要】数式は必ずインライン形式 $...$ で囲んでください**
- ディスプレイ形式 $$...$$ は使用しない
- インライン数式のみ使用: $f(x) = 2x + 1$
- 例: $(x + 3)^2 = x^2 + 6x + 9$
- 例: $y = ax^2 + bx + c$

## HTMLタグの使用
- 段落: <p>...</p>
- 見出し: <h3>、<h4>
- リスト: <ol>、<ul>、<li>
- 強調: <strong>
- 改行: <br>（選択肢の前後と各選択肢の先頭に必須）

## 問題タイプの詳細

### step-by-step形式
\`\`\`json
{
  "problemId": "p001",
  "type": "step-by-step",
  "question": "問題文（数式は $...$ で囲む）",
  "steps": [
    {
      "stepId": "s1",
      "prompt": "ステップの質問（選択肢がある場合は必ず<br><br>**選択肢:**<br>形式で明記）",
      "answer": "正解（数値または数式）",
      "answerType": "number" | "expression" | "choice",
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
  "hints": ["全体のヒント1", "全体のヒント2"],
  "feedback": {
    "correct": "全問正解時のメッセージ",
    "incorrect": "不正解時のメッセージ",
    "commonMistakes": [
      {
        "pattern": "よくある間違い1（具体的な数値や式）",
        "explanation": "なぜ間違いか、正しい考え方"
      }
    ]
  }
}
\`\`\`

### multiple-choice形式
\`\`\`json
{
  "problemId": "p002",
  "type": "multiple-choice",
  "question": "問題文<br><br>**選択肢:**<br>1. 選択肢1<br>2. 選択肢2<br>3. 選択肢3<br><br>**答え: 1, 2, 3 のいずれかの数字を入力してください**",
  "answer": "2",
  "answerType": "choice",
  "choices": ["選択肢1", "選択肢2", "選択肢3"],
  "hints": ["ヒント1"],
  "feedback": {
    "correct": "正解時のメッセージ",
    "incorrect": "不正解時のメッセージ"
  }
}
\`\`\`

### simple形式
\`\`\`json
{
  "problemId": "p003",
  "type": "simple",
  "question": "問題文（数値または数式で答えられる問題）",
  "answer": "7",
  "answerType": "number",
  "hints": ["ヒント1"],
  "feedback": {
    "correct": "正解時のメッセージ",
    "incorrect": "不正解時のメッセージ"
  }
}
\`\`\`

## 出力形式

**必ず以下のJSON形式で、lessons配列に複数のレッスンを含めて出力してください。**

\`\`\`json
{
  "lessons": [
    {
      "id": "lesson-001",
      "title": "レッスンタイトル",
      "importance": "low/medium/high",
      "estimatedTime": 5,
      "prerequisites": [],
      "tags": ["タグ1", "タグ2"],
      "content": {
        "introduction": "このレッスンでは...",
        "explanation": "<p>説明文（HTML形式）</p>",
        "keyConcepts": ["重要概念1（完全な文で）", "重要概念2"]
      },
      "problems": [
        {
          "problemId": "p001",
          "type": "step-by-step",
          "question": "問題文",
          "steps": [...],
          "hints": [],
          "feedback": {
            "correct": "正解時のメッセージ",
            "incorrect": "不正解時のメッセージ",
            "commonMistakes": [...]
          }
        }
      ]
    }
  ]
}
\`\`\`

## 注意事項
1. 各レッスンのIDは必ず指定されたものを使用してください
2. 重要度に応じた要件を適用してください
3. 高重要度の場合は、step-by-step問題を必ず含めてください
4. JSONとして正しくパースできる形式で出力
5. 文字列内の改行は<br>タグを使用
6. ダブルクォートは \\" でエスケープ
7. **数式は必ずインライン形式 $...$ で囲む（$$...$$ は使用しない）**
8. HTMLタグは文字列内に正しく記述
9. 配列やオブジェクトの最後にカンマを付けない
10. **【最重要】選択肢形式の問題では以下のルールを厳守:**
    - 問題文と**選択肢:**の間: <br><br>
    - **選択肢:**の直後: <br>
    - 各選択肢の先頭: <br>（1つ目の選択肢も含む）
    - 選択肢の最後と**答え:**の間: <br><br>
11. **すべての回答は数値、数式、または選択肢番号で一意に定まる形式にする**
12. **言葉で答えさせる場合は必ず選択肢形式にし、問題文に選択肢を明記する**
13. **出力は必ず { "lessons": [...] } の形式**

JSON形式で出力してください。`;

        return prompt;
    }
    
    /**
     * プロンプト構築（第1段階）
     */
    buildStage1Prompt() {
        return `# 役割
あなたは高校数学の教材設計の専門家です。

# 入力（第0段階の出力）
${JSON.stringify(this.data.keyTopics, null, 2)}

# タスク
レッスン一覧を作成してください。

## 出力形式

\`\`\`json
{
  "lessons": [
    {
      "id": "lesson-001",
      "title": "レッスンタイトル",
      "importance": "low/medium/high",
      "estimatedTime": 10,
      "topicId": "topic-001",
      "prerequisites": [],
      "tags": ["タグ1", "タグ2"]
    }
  ]
}
\`\`\`

JSON形式で出力してください。`;
    }
    
    /**
     * プロンプト構築（第2段階）- 修正版
     */
    buildStage2Prompt() {
        const batchSize = this.getBatchSize();
        
        // バッチサイズが1より大きい場合はバッチプロンプトを使用
        if (batchSize > 1) {
            return this.buildStage2BatchPrompt();
        }
        
        const nextLessonIndex = this.data.lessons.length;
        const nextLesson = this.data.lessonMap.lessons[nextLessonIndex];
        
        if (!nextLesson) {
            throw new Error(`レッスンが見つかりません（インデックス: ${nextLessonIndex}）`);
        }
        
        console.log('📝 次のレッスン:', nextLesson);
        
        // 重要度別の要件テキストを事前に生成
        let importanceRequirements = '';
        
        if (nextLesson.importance === 'high') {
            importanceRequirements = `### 高重要度（山場）の要件

**このレッスンは学習の山場です。以下の要件を厳守してください：**

1. **content構造**
   - "introduction": 導入文（2-3段落、学習者のモチベーションを高める内容）
   - "explanation": 詳細な説明（6-10段落、HTML形式）
     * <h3>、<h4>タグで適切に構造化
     * <p>タグで段落を明確に分ける
     * 数式は $...$ で囲む（インライン形式）
     * <ol>、<ul>でリストを適宜使用
   - "keyConcepts": 重要概念（4-6項目、各項目は完全な文）
   - "visualAids": 視覚的補助（オプション、グラフや図の説明）

2. **problems構造**
   - type: "step-by-step" 必須
   - steps: 4-6ステップ
   - 各ステップに "hints" 配列（2-3個）
   - "feedback" オブジェクトに "commonMistakes" 配列を含める（3-4パターン）
     * 各commonMistakeは { "pattern": "誤答例", "explanation": "なぜ間違いか" }

3. **説明の質**
   - 「なぜそうなるのか」を徹底的に説明
   - 具体例を必ず含める
   - 学習者の疑問を先回りして答える
   - 前のレッスンとの関連を明示`;
        } else if (nextLesson.importance === 'medium') {
            importanceRequirements = `### 中重要度の要件
1. **content構造**
   - "explanation": 詳細な説明（3-5段落、HTML形式）
   - "keyConcepts": 重要概念（2-4項目）

2. **problems構造**
   - type: "multiple-choice" または "step-by-step"
   - hintsは1-2個
   - feedbackは正解・不正解のみでOK`;
        } else {
            importanceRequirements = `### 低重要度の要件
1. **content構造**
   - "explanation": 簡潔な説明（2-3段落、HTML形式）

2. **problems構造**
   - type: "simple" または "multiple-choice"
   - hintsは1個でOK
   - feedbackは簡潔に`;
        }
        
        let prompt = `# 役割
あなたは高校数学の教材作成の専門家です。

# 入力
レッスン情報:
${JSON.stringify(nextLesson, null, 2)}
`;

        if (this.data.textbookExamples) {
            prompt += `\n教科書の具体例:
${this.data.textbookExamples}
`;
        }

        prompt += `
# タスク
このレッスンの詳細を生成してください。

## レッスン情報
- ID: ${nextLesson.id}
- タイトル: ${nextLesson.title}
- 重要度: ${nextLesson.importance}
- 推定時間: ${nextLesson.estimatedTime}分
- タグ: ${nextLesson.tags?.join(', ') || ''}
- 前提レッスン: ${nextLesson.prerequisites?.join(', ') || 'なし'}

## 重要度別の要件

${importanceRequirements}

## 【重要】回答形式の厳密なルール

### 基本原則

**すべての問題の回答は数値または数式で一意に定まる形式にしてください。**

**言葉で答えさせる場合は、必ず選択肢形式にして数値で回答させてください。**

### 回答タイプ別の詳細

#### 1. 数値回答（answerType: "number"）
- 答えが数値の場合に使用
- 例: "answer": "7"
- 例: "answer": "-5"
- 例: "answer": "3.14"

#### 2. 数式回答（answerType: "expression"）
- 答えが数式の場合に使用
- 空白なしで記述
- 例: "answer": "(x+3)^2-4"
- 例: "answer": "2x^2-8x+5"
- 例: "answer": "x^2+6x+9"

#### 3. 選択肢回答（answerType: "choice"）

**言葉で答えさせる場合は必ずこの形式を使用**
- 問題文に選択肢を明記
- 答えは選択肢の番号（数値）
- 例: "answer": "2"

**選択肢の書き方（問題文内）：**
\`\`\`
問題文<br><br>**選択肢:**<br>1. 選択肢1の内容<br>2. 選択肢2の内容<br>3. 選択肢3の内容<br><br>**答え: 1, 2, 3 のいずれかの数字を入力してください**
\`\`\`

**【改行の重要ルール】**
- HTMLの<br>タグを使用して改行を表現
- 問題文と**選択肢:**の間: <br><br> を必ず入れる
- **選択肢:**の直後: <br> を入れる
- 各選択肢の先頭: <br> を入れる（1つ目の選択肢の前にも）
- 選択肢の最後と**答え:**の間: <br><br> を入れる
- 実際の例: "関数の定義として正しいものはどれですか？<br><br>**選択肢:**<br>1. 選択肢1<br>2. 選択肢2<br>3. 選択肢3<br><br>**答え: 1, 2, 3 のいずれかの数字を入力してください**"

### 具体例

#### ❌ 悪い例（改行なし）
\`\`\`json
{
  "prompt": "この放物線の形状はどれですか？**選択肢:**1. 上に凸2. 下に凸**答え: 1 または 2 の数字を入力してください**",
  "answer": "1",
  "answerType": "choice"
}
\`\`\`

#### ✅ 良い例（選択肢形式 - <br>タグあり）
\`\`\`json
{
  "prompt": "この放物線の形状はどれですか？<br><br>**選択肢:**<br>1. 上に凸<br>2. 下に凸<br><br>**答え: 1 または 2 の数字を入力してください**",
  "answer": "1",
  "answerType": "choice"
}
\`\`\`

#### ✅ 良い例（3つの選択肢）
\`\`\`json
{
  "prompt": "$y = -3x^2$ のグラフの形状はどれですか？<br><br>**選択肢:**<br>1. 下に凸で細い放物線<br>2. 上に凸で細い放物線<br>3. 上に凸で広い放物線<br><br>**答え: 1, 2, 3 のいずれかの数字を入力してください**",
  "answer": "2",
  "answerType": "choice"
}
\`\`\`

#### ✅ 良い例（数値回答）
\`\`\`json
{
  "prompt": "$8$ を $2$ で割るといくつですか？",
  "answer": "4",
  "answerType": "number"
}
\`\`\`

#### ✅ 良い例（数式回答）
\`\`\`json
{
  "prompt": "$x^2 + 8x + 5$ を平方完成してください。（$(x+a)^2+b$ の形で答えてください）",
  "answer": "(x+4)^2-11",
  "answerType": "expression"
}
\`\`\`

## 数式の書き方

**【重要】数式は必ずインライン形式 $...$ で囲んでください**
- ディスプレイ形式 $$...$$ は使用しない
- インライン数式のみ使用: $f(x) = 2x + 1$
- 例: $(x + 3)^2 = x^2 + 6x + 9$
- 例: $y = ax^2 + bx + c$

## HTMLタグの使用
- 段落: <p>...</p>
- 見出し: <h3>、<h4>
- リスト: <ol>、<ul>、<li>
- 強調: <strong>
- 改行: <br>（選択肢の前後と各選択肢の先頭に必須）

## 問題タイプの詳細

### step-by-step形式
\`\`\`json
{
  "problemId": "p001",
  "type": "step-by-step",
  "question": "問題文（数式は $...$ で囲む）",
  "steps": [
    {
      "stepId": "s1",
      "prompt": "ステップの質問（選択肢がある場合は必ず<br><br>**選択肢:**<br>形式で明記）",
      "answer": "正解（数値または数式）",
      "answerType": "number" | "expression" | "choice",
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
  "hints": ["全体のヒント1", "全体のヒント2"],
  "feedback": {
    "correct": "全問正解時のメッセージ",
    "incorrect": "不正解時のメッセージ",
    "commonMistakes": [
      {
        "pattern": "よくある間違い1（具体的な数値や式）",
        "explanation": "なぜ間違いか、正しい考え方"
      }
    ]
  }
}
\`\`\`

### multiple-choice形式
\`\`\`json
{
  "problemId": "p002",
  "type": "multiple-choice",
  "question": "問題文<br><br>**選択肢:**<br>1. 選択肢1<br>2. 選択肢2<br>3. 選択肢3<br><br>**答え: 1, 2, 3 のいずれかの数字を入力してください**",
  "answer": "2",
  "answerType": "choice",
  "choices": ["選択肢1", "選択肢2", "選択肢3"],
  "hints": ["ヒント1"],
  "feedback": {
    "correct": "正解時のメッセージ",
    "incorrect": "不正解時のメッセージ"
  }
}
\`\`\`

### simple形式
\`\`\`json
{
  "problemId": "p003",
  "type": "simple",
  "question": "問題文（数値または数式で答えられる問題）",
  "answer": "7",
  "answerType": "number",
  "hints": ["ヒント1"],
  "feedback": {
    "correct": "正解時のメッセージ",
    "incorrect": "不正解時のメッセージ"
  }
}
\`\`\`

## 出力形式

**必ずJSON形式で出力してください。コードブロックは不要です。**

\`\`\`json
{
  "id": "${nextLesson.id}",
  "title": "${nextLesson.title}",
  "importance": "${nextLesson.importance}",
  "estimatedTime": ${nextLesson.estimatedTime},
  ${nextLesson.prerequisites && nextLesson.prerequisites.length > 0 ? `"prerequisites": ${JSON.stringify(nextLesson.prerequisites)},` : ''}
  "tags": ${JSON.stringify(nextLesson.tags || [])},
  "content": {
    ${nextLesson.importance === 'high' ? '"introduction": "導入文（2-3段落）",' : ''}
    "explanation": "<p>説明文（HTML形式）</p>",
    "keyConcepts": [
      "重要概念1（完全な文で）",
      "重要概念2"
    ]${nextLesson.importance === 'high' ? ',\n    "visualAids": []' : ''}
  },
  "problems": [
    {
      "problemId": "p001",
      "type": "${nextLesson.importance === 'high' ? 'step-by-step' : 'simple'}",
      "question": "問題文",
      ${nextLesson.importance === 'high' ? '"steps": [],' : ''}
      "answer": "正解（数値または数式）",
      "answerType": "number" | "expression" | "choice",
      "hints": [],
      "feedback": {
        "correct": "正解時のメッセージ",
        "incorrect": "不正解時のメッセージ"${nextLesson.importance === 'high' ? ',\n        "commonMistakes": []' : ''}
      }
    }
  ]
}
\`\`\`

## 注意事項
1. JSONとして正しくパースできる形式で出力
2. 文字列内の改行は<br>タグを使用
3. ダブルクォートは \\" でエスケープ
4. **数式は必ずインライン形式 $...$ で囲む（$$...$$ は使用しない）**
5. HTMLタグは文字列内に正しく記述
6. 配列やオブジェクトの最後にカンマを付けない
7. **【最重要】選択肢形式の問題では以下のルールを厳守:**
   - 問題文と**選択肢:**の間: <br><br>
   - **選択肢:**の直後: <br>
   - 各選択肢の先頭: <br>（1つ目の選択肢も含む）
   - 選択肢の最後と**答え:**の間: <br><br>
8. **すべての回答は数値、数式、または選択肢番号で一意に定まる形式にする**
9. **言葉で答えさせる場合は必ず選択肢形式にし、問題文に選択肢を明記する**

JSON形式で出力してください。`;

        return prompt;
    }
    
    /**
     * バリデーション（第0段階）
     */
    validateStage0(json) {
        return json.topics && Array.isArray(json.topics) && json.topics.length > 0;
    }
    
    /**
     * バリデーション（第1段階）
     */
    validateStage1(json) {
        return json.lessons && Array.isArray(json.lessons) && json.lessons.length > 0;
    }
    
    /**
     * バリデーション（第2段階）
     */
    validateStage2(json) {
        return json.id && json.title && json.problems;
    }
}

// グローバルインスタンス
const generator = new MathRiseGenerator();

// グローバル関数
function moveToStep2() { generator.moveToStep2(); }
function backToStep1() { generator.backToStep1(); }
function moveToStep3() { generator.moveToStep3(); }
function backToStep2() { generator.backToStep2(); }
function loadFile(targetId) { generator.loadFile(targetId); }
function generateStage0Prompt() { generator.generateStage0Prompt(); }
function copyPrompt() { generator.copyPrompt(); }
function showResultInput() { generator.showResultInput(); }
function loadResult() { generator.loadResult(); }
function downloadJSON() { generator.downloadJSON(); }
function reset() { generator.reset(); }
function goBack() { generator.goBack(); }