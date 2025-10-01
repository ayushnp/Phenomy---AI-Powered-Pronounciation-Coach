


















// Dashboard Page Logic
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if user is logged in (basic check)
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        // Redirect to login if not authenticated
        // window.location.href = 'login.html';
    }

    // Get all interactive elements
    const startPracticeBtn = document.getElementById('startPracticeBtn');
    const profileBtn = document.querySelector('button:has(svg path[d*="M16 7a4 4 0 11-8 0"])'); // Profile button selector
    const logoutBtn = document.querySelector('button[onclick*="index.html"]'); // Logout button selector

    // Start Practice Button - ONLY this should go to practice domains
    if (startPracticeBtn) {
        startPracticeBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default behavior
            e.stopPropagation(); // Stop event bubbling
            
            console.log('Start Practice button clicked'); // Debug log
            
            // Add loading state
            const originalHTML = startPracticeBtn.innerHTML;
            startPracticeBtn.innerHTML = `
                <span class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Session...
                </span>
            `;
            
            startPracticeBtn.disabled = true;
            
            // Navigate to practice domains after loading animation
            setTimeout(() => {
                console.log('Navigating to practice domains...'); // Debug log
                window.location.href = 'practice-domains.html';
            }, 1500);
        });
    }

    // Profile Button - Add your profile functionality here
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Profile button clicked');
            // Add profile functionality here
            alert('Profile page would open here!');
        });
    }

    // Logout Button - Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout button clicked');
            
            // Clear authentication data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
            
            // Show logout message
            showSuccessMessage('Logged out successfully!');
            
            // Redirect to home page after short delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        });
    }

    // Animate progress bars on load
    setTimeout(() => {
        const progressBars = document.querySelectorAll('[style*="width:"]');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 500);
        });
    }, 500);

    // Add hover effects to activity items
    const activityItems = document.querySelectorAll('.group');
    activityItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('transform', 'scale-[1.02]');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('transform', 'scale-[1.02]');
        });

        // Add click handler for activity items (for future functionality)
        item.addEventListener('click', function(e) {
            // Only if it's not the start practice button
            if (!e.target.closest('#startPracticeBtn')) {
                console.log('Activity item clicked:', this);
                // Add activity item functionality here
            }
        });
    });

    // Simulate real-time updates after 3 seconds
    setTimeout(() => {
        updateStats();
    }, 3000);

    // Points update functionality
    function updateStats() {
        const pointsDisplay = document.querySelector('.text-green-700');
        if (pointsDisplay) {
            let currentPoints = parseInt(pointsDisplay.textContent);
            const increment = 10;
            const newPoints = currentPoints + increment;
            
            // Animate point increase
            animateNumber(pointsDisplay, currentPoints, newPoints, 1000);
        }
    }

    // Number animation helper
    function animateNumber(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Success message helper
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
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Add subtle animations to stat cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe stat cards for animations
    document.querySelectorAll('.bg-white\\/80').forEach(card => {
        observer.observe(card);
    });

    // Prevent any accidental navigation from other elements
    document.addEventListener('click', function(e) {
        // Only allow navigation from specific buttons
        const allowedNavigationElements = [
            '#startPracticeBtn',
            'button[onclick*="index.html"]', // Logout button
            '.logo', // Logo click to go home
            '[data-navigate]' // Any element with data-navigate attribute
        ];
        
        const isAllowedNavigation = allowedNavigationElements.some(selector => 
            e.target.closest(selector)
        );
        
        // Log for debugging
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            console.log('Button clicked:', e.target, 'Allowed navigation:', isAllowedNavigation);
        }
    });

    console.log('Dashboard loaded successfully'); // Debug log
});

// Add CSS classes for animations
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
