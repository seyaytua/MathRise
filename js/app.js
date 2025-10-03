import { CourseLoader } from './loader.js';
import { LessonRenderer } from './renderer.js';

class App {
  constructor() {
    this.loader = new CourseLoader();
    this.renderer = new LessonRenderer();
    this.currentCourse = null;
    this.currentLessonIndex = 0;
    this.allLessons = [];
  }

  async init() {
    console.log('🚀 アプリを起動中...');

    try {
      // MathJaxの初期化
      await this.initMathJax();

      // イベントリスナーの設定
      this.setupEventListeners();

      // デフォルトコースの読み込み
      await this.loadCourse('math-1-sample');

      console.log('✅ アプリ起動完了！');
    } catch (error) {
      console.error('❌ 起動エラー:', error);
      this.showError('アプリの起動に失敗しました');
    }
  }

  async initMathJax() {
    return new Promise((resolve) => {
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$']],
          displayMath: [['$$', '$$']]
        },
        startup: {
          ready: () => {
            MathJax.startup.defaultReady();
            console.log('✅ MathJax 初期化完了');
            resolve();
          }
        }
      };

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    });
  }

  setupEventListeners() {
    // コース選択
    const courseSelect = document.getElementById('course-select');
    if (courseSelect) {
      courseSelect.addEventListener('change', (e) => {
        this.loadCourse(e.target.value);
      });
    }

    // ナビゲーションボタン
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigateLesson(-1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigateLesson(1));
    }
  }

  async loadCourse(courseId) {
    try {
      console.log(`📚 コース読み込み中: ${courseId}`);
      
      this.currentCourse = await this.loader.loadCourse(courseId);
      
      // 全レッスンをフラット化
      this.allLessons = [];
      this.currentCourse.units.forEach(unit => {
        this.allLessons.push(...unit.lessons);
      });

      // サイドバーを更新
      this.renderSidebar();

      // 最初のレッスンを表示
      this.currentLessonIndex = 0;
      this.renderCurrentLesson();

      console.log(`✅ コース読み込み完了: ${this.allLessons.length} レッスン`);
    } catch (error) {
      console.error('❌ コース読み込みエラー:', error);
      this.showError('コースの読み込みに失敗しました');
    }
  }

  renderSidebar() {
    const sidebar = document.getElementById('lesson-list');
    if (!sidebar) return;

    sidebar.innerHTML = '';

    this.currentCourse.units.forEach(unit => {
      const unitGroup = document.createElement('div');
      unitGroup.className = 'unit-group';

      const unitTitle = document.createElement('div');
      unitTitle.className = 'unit-title';
      unitTitle.textContent = unit.unitName;
      unitGroup.appendChild(unitTitle);

      unit.lessons.forEach((lesson, index) => {
        const lessonItem = document.createElement('div');
        lessonItem.className = 'lesson-item';
        
        const emoji = this.renderer.getImportanceEmoji(lesson.importance);
        lessonItem.textContent = `${emoji} ${lesson.title}`;
        
        lessonItem.onclick = () => {
          this.currentLessonIndex = this.allLessons.indexOf(lesson);
          this.renderCurrentLesson();
        };

        unitGroup.appendChild(lessonItem);
      });

      sidebar.appendChild(unitGroup);
    });
  }

  renderCurrentLesson() {
    if (this.allLessons.length === 0) return;

    const lesson = this.allLessons[this.currentLessonIndex];
    this.renderer.renderLesson(lesson);

    // サイドバーのアクティブ状態を更新
    document.querySelectorAll('.lesson-item').forEach((item, index) => {
      item.classList.toggle('active', index === this.currentLessonIndex);
    });

    // ナビゲーションボタンの状態を更新
    this.updateNavigationButtons();

    // 進捗バーを更新
    this.updateProgress();
  }

  navigateLesson(direction) {
    const newIndex = this.currentLessonIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.allLessons.length) {
      this.currentLessonIndex = newIndex;
      this.renderCurrentLesson();
      
      // ページトップにスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
      prevBtn.disabled = this.currentLessonIndex === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentLessonIndex === this.allLessons.length - 1;
    }
  }

  updateProgress() {
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');

    if (progressText && progressFill) {
      const progress = Math.round(((this.currentLessonIndex + 1) / this.allLessons.length) * 100);
      progressText.textContent = `進捗: ${progress}%`;
      progressFill.style.width = `${progress}%`;
    }
  }

  showError(message) {
    const content = document.getElementById('lesson-content');
    if (content) {
      content.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 3rem; color: var(--error);">
          <h2>❌ エラー</h2>
          <p>${message}</p>
        </div>
      `;
    }
  }
}

// アプリケーション起動
const app = new App();
app.init();
