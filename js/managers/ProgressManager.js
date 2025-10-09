/**
 * 進捗管理マネージャー
 */
export class ProgressManager {
  constructor() {
    this.storageKey = 'mathrise_progress';
    this.data = this.load();
  }

  /**
   * 進捗データの読み込み
   */
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ 進捗データの読み込みエラー:', error);
    }

    // デフォルトデータ
    return {
      version: '1.0.0',
      lastAccessed: new Date().toISOString(),
      courses: {}
    };
  }

  /**
   * 進捗データの保存
   */
  save() {
    try {
      this.data.lastAccessed = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      console.log('✅ 進捗を保存しました');
    } catch (error) {
      console.error('❌ 進捗の保存エラー:', error);
    }
  }

  /**
   * コース進捗の初期化
   */
  initCourse(courseId, totalLessons) {
    console.log(`🔧 initCourse: ${courseId}, totalLessons: ${totalLessons}`);
    
    if (!this.data.courses[courseId]) {
      this.data.courses[courseId] = {
        totalLessons: totalLessons,
        completedLessons: [],
        currentLesson: 0,
        lessonProgress: {},
        startedAt: new Date().toISOString(),
        lastStudied: new Date().toISOString(),
        totalStudyTime: 0
      };
      this.save();
      console.log(`✅ コース ${courseId} を初期化しました`);
    } else {
      // 既存データがある場合も必須フィールドを保証
      const course = this.data.courses[courseId];
      
      if (!Array.isArray(course.completedLessons)) {
        course.completedLessons = [];
      }
      if (!course.lessonProgress) {
        course.lessonProgress = {};
      }
      if (typeof course.currentLesson !== 'number') {
        course.currentLesson = 0;
      }
      // totalLessons を更新（チャプターが変わった場合に対応）
      if (course.totalLessons !== totalLessons) {
        console.log(`📊 totalLessons を更新: ${course.totalLessons} → ${totalLessons}`);
        course.totalLessons = totalLessons;
        this.save();
      }
      
      console.log(`✅ コース ${courseId} の既存データを確認しました`);
    }
    return this.data.courses[courseId];
  }

  /**
   * レッスン完了をマーク
   */
  markLessonCompleted(courseId, lessonId) {
    console.log(`📝 markLessonCompleted: ${courseId} / ${lessonId}`);
    
    const course = this.data.courses[courseId];
    if (!course) {
      console.warn(`⚠️ コース ${courseId} が初期化されていません`);
      return;
    }

    // completedLessons が配列であることを保証
    if (!Array.isArray(course.completedLessons)) {
      course.completedLessons = [];
    }

    if (!course.completedLessons.includes(lessonId)) {
      course.completedLessons.push(lessonId);
      course.lastStudied = new Date().toISOString();
      this.save();
      console.log(`✅ レッスン完了: ${lessonId} (合計: ${course.completedLessons.length}/${course.totalLessons})`);
    } else {
      console.log(`ℹ️ レッスン ${lessonId} は既に完了済み`);
    }
  }

  /**
   * レッスンが完了済みかチェック
   */
  isLessonCompleted(courseId, lessonId) {
    const course = this.data.courses[courseId];
    if (!course) {
      return false;
    }
    
    // completedLessons が配列であることを保証
    if (!Array.isArray(course.completedLessons)) {
      return false;
    }
    
    return course.completedLessons.includes(lessonId);
  }

  /**
   * 問題の進捗を記録
   */
  recordProblemAttempt(courseId, lessonId, problemId, isCorrect) {
    const course = this.data.courses[courseId];
    if (!course) {
      console.warn(`⚠️ コース ${courseId} が初期化されていません`);
      return;
    }

    if (!course.lessonProgress[lessonId]) {
      course.lessonProgress[lessonId] = {
        problems: {},
        attempts: 0,
        correctAnswers: 0,
        lastAttempt: null
      };
    }

    const lessonProgress = course.lessonProgress[lessonId];
    
    if (!lessonProgress.problems[problemId]) {
      lessonProgress.problems[problemId] = {
        attempts: 0,
        correctAttempts: 0,
        firstCorrect: null,
        lastAttempt: null
      };
    }

    const problemProgress = lessonProgress.problems[problemId];
    problemProgress.attempts++;
    problemProgress.lastAttempt = new Date().toISOString();

    if (isCorrect) {
      problemProgress.correctAttempts++;
      if (!problemProgress.firstCorrect) {
        problemProgress.firstCorrect = new Date().toISOString();
      }
      lessonProgress.correctAnswers++;
    }

    lessonProgress.attempts++;
    lessonProgress.lastAttempt = new Date().toISOString();

    this.save();
  }

  /**
   * 現在のレッスン位置を保存
   */
  setCurrentLesson(courseId, lessonIndex) {
    const course = this.data.courses[courseId];
    if (course) {
      course.currentLesson = lessonIndex;
      course.lastStudied = new Date().toISOString();
      this.save();
    }
  }

  /**
   * 現在のレッスン位置を取得
   */
  getCurrentLesson(courseId) {
    const course = this.data.courses[courseId];
    
    // コースが存在しない場合
    if (!course) {
      console.warn(`⚠️ コース ${courseId} が見つかりません。0 を返します。`);
      return 0;
    }
    
    // currentLesson が数値でない場合
    if (typeof course.currentLesson !== 'number') {
      console.warn(`⚠️ currentLesson が数値ではありません: ${course.currentLesson}。0 を返します。`);
      return 0;
    }
    
    return course.currentLesson;
  }

  /**
   * コースの完了率を計算（改善版）
   */
  getCourseProgress(courseId) {
    const course = this.data.courses[courseId];
    
    // コースが存在しない場合
    if (!course) {
      console.warn(`⚠️ getCourseProgress: コース ${courseId} が見つかりません`);
      return 0;
    }
    
    // totalLessons が不正な値の場合
    if (!course.totalLessons || course.totalLessons <= 0) {
      console.warn(`⚠️ getCourseProgress: totalLessons が不正です (${course.totalLessons})`);
      return 0;
    }

    // completedLessons が配列であることを保証
    const completedCount = Array.isArray(course.completedLessons) 
      ? course.completedLessons.length 
      : 0;

    const progress = Math.round((completedCount / course.totalLessons) * 100);
    
    console.log(`📊 進捗計算: ${completedCount}/${course.totalLessons} = ${progress}%`);
    
    return progress;
  }

  /**
   * レッスンの正答率を取得
   */
  getLessonAccuracy(courseId, lessonId) {
    const course = this.data.courses[courseId];
    if (!course || !course.lessonProgress[lessonId]) return null;

    const progress = course.lessonProgress[lessonId];
    if (progress.attempts === 0) return null;

    return Math.round((progress.correctAnswers / progress.attempts) * 100);
  }

  /**
   * 最終アクセス日時を取得
   */
  getLastAccessed(courseId) {
    const course = this.data.courses[courseId];
    return course ? course.lastStudied : null;
  }

  /**
   * 統計情報の取得
   */
  getStatistics(courseId) {
    const course = this.data.courses[courseId];
    if (!course) return null;

    const totalProblems = Object.keys(course.lessonProgress).reduce(
      (sum, lessonId) => {
        const lesson = course.lessonProgress[lessonId];
        return sum + Object.keys(lesson.problems).length;
      },
      0
    );

    const totalAttempts = Object.keys(course.lessonProgress).reduce(
      (sum, lessonId) => {
        return sum + course.lessonProgress[lessonId].attempts;
      },
      0
    );

    const totalCorrect = Object.keys(course.lessonProgress).reduce(
      (sum, lessonId) => {
        return sum + course.lessonProgress[lessonId].correctAnswers;
      },
      0
    );

    // completedLessons が配列であることを保証
    const completedCount = Array.isArray(course.completedLessons) 
      ? course.completedLessons.length 
      : 0;

    return {
      completedLessons: completedCount,
      totalLessons: course.totalLessons,
      progressPercentage: this.getCourseProgress(courseId),
      totalProblems: totalProblems,
      totalAttempts: totalAttempts,
      totalCorrect: totalCorrect,
      accuracy: totalAttempts > 0 
        ? Math.round((totalCorrect / totalAttempts) * 100)
        : 0,
      startedAt: course.startedAt,
      lastStudied: course.lastStudied
    };
  }

  /**
   * 進捗データのリセット
   */
  resetCourse(courseId) {
    if (confirm('このコースの進捗をリセットしますか？')) {
      delete this.data.courses[courseId];
      this.save();
      console.log(`🔄 コース ${courseId} をリセットしました`);
      return true;
    }
    return false;
  }

  /**
   * 全データのリセット
   */
  resetAll() {
    if (confirm('すべての進捗データをリセットしますか？この操作は取り消せません。')) {
      localStorage.removeItem(this.storageKey);
      this.data = this.load();
      console.log('🔄 すべての進捗をリセットしました');
      return true;
    }
    return false;
  }

  /**
   * データのエクスポート
   */
  export() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mathrise_progress_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('📥 進捗データをエクスポートしました');
  }

  /**
   * データのインポート
   */
  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          
          // 簡易的なバリデーション
          if (imported.version && imported.courses) {
            this.data = imported;
            this.save();
            console.log('📤 進捗データをインポートしました');
            resolve(true);
          } else {
            throw new Error('無効なデータ形式');
          }
        } catch (error) {
          console.error('❌ インポートエラー:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}
