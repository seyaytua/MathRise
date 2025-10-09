/**
 * MathRise ホーム画面 - メイン処理
 * データ駆動型に対応
 */

// コアシステム
import { CourseManager } from './core/CourseManager.js';
import { CartridgeManager } from './core/CartridgeManager.js';

// UI層
import { CartridgeCarousel } from './ui/CartridgeCarousel.js';

// マネージャー
import { ProgressManager } from './managers/ProgressManager.js';

// グローバル変数
let courseManager;
let cartridgeManager;
let progressManager;
let carousel;

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ home.js 初期化開始');
    
    try {
        // 初期化処理
        await initializeHome();
    } catch (error) {
        console.error('❌ 初期化エラー:', error);
        alert('ホーム画面の初期化に失敗しました');
    }
});

/**
 * ホーム画面の初期化
 */
async function initializeHome() {
    // コアシステムの初期化
    courseManager = new CourseManager();
    progressManager = new ProgressManager();
    
    await courseManager.init();
    console.log('✅ CourseManager 初期化完了');
    
    cartridgeManager = new CartridgeManager(courseManager, progressManager);
    console.log('✅ CartridgeManager 初期化完了');
    
    // カルーセルの初期化
    carousel = new CartridgeCarousel(courseManager, cartridgeManager, progressManager);
    await carousel.init();
    console.log('✅ CartridgeCarousel 初期化完了');
    
    // 時計更新
    updateClock();
    
    // 実績バッジ更新
    updateAchievementBadge();
    
    // 設定読み込み
    loadSettings();
    
    // イベントリスナー設定
    setupEventListeners();
    
    console.log('✅ home.js 初期化完了');
}

/**
 * イベントリスナー設定
 */
function setupEventListeners() {
    // テーマ切り替え（ヘッダー）
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (typeof themeManager !== 'undefined') {
                const newTheme = themeManager.toggle();
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('theme');
                }
                
                // 設定モーダル内のトグルも更新
                const darkModeToggle = document.getElementById('darkModeToggle');
                if (darkModeToggle) {
                    darkModeToggle.checked = (newTheme === 'dark');
                }
            }
        });
    }
    
    // 実績ボタン
    const achievementsBtn = document.getElementById('achievementsBtn');
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', () => {
            if (typeof soundManager !== 'undefined') {
                soundManager.play('select');
            }
            showAchievements();
        });
    }
    
    // 実績モーダルを閉じる
    const closeAchievements = document.getElementById('closeAchievements');
    if (closeAchievements) {
        closeAchievements.addEventListener('click', () => {
            if (typeof soundManager !== 'undefined') {
                soundManager.play('select');
            }
            closeModal('achievementsModal');
        });
    }
    
    // 設定ボタン
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (typeof soundManager !== 'undefined') {
                soundManager.play('select');
            }
            showSettings();
        });
    }
    
    // 設定モーダルを閉じる
    const closeSettings = document.getElementById('closeSettings');
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            if (typeof soundManager !== 'undefined') {
                soundManager.play('select');
            }
            closeModal('settingsModal');
        });
    }
    
    // モーダル外クリックで閉じる
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('select');
                }
                modal.classList.remove('active');
            }
        });
    });
    
    // 設定内のイベント
    setupSettingsEvents();
}

/**
 * 設定モーダル内のイベント設定
 */
function setupSettingsEvents() {
    // ダークモードトグル
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle && typeof themeManager !== 'undefined') {
        darkModeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            themeManager.applyTheme(newTheme, themeManager.currentVariant);
            if (typeof soundManager !== 'undefined') {
                soundManager.play('theme');
            }
        });
    }
    
    // テーマバリエーション選択
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            if (typeof themeManager !== 'undefined' && themeManager.currentTheme === 'light') {
                const variant = option.dataset.variant;
                themeManager.setVariant(variant);
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('select');
                }
                
                // アクティブ表示を更新
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            }
        });
    });
    
    // サウンドトグル
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle && typeof soundManager !== 'undefined') {
        soundToggle.addEventListener('change', (e) => {
            soundManager.enabled = e.target.checked;
            localStorage.setItem('mathrise_sound_enabled', e.target.checked);
            if (e.target.checked) {
                soundManager.play('select');
            }
        });
    }
    
    // データエクスポート
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (typeof soundManager !== 'undefined') {
                soundManager.play('select');
            }
            exportData();
        });
    }
    
    // データインポート
    const importBtn = document.getElementById('importDataBtn');
    const importFile = document.getElementById('importDataFile');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            if (typeof soundManager !== 'undefined') {
                soundManager.play('select');
            }
            importFile.click();
        });
        
        importFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                importData(e.target.files[0]);
            }
        });
    }
    
    // データリセット
    const resetBtn = document.getElementById('resetDataBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('すべてのデータをリセットしますか？\nこの操作は取り消せません。')) {
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('confirm');
                }
                resetAllData();
            } else {
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('error');
                }
            }
        });
    }
}

