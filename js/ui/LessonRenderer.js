/**
 * レッスンレンダラー
 * レッスン内容を表示する
 */

// デバッグモード設定
const DEBUG_MODE = false;

function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        if (data !== null && data !== undefined) {
            console.log(message, data);
        } else {
            console.log(message);
        }
    }
}

// 入力緩和: 「上に凸/下に凸/１/２/全角半角」→ '1' or '2' に正規化
function normalizeChoiceAnswer(raw) {
    if (raw === null || raw === undefined) return raw;
    let v = String(raw).trim().replace(/[ 　]/g, '');
    v = v.replace(/[①１]/g, '1').replace(/[②２]/g, '2');
    const up = /^(上|上に凸|うえ|うえにとつ)$/i;
    const down = /^(下|下に凸|した|したにとつ)$/i;
    if (up.test(v)) return '1';
    if (down.test(v)) return '2';
    return v;
}

export class LessonRenderer {
    constructor() {
        this.container = document.getElementById('lesson-content');
        this.progressManager = null;
        this.currentCourseId = null;
        this.currentLesson = null;
        this.problemsCompleted = new Set();
    }

    setProgressManager(progressManager, courseId) {
        this.progressManager = progressManager;
        this.currentCourseId = courseId;
    }

    renderLesson(lesson) {
        if (!this.container) {
            console.error('❌ コンテナが見つかりません');
            return;
        }

        this.currentLesson = lesson;
        this.problemsCompleted.clear();

        const importanceClass = `lesson-${lesson.importance || 'medium'}`;
        
        this.container.innerHTML = '';
        this.container.className = importanceClass;

        const lessonElement = document.createElement('div');
        lessonElement.className = 'lesson';

        // ヘッダー
        const header = this.createHeader(lesson);
        lessonElement.appendChild(header);

        // イントロダクション（高重要度のみ）
        if (lesson.importance === 'high' && lesson.content.introduction) {
            const intro = this.createIntroduction(lesson.content.introduction);
            lessonElement.appendChild(intro);
        }

        // 説明
        if (lesson.content.explanation) {
            const explanation = this.createExplanation(lesson.content.explanation);
            lessonElement.appendChild(explanation);
        }

        // 核心概念（中・高重要度）
        if (lesson.content.keyConcepts && lesson.importance !== 'low') {
            const concepts = this.createKeyConcepts(lesson.content.keyConcepts);
            lessonElement.appendChild(concepts);
        }

        // 問題
        if (lesson.problems && lesson.problems.length > 0) {
            const problems = this.createProblems(lesson.problems, lesson.id);
            lessonElement.appendChild(problems);
        }

        this.container.appendChild(lessonElement);

        // MathJaxレンダリング（安全に）
        this.renderMathJax();
    }

    /**
     * MathJax のレンダリング（安全版）
     */
    renderMathJax() {
        if (!window.MathJax) {
            console.warn('⚠️ MathJax がまだ読み込まれていません');
            return;
        }

        // typesetPromise が使えるか確認
        if (typeof window.MathJax.typesetPromise === 'function') {
            window.MathJax.typesetPromise([this.container])
                .then(() => {
                    console.log('✅ MathJax レンダリング完了');
                })
                .catch(err => {
                    console.error('❌ MathJax エラー:', err);
                });
        } else if (window.MathJax.typeset) {
            // 古いバージョンの MathJax
            try {
                window.MathJax.typeset([this.container]);
                console.log('✅ MathJax レンダリング完了（typeset）');
            } catch (err) {
                console.error('❌ MathJax エラー:', err);
            }
        } else {
            console.warn('⚠️ MathJax.typesetPromise も typeset も利用できません');
        }
    }

    createHeader(lesson) {
        const header = document.createElement('div');
        header.className = 'lesson-header';

        const title = document.createElement('h2');
        title.className = 'lesson-title';
        
        const emoji = this.getImportanceEmoji(lesson.importance);
        title.textContent = `${lesson.title} ${emoji}`;

        header.appendChild(title);
        return header;
    }

    createIntroduction(text) {
        const intro = document.createElement('div');
        intro.className = 'introduction';
        intro.innerHTML = `<h3>なぜこの概念が重要か</h3><p>${text}</p>`;
        return intro;
    }

