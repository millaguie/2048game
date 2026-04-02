const ParticleCanvas = {
    canvas: null,
    ctx: null,
    particles: [],
    running: false,

    init() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    emit(x, y, value) {
        const count = Math.min(12 + Math.log2(value) * 4, 50);
        const hue = this._hueForValue(value);

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.015 + Math.random() * 0.02,
                size: 3 + Math.random() * 5,
                hue,
                type: Math.random() > 0.3 ? 'circle' : 'star'
            });
        }

        this.particles.push({
            x, y,
            vx: 0, vy: 0,
            life: 0.8,
            decay: 0.04,
            size: 20,
            hue,
            type: 'shockwave'
        });

        this.particles.push({
            x, y,
            vx: 0, vy: 0,
            life: 1,
            decay: 0.05,
            size: 8,
            hue,
            type: 'flash'
        });

        if (!this.running) {
            this.running = true;
            this._animate();
        }
    },

    _hueForValue(value) {
        const hues = {
            2: 30, 4: 35, 8: 25, 16: 20, 32: 10, 64: 5,
            128: 45, 256: 48, 512: 50, 1024: 52, 2048: 55,
            4096: 0, 8192: 0
        };
        return hues[value] || 40;
    },

    _animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.life;

            if (p.type === 'shockwave') {
                const radius = (1 - p.life) * 80;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `hsla(${p.hue}, 90%, 60%, ${p.life})`;
                this.ctx.lineWidth = 3 * p.life;
                this.ctx.stroke();
            } else if (p.type === 'flash') {
                const radius = (1 - p.life) * 30 + 5;
                const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
                gradient.addColorStop(0, `hsla(${p.hue}, 100%, 90%, ${p.life})`);
                gradient.addColorStop(1, `hsla(${p.hue}, 100%, 60%, 0)`);
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1;
                p.vx *= 0.99;

                this.ctx.fillStyle = `hsl(${p.hue}, 90%, ${50 + (1 - p.life) * 30}%)`;

                if (p.type === 'star') {
                    this._drawStar(p.x, p.y, p.size * p.life);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this._animate());
        } else {
            this.running = false;
        }
    },

    _drawStar(cx, cy, size) {
        const spikes = 5;
        const outerR = size;
        const innerR = size / 2;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerR);

        for (let i = 0; i < spikes; i++) {
            this.ctx.lineTo(
                cx + Math.cos(rot) * outerR,
                cy + Math.sin(rot) * outerR
            );
            rot += step;
            this.ctx.lineTo(
                cx + Math.cos(rot) * innerR,
                cy + Math.sin(rot) * innerR
            );
            rot += step;
        }

        this.ctx.lineTo(cx, cy - outerR);
        this.ctx.closePath();
        this.ctx.fill();
    }
};
