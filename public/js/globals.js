// public/js/globals.js

// Client-side session management
function initSession() {
  // Check if user is logged in on page load
  checkAuthStatus();
}

// Function to check authentication status with the server
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    if (data.authenticated) {
      // Store username in sessionStorage for components to use
      sessionStorage.setItem('username', data.username);
      console.log('User is authenticated:', data.username);
    } else {
      // Clear any existing data
      sessionStorage.removeItem('username');
      console.log('User is not authenticated');
    }
  } catch (error) {
    console.error('Error checking authentication status:', error);
  }
}

// Initialize the session
initSession();

export { initSession };