/**
 * 時計を更新
 */
function updateClock() {
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
    setInterval(updateTime, 60000);
}

/**
 * 実績モーダルを表示
 */
function showAchievements() {
    const modal = document.getElementById('achievementsModal');
    const list = document.getElementById('achievementsList');
    
    if (!list) {
        console.error('achievementsList が見つかりません');
        return;
    }
    
    if (typeof achievementManager !== 'undefined') {
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
    }
    
    modal.classList.add('active');
}

/**
 * 設定モーダルを表示
 */
function showSettings() {
    const modal = document.getElementById('settingsModal');
    
    if (!modal) {
        console.error('settingsModal が見つかりません');
        return;
    }
    
    // 現在の設定を反映
    if (typeof themeManager !== 'undefined') {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = (themeManager.currentTheme === 'dark');
        }
        
        // アクティブなテーマバリエーションを表示
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.variant === themeManager.currentVariant);
        });
    }
    
    if (typeof soundManager !== 'undefined') {
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.checked = soundManager.enabled;
        }
    }
    
    modal.classList.add('active');
}

/**
 * モーダルを閉じる
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * 実績バッジを更新
 */
function updateAchievementBadge() {
    const badge = document.getElementById('achievementBadge');
    if (badge && typeof achievementManager !== 'undefined') {
        const count = achievementManager.getUnlockedCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

/**
 * 設定を読み込み
 */
function loadSettings() {
    // サウンド設定
    const soundEnabled = localStorage.getItem('mathrise_sound_enabled');
    if (soundEnabled !== null && typeof soundManager !== 'undefined') {
        soundManager.enabled = (soundEnabled === 'true');
    }
}

/**
 * データをエクスポート
 */
function exportData() {
    const data = {
        progress: localStorage.getItem('mathrise_progress'),
        achievements: localStorage.getItem('mathrise_achievements'),
        theme: localStorage.getItem('mathrise_theme'),
        themeVariant: localStorage.getItem('mathrise_theme_variant'),
        soundEnabled: localStorage.getItem('mathrise_sound_enabled'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mathrise_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    if (typeof soundManager !== 'undefined') {
        soundManager.play('confirm');
    }
    alert('データをエクスポートしました！');
}

/**
 * データをインポート
 */
function importData(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // データを復元
            if (data.progress) localStorage.setItem('mathrise_progress', data.progress);
            if (data.achievements) localStorage.setItem('mathrise_achievements', data.achievements);
            if (data.theme) localStorage.setItem('mathrise_theme', data.theme);
            if (data.themeVariant) localStorage.setItem('mathrise_theme_variant', data.themeVariant);
            if (data.soundEnabled) localStorage.setItem('mathrise_sound_enabled', data.soundEnabled);
            
            if (typeof soundManager !== 'undefined') {
                soundManager.play('confirm');
            }
            alert('データをインポートしました！\nページを再読み込みします。');
            
            setTimeout(() => {
                location.reload();
            }, 500);
        } catch (error) {
            if (typeof soundManager !== 'undefined') {
                soundManager.play('error');
            }
            alert('データの読み込みに失敗しました。\n正しいファイルを選択してください。');
            console.error('Import error:', error);
        }
    };
    
    reader.onerror = () => {
        if (typeof soundManager !== 'undefined') {
            soundManager.play('error');
        }
        alert('ファイルの読み込みに失敗しました。');
    };
    
    reader.readAsText(file);
}

/**
 * すべてのデータをリセット
 */
function resetAllData() {
    localStorage.removeItem('mathrise_progress');
    localStorage.removeItem('mathrise_achievements');
    localStorage.removeItem('mathrise_theme');
    localStorage.removeItem('mathrise_theme_variant');
    localStorage.removeItem('mathrise_sound_enabled');
    localStorage.removeItem('mathrise_has_visited');
    
    alert('すべてのデータをリセットしました。\nページを再読み込みします。');
    
    setTimeout(() => {
        location.reload();
    }, 500);
}
