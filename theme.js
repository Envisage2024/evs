// Theme management system
class ThemeManager {
    constructor() {
        // Load theme from localStorage or default to light
        this.currentTheme = localStorage.getItem('evoting_theme') || 'light';
        this.applyTheme(this.currentTheme);
        this.themeToggle = null;
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggle());
        } else {
            this.setupToggle();
        }
    }

    setupToggle() {
        this.themeToggle = document.getElementById('theme-toggle');
        if (this.themeToggle) {
            this.updateToggleIcon();
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        // Save theme to localStorage for persistence
        localStorage.setItem('evoting_theme', theme);
    }
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// On page load, ensure theme is applied to all sections
document.addEventListener('DOMContentLoaded', function() {
    const theme = localStorage.getItem('evoting_theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
});

// Initialize theme manager
window.themeManager = new ThemeManager();
