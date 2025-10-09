/**
 * カセットカルーセル - Nintendo Switch風UI
 * データ駆動型に改修
 */
export class CartridgeCarousel {
    constructor(courseManager, cartridgeManager, progressManager) {
        this.courseManager = courseManager;
        this.cartridgeManager = cartridgeManager;
        this.progressManager = progressManager;
        
        this.courses = [];
        this.currentIndex = 0;
        this.isScrolling = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
    }
    
    /**
     * 初期化
     */
    async init() {
        try {
            // CourseManager からコース一覧を取得
            await this.loadCourses();
            
            // 最近使用順にソート
            this.sortByRecentlyUsed();
            
            // レンダリング
            this.render();
            
            // イベントリスナー設定
            this.attachEventListeners();
            
            // 詳細表示を更新
            this.updateDetail();
            
            console.log('✅ CartridgeCarousel 初期化完了');
        } catch (error) {
            console.error('❌ CartridgeCarousel 初期化エラー:', error);
            throw error;
        }
    }
    
    /**
     * コース一覧を読み込み
     */
    async loadCourses() {
        // CartridgeManager からカセット情報を取得（進捗付き）
        this.courses = this.cartridgeManager.getCartridges();
        console.log('✅ コース一覧を読み込みました:', this.courses.length, 'コース');
    }
    
    /**
     * 最近使用順にソート
     */
    sortByRecentlyUsed() {
        this.courses = this.cartridgeManager.sortByRecentlyUsed(this.courses);
    }
    
    /**
     * レンダリング
     */
    render() {
        const track = document.getElementById('cartridgeTrack');
        const indicators = document.getElementById('cartridgeIndicators');
        
        if (!track || !indicators) {
            console.error('❌ カルーセル要素が見つかりません');
            return;
        }
        
        // カセットを生成
        track.innerHTML = this.courses.map((course, index) => `
            <div class="cartridge-item ${index === this.currentIndex ? 'selected' : ''} 
                        ${course.locked ? 'locked' : ''}"
                 data-index="${index}"
                 data-course-id="${course.id}">
                <div class="cartridge">
                    <div class="cartridge-body" style="border-color: ${course.color}">
                        <div class="cartridge-label">
                            <span class="cartridge-icon">${course.icon}</span>
                            <div class="cartridge-name">${course.name}</div>
                            ${!course.locked ? `<div class="cartridge-progress">${course.progress}%</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // インジケーターを生成
        indicators.innerHTML = this.courses.map((_, index) => `
            <div class="indicator-dot ${index === this.currentIndex ? 'active' : ''}"
                 data-index="${index}"></div>
        `).join('');
        
        this.updatePositions();
    }
    
    /**
     * 位置を更新
     */
    updatePositions() {
        const items = document.querySelectorAll('.cartridge-item');
        
        items.forEach((item, index) => {
            const distance = Math.abs(index - this.currentIndex);
            
            item.classList.remove('selected', 'adjacent', 'far');
            
            if (index === this.currentIndex) {
                item.classList.add('selected');
            } else if (distance === 1) {
                item.classList.add('adjacent');
            } else {
                item.classList.add('far');
            }
        });
        
        // インジケーター更新
        document.querySelectorAll('.indicator-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
        
        // スクロールボタンの表示/非表示
        this.updateScrollButtons();
    }
    
    /**
     * スクロールボタンの表示/非表示
     */
    updateScrollButtons() {
        const leftTrigger = document.getElementById('scrollTriggerLeft');
        const rightTrigger = document.getElementById('scrollTriggerRight');
        
        if (leftTrigger && rightTrigger) {
            leftTrigger.classList.toggle('hidden', this.currentIndex === 0);
            rightTrigger.classList.toggle('hidden', this.currentIndex === this.courses.length - 1);
        }
    }
    
    /**
     * イベントリスナー設定
     */
    attachEventListeners() {
        // カセットホバーで選択
        const track = document.getElementById('cartridgeTrack');
        if (track) {
            track.addEventListener('mouseover', (e) => {
                const item = e.target.closest('.cartridge-item');
                if (item && !item.classList.contains('locked')) {
                    const index = parseInt(item.dataset.index);
                    if (index !== this.currentIndex) {
                        this.selectByHover(index);
                    }
                }
            });
            
            // カセットクリックで学習開始
            track.addEventListener('click', (e) => {
                const item = e.target.closest('.cartridge-item');
                if (item && !item.classList.contains('locked')) {
                    const index = parseInt(item.dataset.index);
                    if (index === this.currentIndex) {
                        // 既に選択中なら学習開始
                        this.startLearning();
                    } else {
                        // 選択していない場合は選択のみ
                        this.scrollTo(index);
                    }
                } else if (item && item.classList.contains('locked')) {
                    if (typeof soundManager !== 'undefined') {
                        soundManager.play('error');
                    }
                    alert('このコースは準備中です 🚧');
                }
            });
        }
        
        // インジケータークリック
        const indicators = document.getElementById('cartridgeIndicators');
        if (indicators) {
            indicators.addEventListener('click', (e) => {
                if (e.target.classList.contains('indicator-dot')) {
                    const index = parseInt(e.target.dataset.index);
                    this.scrollTo(index);
                }
            });
        }
        
        // スクロールボタン
        const scrollBtnLeft = document.getElementById('scrollBtnLeft');
        const scrollBtnRight = document.getElementById('scrollBtnRight');
        
        if (scrollBtnLeft) {
            scrollBtnLeft.addEventListener('click', () => {
                this.scrollTo(this.currentIndex - 1);
            });
        }
        
        if (scrollBtnRight) {
            scrollBtnRight.addEventListener('click', () => {
                this.scrollTo(this.currentIndex + 1);
            });
        }
        
        // キーボード操作
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.scrollTo(this.currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.scrollTo(this.currentIndex + 1);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.startLearning();
            }
        });
        
        // タッチ操作（スワイプ）
        const viewport = document.querySelector('.cartridge-viewport');
        if (viewport) {
            viewport.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            });
            
