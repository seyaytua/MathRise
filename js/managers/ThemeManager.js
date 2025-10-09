/**
 * テーママネージャー
 * ライト/ダークモードの切り替え（全ページ同期）
 */
class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.currentVariant = this.loadVariant();
        this.applyTheme(this.currentTheme, this.currentVariant);
    }
    
    /**
     * テーマを適用
     */
    applyTheme(theme, variant = 'default') {
        document.documentElement.setAttribute('data-theme', theme);
        
        // ライトテーマのバリエーション
        if (theme === 'light' && variant !== 'default') {
            document.documentElement.classList.add(variant);
        } else {
            // 既存のバリエーションクラスを削除
            ['sunset', 'mint', 'lavender', 'modern'].forEach(v => {
                document.documentElement.classList.remove(v);
            });
        }
        
        this.updateThemeIcon(theme);
        this.currentTheme = theme;
        this.currentVariant = variant;
        
        // localStorageに保存（全ページで共有）
        localStorage.setItem('mathrise_theme', theme);
        localStorage.setItem('mathrise_theme_variant', variant);
    }
    
    /**
     * テーマを切り替え
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme, this.currentVariant);
        return newTheme;
    }
    
    /**
     * バリエーションを変更（ライトテーマのみ）
     */
    setVariant(variant) {
        if (this.currentTheme === 'light') {
            this.applyTheme('light', variant);
        }
    }
    
    /**
     * テーマアイコンを更新
     */
    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }
    
    /**
     * 保存されたテーマを読み込み
     */
    loadTheme() {
        const saved = localStorage.getItem('mathrise_theme');
        if (saved) return saved;
        
        // システム設定を確認
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }
    
    /**
     * 保存されたバリエーションを読み込み
     */
    loadVariant() {
        return localStorage.getItem('mathrise_theme_variant') || 'default';
    }
    
    /**
     * システムのテーマ変更を監視
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('mathrise_theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light', this.currentVariant);
                }
            });
        }
    }
}

// グローバルインスタンス
window.themeManager = new ThemeManager();
window.themeManager.watchSystemTheme();
