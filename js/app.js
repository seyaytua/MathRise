/**
 * MathRise - メインアプリケーション
 * データ駆動型アーキテクチャ
 */

// コアシステム
import { CourseManager } from './core/CourseManager.js';
import { CartridgeManager } from './core/CartridgeManager.js';

// UI層
import { LessonRenderer } from './ui/LessonRenderer.js';
import { Dashboard } from './ui/Dashboard.js';

// マネージャー
import { ProgressManager } from './managers/ProgressManager.js';

class App {
  constructor() {
    // コアシステム
    this.courseManager = new CourseManager();
    this.progressManager = new ProgressManager();
    
    // UI層
    this.cartridgeManager = null;
    this.renderer = new LessonRenderer();
    this.dashboard = new Dashboard(this.progressManager);
    
    // 状態
    this.currentCourse = null;
    this.currentCourseId = null;
    this.currentChapterId = null;
    this.currentLessonIndex = 0;
    this.allLessons = [];
    this.currentMode = 'learn';
    this.isInitialized = false;
  }

  async init() {
    console.log('🚀 MathRise アプリを起動中...');

    try {
      // 1. イベントリスナーの設定
      this.setupEventListeners();

      // 2. MathJaxの初期化
      await this.initMathJax();

      // 3. コース管理システムの初期化
      await this.courseManager.init();
      console.log('✅ コース管理システム初期化完了');

      // 4. カセットマネージャーの初期化
      this.cartridgeManager = new CartridgeManager(
        this.courseManager,
        this.progressManager
      );
      console.log('✅ カセットマネージャー初期化完了');

      // 5. URLパラメータからコースとチャプターを取得
      const params = new URLSearchParams(window.location.search);
      const courseId = params.get('course');
      const chapterId = params.get('chapter');
      const mode = params.get('mode');

      console.log('📝 URLパラメータ:', { courseId, chapterId, mode });

      if (courseId && chapterId) {
        // 学習画面
        await this.loadChapter(courseId, chapterId);
        
        // モード切り替え
        if (mode === 'stats') {
          this.switchMode('stats');
        }
      } else if (courseId) {
        // コース選択画面（最初のチャプターを表示）
        console.log('📚 コースIDのみ指定されています:', courseId);
        const chapters = this.courseManager.getChapters(courseId);
        console.log('📖 利用可能なチャプター:', chapters);
        
        if (chapters.length > 0) {
          await this.loadChapter(courseId, chapters[0].id);
        } else {
          this.showError('このコースにはまだチャプターがありません');
        }
      } else {
        // コースが指定されていない場合
        this.showError('コースが指定されていません。ホーム画面から選択してください。');
      }

      this.isInitialized = true;
      console.log('✅ MathRise アプリ起動完了！');
    } catch (error) {
      console.error('❌ 起動エラー:', error);
      this.showError('アプリの起動に失敗しました: ' + error.message);
    }
  }

