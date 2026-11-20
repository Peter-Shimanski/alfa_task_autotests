# BUG-015: [API][UI] Сортировка истории по сумме идёт как по тексту, а не как по числам

## Краткое описание

При `sort=amount` порядок сумм **лексикографический**, не числовой: например `100` оказывается между `10.28` и `11.26`.

## Severity / Priority

| | Оценка | Обоснование |
|---|---|---|
| **Severity** | Major | Нарушение требования о числовой сортировке |
| **Priority** | Medium | Мешает анализу операций |

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
const res = await fetch('https://fulcrum81.github.io/alfa-task/api/transactions?accountId=acc-1&sort=amount&limit=10', {
  headers: { Authorization: `Bearer ${token}` }
});
const body = await res.json();
console.log('status', res.status);
console.log('amounts', body.data?.items?.map((item) => item.amount));
```

2. UI: "История" → сортировка "По сумме".

## Фактический результат

| Где | Факт |
|---|---|
| API | **200**; пример: `[10.28, 100, 11.26, 12.22, …]` |
| UI | Селект "По сумме" — тот же неверный порядок |

## Ожидаемый результат

- Числовая сортировка: `10.28 < 11.26 < … < 100`
- Требование: `docs/ASSIGNMENT.md` п.19; `docs/openapi.yaml` → `sort=amount|amount-desc`
