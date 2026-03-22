'use strict';

/* cursor effect removed */


/* ── NAVBAR SCROLL + ACTIVE LINKS ── */
(function () {
    const header = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 50);
        let current = '';
        sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
        navLinks.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();


/* ── HAMBURGER ── */
(function () {
    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('navLinks');
    const header = document.getElementById('navbar');
    if (!btn || !menu) return;

    function openMenu() {
        btn.classList.add('open'); menu.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        btn.classList.remove('open'); menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    btn.addEventListener('click', e => {
        e.stopPropagation();
        menu.classList.contains('open') ? closeMenu() : openMenu();
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('click', e => { if (menu.classList.contains('open') && !header.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMenu(); });
})();


/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = (document.getElementById('navbar') || { offsetHeight: 68 }).offsetHeight + 10;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
});


/* ── HERO PARTICLES (orange theme) ── */
(function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    const COUNT = 80;
    const mouse = { x: -999, y: -999 };
    const COLOR = '#E46A2E';

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    class P {
        constructor() { this.init(true); }
        init(rand) {
            this.x = Math.random() * (W || 800);
            this.y = rand ? Math.random() * (H || 600) : (H || 600) + 10;
            this.r = 0.6 + Math.random() * 1.6;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = -(0.2 + Math.random() * 0.5);
            this.life = rand ? Math.random() * 200 : 0;
            this.max = 180 + Math.random() * 240;
            this.peak = 0.12 + Math.random() * 0.22;
        }
        update() {
            this.x += this.vx; this.y += this.vy; this.life++;
            const dx = this.x - mouse.x, dy = this.y - mouse.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 100 && d > 0) { const f = (100 - d) / 100; this.x += dx / d * f * 1.2; this.y += dy / d * f * 1.2; }
            if (this.life >= this.max) this.init(false);
        }
        alpha() {
            const p = this.life / this.max;
            if (p < 0.15) return this.peak * (p / 0.15);
            if (p > 0.75) return this.peak * (1 - (p - 0.75) / 0.25);
            return this.peak;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha();
            ctx.fillStyle = COLOR;
            ctx.shadowColor = COLOR;
            ctx.shadowBlur = this.r * 3;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }

    let pts = [];

    function lines() {
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 120) {
                    ctx.save();
                    ctx.strokeStyle = `rgba(228,106,46,${(1 - d / 120) * 0.07})`;
                    ctx.lineWidth = 0.7;
                    ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }

    function frame() {
        ctx.clearRect(0, 0, W, H);
        lines();
        pts.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(frame);
    }

    resize();
    pts = Array.from({ length: COUNT }, () => new P());
    frame();

    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
    window.addEventListener('resize', () => { resize(); pts.forEach(p => p.init(true)); });
})();


/* ── SCROLL REVEAL (robust version) ── */
(function () {
    const items = document.querySelectorAll('.ri');
    if (!items.length) return;

    // No IntersectionObserver support — show everything immediately
    if (!('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('visible'));
        return;
    }

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.classList.contains('ri-d') ? 180 : 0;
                setTimeout(() => entry.target.classList.add('visible'), delay);
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0,                  // fire the moment any pixel enters viewport
        rootMargin: '0px 0px 0px 0px' // no negative offset — nothing gets missed
    });

    items.forEach(el => obs.observe(el));

    // Hard fallback — force-show anything still hidden after 1.5s
    setTimeout(() => {
        document.querySelectorAll('.ri:not(.visible)').forEach(el => el.classList.add('visible'));
    }, 1500);
})();


/* ── CONTACT FORM ── */
(function () {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    const btn = document.getElementById('submitBtn');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const name = form.querySelector('#name');
        const mail = form.querySelector('#email');
        const msg = form.querySelector('#message');
        let ok = true;
        [name, mail, msg].forEach(f => {
            f.style.borderColor = f.value.trim() ? '' : '#E46A2E';
            if (!f.value.trim()) ok = false;
        });
        if (!ok) return;

        const txtEl = btn.querySelector('.btn-text');
        const loadEl = btn.querySelector('.btn-loading');
        btn.disabled = true;
        txtEl.style.display = 'none';
        loadEl.style.display = 'flex';

        try {
            const res = await fetch(form.action, {
                method: 'POST', body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (res.ok) {
                form.style.display = 'none';
                success.style.display = 'flex';
            } else { throw new Error(); }
        } catch {
            btn.disabled = false;
            txtEl.style.display = 'flex';
            loadEl.style.display = 'none';
            let err = form.querySelector('.form-error');
            if (!err) {
                err = document.createElement('p');
                err.className = 'form-error';
                err.style.cssText = 'color:#E46A2E;font-size:.85rem;text-align:center;margin-top:.5rem';
                btn.after(err);
            }
            err.textContent = 'Something went wrong. Please email hello@unitybridge.com directly.';
        }
    });
    form.querySelectorAll('input,textarea').forEach(f => {
        f.addEventListener('input', () => { f.style.borderColor = ''; });
    });
})();