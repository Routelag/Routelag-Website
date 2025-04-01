document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navCenter = document.querySelector('.nav-center');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navCenter.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (navCenter.classList.contains('active') && 
            !navCenter.contains(event.target) && 
            event.target !== mobileMenuToggle) {
            navCenter.classList.remove('active');
        }
    });

    // Fix navigation links - make sure they work correctly
    const navLinks = document.querySelectorAll('a:not([onclick])');
    navLinks.forEach(link => {
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
            on: [8, 10, 12, 9, 11],
            off: [75, 80, 87, 92, 84]
        };
        
        const fpsValues = {
            on: [125, 130, 128, 132, 135],
            off: [62, 68, 65, 58, 72]
        };
        
        const goodPing = document.querySelector('.on-stats .stat-value:nth-of-type(1)');
        const goodFps = document.querySelector('.on-stats .stat-value:nth-of-type(2)');
        const badPing = document.querySelector('.off-stats .stat-value:nth-of-type(1)');
        const badFps = document.querySelector('.off-stats .stat-value:nth-of-type(2)');
        
        let index = 0;
        
        setInterval(() => {
            index = (index + 1) % pingValues.on.length;
            
            // Add a smooth transition effect
            function updateWithAnimation(element, value, suffix = '') {
                if (!element) return;
                
                // First make it slightly transparent
                element.style.opacity = '0.5';
                element.style.transform = 'translateY(5px)';
                
                // Then after a short delay, update the value and restore opacity
                setTimeout(() => {
                    element.textContent = value + suffix;
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 200);
            }
            
            updateWithAnimation(goodPing, pingValues.on[index], 'ms');
            updateWithAnimation(goodFps, fpsValues.on[index]);
            updateWithAnimation(badPing, pingValues.off[index], 'ms');
            updateWithAnimation(badFps, fpsValues.off[index]);
        }, 3000);
    }
    
    animateStats();
}); 