// Dynamic Voting Quotes System
class QuotesManager {
    constructor() {
        this.quotes = [
            {
                text: "Democracy is not just the right to vote, it is the right to live in dignity.",
                author: "Naomi Klein"
            },
            {
                text: "The vote is the most powerful instrument ever devised by man for breaking down injustice.",
                author: "Lyndon B. Johnson"
            },
            {
                text: "Your vote is your voice. Use it wisely.",
                author: "Student Council Motto"
            },
            {
                text: "Democracy is not a spectator sport. It requires the active participation of all citizens.",
                author: "Robert Kennedy"
            },
            {
                text: "The best way to take control over a people and control them utterly is to take a little of their freedom at a time.",
                author: "Adolf Hitler (Negative Example)"
            },
            {
                text: "Every vote matters. Every voice counts. Make yours heard.",
                author: "Election Commission"
            },
            {
                text: "In a democracy, the individual enjoys not only the ultimate power but carries the ultimate responsibility.",
                author: "Norman Cousins"
            },
            {
                text: "The ballot is stronger than the bullet.",
                author: "Abraham Lincoln"
            },
            {
                text: "Democracy is the government of the people, by the people, for the people.",
                author: "Abraham Lincoln"
            },
            {
                text: "A vote is like a rifle: its usefulness depends upon the character of the user.",
                author: "Theodore Roosevelt"
            },
            {
                text: "The price of freedom is eternal vigilance. Vote responsibly.",
                author: "Thomas Jefferson (Adapted)"
            },
            {
                text: "Your voice, your choice, your future. Exercise your right to vote.",
                author: "Civic Education"
            },
            {
                text: "Democracy cannot succeed unless those who express their choice are prepared to choose wisely.",
                author: "Franklin D. Roosevelt"
            },
            {
                text: "Voting is not only our right—it is our power.",
                author: "Loung Ung"
            },
            {
                text: "The future belongs to those who participate in shaping it today.",
                author: "Student Leadership"
            }
        ];
        
        this.currentQuoteIndex = 0;
        this.quoteInterval = null;
        this.isLoginPage = false;
    }
    
    init() {
        // Only run on login page
        const loginPage = document.getElementById('login-page');
        const quoteDisplay = document.getElementById('quote-display');
        
        console.log('Init called, login page:', !!loginPage, 'quote display:', !!quoteDisplay);
        
        if (loginPage && loginPage.classList.contains('active') && quoteDisplay) {
            this.isLoginPage = true;
            console.log('Starting quote rotation on login page');
            this.startQuoteRotation();
        } else {
            console.log('Conditions not met for quote initialization');
        }
    }
    
    startQuoteRotation() {
        if (!this.isLoginPage) return;
        
        const quoteDisplay = document.getElementById('quote-display');
        if (!quoteDisplay) {
            console.log('Quote display element not found');
            return;
        }
        
        console.log('Quote rotation started');
        
        // Show first quote immediately
        this.displayQuote(0);
        
        // Start rotation every 4 seconds
        this.quoteInterval = setInterval(() => {
            this.rotateQuote();
        }, 4000);
    }
    
    displayQuote(index) {
        const quoteDisplay = document.getElementById('quote-display');
        const quoteText = document.querySelector('.quote-text');
        const quoteAuthor = document.querySelector('.quote-author');
        
        if (!quoteDisplay || !quoteText || !quoteAuthor) {
            console.log('Quote elements not found', { quoteDisplay, quoteText, quoteAuthor });
            return;
        }
        
        const quote = this.quotes[index];
        console.log('Displaying quote:', quote.text);
        
        // Fade out
        quoteDisplay.classList.add('fade-out');
        
        setTimeout(() => {
            // Update content
            quoteText.textContent = quote.text;
            quoteAuthor.textContent = `— ${quote.author}`;
            
            // Fade in
            quoteDisplay.classList.remove('fade-out');
        }, 250);
    }
    
    rotateQuote() {
        this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
        this.displayQuote(this.currentQuoteIndex);
    }
    
    stopQuoteRotation() {
        if (this.quoteInterval) {
            clearInterval(this.quoteInterval);
            this.quoteInterval = null;
        }
    }
    
    // Clean up when leaving login page
    destroy() {
        this.stopQuoteRotation();
        this.isLoginPage = false;
    }
}

// Initialize quotes manager
window.quotesManager = new QuotesManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing quotes manager');
    if (window.quotesManager) {
        // Wait a bit for page to fully load
        setTimeout(() => {
            window.quotesManager.init();
        }, 1000);
    }
});

// Also try to initialize when window loads
window.addEventListener('load', () => {
    console.log('Window loaded, trying quotes again');
    if (window.quotesManager && !window.quotesManager.quoteInterval) {
        setTimeout(() => {
            window.quotesManager.init();
        }, 500);
    }
});

// Cleanup when navigating away from login
window.addEventListener('beforeunload', () => {
    if (window.quotesManager) {
        window.quotesManager.destroy();
    }
});