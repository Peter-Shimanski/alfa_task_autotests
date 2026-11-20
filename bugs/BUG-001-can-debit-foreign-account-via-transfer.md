# BUG-001: [API][Security] Возможно списать средства с чужого счёта при указании чужого `fromAccountId`

## Краткое описание

Авторизованный клиент `ivanov` указывает чужой счёт списания (`acc-3` petrova) и свой счёт зачисления (`acc-1`) — перевод проходит. Деньги уходят с чужого счёта на свой. Проверки владельца счёта списания нет.

## Severity / Priority

|              | Оценка   | Обоснование                                         |
| ------------ | -------- | --------------------------------------------------- |
| **Severity** | Critical | Прямое воровство: чужие средства на свой счёт       |
| **Priority** | High     | Финансовый и security-риск; чинить в первую очередь |

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

const before = await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/state').then((response) =>
  response.json()
);
const balanceBeforeForeign = before.data.accounts.find((account) => account.id === 'acc-3').balance;
const balanceBeforeOwn = before.data.accounts.find((account) => account.id === 'acc-1').balance;
console.log('acc-3 before', balanceBeforeForeign, 'acc-1 before', balanceBeforeOwn);
```

## Шаги воспроизведения

1. В DevTools → Console отправить перевод **с чужого `acc-3` на свой `acc-1`** под токеном ivanov:

```js
const transfer = await fetch('https://fulcrum81.github.io/alfa-task/api/transfers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'Idempotency-Key': `bug001-${Date.now()}`
  },
  body: JSON.stringify({
    fromAccountId: 'acc-3',
    toAccountId: 'acc-1',
    amount: '50'
  })
});
console.log('status', transfer.status);
console.log('body', await transfer.json());
```

2. Проверить балансы снова:

```js
const after = await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/state').then((response) =>
  response.json()
);
const balanceAfterForeign = after.data.accounts.find((account) => account.id === 'acc-3').balance;
const balanceAfterOwn = after.data.accounts.find((account) => account.id === 'acc-1').balance;
console.log('acc-3 after', balanceAfterForeign, 'acc-1 after', balanceAfterOwn);
```

## Фактический результат

| Что смотреть   | Факт                                                       |
| -------------- | ---------------------------------------------------------- |
| HTTP status    | **200**                                                    |
| Тело ответа    | `success: true`, `data.fee: 0` (между своими счетами)      |
| Баланс `acc-3` | был **932.1** → стал **882.1** (−50)                       |
| Баланс `acc-1` | был **1284.51** → стал **1334.51** (+50) — деньги на своём |

## Ожидаемый результат

- HTTP **403**
- Балансы `acc-3` и `acc-1` не изменились
- Требование: `docs/ASSIGNMENT.md` п.9; `docs/openapi.yaml` → `POST /api/transfers` → 403
