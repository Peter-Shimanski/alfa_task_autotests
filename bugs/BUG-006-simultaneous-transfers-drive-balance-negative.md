# BUG-006: [API] Возможно увести баланс ниже нуля при двух почти одновременных переводах с одного счёта

## Краткое описание

Два почти одновременных internal-перевода, каждый из которых по отдельности укладывается в остаток, вместе делают баланс **отрицательным**.

## Severity / Priority

|              | Оценка   | Обоснование                             |
| ------------ | -------- | --------------------------------------- |
| **Severity** | Critical | Нарушен инвариант "баланс не ниже нуля" |
| **Priority** | High     | Overdraft при гонке запросов            |

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

1. Посчитать сумму одного перевода: каждый запрос вписывается в остаток, вместе — нет:

```js
const state = await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/state').then((response) =>
  response.json()
);
const balance = state.data.accounts.find((account) => account.id === 'acc-1').balance;
const amount = String(Math.ceil(balance / 2 + 50));
console.log('balance', balance, 'amount', amount);
```

2. Отправить **два** перевода параллельно с **разными** `Idempotency-Key`:

```js
const headers = (key) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
  'Idempotency-Key': key
});
const body = JSON.stringify({
  fromAccountId: 'acc-1',
  toAccountId: 'acc-2',
  amount
});

const [response1, response2] = await Promise.all([
  fetch('https://fulcrum81.github.io/alfa-task/api/transfers', { method: 'POST', headers: headers('bug006-a'), body }),
  fetch('https://fulcrum81.github.io/alfa-task/api/transfers', { method: 'POST', headers: headers('bug006-b'), body })
]);
console.log('status', response1.status, response2.status);
```

3. Проверить итоговый баланс:

```js
const after = await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/state').then((response) =>
  response.json()
);
const balanceAfter = after.data.accounts.find((account) => account.id === 'acc-1').balance;
console.log('balanceAfter', balanceAfter);
```

## Фактический результат

| Что смотреть    | Факт                                                           |
| --------------- | -------------------------------------------------------------- |
| HTTP (оба POST) | Оба могут быть **200**                                         |
| Баланс `acc-1`  | Например **-101.49** (в автотесте также всплывает float-хвост) |

## Ожидаемый результат

- Хотя бы один запрос отклонён **или** оба учтены так, что итог ≥ 0
- Баланс `acc-1` **не отрицательный**
- Требование: `docs/ASSIGNMENT.md` п.4
