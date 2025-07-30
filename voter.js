// Voter management system
class VoterManager {
    constructor() {
        this.currentVoter = null;
        this.selectedVotes = {};
        this.posts = [];
        this.candidates = [];
    }

    async init(voter) {
        this.currentVoter = voter;
        this.selectedVotes = {};
        await this.loadVotingData();
        this.setupVoterInterface();
        this.updateProgress();
    }

    async loadVotingData() {
        if (typeof fetchPosts === 'function' && typeof fetchCandidates === 'function') {
            this.posts = await fetchPosts();
            this.candidates = await fetchCandidates();
        } else {
            this.posts = [];
            this.candidates = [];
        }
    }

    setupVoterInterface() {
        // Display voter name
        const voterNameDisplay = document.getElementById('voter-name-display');
        if (voterNameDisplay && this.currentVoter) {
            voterNameDisplay.textContent = `Welcome, ${this.currentVoter.name}`;
        }

        // Setup voting sections
        this.createVotingSections();
        
        // Setup submit button
        const submitButton = document.getElementById('submit-votes');
        if (submitButton) {
            submitButton.addEventListener('click', () => this.showConfirmationModal());
        }

        // Setup confirmation modal
        this.setupConfirmationModal();
    }

    createVotingSections() {
        const container = document.getElementById('voting-sections');
        if (!container) return;

        container.innerHTML = '';

        if (this.posts.length === 0) {
            container.innerHTML = '<p class="empty-state">No voting posts available at the moment.</p>';
            return;
        }

        this.posts.forEach(post => {
            const postCandidates = this.candidates.filter(c => c.postId === post.id);
            if (postCandidates.length === 0) return;

            const section = this.createVotingSection(post, postCandidates);
            container.appendChild(section);
        });
    }

    createVotingSection(post, candidates) {
        const section = document.createElement('div');
        section.className = 'voting-section';
        section.id = `voting-section-${post.id}`;

        section.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <div class="candidates-container" id="candidates-${post.id}">
                ${candidates.map(candidate => this.createCandidateCard(candidate, post.id)).join('')}
            </div>
        `;

        return section;
    }

    createCandidateCard(candidate, postId) {
        const isSelected = this.selectedVotes[postId] === candidate.id;
        
        return `
            <div class="candidate-card ${isSelected ? 'selected' : ''}" 
                 data-candidate-id="${candidate.id}" 
                 data-post-id="${postId}"
                 onclick="voterManager.selectCandidate('${postId}', '${candidate.id}')">
                
                ${candidate.image ? 
                    `<img src="${candidate.image}" alt="${candidate.name}" class="candidate-image" onerror="this.style.display='none'">` : 
                    `<div class="candidate-image" style="background-color: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user" style="font-size: 2rem; color: var(--text-secondary);"></i>
                    </div>`
                }
                
                <div class="candidate-info">
                    <h4>${candidate.name}</h4>
                    <div class="candidate-slogan">"${candidate.slogan}"</div>
                    ${candidate.bio ? `<div class="candidate-bio">${candidate.bio}</div>` : ''}
                    
                    ${candidate.video ? `
                        <div class="candidate-media">
                            <video src="${candidate.video}" class="candidate-video" controls></video>
                        </div>
                    ` : ''}
                </div>
                
                <div class="selection-indicator">
                    <i class="fas fa-check-circle"></i>
                </div>
            </div>
        `;
    }

    selectCandidate(postId, candidateId) {
        // Update selection
        if (this.selectedVotes[postId] === candidateId) {
            // Deselect if already selected
            delete this.selectedVotes[postId];
        } else {
            // Select new candidate
            this.selectedVotes[postId] = candidateId;
        }

        // Update UI
        this.updateCandidateSelection(postId);
        this.updateProgress();
        this.updateSubmitButton();
    }

    updateCandidateSelection(postId) {
        const candidatesContainer = document.getElementById(`candidates-${postId}`);
        if (!candidatesContainer) return;

        const candidateCards = candidatesContainer.querySelectorAll('.candidate-card');
        candidateCards.forEach(card => {
            const candidateId = card.dataset.candidateId;
            if (this.selectedVotes[postId] === candidateId) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    updateProgress() {
        // Calculate progress based on selectedVotes and posts
        const total = this.posts.length;
        const voted = Object.keys(this.selectedVotes).length;
        const percentage = total > 0 ? Math.round((voted / total) * 100) : 0;

        // Update progress text
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = `${voted} of ${total} positions voted`;
        }

        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }

    updateSubmitButton() {
        const submitButton = document.getElementById('submit-votes');
        if (!submitButton) return;

        const totalPosts = this.posts.length;
        const votedPosts = Object.keys(this.selectedVotes).length;
        
        if (votedPosts === totalPosts && totalPosts > 0) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Votes';
        } else {
            submitButton.disabled = true;
            submitButton.innerHTML = `<i class="fas fa-paper-plane"></i> Submit Votes (${votedPosts}/${totalPosts} completed)`;
        }
    }

    setupConfirmationModal() {
        const modal = document.getElementById('confirmation-modal');
        const confirmBtn = document.getElementById('confirm-submit');
        const cancelBtn = document.getElementById('cancel-submit');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.submitVotes());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideConfirmationModal());
        }

        // Close modal on background click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideConfirmationModal();
                }
            });
        }
    }

    showConfirmationModal() {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            // Update modal content with voting summary
            this.updateConfirmationContent();
            modal.classList.add('show');
        }
    }

    hideConfirmationModal() {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    updateConfirmationContent() {
        const modal = document.getElementById('confirmation-modal');
        if (!modal) return;

        // Create voting summary
        let summary = '<h4>Confirm Your Votes</h4><div class="vote-summary">';
        
        Object.keys(this.selectedVotes).forEach(postId => {
            const post = this.posts.find(p => p.id === postId);
            const candidate = this.candidates.find(c => c.id === this.selectedVotes[postId]);
            
            if (post && candidate) {
                summary += `
                    <div class="vote-item">
                        <strong>${post.title}:</strong> ${candidate.name}
                    </div>
                `;
            }
        });
        
        summary += '</div><p>Are you sure you want to submit your votes? This action cannot be undone.</p>';
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            const existingSummary = modalContent.querySelector('.vote-summary-container');
            if (existingSummary) {
                existingSummary.remove();
            }
            
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'vote-summary-container';
            summaryDiv.innerHTML = summary;
            
            const actions = modalContent.querySelector('.modal-actions');
            if (actions) {
                modalContent.insertBefore(summaryDiv, actions);
            }
        }
    }

    async submitVotes() {
        try {
            // Submit votes to Firestore
            if (!this.currentVoter || !this.currentVoter.id) throw new Error('Voter not found');
            // Save votes in a 'votes' collection, one document per voter
            await db.collection('votes').doc(this.currentVoter.id).set({
                voterId: this.currentVoter.id,
                votes: this.selectedVotes,
                submittedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            // Mark voter as voted in Firestore
            await db.collection('voters').doc(this.currentVoter.id).update({ voted: true });

            // Hide confirmation modal
            this.hideConfirmationModal();

            // Show success message
            this.showSuccessMessage();

            // Logout after a delay
            setTimeout(() => {
                window.authManager.logout();
            }, 3000);

        } catch (error) {
            this.showErrorMessage('Failed to submit votes: ' + error.message);
        }
    }

    showSuccessMessage() {
        // Create success overlay
        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        overlay.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h2>Votes Submitted Successfully!</h2>
                <p>Thank you for participating in the election.</p>
                <p>You will be redirected to the login page shortly.</p>
            </div>
        `;
        
        // Add styles
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
    }

