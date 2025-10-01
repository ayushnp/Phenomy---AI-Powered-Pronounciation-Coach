// Practice Domains Page Logic
document.addEventListener('DOMContentLoaded', function() {
    
    // Domain selection functionality
    const domainCards = document.querySelectorAll('.domain-card');
    
    domainCards.forEach(card => {
        card.addEventListener('click', function() {
            const domain = this.dataset.domain;
            handleDomainSelection(domain);
        });

        // Add individual button click handlers
        const practiceButton = card.querySelector('button');
        if (practiceButton) {
            practiceButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent card click
                const domain = card.dataset.domain;
                handleDomainSelection(domain);
            });
        }
    });

    function handleDomainSelection(domain) {
        // Show loading state
        const clickedCard = document.querySelector(`[data-domain="${domain}"]`);
        const button = clickedCard.querySelector('button');
        const buttonText = button.querySelector('span');
        const buttonIcon = button.querySelector('svg');
        
        // Store original content
        const originalText = buttonText.textContent;
        
        // Show loading state
        buttonText.textContent = 'Starting...';
        buttonIcon.innerHTML = `
            <path class="opacity-25" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        `;
        buttonIcon.classList.add('animate-spin');
        button.disabled = true;

        // Navigate to practice session
        setTimeout(() => {
            console.log(`Starting practice for domain: ${domain}`);
            
            // Store selected domain for the practice session
            localStorage.setItem('selectedDomain', domain.toUpperCase());
            localStorage.setItem('domainStartTime', new Date().toISOString());
            
            // Show success message
            showSuccessMessage(`Starting ${domain} practice session!`);
            
            // Redirect to practice session page
            setTimeout(() => {
                console.log(`Redirecting to practice session for ${domain}`);
                window.location.href = `practice-session.html?domain=${domain}`;
            }, 1500);
            
        }, 1000);
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

    // Animate progress bars on load
    setTimeout(() => {
        const progressBars = document.querySelectorAll('[style*="width:"]');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 300);
        });
    }, 500);

    // Add hover effects to domain cards
    domainCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('transform', 'scale-[1.02]');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('transform', 'scale-[1.02]');
        });
    });

    // Log successful page load
    console.log('Practice domains page loaded successfully');
    console.log('Available domains:', ['sports', 'politics', 'environment', 'social']);
});