    createExplanation(html) {
        const explanation = document.createElement('div');
        explanation.className = 'lesson-explanation';
        
        const processedHtml = html
            .replace(/\n{3,}/g, '\n\n')
            .split('\n').join('<br>')
            .replace(/<p>/g, '<p class="text-with-math">')
            .replace(/class='math-center'/g, 'class="math-center"');
        explanation.innerHTML = processedHtml;
        return explanation;
    }

    createKeyConcepts(concepts) {
        const container = document.createElement('div');
        container.className = 'core-concepts';

        const title = document.createElement('h3');
        title.textContent = '核となる概念';
        container.appendChild(title);

        const list = document.createElement('ul');
        concepts.forEach(concept => {
            const li = document.createElement('li');
            li.innerHTML = concept;
            list.appendChild(li);
        });

        container.appendChild(list);
        
        // MathJax レンダリング（遅延）
        setTimeout(() => {
            this.renderMathJax();
        }, 100);
        
        return container;
    }

    createProblems(problems, lessonId) {
        const container = document.createElement('div');
        container.className = 'problems-section';

        problems.forEach((problem, index) => {
            const problemElement = this.createProblem(problem, index, lessonId);
            container.appendChild(problemElement);
        });

        return container;
    }

    createProblem(problem, index, lessonId) {
        debugLog('🔍 createProblem 呼び出し:', {
            problemId: problem.problemId,
            type: problem.type,
            hasSteps: !!problem.steps,
            stepsCount: problem.steps ? problem.steps.length : 0
        });

        if (problem.type === 'step-by-step') {
            debugLog('✅ step-by-step 問題として処理');
            return this.createStepByStepProblem(problem, index, lessonId);
        }
        debugLog('⚠️ 通常の問題として処理');

        const container = document.createElement('div');
        container.className = 'problem-container';
        container.id = `problem-${index}`;

        // 問題文
        const question = document.createElement('div');
        question.className = 'problem-question';
        question.innerHTML = `<strong>問題 ${index + 1}:</strong> <span class="question-text">${problem.question}</span>`;
        container.appendChild(question);

        // 数式入力ツールバー
        const toolbar = this.createMathToolbar();
        container.appendChild(toolbar);

        // 入力欄
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'problem-input';
        input.placeholder = '答えを入力してください（例: x^2+3x+1）';
        input.id = `answer-${index}`;
        
        // 数式プレビュー
        const preview = document.createElement('div');
        preview.className = 'math-preview';
        preview.innerHTML = '<span class="preview-label">プレビュー:</span> <span class="preview-content">（入力してください）</span>';
        
        // リアルタイムプレビュー
        input.addEventListener('input', (e) => {
            this.updateMathPreview(e.target.value, preview.querySelector('.preview-content'));
        });

        container.appendChild(input);
        container.appendChild(preview);

        // ボタングループ
        const actions = document.createElement('div');
        actions.className = 'problem-actions';

        // ヒントボタン
        if (problem.hints && problem.hints.length > 0) {
            const hintBtn = document.createElement('button');
            hintBtn.className = 'btn btn-secondary';
            hintBtn.textContent = '💡 ヒント';
            hintBtn.onclick = () => this.showHint(problem, container);
            actions.appendChild(hintBtn);
        }

        // 答え合わせボタン
        const checkBtn = document.createElement('button');
        checkBtn.className = 'btn btn-primary';
        checkBtn.textContent = '✓ 答え合わせ';
        checkBtn.onclick = () => this.checkAnswer(problem, input.value, container, lessonId, index);
        actions.appendChild(checkBtn);

        // Enterキーで答え合わせ
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkBtn.click();
            }
        });

        container.appendChild(actions);

        return container;
    }

    createMathToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'math-toolbar';

        const symbols = [
            { label: 'x²', value: 'x^2', title: 'x の2乗' },
            { label: 'x³', value: 'x^3', title: 'x の3乗' },
            { label: '√', value: 'sqrt()', title: '平方根' },
            { label: '±', value: '±', title: 'プラスマイナス' },
            { label: '÷', value: '/', title: '割り算' },
            { label: '×', value: '*', title: '掛け算' },
            { label: '( )', value: '()', title: '括弧' },
            { label: 'π', value: 'π', title: '円周率' },
        ];

        const label = document.createElement('span');
        label.className = 'toolbar-label';
        label.textContent = '記号:';
        toolbar.appendChild(label);

        symbols.forEach(symbol => {
            const btn = document.createElement('button');
            btn.className = 'math-symbol-btn';
            btn.textContent = symbol.label;
            btn.title = symbol.title;
            btn.onclick = (e) => {
                e.preventDefault();
                const input = btn.closest('.problem-container').querySelector('.problem-input');
                this.insertSymbol(input, symbol.value);
            };
            toolbar.appendChild(btn);
        });

        return toolbar;
    }

    insertSymbol(input, symbol) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        
        if (symbol === '()' || symbol === 'sqrt()') {
            const before = text.substring(0, start);
            const after = text.substring(end);
            input.value = before + symbol + after;
            input.focus();
            input.setSelectionRange(start + symbol.length - 1, start + symbol.length - 1);
        } else {
            const before = text.substring(0, start);
            const after = text.substring(end);
            input.value = before + symbol + after;
            input.focus();
            input.setSelectionRange(start + symbol.length, start + symbol.length);
        }

        const preview = input.closest('.problem-container').querySelector('.preview-content');
        this.updateMathPreview(input.value, preview);
    }

    updateMathPreview(text, previewElement) {
        if (!text.trim()) {
            previewElement.textContent = '（入力してください）';
            return;
        }

        let latex = text
            .replace(/\^(\d)/g, '^{$1}')
            .replace(/sqrt\((.*?)\)/g, '\\sqrt{$1}')
            .replace(/\*/g, '\\times')
            .replace(/\//g, '\\div')
            .replace(/±/g, '\\pm')
            .replace(/π/g, '\\pi');

        previewElement.innerHTML = `$$${latex}$$`;

        // MathJax レンダリング（遅延）
        setTimeout(() => {
            this.renderMathJax();
        }, 100);
    }

    showHint(problem, container) {
        const existingHint = container.querySelector('.hint-container');
        if (existingHint) {
            existingHint.remove();
            return;
        }

        const hintContainer = document.createElement('div');
        hintContainer.className = 'hint-container';
        hintContainer.innerHTML = problem.hints[0];

        container.appendChild(hintContainer);

        // MathJax レンダリング（遅延）
        setTimeout(() => {
            this.renderMathJax();
        }, 100);
    }

    checkAnswer(problem, userAnswer, container, lessonId, problemIndex) {
        const existingFeedback = container.querySelector('.feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const normalized = this.normalizeAnswer(userAnswer);
        const correctAnswer = this.normalizeAnswer(problem.answer);
        const isCorrect = normalized === correctAnswer;

        // 進捗を記録
        if (this.progressManager && this.currentCourseId) {
            this.progressManager.recordProblemAttempt(
                this.currentCourseId,
                lessonId,
                problem.problemId,
                isCorrect
            );
        }

        // 正解の場合、完了セットに追加
        if (isCorrect) {
            this.problemsCompleted.add(problemIndex);
            console.log(`✅ 問題 ${problemIndex + 1} 正解 (${this.problemsCompleted.size}/${this.currentLesson.problems.length})`);
            
            // すべての問題が完了したかチェック
            this.checkLessonCompletion(lessonId);
        }

        const feedback = document.createElement('div');
        feedback.className = `feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
        
        if (isCorrect) {
            feedback.innerHTML = '✅ 正解です！よくできました。';
            container.classList.add('problem-completed');
        } else {
            feedback.innerHTML = `❌ 不正解です。<br>正しい答え: $$${problem.answer}$$`;
            if (problem.feedback && problem.feedback.incorrect) {
                feedback.innerHTML += `<br><br>${problem.feedback.incorrect}`;
            }
        }

        container.appendChild(feedback);

        // MathJax レンダリング（遅延）
        setTimeout(() => {
            this.renderMathJax();
        }, 100);
    }

    /**
     * レッスン完了チェック（共通化）
     */
    checkLessonCompletion(lessonId) {
        if (this.currentLesson && this.problemsCompleted.size === this.currentLesson.problems.length) {
            console.log(`🎉 すべての問題完了！レッスン ${lessonId} を完了としてマーク`);
            this.markLessonCompleted(lessonId);
        }
    }

    markLessonCompleted(lessonId) {
        if (this.progressManager && this.currentCourseId) {
            this.progressManager.markLessonCompleted(this.currentCourseId, lessonId);
            this.showCompletionNotification();
            window.dispatchEvent(new CustomEvent('lessonCompleted', { 
                detail: { lessonId } 
            }));
        }
    }

    showCompletionNotification() {
        const notification = document.createElement('div');
        notification.className = 'completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🎉</div>
                <div class="notification-text">
                    <strong>レッスン完了！</strong>
                    <p>よくできました。次のレッスンに進みましょう。</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    normalizeAnswer(answer) {
        return String(answer)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/\*/g, '')
            .replace(/×/g, '')
            .replace(/÷/g, '/')
            .replace(/π/g, 'pi');
    }

    getImportanceEmoji(importance) {
        const emojis = {
            low: '🟢',
            medium: '🟡',
            high: '🔴'
        };
        return emojis[importance] || '⚪';
    }

    // 段階的問題（Step-by-Step）の実装
    createStepByStepProblem(problem, index, lessonId) {
        debugLog('🎯 createStepByStepProblem 呼び出し:', {
            problemId: problem.problemId,
            stepsCount: problem.steps.length
        });

        const container = document.createElement('div');
        container.className = 'step-by-step-container';
        container.dataset.problemIndex = index;  // ← 問題インデックスを保存
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'problem-question';
        questionDiv.innerHTML = `<strong>段階的問題 ${index + 1}:</strong> ${problem.question}`;
        container.appendChild(questionDiv);
        
        problem.steps.forEach((step, stepIndex) => {
            const stepElement = this.createStep(step, stepIndex, problem, lessonId, index);
            
            if (stepIndex > 0) {
                stepElement.classList.add('locked');
            }
            
            container.appendChild(stepElement);
        });
        
        return container;
    }
    
    createStep(step, stepIndex, problem, lessonId, problemIndex) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.id = `step-${problem.problemId}-${stepIndex}`;
        stepDiv.dataset.stepIndex = stepIndex;
        
        const header = document.createElement('div');
        header.className = 'step-header';
        const stepNumber = document.createElement('div');
        stepNumber.className = 'step-number';
        stepNumber.textContent = stepIndex + 1;
        
        const stepPrompt = document.createElement('div');
        stepPrompt.className = 'step-prompt';
        
        let promptText = step.prompt;
        promptText = promptText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        stepPrompt.innerHTML = promptText;
        
        header.appendChild(stepNumber);
        header.appendChild(stepPrompt);
        stepDiv.appendChild(header);
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'step-input-container';
        
        let input = document.createElement('input');
        input.type = 'text';
        input.className = 'problem-input';
        input.id = `step-answer-${problem.problemId}-${stepIndex}`;
        input.placeholder = '答えを入力...';
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkBtn.click();
            }
        });
        
        inputContainer.appendChild(input);

        const btnContainer = document.createElement('div');
        btnContainer.className = 'step-buttons';
        
        if (step.hints && step.hints.length > 0) {
            const hintBtn = document.createElement('button');
            hintBtn.className = 'btn btn-secondary';
            hintBtn.innerHTML = '💡 ヒント';
            hintBtn.onclick = () => this.showStepHint(step, stepDiv);
            btnContainer.appendChild(hintBtn);
        }
        
        const checkBtn = document.createElement('button');
        checkBtn.className = 'btn btn-primary';
        checkBtn.textContent = '確認';
        checkBtn.onclick = () => { 
            const currentValue = input.value; 
            this.checkStepAnswer(step, currentValue, stepDiv, stepIndex, problem, lessonId, problemIndex);
        };
        btnContainer.appendChild(checkBtn);
        
        inputContainer.appendChild(btnContainer);
        stepDiv.appendChild(inputContainer);
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'step-feedback';
        stepDiv.appendChild(feedbackDiv);
        
        return stepDiv;
    }
    
    showStepHint(step, stepDiv) {
        const feedbackDiv = stepDiv.querySelector('.step-feedback');
        
        const existingHints = feedbackDiv.querySelectorAll('.hint-message');
        existingHints.forEach(h => h.remove());
        
        const currentHintCount = feedbackDiv.querySelectorAll('.hint-message').length;
        
        if (currentHintCount < step.hints.length) {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'hint-message';
            hintDiv.innerHTML = `💡 <strong>ヒント ${currentHintCount + 1}:</strong> ${step.hints[currentHintCount]}`;
            feedbackDiv.appendChild(hintDiv);
            
            setTimeout(() => {
                this.renderMathJax();
            }, 100);
        }
    }
    
    checkStepAnswer(step, userAnswer, stepDiv, stepIndex, problem, lessonId, problemIndex) {
        if (step.prompt && step.prompt.includes('選択肢')) {
            userAnswer = normalizeChoiceAnswer(userAnswer);
        }
        
        const normalized = this.normalizeAnswer(userAnswer);
        const correctAnswer = this.normalizeAnswer(step.answer);
        const isCorrect = normalized === correctAnswer;
        
        this.showStepFeedback(isCorrect, stepDiv, step);
        
        if (isCorrect) {
            stepDiv.classList.add('completed');
            
            const input = stepDiv.querySelector('.problem-input');
            input.disabled = true;
            
            const checkBtn = stepDiv.querySelector('.btn-primary');
            checkBtn.disabled = true;
            checkBtn.textContent = '✓ 完了';
            
            const nextStepId = `step-${problem.problemId}-${stepIndex + 1}`;
            const nextStep = document.getElementById(nextStepId);
            
            if (nextStep) {
                setTimeout(() => {
                    nextStep.classList.remove('locked');
                    nextStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    const nextInput = nextStep.querySelector('.problem-input');
                    if (nextInput) {
                        nextInput.focus();
                    }
                }, 500);
            } else {
                // 最後のステップ完了 → 問題全体を完了
                this.checkAllStepsCompleted(problem, lessonId, problemIndex);
            }
        }
    }
    
    showStepFeedback(isCorrect, stepDiv, step) {
        const feedbackDiv = stepDiv.querySelector('.step-feedback');
        
        const existingFeedback = feedbackDiv.querySelector('.feedback-message');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const feedbackMsg = document.createElement('div');
        feedbackMsg.className = `feedback-message ${isCorrect ? 'correct' : 'incorrect'}`;
        
        if (isCorrect) {
            const correctMsg = step.feedback?.correct || '✓ 正解です！次のステップに進みましょう。';
            feedbackMsg.innerHTML = correctMsg;
        } else {
            const incorrectMsg = step.feedback?.incorrect || '✗ 不正解です。もう一度確認してみましょう。';
            feedbackMsg.innerHTML = incorrectMsg;
        }
        
        feedbackDiv.appendChild(feedbackMsg);
        
        setTimeout(() => {
            this.renderMathJax();
        }, 100);
    }
    
    checkAllStepsCompleted(problem, lessonId, problemIndex) {
        const allSteps = document.querySelectorAll(`[id^="step-${problem.problemId}-"]`);
        const completedSteps = document.querySelectorAll(`[id^="step-${problem.problemId}-"].completed`);
        
        if (allSteps.length === completedSteps.length) {
            setTimeout(() => {
                const container = document.querySelector('.step-by-step-container');
                
                const completionDiv = document.createElement('div');
                completionDiv.className = 'step-completion-message';
                completionDiv.innerHTML = `
                    <div class="completion-icon">🎉</div>
                    <div class="completion-text">
                        <strong>すべてのステップを完了しました！</strong>
                        <p>${problem.feedback?.correct || '素晴らしい理解です！'}</p>
                    </div>
                `;
                
                container.appendChild(completionDiv);
                completionDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                setTimeout(() => {
                    this.renderMathJax();
                }, 100);
                
                // 進捗を記録
                if (this.progressManager && this.currentCourseId) {
                    this.progressManager.recordProblemAttempt(
                        this.currentCourseId,
                        lessonId,
                        problem.problemId,
                        true
                    );
                }
                
                // ★ 重要: problemsCompleted に追加
                this.problemsCompleted.add(problemIndex);
                console.log(`✅ 段階的問題 ${problemIndex + 1} 完了 (${this.problemsCompleted.size}/${this.currentLesson.problems.length})`);
                
                // レッスン完了チェック
                this.checkLessonCompletion(lessonId);
            }, 500);
        }
    }
}
