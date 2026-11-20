# BUG-021: [UI] Невозможно открыть последнюю страницу истории — число страниц считают через floor

## Краткое описание

API отдаёт страницу 20 корректно. UI считает число страниц через **floor** (`199 / 10 → 19` вместо **20**), кнопка "Вперёд" блокируется раньше — хвост операций из интерфейса недоступен.

## Severity / Priority

| | Оценка | Обоснование |
|---|---|---|
| **Severity** | Minor | API цел; ломается UI-навигация |
| **Priority** | Medium | Пользователь не видит часть выписки |

## Окружение

- ОС: Windows 10
- Браузер: Chrome

## Предусловия

- Учётка: `ivanov` / `password123`, счёт "Текущий" (`acc-1`, после reset около 199 операций)

1. Открыть https://fulcrum81.github.io/alfa-task/
2. В DevTools браузера (F12 → Console) сбросить стенд:

```js
await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/reset', { method: 'POST' });
```

3. Войти через UI: `ivanov` / `password123`.

## Шаги воспроизведения

1. UI: "История" → счёт "Текущий" → "На странице: 10".
2. Прочитать строку "Найдено: 199 операций · страниц: …".
3. Дойти до последней доступной страницы кнопкой "Вперёд".
4. В DevTools → Console — вставить (после login через UI или snippet из других багов):

```js
const login = await fetch('https://fulcrum81.github.io/alfa-task/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ login: 'ivanov', password: 'password123' })
}).then((response) => response.json());

const res = await fetch('https://fulcrum81.github.io/alfa-task/api/transactions?accountId=acc-1&page=20&limit=10', {
  headers: { Authorization: `Bearer ${login.data.token}` }
});
const body = await res.json();
console.log('status', res.status);
console.log('page', body.data?.page, 'total', body.data?.total, 'items', body.data?.items?.length);
```

## Фактический результат

| Где | Факт |
|---|---|
| UI | Показано **"страниц: 19"**; "Вперёд" неактивна на 19-й |
| UI | Последние операции через интерфейс **не открыть** |
| API `page=20` | **200**; записи на 20-й странице **есть** |

## Ожидаемый результат

- Все операции доступны в UI
- Число страниц = **20** (ceil: 199/10)
- Требование: `docs/ASSIGNMENT.md` п.16
