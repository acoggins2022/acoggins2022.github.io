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
