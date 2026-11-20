# BUG-010: [API] Возможно списать деньги дважды при повторе с тем же `Idempotency-Key`

## Краткое описание

Два одинаковых `POST /api/transfers` с одним и тем же заголовком `Idempotency-Key` оба исполняются: деньги списываются дважды, появляется вторая операция.

## Severity / Priority

|              | Оценка | Обоснование                                   |
| ------------ | ------ | --------------------------------------------- |
| **Severity** | Major  | Двойное списание при повторе запроса          |
| **Priority** | High   | Типовой платёжный риск; заголовок в контракте |

## Окружение

- ОС: Windows 10
- Браузер: Chrome

## Предусловия

- Учётка: `ivanov` / `password123`
- После reset баланс `acc-1` = **1284.51**

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

1. Дважды отправить один и тот же перевод с **одним** ключом:

```js
const key = 'same-key-bug010';
const opts = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'Idempotency-Key': key
  },
  body: JSON.stringify({
    fromAccountId: 'acc-1',
    toAccountId: 'acc-2',
    amount: '10'
  })
};

const response1 = await fetch('https://fulcrum81.github.io/alfa-task/api/transfers', opts);
const response2 = await fetch('https://fulcrum81.github.io/alfa-task/api/transfers', opts);
console.log('status', response1.status, response2.status);
```

2. Сверить баланс и число операций:

```js
const after = await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/state').then((response) =>
  response.json()
);
const balanceAfter = after.data.accounts.find((account) => account.id === 'acc-1').balance;
const tx = await fetch('https://fulcrum81.github.io/alfa-task/api/transactions?accountId=acc-1&limit=1', {
  headers: { Authorization: `Bearer ${token}` }
}).then((response) => response.json());
console.log('balanceAfter', balanceAfter);
console.log('txTotal', tx.data?.total);
```

## Фактический результат

| Что смотреть      | Факт                                          |
| ----------------- | --------------------------------------------- |
| HTTP (оба POST)   | Оба **200**                                   |
| `Idempotency-Key` | Один и тот же                                 |
| Баланс `acc-1`    | −**20** (например **1264.51** вместо 1274.51) |
| Транзакции        | +2                                            |

## Ожидаемый результат

- Вторая операция **не** создаётся (идемпотентный повтор)
- Баланс уменьшен на **10** один раз → **1274.51**
- Требование: `docs/ASSIGNMENT.md` п.8; `docs/openapi.yaml` → `Idempotency-Key`
