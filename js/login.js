// Login Page Logic with Username and Password
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    const eyeIcon = document.getElementById('eyeIcon');
    const loginBtn = document.getElementById('loginBtn');
    const loginLoader = document.getElementById('loginLoader');
    const loginText = document.getElementById('loginText');

    // Toggle Password Visibility
    if (togglePassword && passwordInput && eyeIcon) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'text') {
                eyeIcon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                `;
            } else {
                eyeIcon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                `;
            }
        });
    }

    // Real-time Username Validation
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            const username = usernameInput.value.trim();
            if (username && username.length < 3) {
                showError('username', 'Username must be at least 3 characters long');
            } else {
                hideError('username');
            }
        });
    }

    // Real-time Password Validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            if (password.length > 0 && password.length < 6) {
                showError('password', 'Password must be at least 6 characters long');
            } else {
                hideError('password');
            }
        });
    }

    // Form Submission with Backend Integration
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('🔑 Login form submitted');
            
            // Clear all previous errors
            clearAllErrors();
            
            const formData = new FormData(loginForm);
            const username = formData.get('username').trim();
            const password = formData.get('password');
            
            // Validate inputs
            let isValid = true;
            
            if (!username) {
                showError('username', 'Username is required');
                isValid = false;
            } else if (username.length < 3) {
                showError('username', 'Username must be at least 3 characters long');
                isValid = false;
            }
            
            if (!password) {
                showError('password', 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                showError('password', 'Password must be at least 6 characters long');
                isValid = false;
            }
            
            if (!isValid) {
                return;
            }

            const loginData = {
                username: username,
                password: password
            };

            console.log('📤 Sending login data:', { username: username, password: '***' });

            // Show loading state
            if (loginLoader && loginText && loginBtn) {
                loginLoader.classList.remove('hidden');
                loginText.textContent = 'Signing In...';
                loginBtn.disabled = true;
                loginBtn.classList.add('opacity-75', 'cursor-not-allowed');
            }

            try {
                // Connect to backend API
                const response = await fetch('http://localhost:3000/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                console.log('📡 Response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('📋 Login result:', result);

                    // Store authentication data
                    if (result.token) {
                        localStorage.setItem('authToken', result.token);
                    }
                    if (result.user) {
                        localStorage.setItem('user', JSON.stringify(result.user));
                    }
                    localStorage.setItem('loginTime', new Date().toISOString());
                    
                    console.log('✅ Login successful');
                    
                    // Show success message
                    showSuccessMessage('Login successful! Redirecting to dashboard...');
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                    
                } else {
                    const result = await response.json();
                    console.log('❌ Login failed:', result);
                    showError('username', result.message || 'Invalid username or password. Please try again.');
                }
                
            } catch (error) {
                console.error('❌ Login error:', error);
                
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    showError('username', 'Cannot connect to server. Please start the backend server.');
                } else {
                    showError('username', 'Network error. Please try again.');
                }
            } finally {
                // Reset button state
                if (loginLoader && loginText && loginBtn) {
                    loginLoader.classList.add('hidden');
                    loginText.textContent = 'Sign In';
                    loginBtn.disabled = false;
                    loginBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                }
            }
        });
    }

    // Helper Functions
    function showError(field, message) {
        const errorElement = document.getElementById(field + 'Error');
        const inputElement = document.getElementById(field);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
        
        if (inputElement) {
            inputElement.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
            inputElement.classList.remove('border-slate-300', 'focus:border-blue-500', 'focus:ring-blue-500');
        }
        
        setTimeout(() => {
            hideError(field);
        }, 5000);
    }

    function hideError(field) {
        const errorElement = document.getElementById(field + 'Error');
        const inputElement = document.getElementById(field);
        
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        
        if (inputElement) {
            inputElement.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
            inputElement.classList.add('border-slate-300', 'focus:border-blue-500', 'focus:ring-blue-500');
        }
    }

    function clearAllErrors() {
        ['username', 'password'].forEach(field => {
            hideError(field);
        });
    }

    function showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    console.log('✅ Login page loaded');
});
