// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Select all elements that should fade in on scroll
    const animatedElements = document.querySelectorAll('.scroll-fade');

    // If there are no elements to animate, do nothing.
    if (animatedElements.length === 0) {
        return;
    }

    // Set up the Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If the element is in the viewport, add the 'visible' class
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing the element once it's visible
                // to prevent re-triggering the animation.
                observer.unobserve(entry.target);
            }
        });
    }, {
        // threshold determines how much of the element must be visible
        // before the animation triggers. 0.1 means 10%.
        threshold: 0.1
    });

    // Observe each of the selected elements
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});
document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Navbar Shadow on Scroll ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Active Nav Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (sections.length > 0 && navLinks.length > 0) {
        const observerOptions = {
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // --- Your existing scroll-fade animation logic ---
    const animatedElements = document.querySelectorAll('.scroll-fade');
    if (animatedElements.length > 0) {
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

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
});
