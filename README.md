# Autotests: Наш банк (Playwright + TypeScript)

UI/API-автотесты для стенда интернет-банка  
**https://fulcrum81.github.io/alfa-task/**

Требования задания: [docs/ASSIGNMENT.md](../docs/ASSIGNMENT.md)  
Контракт API: [docs/openapi.yaml](../docs/openapi.yaml)  
Баг-репорты: [bugs/README.md](./bugs/README.md)

| Инструмент | Версия                                                   |
| ---------- | -------------------------------------------------------- |
| Node.js    | 20+ (рекомендуется **26.13.1** LTS)                      |
| Playwright | **1.65.1** (`@playwright/test`)                          |
| TypeScript | 7.0.2                                                    |
| Allure     | `allure-playwright` 3.14.0 + `allure-commandline` 2.46.1 |

---

## 1. Установка

```bash
cd playwright
npm install
npx playwright install chrome
npx playwright install ffmpeg
```

Тесты запускают Google Chrome через `channel: 'chrome'`.

На Linux CI:

```bash
npx playwright install --with-deps chrome
```

### Переменные окружения

```bash
cp .env.example .env
```

Минимум:

```
BASE_URL='https://fulcrum81.github.io/alfa-task/'
```

Учётки стенда (публичные, из задания):

| Логин     | Пароль        | Роль      |
| --------- | ------------- | --------- |
| `ivanov`  | `password123` | клиент    |
| `petrova` | `qwerty123`   | клиент    |
| `admin`   | `admin123`    | сотрудник |

`.env` в git не коммитится.

---

## 2. Запуск

Одна команда с чистой машины (после установки):

```bash
npm test
```

`pretest` ставит зависимости и прогоняет `tsc --noEmit`, затем Playwright стартует с `src/playwright.config.ts`.

Один файл / папка:

```bash
npm test src/tests/<path>
```

С UI / headed:

```bash
npx playwright test --config=src/playwright.config.ts --ui
npx playwright test --config=src/playwright.config.ts --headed
```

---

## 3. Отчёты

HTML Playwright:

```bash
npx playwright show-report
```

Allure:

```bash
npm run showAllureReport
```

Генерирует `allure-report/` из `allure-results/` и открывает его.

Артефакты падений (trace, screenshot, video) — в `results/`:

```bash
npx playwright show-trace results/<path>/trace.zip
```

---

## 4. Важные особенности стенда

Это не баги, а устройство стенда:

1. **API живёт в service worker (MSW).** Внешние клиенты (Postman, `APIRequestContext`) стенд не видят. Проверки API — через `fetch` **внутри** страницы (`page.evaluate` / хелпер поверх него).
2. **Нельзя** ставить `serviceWorkers: 'block'` — API перестанет работать.
3. Стенд на base path `/alfa-task`. Абсолютные пути от корня домена (`/`, `/api/...`) уходят мимо приложения. В тестах: `BASE_URL` **со** хвостовым `/`; `page.goto` — `` `./login` `` / `` `./transfer` ``; API `fetch` — `` `${BASE_URL}api/...` `` (относительный fetch зависит от текущего `page.url` и ломается без слэша в документе).
4. Перед каждым тестом состояние сбрасывается (`POST api/__test__/reset`), чтобы прогон был независимым.
5. Перед первым запросом дожидаемся готовности worker (опрос `GET api/__test__/state`), иначе холодный старт даёт флаки.

Debug-панель стенда: `https://fulcrum81.github.io/alfa-task/?debug=1`

---

## 5. Устойчивость (антифлак)

- Свой browser context на тест + reset до сценария.
- Ожидание активного service worker до API-вызовов.
- После reset — `page.reload()`, чтобы UI подтянул чистое состояние.
- Retries в финальном прогоне: `0` локально (в CI — по конфигу); флаки чиним в хелперах, а не ретраями.

---

## 6. Качество кода

| Инструмент                   | Назначение                          |
| ---------------------------- | ----------------------------------- |
| ESLint (`eslint.config.cjs`) | качество TypeScript-кода            |
| Prettier (`.prettierrc.cjs`) | форматирование (отдельно от ESLint) |

```bash
npx eslint .
npx prettier --write .
npx prettier --check .
```

---

## 7. Структура

```
├── src/
│   ├── playwright.config.ts   # конфиг Playwright + Allure
│   ├── test-params.ts         # env (BASE_URL и др.)
│   ├── constants.ts
│   ├── fixtures/              # общие фикстуры (reset, login via API, page objects)
│   ├── helpers/               # apiFetch, resetStand, waitForWorker, …
│   ├── page-objects/
│   └── tests/
│       ├── api/<feature>/     # только API-проверки
│       ├── ui/<feature>/      # только UI-проверки
│       └── constants.ts       # epics: UI|API; features = домен проверки
├── bugs/                      # описания найденных дефектов
├── eslint.config.cjs
├── .prettierrc.cjs
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

Артефакты прогона (gitignore): `results/`, `test-results/`, `playwright-report/`, `allure-results/`, `json-report/`, `compiled/`.
