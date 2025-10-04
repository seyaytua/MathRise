/**
 * MathRise ホーム画面
 * メインアプリケーション
 */
class MathRiseHome {
    constructor() {
        this.courses = [
            {
                id: 'math-1',
                name: '数学Ⅰ',
                icons: '📊📈📐',
                description: '二次関数、方程式、図形の基礎',
                progress: 0,
                locked: false,
                color: '#2196F3'
            },
            {
                id: 'math-A',
                name: '数学A',
                icons: '🔺🔻⭕',
                description: '場合の数、確率、図形の性質',
                progress: 0,
                locked: false,
                color: '#4CAF50'
            },
            {
                id: 'math-2',
                name: '数学Ⅱ',
                icons: '🎯🔄📊',
                description: '式と証明、複素数、図形と方程式',
                progress: 0,
                locked: false,
                color: '#FF9800'
            },
            {
                id: 'math-B',
                name: '数学B',
                icons: '📉📊🔢',
                description: 'ベクトル、数列、統計',
                progress: 0,
                locked: false,
                color: '#9C27B0'
            },
            {
                id: 'math-3',
                name: '数学Ⅲ',
                icons: '🎲🔢📐',
                description: '極限、微分、積分',
                progress: 0,
                locked: false,
                color: '#F44336'
            },
            {
                id: 'math-C',
                name: '数学C',
                icons: '🔢🎯📊',
                description: 'ベクトル、複素数平面、式と曲線',
                progress: 0,
                locked: false,
                color: '#00BCD4'
            },
            {
                id: 'physics',
                name: '物理',
                icons: '⚡🔬🧲',
                description: '力学、波動、電磁気',
                progress: 0,
                locked: true,
                color: '#607D8B'
            },
            {
                id: 'chemistry',
                name: '化学',
                icons: '⚗️🧪🔬',
                description: '物質の構造、反応、化学平衡',
                progress: 0,
                locked: true,
                color: '#795548'
            }
        ];
        
        this.selectedIndex = 0;
        this.init();
    }
    
