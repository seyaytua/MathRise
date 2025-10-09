/**
 * カセット（コース選択UI）の管理
 */
export class CartridgeManager {
  constructor(courseManager, progressManager) {
    this.courseManager = courseManager;
    this.progressManager = progressManager;
    this.currentIndex = 0;
  }

  /**
   * カセット一覧を取得（進捗情報を付加）
   */
  getCartridges() {
    const courses = this.courseManager.getAllCourses();
    
    return courses.map(course => {
      // 進捗情報を取得
      let progress = 0;
      let lastAccessed = null;

      if (this.progressManager) {
        const courseProgress = this.progressManager.data.courses[course.id];
        if (courseProgress) {
          // 全チャプターの進捗を計算
          const totalLessons = courseProgress.totalLessons || 1;
          const completedLessons = courseProgress.completedLessons?.length || 0;
          progress = Math.round((completedLessons / totalLessons) * 100);
          lastAccessed = courseProgress.lastStudied || null;
        }
      }
      
      return {
        ...course,
        progress: progress,
        lastAccessed: lastAccessed
      };
    });
  }

  /**
   * 最近使用順にソート
   */
  sortByRecentlyUsed(cartridges) {
    return cartridges.sort((a, b) => {
      // ロック状態は最後
      if (a.locked && !b.locked) return 1;
      if (!a.locked && b.locked) return -1;
      
      // 最近使用順
      if (!a.lastAccessed && !b.lastAccessed) return 0;
      if (!a.lastAccessed) return 1;
      if (!b.lastAccessed) return -1;
      
      return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    });
  }

  /**
   * カセットをフィルタリング
   */
  filterCartridges(cartridges, options = {}) {
    let filtered = [...cartridges];

    // ロック状態でフィルタ
    if (options.showLocked === false) {
      filtered = filtered.filter(c => !c.locked);
    }

    // 難易度でフィルタ
    if (options.difficulty) {
      filtered = filtered.filter(c => c.difficulty === options.difficulty);
    }

    // 進捗でフィルタ
    if (options.minProgress !== undefined) {
      filtered = filtered.filter(c => c.progress >= options.minProgress);
    }

    return filtered;
  }
}
