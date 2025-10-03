export class LessonRenderer {
  constructor() {
    this.container = document.getElementById('lesson-content');
    this.progressManager = null;
    this.currentCourseId = null;
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

    // 重要度に応じたクラスを取得
    const importanceClass = `lesson-${lesson.importance || 'medium'}`;
    
    // コンテナをクリア
    this.container.innerHTML = '';
    this.container.className = importanceClass;

    // レッスン構築
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

  createExplanation(text) {
    const explanation = document.createElement('div');
    explanation.className = 'lesson-explanation';
    explanation.innerHTML = `<div>${text}</div>`;
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
      li.textContent = concept;
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
    question.innerHTML = `<strong>問題 ${index + 1}:</strong> ${problem.question}`;
    container.appendChild(question);

    // 入力欄
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'problem-input';
    input.placeholder = '答えを入力してください';
    input.id = `answer-${index}`;
    container.appendChild(input);

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
    checkBtn.onclick = () => this.checkAnswer(problem, input.value, container, lessonId);
    actions.appendChild(checkBtn);

    container.appendChild(actions);

    return container;
  }

  showHint(problem, container) {
    // 既存のヒントを削除
    const existingHint = container.querySelector('.hint-container');
    if (existingHint) {
      existingHint.remove();
      return;
    }

    const hintContainer = document.createElement('div');
    hintContainer.className = 'hint-container';
    hintContainer.textContent = problem.hints[0];

    container.appendChild(hintContainer);
  }

  checkAnswer(problem, userAnswer, container, lessonId) {
    // 既存のフィードバックを削除
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

    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
    
    if (isCorrect) {
      feedback.textContent = '正解です！よくできました。';
    } else {
      feedback.innerHTML = `不正解です。<br>正しい答え: ${problem.answer}`;
      if (problem.feedback && problem.feedback.incorrect) {
        feedback.innerHTML += `<br><br>${problem.feedback.incorrect}`;
      }
    }

    container.appendChild(feedback);

    // MathJaxで再レンダリング
    if (window.MathJax) {
      MathJax.typesetPromise([feedback]).catch(err => {
        console.error('MathJax エラー:', err);
      });
    }
  }

  normalizeAnswer(answer) {
    return String(answer).trim().toLowerCase().replace(/\s+/g, '');
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
