export function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let stars = [];
    let comets = [];
    let cosmicObjects = [];
    let animationId = null;
    let lastTime = 0;

    const STAR_COUNT = 120;
    const COMET_COUNT = 3;
    const COSMIC_OBJECT_COUNT = 8;
    const STAR_COLORS = ['#00d4ff', '#ffffff', '#0099cc', '#ffffff', '#00d4ff'];
    const COMET_COLORS = ['#00d4ff', '#00ffff', '#ffffff'];
    const COSMIC_COLORS = ['#0066cc', '#0044aa', '#0088dd', '#003388'];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initStarsArray();
        initCometsArray();
        initCosmicObjectsArray();
    }

    function initStarsArray() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5 + 0.5,
                color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
                speedX: (Math.random() - 0.5) * 0.08,
                speedY: (Math.random() - 0.5) * 0.05,
                opacity: Math.random() * 0.6 + 0.2,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function initCometsArray() {
        comets = [];
        for (let i = 0; i < COMET_COUNT; i++) {
            spawnComet();
        }
    }

    function spawnComet() {
        const fromTop = Math.random() > 0.5;
        const fromLeft = Math.random() > 0.5;

        let x, y, angle;

        if (fromTop) {
            x = Math.random() * width;
            y = -50;
            angle = Math.PI / 4 + Math.random() * Math.PI / 2;
        } else {
            x = fromLeft ? -50 : width + 50;
            y = Math.random() * height;
            angle = fromLeft ? Math.random() * Math.PI / 3 - Math.PI / 6 : Math.PI + Math.random() * Math.PI / 3 - Math.PI / 6;
        }

        const speed = 300 + Math.random() * 400;
        const size = 2 + Math.random() * 2;
        const tailLength = 80 + Math.random() * 120;
        const color = COMET_COLORS[Math.floor(Math.random() * COMET_COLORS.length)];

        comets.push({
            x,
            y,
            angle,
            speed,
            size,
            tailLength,
            color,
            tail: [],
            life: 1,
            decay: 0.002 + Math.random() * 0.003
        });
    }

    function initCosmicObjectsArray() {
        cosmicObjects = [];
        for (let i = 0; i < COSMIC_OBJECT_COUNT; i++) {
            cosmicObjects.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: 15 + Math.random() * 35,
                color: COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)],
                speedX: (Math.random() - 0.5) * 0.03,
                speedY: (Math.random() - 0.5) * 0.02,
                opacity: 0.08 + Math.random() * 0.12,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.0005,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.0003 + Math.random() * 0.0005,
                shape: Math.floor(Math.random() * 3)
            });
        }
    }

    function drawCosmicObject(obj) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);
        ctx.globalAlpha = obj.opacity * (0.7 + Math.sin(obj.pulsePhase) * 0.3);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.size);
        gradient.addColorStop(0, obj.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;

        switch (obj.shape) {
            case 0:
                ctx.beginPath();
                ctx.arc(0, 0, obj.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 1:
                ctx.beginPath();
                for (let j = 0; j < 6; j++) {
                    const angle = (j / 6) * Math.PI * 2;
                    const r = j % 2 === 0 ? obj.size : obj.size * 0.5;
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if (j === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                break;
            case 2:
                ctx.beginPath();
                for (let j = 0; j < 5; j++) {
                    const angle = (j / 5) * Math.PI * 2 - Math.PI / 2;
                    const r = j % 2 === 0 ? obj.size : obj.size * 0.4;
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if (j === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    function animate(time) {
        if (prefersReducedMotion) {
            drawStatic();
            return;
        }

        const delta = (time - lastTime) / 1000;
        lastTime = time;

        ctx.clearRect(0, 0, width, height);

        cosmicObjects.forEach(obj => {
            obj.x += obj.speedX * delta * 60;
            obj.y += obj.speedY * delta * 60;
            obj.rotation += obj.rotationSpeed * delta * 60;
            obj.pulsePhase += obj.pulseSpeed * delta * 60;

            if (obj.x < -obj.size) obj.x = width + obj.size;
            if (obj.x > width + obj.size) obj.x = -obj.size;
            if (obj.y < -obj.size) obj.y = height + obj.size;
            if (obj.y > height + obj.size) obj.y = -obj.size;

            drawCosmicObject(obj);
        });

        stars.forEach(star => {
            star.x += star.speedX * delta * 60;
            star.y += star.speedY * delta * 60;
            star.phase += delta * 0.5;

            const twinkle = Math.sin(star.phase) * 0.3 + 0.7;
            const currentOpacity = star.opacity * twinkle;

            if (star.x < -10) star.x = width + 10;
            if (star.x > width + 10) star.x = -10;
            if (star.y < -10) star.y = height + 10;
            if (star.y > height + 10) star.y = -10;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = currentOpacity;
            ctx.fill();
        });

        for (let i = comets.length - 1; i >= 0; i--) {
            const comet = comets[i];

            comet.tail.unshift({ x: comet.x, y: comet.y, life: 1 });

            if (comet.tail.length > comet.tailLength) {
                comet.tail.pop();
            }

            comet.tail.forEach((segment, idx) => {
                segment.life = 1 - idx / comet.tailLength;
            });

            comet.x += Math.cos(comet.angle) * comet.speed * delta;
            comet.y += Math.sin(comet.angle) * comet.speed * delta;
            comet.life -= comet.decay;

            const headGradient = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, comet.size * 3);
            headGradient.addColorStop(0, comet.color);
            headGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(comet.x, comet.y, comet.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = headGradient;
            ctx.globalAlpha = comet.life;
            ctx.fill();

            comet.tail.forEach((segment, idx) => {
                const tailProgress = idx / comet.tail.length;
                const segmentSize = comet.size * (1 - tailProgress * 0.7);
                const segmentAlpha = segment.life * comet.life * 0.6;

                const tailGradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, segmentSize * 2);
                tailGradient.addColorStop(0, comet.color);
                tailGradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(segment.x, segment.y, segmentSize, 0, Math.PI * 2);
                ctx.fillStyle = tailGradient;
                ctx.globalAlpha = segmentAlpha;
                ctx.fill();
            });

            if (comet.life <= 0 ||
                comet.x < -100 || comet.x > width + 100 ||
                comet.y < -100 || comet.y > height + 100) {
                comets.splice(i, 1);
                if (Math.random() > 0.3) {
                    setTimeout(spawnComet, 2000 + Math.random() * 5000);
                }
            }
        }

        ctx.globalAlpha = 1;

        if (comets.length < COMET_COUNT && Math.random() < 0.002) {
            spawnComet();
        }

        animationId = requestAnimationFrame(animate);
    }

    function drawStatic() {
        ctx.clearRect(0, 0, width, height);

        cosmicObjects.forEach(obj => {
            drawCosmicObject(obj);
        });

        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity;
            ctx.fill();
        });

        ctx.globalAlpha = 1;
    }

    function handleResize() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        resize();
        if (!prefersReducedMotion) {
            animate(performance.now());
        } else {
            drawStatic();
        }
    }

    window.addEventListener('resize', handleResize, { passive: true });

    resize();
    if (!prefersReducedMotion) {
        animate(performance.now());
    } else {
        drawStatic();
    }

    return {
        destroy: () => {
            window.removeEventListener('resize', handleResize);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    };
}