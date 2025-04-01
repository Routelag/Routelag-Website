document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
    });

    // Close menu on click outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && e.target !== mobileMenuToggle) {
            navLinks.classList.remove('active');
        }
    });

    // Smooth scroll for navigation links and close menu on click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
            navLinks.classList.remove('active');
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
    });

    // Close menu on click outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && e.target !== mobileMenuToggle) {
            navLinks.classList.remove('active');
        }
    });

    // Smooth scroll for navigation links and close menu on click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
            navLinks.classList.remove('active');
        });
    });
});
