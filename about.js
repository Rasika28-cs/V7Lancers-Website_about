document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i');

    // Check system preference or localStorage
    const savedTheme = localStorage.getItem('v7-theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('v7-theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
        } else {
            themeIcon.classList.remove('ph-sun');
            themeIcon.classList.add('ph-moon');
        }
    }

    // 2. Scroll Reveal Animations using Intersection Observer
    const revealElements = document.querySelectorAll('.reveal, .reveal-card');

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 3. Animated Counters
    const counters = document.querySelectorAll('.counter');
    let hasAnimated = false;

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                startCounters();
                hasAnimated = true; // Only animate once
                observer.disconnect(); // Stop observing after animation starts
            }
        });
    }, { threshold: 0.5 });

    const metricsSection = document.querySelector('.metrics');
    if (metricsSection) {
        counterObserver.observe(metricsSection);
    }

    function startCounters() {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // ms
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
        });
    }

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    // 5. Directional Nav Link Underline
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const updateOrigin = (e) => {
            const rect = link.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            link.style.setProperty('--origin', relX < rect.width / 2 ? 'left center' : 'right center');
        };
        link.addEventListener('mouseenter', updateOrigin);
        link.addEventListener('mouseleave', updateOrigin);
    });

    // Handle Active state smoothly without indicators
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        let found = false;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                navLinks.forEach(l => l.classList.remove('active'));
                if (activeLink) {
                    activeLink.classList.add('active');
                    found = true;
                }
            }
        });
        if (!found && window.scrollY < 200) {
            navLinks.forEach(l => l.classList.remove('active'));
        }
    }, { threshold: 0.3 });
    sections.forEach(sec => sectionObserver.observe(sec));

    // 6. Cinematic Depth Parallax Hover Effects
    const cards = document.querySelectorAll('.glass-card, .service-card, .team-card');
    cards.forEach(card => {
        const children = card.children;
        
        card.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Subtle rotation
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            // Layered depth interaction
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // Independent internal element animation
            Array.from(children).forEach((child, index) => {
                // Ignore elements that shouldn't move
                if(child.tagName === 'P' && child.className !== 'role') {
                     const moveX = ((x - centerX) / centerX) * 3;
                     const moveY = ((y - centerY) / centerY) * 3;
                     child.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px)`;
                } else {
                     const depth = (index + 2) * 5; // e.g. 10, 15, 20
                     const moveX = ((x - centerX) / centerX) * depth;
                     const moveY = ((y - centerY) / centerY) * depth;
                     child.style.transform = `translate3d(${moveX}px, ${moveY}px, ${depth}px)`;
                }
            });
        });

        card.addEventListener('mouseleave', () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            
            // Exit animation with momentum
            card.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            
            Array.from(children).forEach(child => {
                child.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                child.style.transform = `translate3d(0px, 0px, 0px)`;
            });
            
            setTimeout(() => {
                card.style.transition = '';
                Array.from(children).forEach(child => child.style.transition = '');
            }, 800);
        });
        
        card.addEventListener('mouseenter', () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            // Entry animation without transition for instant binding to cursor
            card.style.transition = 'none';
            Array.from(children).forEach(child => child.style.transition = 'none');
        });
    });
});
