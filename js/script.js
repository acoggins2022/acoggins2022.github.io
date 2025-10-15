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
    handleThemeToggle();
    handleSectionHighlighting();

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
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
        document.removeEventListener('keydown', trapTabKey);
    };

    // --- Toggle menu on hamburger click ---
    navToggle.addEventListener('click', (e) => {
        // Stop the click from bubbling up to the document listener
        e.stopPropagation(); 
        navLinks.classList.toggle('nav-open');
        navToggle.classList.toggle('nav-open');
        const expanded = navToggle.classList.contains('nav-open');
        navToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        if (expanded) {
            document.addEventListener('keydown', trapTabKey);
            const firstLink = navLinks.querySelector('a');
            if (firstLink) firstLink.focus();
        } else {
            document.removeEventListener('keydown', trapTabKey);
        }
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

    // Focus trap logic
    function trapTabKey(e) {
        if (e.key !== 'Tab') return;
        const focusable = navLinks.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
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
            link.setAttribute('aria-current', 'page');
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

/**
 * Highlights active section in the nav as you scroll.
 */
function handleSectionHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    if (sections.length === 0 || navLinks.length === 0) return;

    const byId = (id) => Array.from(navLinks).find(a => (a.getAttribute('href') || '').includes(`#${id}`));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const link = byId(entry.target.id);
            if (!link) return;
            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.remove('active'));
                link.classList.add('active');
                navLinks.forEach(a => a.removeAttribute('aria-current'));
                link.setAttribute('aria-current', 'page');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

    sections.forEach(sec => observer.observe(sec));
}

/**
 * Handles dark mode toggling and persistence via localStorage.
 */
function handleThemeToggle() {
    const root = document.documentElement; // <html>
    const toggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const saved = localStorage.getItem('theme');
    const initialTheme = saved || (prefersDark ? 'dark' : 'light');
    if (initialTheme === 'dark') {
        root.classList.add('theme-dark');
    }

    if (!toggle) return;

    const updateIcon = () => {
        const isDark = root.classList.contains('theme-dark');
        toggle.innerHTML = isDark ? '<i class="fas fa-sun" aria-hidden="true"></i>' : '<i class="fas fa-moon" aria-hidden="true"></i>';
        toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        toggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    };

    updateIcon();

    toggle.addEventListener('click', () => {
        root.classList.toggle('theme-dark');
        const isDark = root.classList.contains('theme-dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateIcon();
    });
}