  async initMathJax() {
    return new Promise((resolve) => {
      if (window.MathJax) {
        console.log('✅ MathJax は既に読み込まれています');
        resolve();
        return;
      }

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
        const chapterId = e.target.value;
        if (this.currentCourseId) {
          this.loadChapter(this.currentCourseId, chapterId);
        }
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
      exportBtn.addEventListener('click', () => this.progressManager.export());
    }

    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.progressManager.import(e.target.files[0]).then(() => {
            alert('データをインポートしました！');
            this.refreshDashboard();
            this.renderSidebar();
            this.updateProgress();
          }).catch(err => {
            alert('インポートに失敗しました: ' + err.message);
          });
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.progressManager.resetCourse(this.currentCourseId)) {
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
          e.preventDefault();
          this.navigateLesson(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
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
      if (learnMode) learnMode.style.display = 'flex';
      if (statsMode) statsMode.style.display = 'none';
      if (navLearn) navLearn.classList.add('active');
      if (navStats) navStats.classList.remove('active');
    } else {
      if (learnMode) learnMode.style.display = 'none';
      if (statsMode) statsMode.style.display = 'block';
      if (navLearn) navLearn.classList.remove('active');
      if (navStats) navStats.classList.add('active');
      this.refreshDashboard();
    }
  }

  refreshDashboard() {
    if (this.currentCourse && this.currentCourseId) {
      this.dashboard.render(this.currentCourseId, this.currentCourse.courseName);
    }
  }

  async loadChapter(courseId, chapterId) {
    try {
      console.log(`📚 チャプター読み込み中: ${courseId} / ${chapterId}`);
      
      // チャプターデータを読み込み
      const chapterData = await this.courseManager.loadChapter(courseId, chapterId);
      console.log('✅ チャプターデータ取得成功:', chapterData.courseName);
      
      this.currentCourse = chapterData;
      this.currentCourseId = courseId;
      this.currentChapterId = chapterId;
      
      // 全レッスンを取得
      this.allLessons = [];
      chapterData.units.forEach(unit => {
        this.allLessons.push(...unit.lessons);
      });
      console.log(`📖 レッスン数: ${this.allLessons.length}`);

      // 進捗管理の初期化
      this.progressManager.initCourse(courseId, this.allLessons.length);
      
      // 現在のレッスン位置を取得（サイドバーより先に！）
      this.currentLessonIndex = this.progressManager.getCurrentLesson(courseId);
      console.log(`📍 現在のレッスンインデックス: ${this.currentLessonIndex}`);
      
      // サイドバーをレンダリング
      this.renderSidebar();
      
      // レッスンを表示
      this.renderCurrentLesson();

      // 統計モードの場合は切り替え
      if (this.currentMode === 'stats') {
        this.refreshDashboard();
      }

      // チャプター選択のドロップダウンを更新
      this.updateChapterSelector(courseId, chapterId);

      console.log(`✅ チャプター読み込み完了: ${this.allLessons.length} レッスン`);
    } catch (error) {
      console.error('❌ チャプター読み込みエラー:', error);
      this.showError('チャプターの読み込みに失敗しました: ' + error.message);
    }
  }

  updateChapterSelector(courseId, currentChapterId) {
    const courseSelect = document.getElementById('course-select');
    if (!courseSelect) return;

    const chapters = this.courseManager.getChapters(courseId);
    
    courseSelect.innerHTML = chapters.map(chapter => `
      <option value="${chapter.id}" ${chapter.id === currentChapterId ? 'selected' : ''}>
        ${chapter.name}
      </option>
    `).join('');
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
        
        if (this.progressManager.isLessonCompleted(this.currentCourseId, lesson.id)) {
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
    if (this.allLessons.length === 0) {
      console.warn('⚠️ レッスンが0件です');
      return;
    }

    // インデックスの範囲チェック
    if (this.currentLessonIndex < 0 || this.currentLessonIndex >= this.allLessons.length) {
      console.warn(`⚠️ 無効なインデックス: ${this.currentLessonIndex} (レッスン数: ${this.allLessons.length})`);
      this.currentLessonIndex = 0;
    }

    const lesson = this.allLessons[this.currentLessonIndex];
    
    if (!lesson) {
      console.error('❌ レッスンが取得できません:', {
        currentLessonIndex: this.currentLessonIndex,
        allLessonsLength: this.allLessons.length,
        allLessons: this.allLessons
      });
      return;
    }
    
    console.log(`🎯 レッスンをレンダリング: [${this.currentLessonIndex}] ${lesson.title}`);
    
    this.renderer.setProgressManager(this.progressManager, this.currentCourseId);
    this.renderer.renderLesson(lesson);

    this.progressManager.setCurrentLesson(this.currentCourseId, this.currentLessonIndex);

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
      const progress = this.progressManager.getCourseProgress(this.currentCourseId);
      progressText.textContent = `進捗: ${progress}%`;
      progressFill.style.width = `${progress}%`;
    }
  }

  showError(message) {
    const content = document.getElementById('lesson-content');
    if (content) {
      content.innerHTML = `
        <div class="error-message">
          <h2>❌ エラー</h2>
          <p>${message}</p>
          <button class="btn btn-primary" onclick="location.href='home.html'">
            ホームに戻る
          </button>
        </div>
      `;
    }
  }
}

// アプリ起動
window.app = new App();
window.app.init();
