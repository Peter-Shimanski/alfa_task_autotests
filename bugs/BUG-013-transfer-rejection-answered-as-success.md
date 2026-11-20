# BUG-013: [API] Отказ перевода из‑за нехватки средств приходит с HTTP 200 вместо 4xx

## Краткое описание

При недостатке средств сервер отвечает **HTTP 200** и телом `{ success: false, ... }` вместо клиентской ошибки **4xx**, как в контракте API.

## Severity / Priority

|              | Оценка | Обоснование                            |
| ------------ | ------ | -------------------------------------- |
| **Severity** | Major  | Ломает контракт API и обработку ошибок |
| **Priority** | Medium | Интеграция и мониторинг страдают       |

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

1. Перевод на сумму больше остатка — вставить в DevTools → Console:

```js
const transfer = await fetch('https://fulcrum81.github.io/alfa-task/api/transfers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'Idempotency-Key': `bug013-${Date.now()}`
  },
  body: JSON.stringify({
    fromAccountId: 'acc-1',
    toAccountId: 'acc-2',
    amount: '99999'
  })
});
console.log('status', transfer.status);
console.log('body', await transfer.json());
```

## Фактический результат

| Что смотреть | Факт                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| HTTP         | **200**                                                                                    |
| Тело         | `success: false`, `message: "Недостаточно средств на счёте"`, `code: "INSUFFICIENT_FUNDS"` |

## Ожидаемый результат

- HTTP **400** (или иной 4xx)
- `success: false`, код `INSUFFICIENT_FUNDS`
- Требование: `docs/openapi.yaml` → `POST /api/transfers` (бизнес-ошибки — 4xx)
