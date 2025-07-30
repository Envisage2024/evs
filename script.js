
// Main application script
document.addEventListener('DOMContentLoaded', function() {
    // --- Role Selector Logic ---
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        // Change label for username field
        const label = document.getElementById('username-label');
        if (this.dataset.role === 'admin') {
          label.textContent = 'Admin Email';
        } else {
          label.textContent = 'Student Code';
        }
      });
    });
    // Initialize all components
    initializeApplication();
});

function initializeApplication() {
    console.log('School E-Voting System Initialized');
    
    // Ensure all managers are initialized
    if (!window.dataManager) {
        // Data Manager is deprecated, no longer needed
        return;
    }

    
    if (!window.themeManager) {
        console.error('Theme Manager not initialized');
        return;
    }
    
    if (!window.authManager) {
        console.error('Auth Manager not initialized');
        return;
    }
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Initialize tooltips and other UI enhancements
    setupUIEnhancements();
    
    console.log('Application initialization complete');
}

function setupGlobalEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // ESC key to close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl/Cmd + D to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (window.themeManager) {
                window.themeManager.toggleTheme();
            }
        }
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(e) {
        // Prevent navigation away from voting if in progress
        if (window.authManager && window.authManager.isVoter()) {
            e.preventDefault();
            return false;
        }
    });
    
    // Prevent accidental page refresh during voting
    window.addEventListener('beforeunload', function(e) {
        if (window.authManager && window.authManager.isVoter()) {
            e.preventDefault();
            e.returnValue = 'You have unsaved votes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
    
    // Handle form submissions to prevent default behavior
    document.addEventListener('submit', function(e) {
        // This is handled by individual form handlers
        // Just ensuring we don't have any unwanted form submissions
    });
    
    // Handle clicks outside modals to close them
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

function setupUIEnhancements() {
    // Don't auto-add loading states - let forms handle this
    
    // Add focus management for accessibility
    setupFocusManagement();
    
    // Add animations for better UX
    setupAnimations();
}

function addLoadingState(button) {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Store original text for restoration
    button.dataset.originalText = originalText;
    
    // Don't auto-restore - let the actual process handle restoration
}

function removeLoadingState(button) {
    if (button && button.dataset.originalText) {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
    }
}

function setupFocusManagement() {
    // Focus management for modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const activeModal = document.querySelector('.modal.show');
            if (activeModal) {
                const focusableElements = activeModal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        }
    });
}

function setupAnimations() {
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    document.addEventListener('DOMNodeInserted', function(e) {
        if (e.target.nodeType === 1) {
            const animatableElements = e.target.querySelectorAll('.card, .voting-section, .result-card');
            animatableElements.forEach(el => observer.observe(el));
        }
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application Error:', e.error);
    
    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-toast';
    errorMessage.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>An unexpected error occurred. Please refresh the page.</span>
        <button onclick="this.parentNode.remove()">×</button>
    `;
    
    errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--danger-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 500px;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(errorMessage);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.parentNode.removeChild(errorMessage);
        }
    }, 10000);
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Page Load Performance:', {
                    loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                    domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart
                });
            }
        }, 0);
    });
}

// Add additional CSS for animations and enhancements
const mainStyle = document.createElement('style');
mainStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    .error-toast button {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: 1rem;
    }
    
    .error-toast button:hover {
        opacity: 0.8;
    }
    
    /* Improved focus styles for accessibility */
    button:focus,
    input:focus,
    select:focus,
    textarea:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }
    
    /* Loading spinner animation */
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    
    .fa-spin {
        animation: spin 1s linear infinite;
    }
    
    /* Smooth transitions for all interactive elements */
    button,
    .card,
    .candidate-card,
    input,
    select,
    textarea {
        transition: all 0.3s ease;
    }
    
    /* Custom scrollbar for webkit browsers */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: var(--bg-secondary);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
        background: var(--text-secondary);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: var(--primary-color);
    }
    
    /* Print styles */
    @media print {
        .theme-toggle,
        .nav-menu,
        .logout-btn,
        .modal {
            display: none !important;
        }
        
        .page {
            display: block !important;
        }
        
        .admin-content,
        .voter-content {
            padding: 0 !important;
        }
    }
`;
document.head.appendChild(mainStyle);

// Export utility functions for use in other modules
window.utils = {
    formatDate,
    formatTime,
    debounce,
    throttle,
    closeAllModals,
    addLoadingState,
    removeLoadingState
};

// Make sure all components are available globally
console.log('Available components:', {
    dataManager: !!window.dataManager,
    themeManager: !!window.themeManager,
    authManager: !!window.authManager,
    adminManager: !!window.adminManager,
    voterManager: !!window.voterManager
});
