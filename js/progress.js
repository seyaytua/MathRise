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
      console.error('進捗データの読み込みエラー:', error);
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
    }
    return this.data.courses[courseId];
  }

  /**
   * レッスン完了をマーク
   */
  markLessonCompleted(courseId, lessonId) {
    const course = this.data.courses[courseId];
    if (!course) return;

    if (!course.completedLessons.includes(lessonId)) {
      course.completedLessons.push(lessonId);
      course.lastStudied = new Date().toISOString();
      this.save();
      console.log(`✓ レッスン完了: ${lessonId}`);
    }
  }

  /**
   * レッスンが完了済みかチェック
   */
  isLessonCompleted(courseId, lessonId) {
    const course = this.data.courses[courseId];
    return course ? course.completedLessons.includes(lessonId) : false;
  }

  /**
   * 問題の進捗を記録
   */
  recordProblemAttempt(courseId, lessonId, problemId, isCorrect) {
    const course = this.data.courses[courseId];
    if (!course) return;

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
    return course ? course.currentLesson : 0;
  }

  /**
   * コースの完了率を計算
   */
  getCourseProgress(courseId) {
    const course = this.data.courses[courseId];
    if (!course || course.totalLessons === 0) return 0;

    return Math.round(
      (course.completedLessons.length / course.totalLessons) * 100
    );
  }

  /**
   * レッスンの正答率を取得
   */
  getLessonAccuracy(courseId, lessonId) {
    const course = this.data.courses[courseId];
    if (!course || !course.lessonProgress[lessonId]) return null;

    const progress = course.lessonProgress[lessonId];
    if (progress.attempts === 0) return null;

    return Math.round(
      (progress.correctAnswers / progress.attempts) * 100
    );
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

    return {
      completedLessons: course.completedLessons.length,
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
          console.error('インポートエラー:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}
