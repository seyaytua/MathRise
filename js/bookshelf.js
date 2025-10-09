/**
 * 本棚管理システム
 */

class BookshelfManager {
  constructor() {
    this.textbooks = [];
    this.filteredTextbooks = [];
    this.searchInput = null;
    this.categoryFilter = null;
    this.difficultyFilter = null;
    this.sortBy = null;
  }

  /**
   * 初期化
   */
  async init() {
    try {
      // 教科書データの読み込み
      await this.loadTextbooks();
      
      // DOM要素の取得
      this.searchInput = document.getElementById('searchInput');
      this.categoryFilter = document.getElementById('categoryFilter');
      this.difficultyFilter = document.getElementById('difficultyFilter');
      this.sortBy = document.getElementById('sortBy');
      
      // イベントリスナーの設定
      this.setupEventListeners();
      
      // 初期表示
      this.filteredTextbooks = [...this.textbooks];
      this.renderBooks();
      this.updateStats();
      
      console.log('✅ BookshelfManager initialized');
    } catch (error) {
      console.error('❌ BookshelfManager initialization failed:', error);
      this.showError('教科書データの読み込みに失敗しました');
    }
  }

  /**
   * 教科書データの読み込み
   */
  async loadTextbooks() {
    try {
      const response = await fetch('data/textbooks/textbooks.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.textbooks = data.textbooks;
      console.log(`✅ Loaded ${this.textbooks.length} textbooks`);
    } catch (error) {
      console.error('❌ Failed to load textbooks:', error);
      throw error;
    }
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // 検索
    this.searchInput.addEventListener('input', () => this.applyFilters());
    
    // フィルター
    this.categoryFilter.addEventListener('change', () => this.applyFilters());
    this.difficultyFilter.addEventListener('change', () => this.applyFilters());
    
    // ソート
    this.sortBy.addEventListener('change', () => {
      this.sortBooks();
      this.renderBooks();
    });
    
    // 時計の更新
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  /**
   * フィルター適用
   */
  applyFilters() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const category = this.categoryFilter.value;
    const difficulty = this.difficultyFilter.value;
    
    this.filteredTextbooks = this.textbooks.filter(book => {
      // 検索フィルター
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm) ||
        book.subtitle.toLowerCase().includes(searchTerm) ||
        book.description.toLowerCase().includes(searchTerm);
      
      // カテゴリフィルター
      const matchesCategory = category === 'all' || book.category === category;
      
      // 難易度フィルター
      const matchesDifficulty = difficulty === 'all' || book.difficulty === difficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
    
    this.sortBooks();
    this.renderBooks();
    this.updateStats();
  }

  /**
   * ソート
   */
  sortBooks() {
    const sortType = this.sortBy.value;
    
    this.filteredTextbooks.sort((a, b) => {
      switch (sortType) {
        case 'title':
          return a.title.localeCompare(b.title, 'ja');
        case 'updated':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        case 'pages':
          return b.pages - a.pages;
        default:
          return 0;
      }
    });
  }

  /**
   * 本の表示
   */
  renderBooks() {
    const bookshelfRow = document.getElementById('bookshelfRow');
    const emptyState = document.getElementById('emptyState');
    
    if (this.filteredTextbooks.length === 0) {
      bookshelfRow.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    bookshelfRow.innerHTML = this.filteredTextbooks.map(book => `
      <div class="book-card" data-book-id="${book.id}" style="--book-color: ${book.color}; --book-color-dark: ${book.colorDark};">
        <div class="book-spine">
          <div>
            <div class="book-icon">${book.icon}</div>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-subtitle">${book.subtitle}</p>
          </div>
          
          <div>
            <div class="book-info">
              <div class="book-info-item">
                <span>📄 ページ数</span>
                <span>${book.pages}</span>
              </div>
              <div class="book-info-item">
                <span>📅 更新日</span>
                <span>${this.formatDate(book.lastUpdated)}</span>
              </div>
            </div>
            
            <div class="book-badges">
              <span class="book-badge">${book.category}</span>
              <span class="book-badge difficulty-${book.difficulty}">${book.difficulty}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    // クリックイベントの設定
    document.querySelectorAll('.book-card').forEach(card => {
      card.addEventListener('click', () => {
        const bookId = card.dataset.bookId;
        this.openTextbook(bookId);
      });
    });
  }

  /**
   * 教科書を開く
   */
  openTextbook(bookId) {
    const book = this.textbooks.find(b => b.id === bookId);
    if (!book) {
      console.error('❌ Book not found:', bookId);
      return;
    }
    
    // サウンド再生（SoundManagerが利用可能な場合）
    if (window.soundManager) {
      window.soundManager.play('confirm');
    }
    
    // 別ウィンドウで開く
    const width = 1200;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    window.open(
      book.file,
      `textbook_${bookId}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    console.log(`📖 Opened textbook: ${book.title}`);
  }

  /**
   * 統計情報の更新
   */
  updateStats() {
    const totalBooks = this.filteredTextbooks.length;
    const totalPages = this.filteredTextbooks.reduce((sum, book) => sum + book.pages, 0);
    const lastUpdate = this.getLatestUpdate();
    
    document.getElementById('totalBooks').textContent = totalBooks;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('lastUpdate').textContent = this.formatDate(lastUpdate);
  }

  /**
   * 最新の更新日を取得
   */
  getLatestUpdate() {
    if (this.filteredTextbooks.length === 0) return null;
    
    return this.filteredTextbooks.reduce((latest, book) => {
      const bookDate = new Date(book.lastUpdated);
      return bookDate > latest ? bookDate : latest;
    }, new Date(this.filteredTextbooks[0].lastUpdated));
  }

  /**
   * 日付フォーマット
   */
  formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * 時計の更新
   */
  updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
  }

  /**
   * エラー表示
   */
  showError(message) {
    const bookshelfRow = document.getElementById('bookshelfRow');
    bookshelfRow.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h2 style="color: var(--error); margin-bottom: 0.5rem;">エラー</h2>
        <p style="color: var(--text-secondary);">${message}</p>
      </div>
    `;
  }
}

// 初期化
const bookshelfManager = new BookshelfManager();
bookshelfManager.init();

// グローバルに公開
window.bookshelfManager = bookshelfManager;