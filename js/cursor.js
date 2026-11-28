export function initCursor() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (prefersReducedMotion || isTouchDevice) {
        document.body.classList.add('cursor-hidden');
        return;
    }

    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');

    if (!cursor || !cursorFollower) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;
    let isVisible = true;

    const interactiveElements = 'a, button, .nav-link, .btn, .project-link, .contact-method, .devlog-item-link';

    function updateCursorPosition(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.3;
        cursorY += (mouseY - cursorY) * 0.3;

        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;

        cursor.style.transform = `translate(${cursorX - cursor.offsetWidth / 2}px, ${cursorY - cursor.offsetHeight / 2}px)`;
        cursorFollower.style.transform = `translate(${followerX - cursorFollower.offsetWidth / 2}px, ${followerY - cursorFollower.offsetHeight / 2}px)`;

        requestAnimationFrame(animateCursor);
    }

    function setCursorState(active) {
        if (active) {
            cursor.style.transform += ' scale(1.5)';
            cursorFollower.style.transform += ' scale(1.5)';
            cursor.style.backgroundColor = 'var(--accent)';
            cursorFollower.style.borderColor = 'var(--accent)';
        } else {
            cursor.style.transform = cursor.style.transform.replace(' scale(1.5)', '');
            cursorFollower.style.transform = cursorFollower.style.transform.replace(' scale(1.5)', '');
            cursor.style.backgroundColor = '';
            cursorFollower.style.borderColor = '';
        }
    }

    function handleMouseEnter(e) {
        if (e.target.matches(interactiveElements)) {
            document.body.classList.add('cursor-active');
        }
    }

    function handleMouseLeave(e) {
        if (e.target.matches(interactiveElements)) {
            document.body.classList.remove('cursor-active');
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            cursor.style.opacity = '0';
            cursorFollower.style.opacity = '0';
            isVisible = false;
        } else {
            cursor.style.opacity = '';
            cursorFollower.style.opacity = '';
            isVisible = true;
        }
    }

    document.addEventListener('mousemove', updateCursorPosition, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const style = document.createElement('style');
    style.textContent = `
        .cursor-active .cursor {
            transform: translate(-50%, -50%) scale(1.5) !important;
            background-color: var(--accent) !important;
        }
        .cursor-active .cursor-follower {
            transform: translate(-50%, -50%) scale(1.5) !important;
            border-color: var(--accent) !important;
        }
    `;
    document.head.appendChild(style);

    animateCursor();

    return {
        destroy: () => {
            document.removeEventListener('mousemove', updateCursorPosition);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            style.remove();
        }
    };
}