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

    // MathJaxレンダリング
    if (window.MathJax) {
      MathJax.typesetPromise([this.container]).catch(err => {
        console.error('MathJax エラー:', err);
      });
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
    
    // HTMLを処理して数式を適切に配置
    const processedHtml = html
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
      li.innerHTML = concept; // 数式を含む可能性があるのでinnerHTML
      list.appendChild(li);
    });

    container.appendChild(list);
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

    if (window.MathJax) {
      MathJax.typesetPromise([previewElement]).catch(err => {
        previewElement.textContent = text;
      });
    }
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

    if (window.MathJax) {
      MathJax.typesetPromise([hintContainer]).catch(err => {
        console.error('MathJax エラー:', err);
      });
    }
  }

  checkAnswer(problem, userAnswer, container, lessonId, problemIndex) {
    const existingFeedback = container.querySelector('.feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    const normalized = this.normalizeAnswer(userAnswer);
    const correctAnswer = this.normalizeAnswer(problem.answer);
    const isCorrect = normalized === correctAnswer;

    if (this.progressManager && this.currentCourseId) {
      this.progressManager.recordProblemAttempt(
        this.currentCourseId,
        lessonId,
        problem.problemId,
        isCorrect
      );
    }

    if (isCorrect) {
      this.problemsCompleted.add(problemIndex);
      
      if (this.currentLesson && this.problemsCompleted.size === this.currentLesson.problems.length) {
        this.markLessonCompleted(lessonId);
      }
    }

    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
    
    if (isCorrect) {
      feedback.innerHTML = '正解です！よくできました。';
      container.classList.add('problem-completed');
    } else {
      feedback.innerHTML = `不正解です。<br>正しい答え: $$${problem.answer}$$`;
      if (problem.feedback && problem.feedback.incorrect) {
        feedback.innerHTML += `<br><br>${problem.feedback.incorrect}`;
      }
    }

    container.appendChild(feedback);

    if (window.MathJax) {
      MathJax.typesetPromise([feedback]).catch(err => {
        console.error('MathJax エラー:', err);
      });
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
}