            viewport.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            });
        }
        
        // 学習開始ボタン
        const startBtn = document.getElementById('startLearningBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startLearning();
            });
        }
        
        // 統計ボタン
        const statsBtn = document.getElementById('viewStatsBtn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                this.viewStats();
            });
        }
    }
    
    /**
     * ホバーによる選択（スムーズ）
     */
    selectByHover(index) {
        if (this.isScrolling) return;
        if (index < 0 || index >= this.courses.length) return;
        
        this.currentIndex = index;
        
        // ホバー時は音を鳴らす
        if (typeof soundManager !== 'undefined') {
            soundManager.play('hover');
        }
        
        this.updatePositions();
        this.updateDetail();
    }
    
    /**
     * スクロール（クリック・キーボード時）
     */
    scrollTo(index) {
        if (this.isScrolling) return;
        if (index < 0 || index >= this.courses.length) return;
        
        this.isScrolling = true;
        this.currentIndex = index;
        
        if (typeof soundManager !== 'undefined') {
            soundManager.play('select');
        }
        
        this.updatePositions();
        this.updateDetail();
        
        setTimeout(() => {
            this.isScrolling = false;
        }, 50);
    }
    
    /**
     * スワイプ処理
     */
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // 左スワイプ → 次へ
                this.scrollTo(this.currentIndex + 1);
            } else {
                // 右スワイプ → 前へ
                this.scrollTo(this.currentIndex - 1);
            }
        }
    }
    
    /**
     * 詳細表示を更新
     */
    updateDetail() {
        const course = this.courses[this.currentIndex];
        
        const detailIcon = document.getElementById('detailIcon');
        const detailTitle = document.getElementById('detailTitle');
        const detailSubtitle = document.getElementById('detailSubtitle');
        const detailProgress = document.getElementById('detailProgress');
        const detailProgressText = document.getElementById('detailProgressText');
        const detailLessons = document.getElementById('detailLessons');
        const detailLastStudy = document.getElementById('detailLastStudy');
        
        if (detailIcon) detailIcon.textContent = course.icon;
        if (detailTitle) detailTitle.textContent = course.name;
        if (detailSubtitle) detailSubtitle.textContent = course.description;
        if (detailProgress) detailProgress.style.width = `${course.progress}%`;
        if (detailProgressText) detailProgressText.textContent = `${course.progress}%`;
        
        // レッスン数（meta.json から取得予定、今は推定）
        const totalLessons = course.estimatedHours || 30;
        const completedLessons = Math.round(totalLessons * course.progress / 100);
        if (detailLessons) {
            detailLessons.textContent = `${completedLessons}/${totalLessons}`;
        }
        
        // 最終学習日
        const lastStudy = course.lastAccessed 
            ? new Date(course.lastAccessed).toLocaleDateString('ja-JP')
            : '未学習';
        if (detailLastStudy) {
            detailLastStudy.textContent = lastStudy;
        }
    }
    
    /**
     * 学習開始
     */
    startLearning() {
        const course = this.courses[this.currentIndex];
        
        if (course.locked) {
            if (typeof soundManager !== 'undefined') {
                soundManager.play('error');
            }
            alert('このコースは準備中です 🚧');
            return;
        }
        
        if (typeof soundManager !== 'undefined') {
            soundManager.play('confirm');
        }
        
        this.showInsertAnimation(course);
    }
    
    /**
     * カセット挿入演出
     */
    showInsertAnimation(course) {
        const overlay = document.getElementById('insertOverlay');
        const cartridge = document.getElementById('insertingCartridge');
        
        if (!overlay || !cartridge) {
            // 演出なしで直接遷移
            this.navigateToLearning(course);
            return;
        }
        
        // カセットの色を設定
        const cartridgeBody = cartridge.querySelector('.cartridge-body');
        const cartridgeLabel = cartridge.querySelector('.cartridge-label');
        
        if (cartridgeBody) {
            cartridgeBody.style.background = 
                `linear-gradient(135deg, ${course.color}, ${this.darkenColor(course.color)})`;
        }
        if (cartridgeLabel) {
            cartridgeLabel.textContent = course.name;
        }
        
        overlay.classList.add('active');
        
        // 効果音（オプション）
        if (typeof soundManager !== 'undefined') {
            setTimeout(() => soundManager.play('confirm'), 1800);
        }
        
        // 3秒後に遷移
        setTimeout(() => {
            this.navigateToLearning(course);
        }, 3000);
    }
    
    /**
     * 学習画面へ遷移
     */
    navigateToLearning(course) {
        // 最終アクセス日時を更新
        this.updateLastAccessed(course.id);
        
        // 最初のチャプターに遷移
        const chapters = this.courseManager.getChapters(course.id);
        if (chapters.length > 0) {
            window.location.href = `index.html?course=${course.id}&chapter=${chapters[0].id}`;
        } else {
            alert('このコースにはまだチャプターがありません');
        }
    }
    
    /**
     * 統計表示
     */
    viewStats() {
        const course = this.courses[this.currentIndex];
        
        if (course.locked) {
            if (typeof soundManager !== 'undefined') {
                soundManager.play('error');
            }
            return;
        }
        
        if (typeof soundManager !== 'undefined') {
            soundManager.play('select');
        }
        
        const chapters = this.courseManager.getChapters(course.id);
        if (chapters.length > 0) {
            window.location.href = `index.html?course=${course.id}&chapter=${chapters[0].id}&mode=stats`;
        }
    }
    
    /**
     * 最終アクセス日時を更新
     */
    updateLastAccessed(courseId) {
        const now = new Date().toISOString();
        const progress = this.progressManager.data;
        
        if (!progress.courses) progress.courses = {};
        if (!progress.courses[courseId]) progress.courses[courseId] = {};
        
        progress.courses[courseId].lastStudied = now;
        this.progressManager.save();
    }
    
    /**
     * 色を暗くする
     */
    darkenColor(color) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
