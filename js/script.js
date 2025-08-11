/**
 * Main execution function that runs after the HTML document has been fully loaded.
 * It initializes all the interactive features of the website.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize all site functionalities
    handleMobileNavigation();
    handleActiveNavLinks();
    handleNavbarShadow();
    handleScrollFadeAnimation();

});

/**
 * Toggles the mobile navigation menu and handles closing it automatically
 * when a link is clicked or when clicking outside the menu.
 */
function handleMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!navToggle || !navLinks) return;

    // --- Function to close the menu ---
    // This prevents code duplication and makes the logic cleaner.
    const closeMenu = () => {
        navLinks.classList.remove('nav-open');
        navToggle.classList.remove('nav-open');
    };

    // --- Toggle menu on hamburger click ---
    navToggle.addEventListener('click', (e) => {
        // Stop the click from bubbling up to the document listener
        e.stopPropagation(); 
        navLinks.classList.toggle('nav-open');
        navToggle.classList.toggle('nav-open');
    });

    // --- Close menu when a navigation link is clicked ---
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // --- Close menu when clicking outside of it ---
    document.addEventListener('click', (e) => {
        // Check if the menu is open and the click was outside the nav links
        if (navLinks.classList.contains('nav-open') && !navLinks.contains(e.target)) {
            closeMenu();
        }
    });
}


/**
 * Sets the 'active' class on the correct navigation link based on the current page URL.
 * This helps users know which page they are currently on.
 */
function handleActiveNavLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}


/**
 * Adds a shadow to the fixed navigation bar when the user scrolls down.
 */
function handleNavbarShadow() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}


/**
 * Animates elements with the '.scroll-fade' class as they are scrolled into view.
 */
function handleScrollFadeAnimation() {
    const animatedElements = document.querySelectorAll('.scroll-fade');
    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1 
    });

    animatedElements.forEach(el => observer.observe(el));
}
