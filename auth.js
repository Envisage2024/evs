// Authentication management system
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        // Attach event listeners for login and logout
        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const submitButton = e.target.querySelector('.login-btn');
                const originalText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                await this.handleLogin(e);
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            } catch (error) {
                this.showError(error.message);
            }
        });
        // Make all logout buttons functional
        const adminLogoutBtn = document.getElementById('admin-logout');
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', () => this.logout());
        }
        const voterLogoutBtn = document.getElementById('voter-logout');
        if (voterLogoutBtn) {
            voterLogoutBtn.addEventListener('click', () => this.logout());
        }
        // Fallback for dynamically added or future logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest && (e.target.closest('#admin-logout') || e.target.closest('#voter-logout'))) {
                this.logout();
            }
        });
    }

    async handleLogin(e) {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.querySelector('.role-btn.active').dataset.role;
        this.clearError();
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return false;
        }
        if (role === 'admin') {
            return await this.loginAdmin(username, password);
        } else {
            return await this.loginVoter(username, password);
        }
    }

    async loginAdmin(username, password) {
        // Use Firebase Auth for admin login
        try {
            await auth.signInWithEmailAndPassword(username, password);
            this.currentUser = { username, role: 'admin' };
            this.currentRole = 'admin';
            this.showPage('admin-page');
            setTimeout(() => {
                if (window.adminManager) window.adminManager.init();
            }, 50);
            return true;
        } catch (error) {
            throw new Error('Invalid admin credentials');
        }
    }

    async loginVoter(studentCode, password) {
        // Use Firestore to verify voter (match admin entry fields)
        const snapshot = await db.collection('voters')
            .where('studentCode', '==', studentCode)
            .where('password', '==', password)
            .get();
        if (snapshot.empty) {
            throw new Error('Invalid student credentials');
        }
        const voter = snapshot.docs[0].data();
        voter.id = snapshot.docs[0].id;
        if (voter.voted) {
            throw new Error('You have already voted. You cannot vote again.');
        }
        this.currentUser = voter;
        this.currentRole = 'voter';
        this.showPage('voter-page');
        if (window.voterManager) window.voterManager.init(voter);
    }

    logout() {
        this.currentUser = null;
        this.currentRole = null;
        auth.signOut();
        this.showPage('login-page');
        this.clearLoginForm();
    }

    // No sessionStorage or DataManager logic needed

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearError() {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }

    clearLoginForm() {
        const form = document.getElementById('login-form');
        if (form) {
            form.reset();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentRole() {
        return this.currentRole;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentRole === 'admin';
    }

    isVoter() {
        return this.currentRole === 'voter';
    }
}

// Initialize authentication manager
window.authManager = new AuthManager();
