import { CourseLoader } from './loader.js';
import { LessonRenderer } from './renderer.js';
import { ProgressManager } from './progress.js';
import { Dashboard } from './dashboard.js';

class App {
  constructor() {
    this.loader = new CourseLoader();
    this.renderer = new LessonRenderer();
    this.progress = new ProgressManager();
    this.dashboard = new Dashboard(this.progress);
    this.currentCourse = null;
    this.currentCourseId = null;
    this.currentLessonIndex = 0;
    this.allLessons = [];
    this.currentMode = 'learn';
  }

  async init() {
    console.log('🚀 アプリを起動中...');

    try {
      await this.initMathJax();
      this.setupEventListeners();
      await this.loadCourse('math-1-sample');
      console.log('✅ アプリ起動完了！');
    } catch (error) {
      console.error('❌起動エラー:', error);
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
    // レッスン完了イベント
    window.addEventListener('lessonCompleted', () => {
      this.renderSidebar();
      this.updateProgress();
    });

    // モード切り替え
    const navLearn = document.getElementById('nav-learn');
    const navStats = document.getElementById('nav-stats');

    if (navLearn) {
      navLearn.addEventListener('click', () => this.switchMode('learn'));
    }

    if (navStats) {
      navStats.addEventListener('click', () => this.switchMode('stats'));
    }

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

    // データ管理ボタン
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const resetBtn = document.getElementById('reset-btn');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.progress.export());
    }

    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.progress.import(e.target.files[0]).then(() => {
            alert('データをインポートしました！');
            this.refreshDashboard();
          }).catch(err => {
            alert('インポートに失敗しました: ' + err.message);
          });
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.progress.resetCourse(this.currentCourseId)) {
          this.refreshDashboard();
          this.renderSidebar();
          this.updateProgress();
          alert('進捗をリセットしました');
        }
      });
    }

    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
      if (this.currentMode === 'learn' && !e.target.matches('input, textarea')) {
        if (e.key === 'ArrowLeft') {
          this.navigateLesson(-1);
        } else if (e.key === 'ArrowRight') {
          this.navigateLesson(1);
        }
      }
    });
  }

  switchMode(mode) {
    this.currentMode = mode;

    const learnMode = document.getElementById('learn-mode');
    const statsMode = document.getElementById('stats-mode');
    const navLearn = document.getElementById('nav-learn');
    const navStats = document.getElementById('nav-stats');

    if (mode === 'learn') {
      learnMode.style.display = 'flex';
      statsMode.style.display = 'none';
      navLearn.classList.add('active');
      navStats.classList.remove('active');
    } else {
      learnMode.style.display = 'none';
      statsMode.style.display = 'block';
      navLearn.classList.remove('active');
      navStats.classList.add('active');
      this.refreshDashboard();
    }
  }

  refreshDashboard() {
    if (this.currentCourse) {
      this.dashboard.render(this.currentCourseId, this.currentCourse.courseName);
    }
  }

  async loadCourse(courseId) {
    try {
      console.log(`📚 コース読み込み中: ${courseId}`);
      
      this.currentCourse = await this.loader.loadCourse(courseId);
      this.currentCourseId = courseId;
      
      this.allLessons = [];
      this.currentCourse.units.forEach(unit => {
        this.allLessons.push(...unit.lessons);
      });

      this.progress.initCourse(courseId, this.allLessons.length);
      this.renderSidebar();
      this.currentLessonIndex = this.progress.getCurrentLesson(courseId);
      this.renderCurrentLesson();

      if (this.currentMode === 'stats') {
        this.refreshDashboard();
      }

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

      unit.lessons.forEach((lesson) => {
        const lessonItem = document.createElement('div');
        lessonItem.className = 'lesson-item';
        
        if (this.progress.isLessonCompleted(this.currentCourseId, lesson.id)) {
          lessonItem.classList.add('completed');
        }
        
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
    
    this.renderer.setProgressManager(this.progress, this.currentCourseId);
    this.renderer.renderLesson(lesson);

    this.progress.setCurrentLesson(this.currentCourseId, this.currentLessonIndex);

    document.querySelectorAll('.lesson-item').forEach((item, index) => {
      item.classList.toggle('active', index === this.currentLessonIndex);
    });

    this.updateNavigationButtons();
    this.updateProgress();
  }

  navigateLesson(direction) {
    const newIndex = this.currentLessonIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.allLessons.length) {
      this.currentLessonIndex = newIndex;
      this.renderCurrentLesson();
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
      const progress = this.progress.getCourseProgress(this.currentCourseId);
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

const app = new App();
app.init();
