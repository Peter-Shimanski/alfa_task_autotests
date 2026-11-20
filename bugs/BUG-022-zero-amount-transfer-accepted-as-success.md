# BUG-022: [API][UI] Возможно провести перевод с `amount: 0` как успешный

## Краткое описание

`"amount": "0"` проходит как успешная операция. По ТЗ сумма должна быть **строго больше нуля**. Баланс не меняется, но валидация нарушена: в ответе и в state появляется операция с `amount: 0`.

## Severity / Priority

|              | Оценка | Обоснование                                     |
| ------------ | ------ | ----------------------------------------------- |
| **Severity** | Major  | Нарушение п.1 (граница "> 0")                   |
| **Priority** | Medium | Ущерб меньше, чем у BUG-002, но правило сломано |

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
const transfer = await fetch('https://fulcrum81.github.io/alfa-task/api/transfers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'Idempotency-Key': `bug022-${Date.now()}`
  },
  body: JSON.stringify({
    fromAccountId: 'acc-1',
    toAccountId: 'acc-2',
    amount: '0'
  })
});
console.log('status', transfer.status);
console.log('body', await transfer.json());
```

2. Проверить историю / `GET` state на операцию с `amount: 0`.

## Фактический результат

| Что смотреть | Факт                                     |
| ------------ | ---------------------------------------- |
| HTTP         | **200**, `success: true` |
| Тело         | В `data.transaction` запись с **`amount: 0`**, `status: "done"` |
| State        | Число транзакций +1; балансы `acc-1` / `acc-2` не меняются |

## Ожидаемый результат

- Отказ валидации (4xx): сумма не больше нуля
- Требование: `docs/ASSIGNMENT.md` п.1
