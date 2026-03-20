/* ═══════════════════════════════════════
   UNITY BRIDGE — main.js
   Handles: cursor, nav, hero particles,
   scroll reveal, hamburger, form
═══════════════════════════════════════ */

'use strict';

/* ── CUSTOM CURSOR ── */
(function initCursor() {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (!cursor || !ring) return;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    // Smooth ring follows cursor
    function animateRing() {
        rx += (mx - rx) * 0.14;
        ry += (my - ry) * 0.14;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover state on interactive elements
    const interactives = 'a, button, input, textarea, select, .service-card, .team-card, .pillar';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(interactives)) ring.classList.add('hovered');
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(interactives)) ring.classList.remove('hovered');
    });

    // Hide on mouse leave
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        ring.style.opacity = '1';
    });
})();


/* ── NAV: SCROLL SHRINK & ACTIVE LINK ── */
(function initNav() {
    const header = document.getElementById('navbar');
    const links = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    // Shrink on scroll
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 40);
        highlightActiveLink();
    }, { passive: true });

    function highlightActiveLink() {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.getAttribute('id');
            }
        });
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
})();


/* ── HAMBURGER MENU ── */
(function initHamburger() {
    const btn = document.getElementById('hamburger');
    const links = document.getElementById('navLinks');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
        const isOpen = btn.classList.toggle('open');
        links.classList.toggle('open', isOpen);
        btn.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            btn.classList.remove('open');
            links.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
})();


/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const offset = document.getElementById('navbar').offsetHeight + 12;
        window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - offset,
            behavior: 'smooth'
        });
    });
});


/* ── HERO PARTICLE CANVAS ── */
(function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], mouse = { x: -999, y: -999 };
    const COUNT = 90;
    const CYAN = '0, 200, 232';

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
        constructor() { this.reset(true); }
        reset(init = false) {
            this.x = Math.random() * W;
            this.y = init ? Math.random() * H : H + 10;
            this.size = 0.6 + Math.random() * 1.8;
            this.speedX = (Math.random() - 0.5) * 0.35;
            this.speedY = -(0.25 + Math.random() * 0.55);
            this.alpha = 0;
            this.maxAlpha = 0.2 + Math.random() * 0.35;
            this.life = 0;
            this.maxLife = 180 + Math.random() * 260;
            if (init) {
                this.life = Math.random() * this.maxLife;
                this.alpha = this.maxAlpha * (this.life / this.maxLife);
            }
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life++;

            // Subtle mouse repulsion
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.x += dx / dist * force * 1.5;
                this.y += dy / dist * force * 1.5;
            }

            // Fade in / fade out
            const progress = this.life / this.maxLife;
            if (progress < 0.15) this.alpha = this.maxAlpha * (progress / 0.15);
            else if (progress > 0.75) this.alpha = this.maxAlpha * (1 - (progress - 0.75) / 0.25);
            else this.alpha = this.maxAlpha;

            if (this.life >= this.maxLife) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = `rgba(${CYAN}, 1)`;
            ctx.shadowColor = `rgba(${CYAN}, 0.8)`;
            ctx.shadowBlur = this.size * 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function drawConnections() {
        const maxDist = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.08;
                    ctx.save();
                    ctx.strokeStyle = `rgba(${CYAN}, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        drawConnections();
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }

    function init() {
        resize();
        particles = Array.from({ length: COUNT }, () => new Particle());
        animate();
    }

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    window.addEventListener('resize', () => {
        resize();
        particles.forEach(p => p.reset(true));
    });

    init();
})();


/* ── SCROLL REVEAL ── */
(function initScrollReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Honour data-delay attribute
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => entry.target.classList.add('revealed'), parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    els.forEach(el => observer.observe(el));
})();


/* ── CONTACT FORM ── */
(function initForm() {
    const form = document.getElementById('contact-form');
    const successBox = document.getElementById('form-success');
    const submitBtn = document.getElementById('submitBtn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic client-side validation
        const name = form.querySelector('#name');
        const email = form.querySelector('#email');
        const message = form.querySelector('#message');
        let valid = true;

        [name, email, message].forEach(field => {
            field.style.borderColor = '';
            if (!field.value.trim()) {
                field.style.borderColor = '#f43f5e';
                valid = false;
            }
        });
        if (!valid) return;

        // Show loading state
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';

        try {
            const data = new FormData(form);
            const res = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                // Show success
                form.style.display = 'none';
                successBox.style.display = 'flex';
            } else {
                throw new Error('Form submission failed');
            }
        } catch (err) {
            // Reset button and show inline error
            submitBtn.disabled = false;
            btnText.style.display = 'flex';
            btnLoading.style.display = 'none';
            // Show a simple error note
            let errNote = form.querySelector('.form-error');
            if (!errNote) {
                errNote = document.createElement('p');
                errNote.className = 'form-error';
                errNote.style.cssText = 'color:#f43f5e;font-size:.85rem;text-align:center;margin-top:.5rem';
                submitBtn.after(errNote);
            }
            errNote.textContent = 'Something went wrong. Please email us directly at hello@unitybridge.com';
        }
    });

    // Clear red borders on input
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => { field.style.borderColor = ''; });
    });
})();


/* ── ACTIVE NAV LINK STYLE (injected) ── */
(function addActiveStyle() {
    const style = document.createElement('style');
    style.textContent = `.nav-links a.active { color: var(--cyan); }
  .nav-links a.active::after { width: 100%; }`;
    document.head.appendChild(style);
})();