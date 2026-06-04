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
    // 5. Navigation Indicator & Active State
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const indicator = document.querySelector('.nav-indicator');

    if (navLinksContainer && indicator) {
        let activeLink = null; // Track current active item via scroll

        function updateIndicator(link) {
            if (!link) {
                indicator.style.width = '0px';
                return;
            }
            const linkRect = link.getBoundingClientRect();
            const containerRect = navLinksContainer.getBoundingClientRect();
            indicator.style.width = `${linkRect.width}px`;
            indicator.style.transform = `translateX(${linkRect.left - containerRect.left}px)`;
        }

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                updateIndicator(e.target);
            });
        });

        navLinksContainer.addEventListener('mouseleave', () => {
            updateIndicator(activeLink); // Revert to active item
        });

        // Intersection observer to track active section
        const sections = document.querySelectorAll('section[id]');
        const sectionObserver = new IntersectionObserver((entries) => {
            let found = false;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                    navLinks.forEach(l => l.classList.remove('active'));
                    if (activeLink) {
                        activeLink.classList.add('active');
                        updateIndicator(activeLink);
                        found = true;
                    }
                }
            });
            // Handle scrolling back to top where hero has no nav link match (reset active)
            if (!found && window.scrollY < 200) {
                navLinks.forEach(l => l.classList.remove('active'));
                activeLink = null;
                updateIndicator(null);
            }
        }, { threshold: 0.3 });

        sections.forEach(sec => sectionObserver.observe(sec));
    }

    // 6. 3D Hover & Spotlight Effects
    const cards = document.querySelectorAll('.glass-card, .service-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            // Check for reduced motion
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Spotlight update via CSS Variables
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // 3D Tilt calculation (subtle)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4; // Max 4deg
            const rotateY = ((x - centerX) / centerX) * 4;

            // GPU Accelerated Transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            // Delay removing transition for smooth reset
            card.style.transition = 'transform 0.5s ease-out';
            setTimeout(() => card.style.transition = '', 500);
        });
        
        card.addEventListener('mouseenter', () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            card.style.transition = 'none';
        });
    });

    // 7. Floating Particles System (Canvas)
    const canvas = document.getElementById('particles-bg');
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let width, height;
        
        // Mouse interaction area
        let mouse = { x: null, y: null, radius: 120 };
        
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2.5 + 0.5;
                this.speedX = Math.random() * 0.8 - 0.4;
                this.speedY = Math.random() * 0.8 - 0.4;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap around edges
                if (this.x > width) this.x = 0;
                if (this.x < 0) this.x = width;
                if (this.y > height) this.y = 0;
                if (this.y < 0) this.y = height;

                // Subtle repulsion from mouse
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= forceDirectionX * force * 1.5;
                        this.y -= forceDirectionY * force * 1.5;
                    }
                }
            }
            draw() {
                // Adjust colors dynamically based on theme
                const isDark = htmlElement.getAttribute('data-theme') === 'dark';
                ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(37, 99, 235, 0.4)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Optimize particle count based on screen size (max 80)
            let numParticles = Math.min((width * height) / 15000, 80);
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        requestAnimationFrame(animateParticles);
        
        // Re-draw on theme change to update colors seamlessly
        themeToggleBtn.addEventListener('click', () => {
            // Allow DOM update first
            setTimeout(() => {
               // Particles will auto draw with new theme color in next frame
            }, 50);
        });
    }
});
