/* ── HERO PARTICLES ── */
(function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    const COUNT = 80;
    const mouse = { x: -999, y: -999 };

    // New orange color for particles
    const PARTICLE_COLOR = '#E46A2E';
    const PARTICLE_GLOW = '#E46A2E';

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
            this.peak = 0.15 + Math.random() * 0.3;
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
            ctx.fillStyle = PARTICLE_COLOR;
            ctx.shadowColor = PARTICLE_GLOW;
            ctx.shadowBlur = this.r * 4;
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
                    // Orange lines with transparency
                    ctx.strokeStyle = `rgba(228, 106, 46, ${(1 - d / 120) * 0.07})`;
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