# BUG-005: [API][Security] Возможно пользоваться тем же Bearer после выхода

## Краткое описание

`POST /api/auth/logout` отвечает успехом, но тот же Bearer-токен продолжает открывать защищённые методы (например `./api/me`). UI очищает `localStorage`, поэтому из интерфейса баг неочевиден.

## Severity / Priority

|              | Оценка   | Обоснование                            |
| ------------ | -------- | -------------------------------------- |
| **Severity** | Critical | Выход не отзывает сессию на сервере    |
| **Priority** | High     | Базовое требование безопасности сессии |

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

1. Выполнить logout с тем же токеном:

```js
const logout = await fetch('https://fulcrum81.github.io/alfa-task/api/auth/logout', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
console.log('logout status', logout.status);
```

2. Снова вызвать `/me` с **тем же** токеном:

```js
const me = await fetch('https://fulcrum81.github.io/alfa-task/api/me', {
  headers: { Authorization: `Bearer ${token}` }
});
console.log('me status', me.status);
console.log('me body', await me.json());
```

## Фактический результат

| Шаг                           | HTTP    | Факт                                        |
| ----------------------------- | ------- | ------------------------------------------- |
| `POST ./api/auth/logout`      | **200** | Успех                                       |
| `GET ./api/me` (тот же токен) | **200** | Данные пользователя — токен всё ещё валиден |

## Ожидаемый результат

- Logout → успех (например **200**)
- Повторный `GET /api/me` с тем же токеном → **401**
- Требование: `docs/ASSIGNMENT.md` п.11; `docs/openapi.yaml` → `POST /api/auth/logout`
