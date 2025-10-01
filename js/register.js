// Register Page Logic with Backend Integration
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const emailInput = document.getElementById('email');
    const fullNameInput = document.getElementById('fullName');
    const eyeIcon = document.getElementById('eyeIcon');
    const registerBtn = document.getElementById('registerBtn');
    const registerLoader = document.getElementById('registerLoader');
    const registerText = document.getElementById('registerText');
    const termsCheckbox = document.getElementById('terms');

    // Validation regexes
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;

    // Password Requirements
    const passwordRequirements = {
        length: /^.{8,}$/,
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /\d/
    };

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

    // Real-time Full Name Validation
    if (fullNameInput) {
        fullNameInput.addEventListener('blur', function() {
            const name = fullNameInput.value.trim();
            if (name && !nameRegex.test(name)) {
                showError('fullName', 'Name must be 2-50 characters and contain only letters');
            } else if (name) {
                hideError('fullName');
            }
        });

        fullNameInput.addEventListener('input', function() {
            const name = this.value;
            this.value = name.replace(/[^a-zA-Z\s]/g, '');
        });
    }

    // Real-time Email Validation
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = emailInput.value.trim();
            if (email && !emailRegex.test(email)) {
                showError('email', 'Please enter a valid email address');
            } else if (email) {
                hideError('email');
            }
        });
    }

    // Real-time Password Validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            
            Object.keys(passwordRequirements).forEach(requirement => {
                const element = document.getElementById(requirement);
                if (element) {
                    if (passwordRequirements[requirement].test(password)) {
                        element.classList.remove('text-slate-500');
                        element.classList.add('text-green-600');
                        const svg = element.querySelector('svg');
                        if (svg) {
                            svg.innerHTML = `
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            `;
                            svg.classList.add('text-green-600');
                        }
                    } else {
                        element.classList.remove('text-green-600');
                        element.classList.add('text-slate-500');
                        const svg = element.querySelector('svg');
                        if (svg) {
                            svg.innerHTML = `<circle cx="12" cy="12" r="10"></circle>`;
                            svg.classList.remove('text-green-600');
                        }
                    }
                }
            });
        });
    }

    // Real-time Confirm Password Validation
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword && password !== confirmPassword) {
                showError('confirmPassword', 'Passwords do not match');
            } else if (confirmPassword) {
                hideError('confirmPassword');
            }
        });
    }

    // Form Submission with Backend Integration
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('📝 Register form submitted');
            
            // Clear all previous errors
            clearAllErrors();
            
            const formData = new FormData(registerForm);
            const fullName = formData.get('fullName')?.trim() || '';
            const email = formData.get('email')?.trim() || '';
            const password = formData.get('password') || '';
            const confirmPassword = formData.get('confirmPassword') || '';
            const termsAccepted = formData.get('terms');
            
            let isValid = true;
            
            // Validation
            if (!fullName) {
                showError('fullName', 'Full name is required');
                isValid = false;
            } else if (!nameRegex.test(fullName)) {
                showError('fullName', 'Name must be 2-50 characters and contain only letters');
                isValid = false;
            }
            
            if (!email) {
                showError('email', 'Email address is required');
                isValid = false;
            } else if (!emailRegex.test(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            if (!password) {
                showError('password', 'Password is required');
                isValid = false;
            } else {
                const passwordValid = Object.values(passwordRequirements).every(req => req.test(password));
                if (!passwordValid) {
                    showError('password', 'Password does not meet all requirements');
                    isValid = false;
                }
            }
            
            if (!confirmPassword) {
                showError('confirmPassword', 'Please confirm your password');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError('confirmPassword', 'Passwords do not match');
                isValid = false;
            }
            
            if (!termsAccepted) {
                showError('terms', 'You must agree to the Terms of Service and Privacy Policy');
                isValid = false;
            }
            
            if (!isValid) {
                return;
            }

            const registerData = {
                username: fullName,  // Backend expects 'username'
                email: email,
                password: password
            };

            // Show loading state
            if (registerLoader && registerText && registerBtn) {
                registerLoader.classList.remove('hidden');
                registerText.textContent = 'Creating Account...';
                registerBtn.disabled = true;
                registerBtn.classList.add('opacity-75', 'cursor-not-allowed');
            }

            try {
                // Connect to backend - CORRECT URL based on friend's structure  
                const response = await fetch('http://localhost:3000/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(registerData)
                });

                console.log('📡 Response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('📋 Register result:', result);

                    // Store user data (no token for registration typically)
                    if (result.user) {
                        localStorage.setItem('user', JSON.stringify(result.user));
                    }
                    localStorage.setItem('loginTime', new Date().toISOString());
                    
                    console.log('✅ Registration successful');
                    
                    // Show success message
                    showSuccessMessage('Registration successful! You can now log in.');
                    
                    // Redirect to login page
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                    
                } else {
                    const result = await response.json();
                    console.log('❌ Registration failed:', result);
                    
                    if (result.field && result.message) {
                        showError(result.field, result.message);
                    } else {
                        showError('email', result.message || 'Registration failed. Please try again.');
                    }
                }
                
            } catch (error) {
                console.error('❌ Registration error:', error);
                
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    showError('email', 'Cannot connect to server. Please start the backend server.');
                } else {
                    showError('email', 'Network error. Please try again.');
                }
                
            } finally {
                // Reset button state
                if (registerLoader && registerText && registerBtn) {
                    registerLoader.classList.add('hidden');
                    registerText.textContent = 'Create Account';
                    registerBtn.disabled = false;
                    registerBtn.classList.remove('opacity-75', 'cursor-not-allowed');
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
        
        if (inputElement && field !== 'terms') {
            inputElement.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
            inputElement.classList.remove('border-slate-300', 'focus:border-blue-500', 'focus:ring-blue-500');
        }
        
        setTimeout(() => {
            hideError(field);
        }, 7000);
    }

    function hideError(field) {
        const errorElement = document.getElementById(field + 'Error');
        const inputElement = document.getElementById(field);
        
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        
        if (inputElement && field !== 'terms') {
            inputElement.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
            inputElement.classList.add('border-slate-300', 'focus:border-blue-500', 'focus:ring-blue-500');
        }
    }

    function clearAllErrors() {
        ['fullName', 'email', 'password', 'confirmPassword', 'terms'].forEach(field => {
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
        }, 4000);
    }

    console.log('✅ Register page loaded');
});
