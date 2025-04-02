document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const navCenter = document.querySelector('.nav-center');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling to document
        hamburger.classList.toggle('active');
        navCenter.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navCenter.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navCenter.contains(e.target)) {
            hamburger.classList.remove('active');
            navCenter.classList.remove('active');
        }
    });
}); 