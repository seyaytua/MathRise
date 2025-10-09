/**
 * 汎用データローダー
 * JSONファイルの読み込みを管理
 */
export class DataLoader {
  constructor() {
    this.cache = new Map();
  }

  /**
   * JSONファイルを読み込む
   */
  async loadJSON(url, useCache = true) {
    // キャッシュチェック
    if (useCache && this.cache.has(url)) {
      console.log(`📦 キャッシュから取得: ${url}`);
      return this.cache.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // キャッシュに保存
      if (useCache) {
        this.cache.set(url, data);
      }
      
      console.log(`✅ データを読み込みました: ${url}`);
      return data;
    } catch (error) {
      console.error(`❌ データ読み込みエラー: ${url}`, error);
      throw error;
    }
  }

  /**
   * 複数のJSONファイルを並行読み込み
   */
  async loadMultiple(urls, useCache = true) {
    try {
      const promises = urls.map(url => this.loadJSON(url, useCache));
      const results = await Promise.all(promises);
      console.log(`✅ ${urls.length}個のファイルを読み込みました`);
      return results;
    } catch (error) {
      console.error('❌ 複数ファイル読み込みエラー:', error);
      throw error;
    }
  }

  /**
   * キャッシュをクリア
   */
  clearCache(url = null) {
    if (url) {
      this.cache.delete(url);
      console.log(`🗑️ キャッシュをクリア: ${url}`);
    } else {
      this.cache.clear();
      console.log('🗑️ すべてのキャッシュをクリア');
    }
  }

  /**
   * キャッシュサイズを取得
   */
  getCacheSize() {
    return this.cache.size;
  }
}
