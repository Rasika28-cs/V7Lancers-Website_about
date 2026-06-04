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

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
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
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    // 5. Intelligent Navigation Underline
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const indicator = document.querySelector('.nav-indicator');

    if (navLinksContainer && indicator) {
        let activeLink = null;
        let targetX = 0;
        let targetWidth = 0;
        let currentX = 0;
        let currentWidth = 0;
        let isHovering = false;
        let isFirstRender = true;

        function setTarget(link) {
            if (!link) {
                targetWidth = 0;
                return;
            }
            const linkRect = link.getBoundingClientRect();
            const containerRect = navLinksContainer.getBoundingClientRect();
            targetWidth = linkRect.width;
            targetX = linkRect.left - containerRect.left;
        }

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                isHovering = true;
                setTarget(e.target);
            });
        });

        navLinksContainer.addEventListener('mouseleave', () => {
            isHovering = false;
            setTarget(activeLink);
        });

        // Smooth momentum using Lerp
        function animateIndicator() {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                currentX = targetX;
                currentWidth = targetWidth;
            } else {
                currentX += (targetX - currentX) * 0.15;
                currentWidth += (targetWidth - currentWidth) * 0.15;
            }
            
            // Snap when very close to avoid micro-calculations
            if (Math.abs(targetX - currentX) < 0.1) currentX = targetX;
            if (Math.abs(targetWidth - currentWidth) < 0.1) currentWidth = targetWidth;

            indicator.style.transform = `translateX(${currentX}px)`;
            indicator.style.width = `${currentWidth}px`;
            
            requestAnimationFrame(animateIndicator);
        }
        animateIndicator();

        // Active State tracking via scroll
        const sections = document.querySelectorAll('section[id]');
        const sectionObserver = new IntersectionObserver((entries) => {
            let found = false;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    const link = document.querySelector(`.nav-link[href="#${id}"]`);
                    navLinks.forEach(l => l.classList.remove('active'));
                    if (link) {
                        link.classList.add('active');
                        activeLink = link;
                        if (!isHovering) {
                            setTarget(activeLink);
                            if(isFirstRender) {
                                currentX = targetX;
                                currentWidth = targetWidth;
                                isFirstRender = false;
                            }
                        }
                        found = true;
                    }
                }
            });
            if (!found && window.scrollY < 200) {
                navLinks.forEach(l => l.classList.remove('active'));
                activeLink = null;
                if (!isHovering) setTarget(null);
            }
        }, { threshold: 0.4 });
        sections.forEach(sec => sectionObserver.observe(sec));
    }

    // 6. Floating Ambient Particles
    const canvas = document.getElementById('particles-bg');
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
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
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.parallaxFactor = Math.random() * 0.02 + 0.005;
                this.baseOpacity = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Parallax drift based on mouse
                const driftX = (mouseX - width / 2) * this.parallaxFactor * 0.02;
                const driftY = (mouseY - height / 2) * this.parallaxFactor * 0.02;
                
                this.x -= driftX;
                this.y -= driftY;

                // Wrap smoothly
                if (this.x > width + 10) this.x = -10;
                if (this.x < -10) this.x = width + 10;
                if (this.y > height + 10) this.y = -10;
                if (this.y < -10) this.y = height + 10;
            }
            draw() {
                const isDark = htmlElement.getAttribute('data-theme') === 'dark';
                ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${this.baseOpacity})` : `rgba(37, 99, 235, ${this.baseOpacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Optimize count for performance (max 75)
            const count = Math.min((width * height) / 15000, 75);
            for (let i = 0; i < count; i++) {
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
        animateParticles();
    }
});