    showErrorMessage(message) {
        // Create error message element
        const messageEl = document.createElement('div');
        messageEl.className = 'error-message';
        messageEl.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);
    }
}

// Initialize voter manager
window.voterManager = new VoterManager();

// Add additional CSS for voter interface
const voterStyle = document.createElement('style');
voterStyle.textContent = `
    .selection-indicator {
        position: absolute;
        top: 1rem;
        right: 1rem;
        color: var(--success-color);
        font-size: 1.5rem;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .candidate-card {
        position: relative;
    }
    
    .candidate-card.selected .selection-indicator {
        opacity: 1;
    }
    
    .vote-summary {
        background-color: var(--bg-secondary);
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
    
    .vote-item {
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .vote-item:last-child {
        border-bottom: none;
    }
    
    .success-overlay .success-content {
        background: var(--bg-primary);
        padding: 3rem;
        border-radius: 1rem;
        text-align: center;
        max-width: 500px;
        box-shadow: var(--shadow-lg);
    }
    
    .success-overlay .success-content i {
        font-size: 4rem;
        color: var(--success-color);
        margin-bottom: 1rem;
    }
    
    .success-overlay .success-content h2 {
        color: var(--success-color);
        margin-bottom: 1rem;
    }
    
    .success-overlay .success-content p {
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }
    
    .candidate-image {
        border: 3px solid transparent;
        transition: border-color 0.3s ease;
    }
    
    .candidate-card.selected .candidate-image {
        border-color: var(--success-color);
    }
    
    .candidate-card:hover {
        cursor: pointer;
    }
    
    .candidate-card:hover:not(.selected) {
        border-color: var(--primary-color);
    }
    
    @media (max-width: 768px) {
        .success-overlay .success-content {
            margin: 1rem;
            padding: 2rem;
        }
        
        .success-overlay .success-content i {
            font-size: 3rem;
        }
    }
`;
document.head.appendChild(voterStyle);
