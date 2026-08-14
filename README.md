# agezha-site

Official website of psychologist Alexandra Gezha.

## Local development

Run a simple local server:

```bash
python3 -m http.server 5173
```

Then open:

[http://localhost:5173](http://localhost:5173)

## Deployment

The site is deployed automatically from GitHub via Timeweb Cloud.

## Project

- `index.html` — page markup
- `styles.css` — styles
- `images/` — local photos used on the site
- `privacy.html` — privacy policy
- `analytics.js` / `analytics.css` — optional Yandex Metrika consent module

## Как полностью удалить Яндекс Метрику

1. Удалить подключение `analytics.css` из HTML-страниц.
2. Удалить разметку плашки согласия (`#analytics-consent`) и ссылки управления статистикой в футере («Политика конфиденциальности» можно оставить, если страница политики нужна отдельно).
3. Удалить подключение `analytics.js`.
4. Удалить файлы `analytics.js`, `analytics.css` и при необходимости `privacy.html`.
