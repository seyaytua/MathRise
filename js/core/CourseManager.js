/**
 * コース管理の中枢
 * すべてのコース情報を管理する
 */
export class CourseManager {
  constructor() {
    this.coursesData = null;      // courses.json のデータ
    this.loadedCourses = new Map(); // 読み込み済みコース詳細
    this.currentCourse = null;
    this.currentChapter = null;
  }

  /**
   * 初期化：コース一覧を読み込む
   */
  async init() {
    try {
      const response = await fetch('data/courses.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.coursesData = await response.json();
      console.log('✅ コース一覧を読み込みました:', this.coursesData.courses.length, 'コース');
      return this.coursesData;
    } catch (error) {
      console.error('❌ コース一覧の読み込みエラー:', error);
      throw error;
    }
  }

  /**
   * すべてのコース情報を取得（カセット表示用）
   */
  getAllCourses() {
    if (!this.coursesData) {
      throw new Error('CourseManager が初期化されていません。init() を先に呼び出してください。');
    }
    return this.coursesData.courses;
  }

  /**
   * 特定のコース情報を取得
   */
  getCourse(courseId) {
    if (!this.coursesData) {
      throw new Error('CourseManager が初期化されていません');
    }
    return this.coursesData.courses.find(c => c.id === courseId);
  }

  /**
   * チャプターを読み込む
   */
  async loadChapter(courseId, chapterId) {
    const course = this.getCourse(courseId);
    if (!course) {
      throw new Error(`コースが見つかりません: ${courseId}`);
    }

    const chapter = course.chapters.find(ch => ch.id === chapterId);
    if (!chapter) {
      throw new Error(`チャプターが見つかりません: ${chapterId} (コース: ${courseId})`);
    }

    // キャッシュチェック
    const cacheKey = `${courseId}:${chapterId}`;
    if (this.loadedCourses.has(cacheKey)) {
      console.log(`📦 キャッシュからチャプターを取得: ${chapter.name}`);
      return this.loadedCourses.get(cacheKey);
    }

    // ファイル読み込み
    try {
      const response = await fetch(chapter.file);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // キャッシュに保存
      this.loadedCourses.set(cacheKey, data);
      
      console.log(`✅ チャプターを読み込みました: ${chapter.name}`);
      return data;
    } catch (error) {
      console.error(`❌ チャプター読み込みエラー: ${chapterId}`, error);
      throw error;
    }
  }

  /**
   * コースの全チャプターを取得
   */
  getChapters(courseId) {
    const course = this.getCourse(courseId);
    return course ? course.chapters : [];
  }

  /**
   * ロック状態をチェック
   */
  isLocked(courseId) {
    const course = this.getCourse(courseId);
    return course ? course.locked : true;
  }

  /**
   * コースのメタ情報を読み込む
   */
  async loadCourseMeta(courseId) {
    try {
      const response = await fetch(`data/courses/${courseId}/meta.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const meta = await response.json();
      console.log(`✅ コースメタ情報を読み込みました: ${meta.courseName}`);
      return meta;
    } catch (error) {
      console.error(`❌ メタ情報読み込みエラー: ${courseId}`, error);
      return null;
    }
  }

  /**
   * キャッシュをクリア
   */
  clearCache() {
    this.loadedCourses.clear();
    console.log('🗑️ キャッシュをクリアしました');
  }
}