    /**
     * 初期化
     */
    init() {
        this.loadProgress();
        this.renderCourses();
        this.attachEventListeners();
        this.updateClock();
        this.updateAchievementBadge();
        
        // 初回訪問チェック
        this.checkFirstVisit();
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
                }
            });
        }
    }
    
    /**
     * コースをレンダリング
     */
    renderCourses() {
        const grid = document.getElementById('courseGrid');
        grid.innerHTML = this.courses.map((course, index) => `
            <div class="course-card ${course.locked ? 'locked' : ''}" 
                 data-course-id="${course.id}"
                 data-index="${index}"
                 style="border-left: 4px solid ${course.color}">
                <div class="course-header">
                    <h2 class="course-name">${course.name}</h2>
                    <span class="course-status">${course.locked ? '🔒' : course.progress === 100 ? '✅' : '📖'}</span>
                </div>
                
                <div class="course-progress">
                    <div class="course-progress-bar" style="width: ${course.progress}%"></div>
                </div>
                
                <div class="course-stats">
                    <span>${course.progress}% 完了</span>
                    <span>${course.locked ? '準備中' : '利用可能'}</span>
                </div>
                
                <div class="course-icons">${course.icons}</div>
                
                <p class="course-description">${course.description}</p>
            </div>
        `).join('');
    }
    
    /**
     * イベントリスナーを設定
     */
    attachEventListeners() {
        // コースカードのクリック
        document.querySelectorAll('.course-card:not(.locked)').forEach(card => {
            card.addEventListener('click', (e) => {
                const courseId = card.dataset.courseId;
                this.selectCourse(courseId, card);
            });
            
            card.addEventListener('mouseenter', () => {
                soundManager.play('hover');
            });
        });
        
        // ロックされたカードのクリック
        document.querySelectorAll('.course-card.locked').forEach(card => {
            card.addEventListener('click', () => {
                soundManager.play('error');
                this.showLockedMessage();
            });
        });
        
        // テーマ切り替え
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                themeManager.toggle();
            });
        }
        
        // 実績ボタン
        const achievementsBtn = document.getElementById('achievementsBtn');
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', () => {
                soundManager.play('select');
                this.showAchievements();
            });
        }
        
        // 実績モーダルを閉じる
        const closeBtn = document.getElementById('closeAchievements');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                soundManager.play('select');
                this.closeAchievements();
            });
        }
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.navigateCourses(-1);
            } else if (e.key === 'ArrowRight') {
                this.navigateCourses(1);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.selectCurrentCourse();
            }
        });
        
        // フッターボタン
        document.getElementById('prevBtn')?.addEventListener('click', () => {
            soundManager.play('select');
            this.navigateCourses(-1);
        });
        
        document.getElementById('nextBtn')?.addEventListener('click', () => {
            soundManager.play('select');
            this.navigateCourses(1);
        });
        
        document.getElementById('selectBtn')?.addEventListener('click', () => {
            soundManager.play('confirm');
            this.selectCurrentCourse();
        });
    }
    
    /**
     * コースを選択
     */
    selectCourse(courseId, cardElement) {
        soundManager.play('confirm');
        
        // ズームインアニメーション
        cardElement.classList.add('selecting');
        
        setTimeout(() => {
            window.location.href = `index.html?course=${courseId}`;
        }, 600);
    }
    
    /**
     * キーボードでコースを移動
     */
    navigateCourses(direction) {
        const availableCourses = this.courses.filter(c => !c.locked);
        this.selectedIndex = (this.selectedIndex + direction + availableCourses.length) % availableCourses.length;
        
        // 選択中のカードをハイライト
        document.querySelectorAll('.course-card').forEach((card, index) => {
            card.style.transform = index === this.selectedIndex ? 'scale(1.05)' : 'scale(1)';
        });
    }
    
    /**
     * 現在選択中のコースを開く
     */
    selectCurrentCourse() {
        const availableCourses = this.courses.filter(c => !c.locked);
        const course = availableCourses[this.selectedIndex];
        if (course) {
            const card = document.querySelector(`[data-course-id="${course.id}"]`);
            if (card) {
                this.selectCourse(course.id, card);
            }
        }
    }
    
    /**
     * ロックメッセージを表示
     */
    showLockedMessage() {
        alert('このコースは準備中です。もうしばらくお待ちください！🚧');
    }
    
    /**
     * 実績モーダルを表示
     */
    showAchievements() {
        const modal = document.getElementById('achievementsModal');
        const list = document.getElementById('achievementsList');
        
        const achievements = achievementManager.getAllAchievements();
        
        list.innerHTML = achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-info">
                    <h3>${achievement.title}</h3>
                    <p>${achievement.description}</p>
                </div>
                <span class="achievement-status">${achievement.unlocked ? '✓' : '🔒'}</span>
            </div>
        `).join('');
        
        modal.classList.add('active');
    }
    
    /**
     * 実績モーダルを閉じる
     */
    closeAchievements() {
        const modal = document.getElementById('achievementsModal');
        modal.classList.remove('active');
    }
    
    /**
     * 実績バッジを更新
     */
    updateAchievementBadge() {
        const badge = document.getElementById('achievementBadge');
        if (badge) {
            const count = achievementManager.getUnlockedCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    /**
     * 時計を更新
     */
    updateClock() {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = `${hours}:${minutes}`;
            }
        };
        
        updateTime();
        setInterval(updateTime, 60000); // 1分ごとに更新
    }
    
    /**
     * 初回訪問チェック
     */
    checkFirstVisit() {
        const hasVisited = localStorage.getItem('mathrise_has_visited');
        if (!hasVisited) {
            setTimeout(() => {
                alert('🎮 MathRiseへようこそ！\n\n学びたいコースを選んで、楽しく数学を学びましょう！');
                localStorage.setItem('mathrise_has_visited', 'true');
            }, 500);
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new MathRiseHome();
});
