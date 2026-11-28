export function initSmoothScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let isScrolling = false;
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let animationId = null;
    let wheelDeltaAccumulator = 0;
    let lastWheelTime = 0;

    const lerp = (start, end, factor) => start + (end - start) * factor;
    const maxScrollY = () => document.documentElement.scrollHeight - window.innerHeight;

    function animateScroll() {
        currentScrollY = lerp(currentScrollY, targetScrollY, 0.08);

        if (Math.abs(currentScrollY - targetScrollY) < 0.5) {
            currentScrollY = targetScrollY;
            window.scrollTo(0, currentScrollY);
            isScrolling = false;
            animationId = null;
            return;
        }

        window.scrollTo(0, currentScrollY);
        animationId = requestAnimationFrame(animateScroll);
    }

    function scrollToTarget(targetY) {
        targetScrollY = Math.max(0, Math.min(targetY, maxScrollY()));
        
        if (!isScrolling) {
            isScrolling = true;
            currentScrollY = window.scrollY;
            animationId = requestAnimationFrame(animateScroll);
        }
    }

    function handleWheel(e) {
        e.preventDefault();
        
        const now = performance.now();
        const deltaTime = now - lastWheelTime;
        lastWheelTime = now;

        const normalizedDelta = e.deltaY * (e.deltaMode === 1 ? 40 : 1);
        wheelDeltaAccumulator += normalizedDelta;

        if (deltaTime > 100) {
            wheelDeltaAccumulator = normalizedDelta;
        }

        const scrollSensitivity = 0.8;
        targetScrollY = Math.max(0, Math.min(targetScrollY + wheelDeltaAccumulator * scrollSensitivity, maxScrollY()));
        wheelDeltaAccumulator = 0;

        if (!isScrolling) {
            isScrolling = true;
            currentScrollY = window.scrollY;
            animationId = requestAnimationFrame(animateScroll);
        }
    }

    function handleKeyDown(e) {
        if (!['Space', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.code)) return;

        e.preventDefault();
        
        const step = window.innerHeight * 0.8;
        let delta = 0;

        switch (e.code) {
            case 'Space':
            case 'PageDown':
                delta = e.shiftKey ? -step : step;
                break;
            case 'PageUp':
                delta = -step;
                break;
            case 'ArrowDown':
                delta = 100;
                break;
            case 'ArrowUp':
                delta = -100;
                break;
            case 'Home':
                targetScrollY = 0;
                break;
            case 'End':
                targetScrollY = maxScrollY();
                break;
        }

        if (delta !== 0) {
            targetScrollY = Math.max(0, Math.min(targetScrollY + delta, maxScrollY()));
        }

        if (!isScrolling) {
            isScrolling = true;
            currentScrollY = window.scrollY;
            animationId = requestAnimationFrame(animateScroll);
        }
    }

    function handleAnchorClick(e) {
        const href = e.currentTarget.getAttribute('href');
        if (href === '#' || !href.startsWith('#')) return;
        
        const targetElement = document.querySelector(href);
        if (!targetElement) return;

        e.preventDefault();

        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

        scrollToTarget(targetPosition);

        targetElement.focus({ preventScroll: true });

        const navList = document.getElementById('navList');
        const navToggle = document.getElementById('navToggle');
        if (navList?.classList.contains('open')) {
            navList.classList.remove('open');
            navToggle?.classList.remove('open');
            navToggle?.setAttribute('aria-expanded', 'false');
        }
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleAnchorClick);
    });

    window.addEventListener('resize', () => {
        targetScrollY = Math.min(targetScrollY, maxScrollY());
    }, { passive: true });
}

export function scrollToElement(element, offset = 0) {
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 0;
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - headerHeight + offset;
    const event = new CustomEvent('smooth-scroll', { detail: { targetY: targetPosition } });
    window.dispatchEvent(event);
}