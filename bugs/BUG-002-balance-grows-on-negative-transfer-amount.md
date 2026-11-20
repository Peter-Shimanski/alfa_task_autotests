# BUG-002: [API][UI] Возможно провести перевод с отрицательной суммой

## Краткое описание

Нет проверки "сумма > 0". Отрицательный `amount` (например `"-100"`) принимается и в API, и в форме "Перевод" (поле — обычный text). Следствие: баланс счёта списания растёт, счёт зачисления уменьшается — по сути обратный перевод.

## Severity / Priority

|              | Оценка   | Обоснование                              |
| ------------ | -------- | ---------------------------------------- |
| **Severity** | Critical | Можно искусственно наращивать баланс     |
| **Priority** | High     | Ломает базовое правило денежных операций |

## Окружение

- ОС: Windows 10
- Браузер: Chrome

## Предусловия

- Учётка: `ivanov` / `password123`
- После reset: `acc-1` = **1284.51**, `acc-2` = **5400**

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

const before = await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/state').then((response) =>
  response.json()
);
const balanceBeforeFrom = before.data.accounts.find((account) => account.id === 'acc-1').balance;
const balanceBeforeTo = before.data.accounts.find((account) => account.id === 'acc-2').balance;
console.log('acc-1 before', balanceBeforeFrom, 'acc-2 before', balanceBeforeTo);
```

3. Для UI-варианта: после того же reset войти через форму (`ivanov` / `password123`).

## Шаги воспроизведения

**Вариант API** — в DevTools → Console:

```js
const transfer = await fetch('https://fulcrum81.github.io/alfa-task/api/transfers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'Idempotency-Key': `bug002-${Date.now()}`
  },
  body: JSON.stringify({
    fromAccountId: 'acc-1',
    toAccountId: 'acc-2',
    amount: '-100'
  })
});
console.log('status', transfer.status);
console.log('body', await transfer.json());

const after = await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/state').then((response) =>
  response.json()
);
const balanceAfterFrom = after.data.accounts.find((account) => account.id === 'acc-1').balance;
const balanceAfterTo = after.data.accounts.find((account) => account.id === 'acc-2').balance;
console.log('acc-1 after', balanceAfterFrom, 'acc-2 after', balanceAfterTo);
```

**Вариант UI:** Перевод → Между своими счетами → сумма `-100` → Перевести → сверить остатки счетов.

## Фактический результат

| Что смотреть   | Факт                                                         |
| -------------- | ------------------------------------------------------------ |
| HTTP status    | **200**                                                      |
| Тело ответа    | `success: true`, `data.total: -100`, `data.balance: 1384.51` |
| Баланс `acc-1` | **1284.51 → 1384.51** (+100)                                 |
| Баланс `acc-2` | **5400 → 5300** (−100)                                       |
| UI             | Поле суммы принимает `-100`; перевод уходит на сервер        |

## Ожидаемый результат

- Отказ валидации (**400**, код вроде `INVALID_AMOUNT`): сумма должна быть **строго больше нуля**
- UI не даёт отправить отрицательную сумму (или сразу показывает ошибку)
- Балансы `acc-1` и `acc-2` без изменений
- Требование: `docs/ASSIGNMENT.md` п.1, п.4; `docs/openapi.yaml` → `POST /api/transfers` → 400
