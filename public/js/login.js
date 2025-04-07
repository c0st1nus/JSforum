document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const statusElement = document.getElementById('status');
  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        statusElement.textContent = data.message;
        statusElement.style.color = 'green';
        
        // Store username in session storage
        sessionStorage.setItem('username', username);
        
        // Redirect
        window.location.href = data.redirect;
      } else {
        statusElement.textContent = data.error;
        statusElement.style.color = 'red';
      }
    } catch (error) {
      statusElement.textContent = 'An error occurred. Please try again.';
      statusElement.style.color = 'red';
      console.error('Error:', error);
    }
  });
});