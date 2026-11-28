# dearhospi — Портфолио разработчика

Современное, статическое портфолио веб-разработчика dearhospi с 3D-объектом, плавными анимациями и Devlog на JSON.

## Структура проекта

```
portfolio/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── scene.js
│   ├── animations.js
│   ├── cursor.js
│   ├── devlog.js
│   └── navigation.js
├── images/
│   ├── logo.svg
│   ├── avatar.png
│   ├── favicon.png
│   └── projects/
│       ├── zorica.png
│       ├── varka.png
│       └── stroyka.png
├── models/
│   └── model.glb
└── devlog/
    └── posts.json
```

## Запуск локально

### Вариант 1: Python (встроен в macOS/Linux, легко установить на Windows)

```bash
cd portfolio
python3 -m http.server 8000
```

Откройте http://localhost:8000

### Вариант 2: Node.js (если установлен)

```bash
cd portfolio
npx serve .
```

### Вариант 3: VS Code Live Server

Установите расширение "Live Server", нажмите правой кнопкой на `index.html` → "Open with Live Server".

## Добавление изображений

Поместите следующие файлы в папку `images/`:

| Файл | Описание | Рекомендуемый размер |
|------|----------|---------------------|
| `logo.svg` | Логотип "d." | Вектор (SVG) |
| `avatar.png` | Фото для раздела "Обо мне" | 400×400 px |
| `favicon.png` | Иконка сайта | 32×32 или 64×64 px |
| `projects/zorica.png` | Скриншот проекта ZORICA | 1440×760 px |
| `projects/varka.png` | Скриншот проекта VARKA | 1440×760 px |
| `projects/stroyka.png` | Скриншот проекта STROYKA | 1440×760 px |

**Важно:** Без этих изображений будут показаны пустые места (нет битых ссылок).

## Управление Devlog

Публикации хранятся в `devlog/posts.json`. Формат:

```json
[
  {
    "title": "Заголовок публикации",
    "date": "2025-01-15",
    "excerpt": "Краткое описание для превью...",
    "url": "https://example.com/full-article"
  }
]
```

- `title` — обязательно
- `date` — в формате ISO (YYYY-MM-DD), используется для сортировки (новые сверху)
- `excerpt` — краткое описание (опционально)
- `url` — ссылка на полную статью (опционально, если нет — ссылка не показывается)

### Как обновить Devlog

1. Откройте файл `devlog/posts.json` в любом текстовом редакторе (VS Code, Notepad++, Sublime Text и т.д.)
2. Добавьте новый объект в начало массива (чтобы публикация появилась сверху):
   ```json
   [
     {
       "title": "Новая публикация",
       "date": "2025-12-01",
       "excerpt": "Описание новой заметки...",
       "url": "https://example.com/new-post"
     },
     {
       "title": "Старая публикация",
       "date": "2025-11-15",
       "excerpt": "Описание старой заметки...",
       "url": "https://example.com/old-post"
     }
   ]
   ```
3. Сохраните файл.
4. Зафиксируйте изменения в git и отправьте на GitHub (если сайт на GitHub Pages) или просто обновите файлы на сервере.
5. Обновите страницу в браузере — новая публикация появится автоматически.

**Советы:**
- Дата в формате `YYYY-MM-DD` (например, `2025-12-01`) — важна для правильной сортировки.
- `excerpt` лучше держать кратким (1–2 предложения), это превью в ленте.
- `url` можно опустить, если полной статьи нет — тогда ссылка «Читать далее» не покажется.
- Чтобы удалить публикацию — просто удалите соответствующий объект из массива.
- Чтобы отредактировать — измените поля в объекте.

## Публикация на GitHub Pages

1. Создайте репозиторий на GitHub (например, `dearhospi.github.io` или любой другой).
2. Загрузите всё содержимое папки `portfolio/` в корень репозитория.
3. В Settings → Pages выберите Source: "Deploy from a branch", Branch: `main`, Folder: `/ (root)`.
4. Сайт будет доступен по адресу `https://<username>.github.io/<repo>/` или `https://<username>.github.io/`.

**Важно:** Убедитесь, что файл `models/model.glb` загружен в репозиторий (GitHub Pages поддерживает файлы до 100 МБ).

## Технические детали

- **Стек:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **3D:** Three.js (ESM через importmap), GLTFLoader
- **Шрифты:** Space Grotesk (заголовки/текст), JetBrains Mono (моноширинный)
- **Анимации:** IntersectionObserver (scroll reveal), requestAnimationFrame (3D, курсор)
- **Доступность:** семантический HTML, focus-visible, aria, prefers-reduced-motion
- **Производительность:** ограниченный pixel ratio (max 2), оптимизированная загрузка GLB, пассивные слушатели событий

## Поддержка браузеров

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Мобильные браузеры (iOS Safari, Chrome Android)

## Лицензия

MIT — используйте свободно для своего портфолио.