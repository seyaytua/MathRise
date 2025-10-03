export class CourseLoader {
  constructor() {
    this.cache = new Map();
  }

  async loadCourse(courseId) {
    // キャッシュチェック
    if (this.cache.has(courseId)) {
      return this.cache.get(courseId);
    }

    try {
      const response = await fetch(`courses/${courseId}.json`);
      
      if (!response.ok) {
        throw new Error(`コースの読み込みに失敗: ${response.status}`);
      }

      const data = await response.json();
      const validatedData = this.validateCourse(data);
      
      // キャッシュに保存
      this.cache.set(courseId, validatedData);
      
      return validatedData;
    } catch (error) {
      console.error('❌ コース読み込みエラー:', error);
      throw error;
    }
  }

  validateCourse(data) {
    // 必須フィールドのチェック
    const required = ['courseId', 'courseName', 'units'];
    
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`必須フィールドがありません: ${field}`);
      }
    }

    // 単元の検証
    if (!Array.isArray(data.units) || data.units.length === 0) {
      throw new Error('単元が定義されていません');
    }

    // レッスンの検証
    for (const unit of data.units) {
      if (!unit.lessons || unit.lessons.length === 0) {
        throw new Error(`単元 ${unit.unitName} にレッスンがありません`);
      }
    }

    console.log('✅ コースの検証完了:', data.courseName);
    return data;
  }

  clearCache() {
    this.cache.clear();
  }
}
