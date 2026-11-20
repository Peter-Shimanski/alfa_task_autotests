# BUG-011: [API][Security] Персональный список счетов отдаётся с `Cache-Control: public`

## Краткое описание

Персональный ответ `GET /api/accounts` приходит с заголовком `Cache-Control: public, max-age=3600`. Персональные данные не должны помечаться как публично кэшируемые.

## Severity / Priority

|              | Оценка | Обоснование                                          |
| ------------ | ------ | ---------------------------------------------------- |
| **Severity** | Major  | Риск кэширования балансов/PII на промежуточных узлах |
| **Priority** | Medium | Эксплуатация зависит от инфраструктуры               |

## Окружение

- ОС: Windows 10
- Браузер: Chrome

## Предусловия

- Учётка: `ivanov` / `password123`

1. Открыть https://fulcrum81.github.io/alfa-task/
2. В DevTools браузера (F12 → Console) сбросить стенд и войти:

```js
await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/reset', { method: 'POST' });

const login = await fetch('https://fulcrum81.github.io/alfa-task/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ login: 'ivanov', password: 'password123' })
}).then((response) => response.json());

const token = login.data.token;
```

## Шаги воспроизведения

1. Вставить в DevTools → Console:

```js
const res = await fetch('https://fulcrum81.github.io/alfa-task/api/accounts', {
  headers: { Authorization: `Bearer ${token}` }
});
console.log('status', res.status);
console.log('Cache-Control', res.headers.get('Cache-Control'));
```

2. (Опционально) DevTools → **Network** → запрос `accounts` → Headers ответа.

## Фактический результат

| Что смотреть    | Факт                                  |
| --------------- | ------------------------------------- |
| HTTP            | **200**                               |
| `Cache-Control` | **`public, max-age=3600`**            |
| Тело            | Персональный список счетов и балансов |

## Ожидаемый результат

- Нет `public` (ожидаемо `private` / `no-store` / `no-cache`)
- Требование: `docs/ASSIGNMENT.md` п.14; `docs/openapi.yaml` → `GET /api/accounts`
