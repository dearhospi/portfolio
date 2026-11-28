import { initScene, updateModelPosition, disposeScene } from './scene.js';
import { initScrollAnimations } from './animations.js';
import { initCursor } from './cursor.js';
import { initDevlog } from './devlog.js';
import { initNavigation } from './navigation.js';
import { initStars } from './stars.js';
import { initSmoothScroll } from './smooth-scroll.js';

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initSmoothScroll();
    initCursor();
    initScrollAnimations();
    initStars();
    await initDevlog();

    try {
        await initScene();
        setupSectionTracking();
    } catch (error) {
        console.warn('Three.js scene initialization failed:', error);
    }
});

function setupSectionTracking() {
    const sections = document.querySelectorAll('main section[id]');
    const sectionPositions = new Map();

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        sectionPositions.set(section.id, {
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
            height: rect.height
        });
    });

    function onScroll() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const viewportCenter = scrollY + window.innerHeight / 2;

        let activeSection = null;
        let minDistance = Infinity;

        sectionPositions.forEach((pos, id) => {
            const sectionCenter = pos.top + pos.height / 2;
            const distance = Math.abs(viewportCenter - sectionCenter);
            if (distance < minDistance) {
                minDistance = distance;
                activeSection = id;
            }
        });

        if (activeSection) {
            updateModelPosition(activeSection);
        }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            sectionPositions.set(section.id, {
                top: rect.top + scrollTop,
                bottom: rect.bottom + scrollTop,
                height: rect.height
            });
        });
    }, { passive: true });

    onScroll();
}