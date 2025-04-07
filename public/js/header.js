// public/js/header.js
class Header extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        
        // Listen for auth status changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'username') {
                this.render();
            }
        });
    }
    
    render() {
        const username = sessionStorage.getItem('username');
        
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" type="text/css" href="style/header.css">
            <header class="main-header">
                <div class="logo">
                    <a href="/">Web-Forum</a>
                </div>
                <nav class="nav-menu">
                    <ul>
                        <li><a href="/chats">Chats</a></li>
                        <li><a href="/rules">Rules</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </nav>
                <div class="user-section">
                    ${username 
                        ? `<span class="username">Welcome, ${username}</span>
                           <button id="logout-btn">Logout</button>`
                        : `<div class="cta-button"><a href="log.html">Log in</a></div>`
                    }
                </div>
            </header>
        `;
        
        // Add logout functionality
        if (username) {
            const logoutBtn = this.shadowRoot.querySelector('#logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', this.logout);
            }
        }
    }
    
    async logout() {
        try {
            const response = await fetch('/api/auth/logout');
            const data = await response.json();
            
            sessionStorage.removeItem('username');
            window.location.href = data.redirect;
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Register the custom element
customElements.define('main-header', Header);

// Call checkAuthStatus when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth status first
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            sessionStorage.setItem('username', data.username);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
    
    // Create header if it doesn't exist
    if (!document.querySelector('main-header')) {
        const header = document.createElement('main-header');
        document.body.prepend(header);
    }
});