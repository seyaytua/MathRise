/**
 * 実績システム
 * トロフィー・バッジの管理
 */
class AchievementManager {
    constructor() {
        this.achievements = [
            {
                id: 'first_lesson',
                title: '第一歩',
                description: '最初のレッスンを完了',
                icon: '🎯',
                condition: (stats) => stats.completedLessons >= 1
            },
            {
                id: 'ten_lessons',
                title: '継続は力なり',
                description: '10レッスンを完了',
                icon: '📚',
                condition: (stats) => stats.completedLessons >= 10
            },
            {
                id: 'first_unit',
                title: '単元マスター',
                description: '最初の単元を完了',
                icon: '🏆',
                condition: (stats) => stats.completedUnits >= 1
            },
            {
                id: 'perfect_lesson',
                title: 'パーフェクト',
                description: 'レッスンを一度も間違えずにクリア',
                icon: '⭐',
                condition: (stats) => stats.perfectLessons >= 1
            },
            {
                id: 'night_owl',
                title: '夜更かし学習者',
                description: '深夜（22時以降）に学習',
                icon: '🦉',
                condition: (stats) => stats.lateNightStudy
            },
            {
                id: 'early_bird',
                title: '早起き学習者',
                description: '早朝（6時以前）に学習',
                icon: '🐦',
                condition: (stats) => stats.earlyMorningStudy
            },
            {
                id: 'week_streak',
                title: '7日連続',
                description: '7日間連続で学習',
                icon: '🔥',
                condition: (stats) => stats.streak >= 7
            },
            {
                id: 'speed_demon',
                title: 'スピードマスター',
                description: '1時間で5レッスン完了',
                icon: '⚡',
                condition: (stats) => stats.lessonsPerHour >= 5
            },
            {
                id: 'course_complete',
                title: 'コース制覇',
                description: 'コースを100%完了',
                icon: '👑',
                condition: (stats) => stats.courseProgress >= 100
            },
            {
                id: 'all_courses',
                title: '全科目マスター',
                description: 'すべてのコースを完了',
                icon: '🌟',
                condition: (stats) => stats.allCoursesComplete
            }
        ];
        
        this.unlockedAchievements = this.loadUnlockedAchievements();
    }
    
    /**
     * 実績をチェックして解除
     */
    checkAchievements(stats) {
        const newlyUnlocked = [];
        
        this.achievements.forEach(achievement => {
            if (!this.isUnlocked(achievement.id) && achievement.condition(stats)) {
                this.unlock(achievement.id);
                newlyUnlocked.push(achievement);
            }
        });
        
        return newlyUnlocked;
    }
    
    /**
     * 実績を解除
     */
    unlock(achievementId) {
        if (!this.unlockedAchievements.includes(achievementId)) {
            this.unlockedAchievements.push(achievementId);
            this.saveUnlockedAchievements();
            
            const achievement = this.achievements.find(a => a.id === achievementId);
            if (achievement) {
                this.showNotification(achievement);
                soundManager.play('achievement');
            }
        }
    }
    
    /**
     * 実績が解除済みかチェック
     */
    isUnlocked(achievementId) {
        return this.unlockedAchievements.includes(achievementId);
    }
    
    /**
     * 解除済み実績数を取得
     */
    getUnlockedCount() {
        return this.unlockedAchievements.length;
    }
    
    /**
     * 全実績を取得
     */
    getAllAchievements() {
        return this.achievements.map(achievement => ({
            ...achievement,
            unlocked: this.isUnlocked(achievement.id)
        }));
    }
    
    /**
     * 実績解除通知を表示
     */
    showNotification(achievement) {
        const notification = document.getElementById('achievementNotification');
        const desc = document.getElementById('notificationDesc');
        
        if (notification && desc) {
            desc.textContent = `${achievement.icon} ${achievement.title} - ${achievement.description}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 4000);
        }
    }
    
    /**
     * 実績を保存
     */
    saveUnlockedAchievements() {
        localStorage.setItem('mathrise_achievements', JSON.stringify(this.unlockedAchievements));
    }
    
    /**
     * 実績を読み込み
     */
    loadUnlockedAchievements() {
        const saved = localStorage.getItem('mathrise_achievements');
        return saved ? JSON.parse(saved) : [];
    }
}

// グローバルインスタンス
const achievementManager = new AchievementManager();
