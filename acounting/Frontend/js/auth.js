document.addEventListener('DOMContentLoaded', () => {
    // --- REGISTER LOGIC ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop the page from refreshing
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const accessCode = document.getElementById('accessCode').value; // NEW

            try {
                // Send data to backend using our api.js function
                const data = await registerUser(name, email, password, accessCode);
                alert('Registration successful! Please login.');
                // Redirect to login page
                window.location.href = 'login.html';
            } catch (error) {
                // Show error message (e.g., email already exists or invalid access code)
                const alertBox = document.getElementById('alertBox');
                alertBox.className = 'alert alert-danger';
                alertBox.textContent = error.message;
                alertBox.style.display = 'block';
            }
        });
    }

    // --- LOGIN LOGIC ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop the page from refreshing
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Send data to backend using our api.js function
                const data = await loginUser(email, password);
                alert('Login successful!');
                // Redirect to dashboard page (we will build this next)
                window.location.href = 'dashboard.html';
            } catch (error) {
                // Show error message (e.g., wrong password)
                const alertBox = document.getElementById('alertBox');
                alertBox.className = 'alert alert-danger';
                alertBox.textContent = error.message;
                alertBox.style.display = 'block';
            }
        });
    }
});