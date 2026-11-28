export async function initDevlog() {
    const container = document.getElementById('devlogList');
    const emptyMessage = document.getElementById('devlogEmpty');

    if (!container) return;

    try {
        const response = await fetch('devlog/posts.json', {
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        if (emptyMessage) emptyMessage.style.display = 'none';

        posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(post => {
                const article = createPostElement(post);
                container.appendChild(article);
            });

        observeDevlogItems();
    } catch (error) {
        console.warn('Failed to load devlog posts:', error);
        if (emptyMessage) emptyMessage.style.display = 'block';
    }
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'devlog-item';
    article.setAttribute('role', 'article');

    const date = post.date ? new Date(post.date) : new Date();
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    article.innerHTML = `
        <header class="devlog-item-header">
            <h3 class="devlog-item-title">${escapeHtml(post.title || 'Без заголовка')}</h3>
            <time class="devlog-item-date" datetime="${escapeHtml(post.date || '')}">${formattedDate}</time>
        </header>
        <p class="devlog-item-excerpt">${escapeHtml(post.excerpt || '')}</p>
        ${post.url ? `<a href="${escapeHtml(post.url)}" class="devlog-item-link" target="_blank" rel="noopener">Читать далее →</a>` : ''}
    `;

    article.classList.add('reveal');
    return article;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function observeDevlogItems() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        document.querySelectorAll('.devlog-item.reveal').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    });

    document.querySelectorAll('.devlog-item.reveal').forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index * 80, 400)}ms`;
        observer.observe(el);
    });
}