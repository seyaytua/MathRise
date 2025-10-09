/**
 * カセットカルーセル - Nintendo Switch風UI
 */
class CartridgeCarousel {
    constructor() {
        this.courses = [
            {
                id: 'math-1',
                name: '数学Ⅰ',
                icon: '📊',
                description: '二次関数、方程式、図形の基礎',
                color: '#2196F3',
                locked: false,
                progress: 0,
                lastAccessed: null
            },
            {
                id: 'math-A',
                name: '数学A',
                icon: '🔺',
                description: '場合の数、確率、図形の性質',
                color: '#4CAF50',
                locked: false,
                progress: 0,
                lastAccessed: null
            },
            {
                id: 'math-2',
                name: '数学Ⅱ',
                icon: '🎯',
                description: '式と証明、複素数、図形と方程式',
                color: '#FF9800',
                locked: false,
                progress: 0,
                lastAccessed: null
            },
            {
                id: 'math-B',
                name: '数学B',
                icon: '📉',
                description: 'ベクトル、数列、統計',
                color: '#9C27B0',
                locked: false,
                progress: 0,
                lastAccessed: null
            },
            {
                id: 'math-3',
                name: '数学Ⅲ',
                icon: '🎲',
                description: '極限、微分、積分',
                color: '#F44336',
                locked: false,
                progress: 0,
                lastAccessed: null
            },
            {
                id: 'math-C',
                name: '数学C',
                icon: '🔢',
                description: 'ベクトル、複素数平面、式と曲線',
                color: '#00BCD4',
                locked: false,
                progress: 0,
                lastAccessed: null
            },
            {
                id: 'physics',
                name: '物理',
                icon: '⚡',
                description: '力学、波動、電磁気',
                color: '#607D8B',
                locked: true,
                progress: 0,
                lastAccessed: null
            },
            {
                id: 'chemistry',
                name: '化学',
                icon: '⚗️',
                description: '物質の構造、反応、化学平衡',
                color: '#795548',
                locked: true,
                progress: 0,
                lastAccessed: null
            }
        ];
        
        this.currentIndex = 0;
        this.isScrolling = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    /**
     * 初期化
     */
    init() {
        this.loadProgress();
        this.sortByRecentlyUsed();
        this.render();
        this.attachEventListeners();
        this.updateDetail();
    }
    
    /**
     * 進捗を読み込み
     */
    loadProgress() {
        const saved = localStorage.getItem('mathrise_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.courses.forEach(course => {
                if (progress.courses && progress.courses[course.id]) {
                    const courseProgress = progress.courses[course.id];
                    const total = courseProgress.totalLessons || 1;
                    const completed = courseProgress.completedLessons?.length || 0;
                    course.progress = Math.round((completed / total) * 100);
                    course.lastAccessed = courseProgress.lastStudied || null;
                }
            });
        }
    }
    
    /**
     * 最近使用順にソート
     */
    sortByRecentlyUsed() {
        this.courses.sort((a, b) => {
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
     * レンダリング
     */
    render() {
        const track = document.getElementById('cartridgeTrack');
        const indicators = document.getElementById('cartridgeIndicators');
        
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
        
        leftTrigger.classList.toggle('hidden', this.currentIndex === 0);
        rightTrigger.classList.toggle('hidden', this.currentIndex === this.courses.length - 1);
    }
    
    /**
     * イベントリスナー設定
     */
    attachEventListeners() {
        // カセットホバーで選択
        document.getElementById('cartridgeTrack').addEventListener('mouseover', (e) => {
            const item = e.target.closest('.cartridge-item');
            if (item && !item.classList.contains('locked')) {
                const index = parseInt(item.dataset.index);
                if (index !== this.currentIndex) {
                    this.selectByHover(index);
                }
            }
        });
        
        // カセットクリックで学習開始
        document.getElementById('cartridgeTrack').addEventListener('click', (e) => {
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
                soundManager.play('error');
                alert('このコースは準備中です 🚧');
            }
        });
        
        // インジケータークリック
        document.getElementById('cartridgeIndicators').addEventListener('click', (e) => {
            if (e.target.classList.contains('indicator-dot')) {
                const index = parseInt(e.target.dataset.index);
                this.scrollTo(index);
            }
        });
        
        // スクロールボタン
        document.getElementById('scrollBtnLeft').addEventListener('click', () => {
            this.scrollTo(this.currentIndex - 1);
        });
        
        document.getElementById('scrollBtnRight').addEventListener('click', () => {
            this.scrollTo(this.currentIndex + 1);
        });
        
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
        viewport.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });
        
        viewport.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        // 学習開始ボタン
        document.getElementById('startLearningBtn').addEventListener('click', () => {
            this.startLearning();
        });
        
        // 統計ボタン
        document.getElementById('viewStatsBtn').addEventListener('click', () => {
            this.viewStats();
        });
    }
    
    /**
     * ホバーによる選択（スムーズ）
     */
    selectByHover(index) {
        if (this.isScrolling) return;
        if (index < 0 || index >= this.courses.length) return;
        
        this.currentIndex = index;
        
        // ホバー時は音を鳴らす
        soundManager.play('hover');
        
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
        
        soundManager.play('select');
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
        
        document.getElementById('detailIcon').textContent = course.icon;
        document.getElementById('detailTitle').textContent = course.name;
        document.getElementById('detailSubtitle').textContent = course.description;
        document.getElementById('detailProgress').style.width = `${course.progress}%`;
        document.getElementById('detailProgressText').textContent = `${course.progress}%`;
        
        // レッスン数（仮）
        const totalLessons = course.id === 'math-1' ? 32 : 30;
        const completedLessons = Math.round(totalLessons * course.progress / 100);
        document.getElementById('detailLessons').textContent = `${completedLessons}/${totalLessons}`;
        
        // 最終学習日
        const lastStudy = course.lastAccessed 
            ? new Date(course.lastAccessed).toLocaleDateString('ja-JP')
            : '未学習';
        document.getElementById('detailLastStudy').textContent = lastStudy;
    }
    
    /**
     * 学習開始
     */
    startLearning() {
        const course = this.courses[this.currentIndex];
        
        if (course.locked) {
            soundManager.play('error');
            alert('このコースは準備中です 🚧');
            return;
        }
        
        soundManager.play('confirm');
        this.showInsertAnimation(course);
    }
    
    /**
     * カセット挿入演出
     */
    showInsertAnimation(course) {
        const overlay = document.getElementById('insertOverlay');
        const cartridge = document.getElementById('insertingCartridge');
        
        // カセットの色を設定
        cartridge.querySelector('.cartridge-body').style.background = 
            `linear-gradient(135deg, ${course.color}, ${this.darkenColor(course.color)})`;
        cartridge.querySelector('.cartridge-label').textContent = course.name;
        
        overlay.classList.add('active');
        
        // 効果音（オプション）
        setTimeout(() => soundManager.play('confirm'), 1800);
        
        // 3秒後に遷移
        setTimeout(() => {
            // 最終アクセス日時を更新
            this.updateLastAccessed(course.id);
            
            // 学習画面へ遷移
            window.location.href = `index.html?course=${course.id}`;
        }, 3000);
    }
    
    /**
     * 統計表示
     */
    viewStats() {
        const course = this.courses[this.currentIndex];
        
        if (course.locked) {
            soundManager.play('error');
            return;
        }
        
        soundManager.play('select');
        window.location.href = `index.html?course=${course.id}&mode=stats`;
    }
    
    /**
     * 最終アクセス日時を更新
     */
    updateLastAccessed(courseId) {
        const now = new Date().toISOString();
        const progress = JSON.parse(localStorage.getItem('mathrise_progress') || '{}');
        
        if (!progress.courses) progress.courses = {};
        if (!progress.courses[courseId]) progress.courses[courseId] = {};
        
        progress.courses[courseId].lastStudied = now;
        localStorage.setItem('mathrise_progress', JSON.stringify(progress));
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
    
    /**
     * モバイル判定
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new CartridgeCarousel();
});
