/**
 * Scroll Reveal Animations
 * Triggers section animations when scrolling into view
 */

class ScrollReveal {
    constructor() {
        this.sections = [];
        this.observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px', // Trigger slightly before entering viewport
            threshold: 0.15 // Trigger when 15% visible
        };

        this.init();
    }

    init() {
        console.log('🎬 ScrollReveal initialized');

        // Find all sections to animate
        this.sections = document.querySelectorAll('section');
        console.log(`Found ${this.sections.length} sections to animate`);

        // Add initial state classes
        this.sections.forEach((section, index) => {
            // Skip hero section (already visible)
            if (section.classList.contains('hero')) {
                section.setAttribute('data-revealed', 'true');
                console.log('Skipping hero section');
                return;
            }

            // Add animation type based on section
            this.assignAnimationType(section, index);

            // Mark as not revealed
            section.setAttribute('data-revealed', 'false');
            console.log(`Section ${index} set to: ${section.getAttribute('data-reveal')}`);
        });

        // Create intersection observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            this.observerOptions
        );

        // Observe all sections
        this.sections.forEach(section => {
            if (!section.classList.contains('hero')) {
                this.observer.observe(section);
            }
        });

        // Also observe individual cards/items for stagger effect
        this.observeStaggerItems();
    }

    assignAnimationType(section, index) {
        // Get section class to determine animation
        const classList = section.classList;

        if (classList.contains('stats')) {
            section.setAttribute('data-reveal', 'fade-up');
            section.setAttribute('data-counter', 'true');
        } else if (classList.contains('portfolio')) {
            section.setAttribute('data-reveal', 'curtain');
        } else if (classList.contains('services')) {
            section.setAttribute('data-reveal', 'fade-up');
        } else if (classList.contains('testimonials')) {
            section.setAttribute('data-reveal', 'scale-fade');
        } else if (classList.contains('contact')) {
            section.setAttribute('data-reveal', 'slide-up');
        } else if (classList.contains('trust-badges')) {
            section.setAttribute('data-reveal', 'fade-up');
        } else {
            // Alternate between slide-left and slide-right for variety
            const animations = ['fade-up', 'slide-left', 'slide-right'];
            section.setAttribute('data-reveal', animations[index % animations.length]);
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;

                if (section.getAttribute('data-revealed') === 'false') {
                    console.log('✨ Revealing section:', section.className);

                    // Mark as revealed
                    section.setAttribute('data-revealed', 'true');

                    // Add reveal class
                    section.classList.add('reveal-active');

                    // Handle counters if needed
                    if (section.getAttribute('data-counter') === 'true') {
                        this.animateCounters(section);
                    }

                    // Stop observing this section
                    this.observer.unobserve(section);
                }
            }
        });
    }

    observeStaggerItems() {
        // Find all stagger containers
        const staggerContainers = document.querySelectorAll('[data-stagger="true"]');

        staggerContainers.forEach(container => {
            const items = container.children;

            Array.from(items).forEach((item, index) => {
                item.style.transitionDelay = `${index * 0.1}s`;
                item.setAttribute('data-stagger-item', 'true');
            });
        });
    }

    animateCounters(section) {
        const counters = section.querySelectorAll('.stat-number');

        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            const suffix = counter.textContent.replace(/[0-9]/g, '');

            const updateCounter = () => {
                current += increment;

                if (current < target) {
                    counter.textContent = Math.ceil(current) + suffix;
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + suffix;
                }
            };

            updateCounter();
        });
    }
}

// Initialize when DOM is loaded - or immediately if already loaded
function initScrollReveal() {
    console.log('🚀 Initializing ScrollReveal...');

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        new ScrollReveal();
    } else {
        console.log('⚡ Reduced motion preferred - showing all sections immediately');
        // If reduced motion preferred, show everything immediately
        document.querySelectorAll('section').forEach(section => {
            section.setAttribute('data-revealed', 'true');
            section.classList.add('reveal-active');
        });
    }
}

// Run immediately if DOM is already loaded, otherwise wait
if (document.readyState === 'loading') {
    console.log('⏳ DOM not ready, waiting...');
    document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
    console.log('✅ DOM already ready, initializing now');
    initScrollReveal();
}
