document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const statusElement = document.getElementById('status');
  
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const terms = document.getElementById('terms').checked;
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, terms })
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