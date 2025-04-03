document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navCenter = document.querySelector('.nav-center');
    const body = document.body;

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navCenter.classList.toggle('active');
            body.style.overflow = navCenter.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (navCenter.classList.contains('active') && 
            !navCenter.contains(event.target) && 
            event.target !== mobileMenuToggle) {
            navCenter.classList.remove('active');
            body.style.overflow = '';
        }
    });

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-center .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navCenter.classList.remove('active');
            body.style.overflow = '';
        });
    });

    // Prevent default touch behavior on mobile menu
    navCenter.addEventListener('touchmove', (e) => {
        if (navCenter.classList.contains('active')) {
            e.preventDefault();
        }
    }, { passive: false });

    // Fix navigation links - make sure they work correctly
    const allLinks = document.querySelectorAll('a:not([onclick])');
    allLinks.forEach(link => {
        if (link.getAttribute('href') && 
            !link.getAttribute('href').startsWith('#') && 
            !link.getAttribute('href').startsWith('javascript')) {
            
            const href = link.getAttribute('href');
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.replace(href);
            });
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .step, .testimonial-card, .game-card, .pricing-card, .timeline-step');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animated');
            }
        });
    };

    // Run animation check on page load and scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // Comparison toggle
    const comparisonSwitch = document.getElementById('comparisonSwitch');
    const onStats = document.querySelector('.on-stats');
    const offStats = document.querySelector('.off-stats');
    const toggleLabels = document.querySelectorAll('.toggle-container .toggle-label');

    if (comparisonSwitch) {
        comparisonSwitch.addEventListener('change', function() {
            if (this.checked) {
                onStats.classList.add('active');
                offStats.classList.remove('active');
                toggleLabels[0].classList.remove('active');
                toggleLabels[1].classList.add('active');
            } else {
                onStats.classList.remove('active');
                offStats.classList.add('active');
                toggleLabels[0].classList.add('active');
                toggleLabels[1].classList.remove('active');
            }
        });
    }

    // Pricing toggle
    const pricingToggle = document.getElementById('pricingToggle');
    const monthlyLabel = document.getElementById('monthlyLabel');
    const yearlyLabel = document.getElementById('yearlyLabel');
    const monthlyPrices = document.querySelectorAll('.price.monthly');
    const yearlyPrices = document.querySelectorAll('.price.yearly');

    if (pricingToggle) {
        pricingToggle.addEventListener('change', function() {
            if (this.checked) {
                // Yearly is active
                monthlyLabel.classList.remove('active');
                yearlyLabel.classList.add('active');
                
                monthlyPrices.forEach(price => {
                    price.classList.remove('active');
                });
                yearlyPrices.forEach(price => {
                    price.classList.add('active');
                });
            } else {
                // Monthly is active
                monthlyLabel.classList.add('active');
                yearlyLabel.classList.remove('active');
                
                monthlyPrices.forEach(price => {
                    price.classList.add('active');
                });
                yearlyPrices.forEach(price => {
                    price.classList.remove('active');
                });
            }
        });
    }

    // Add animation to stats numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        // Get the target number from the HTML
        const targetNumber = parseInt(stat.textContent.replace(/\D/g, ''));
        let currentNumber = 0;
        const duration = 2000; // Animation duration in ms
        const frameDuration = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameDuration);
        const increment = targetNumber / totalFrames;
        
        // Start from 0 and animate up
        stat.textContent = '0';
        if (stat.querySelector('.plus')) {
            stat.textContent += '+';
        } else if (stat.querySelector('.percent')) {
            stat.textContent += '%';
        }
        
        const animate = () => {
            currentNumber += increment;
            if (currentNumber < targetNumber) {
                if (stat.querySelector('.plus')) {
                    stat.innerHTML = `${Math.floor(currentNumber)}<span class="plus">+</span>`;
                } else if (stat.querySelector('.percent')) {
                    stat.innerHTML = `${Math.floor(currentNumber)}<span class="percent">%</span>`;
                } else {
                    stat.textContent = Math.floor(currentNumber);
                }
                requestAnimationFrame(animate);
            } else {
                if (stat.querySelector('.plus')) {
                    stat.innerHTML = `${targetNumber}<span class="plus">+</span>`;
                } else if (stat.querySelector('.percent')) {
                    stat.innerHTML = `${targetNumber}<span class="percent">%</span>`;
                } else {
                    stat.textContent = targetNumber;
                }
            }
        };
        
        // Start animation when the element comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(animate);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(stat);
    });

    // Animated comparison stats with smooth transitions
    function animateStats() {
        const pingValues = {
            on: [8, 9, 7, 10, 8, 9, 7, 8],  // Tighter range for better ping
            off: [75, 78, 82, 79, 81, 77, 80, 78]  // Tighter range for worse ping
        };
        
        const fpsValues = {
            on: [125, 128, 130, 127, 129, 126, 128, 127],  // Tighter range for better FPS
            off: [45, 48, 42, 46, 44, 47, 43, 45]  // Much lower FPS when off
        };
        
        // Update selectors to match actual HTML structure
        const goodPing = document.querySelector('.on-stats .stat-value:nth-child(2)');
        const goodFps = document.querySelector('.on-stats .stat-value:nth-child(4)');
        const badPing = document.querySelector('.off-stats .stat-value:nth-child(2)');
        const badFps = document.querySelector('.off-stats .stat-value:nth-child(4)');
        
        let index = 0;
        
        // Function to update stats based on toggle state
        function updateStats() {
            const isOn = comparisonSwitch.checked;
            const currentPing = isOn ? pingValues.on[index] : pingValues.off[index];
            const currentFps = isOn ? fpsValues.on[index] : fpsValues.off[index];
            
            // Update with animation
            function updateWithAnimation(element, value, suffix = '') {
                if (!element) return;
                
                element.style.opacity = '0.5';
                element.style.transform = 'translateY(5px)';
                
                setTimeout(() => {
                    element.textContent = value + suffix;
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 200); // Slower animation
            }
            
            // Update all stats
            updateWithAnimation(goodPing, currentPing, 'ms');
            updateWithAnimation(goodFps, currentFps);
            updateWithAnimation(badPing, currentPing, 'ms');
            updateWithAnimation(badFps, currentFps);
        }
        
        // Initial update
        updateStats();
        
        // Update every 2 seconds for slower changes
        setInterval(() => {
            index = (index + 1) % pingValues.on.length;
            updateStats();
        }, 2000);
        
        // Update when toggle changes
        if (comparisonSwitch) {
            comparisonSwitch.addEventListener('change', updateStats);
        }
    }
    
    animateStats();
}); 