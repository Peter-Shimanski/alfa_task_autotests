# BUG-007: [API][UI] Сумма "1,50" списывается как 150 при вводе с запятой

## Краткое описание

По ТЗ `1,50` — один рубль 50 копеек. Система воспринимает строку как **150** (запятая выбрасывается). То же: `0,01` → `1`, `1 000,50` → `100050`.

## Severity / Priority

|              | Оценка | Обоснование                                           |
| ------------ | ------ | ----------------------------------------------------- |
| **Severity** | Major  | Типичный ввод по ТЗ приводит к сумме в 100 раз больше |
| **Priority** | High   | Высокий риск ошибочных переводов                      |

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

**Вариант API** — вставить в DevTools → Console:

```js
const transfer = await fetch('https://fulcrum81.github.io/alfa-task/api/transfers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'Idempotency-Key': `bug007-${Date.now()}`
  },
  body: JSON.stringify({
    fromAccountId: 'acc-1',
    toAccountId: 'acc-2',
    amount: '1,50'
  })
});

console.log('status', transfer.status);
console.log('body', await transfer.json());

const after = await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/state').then((response) =>
  response.json()
);
const balanceAfter = after.data.accounts.find((account) => account.id === 'acc-1').balance;
console.log('balanceAfter', balanceAfter);
```

**Вариант UI:** "Перевод" → "Между своими счетами" → сумма `1,50` → отправить → сверить остаток `acc-1`.

## Фактический результат

| Что смотреть   | Факт                                             |
| -------------- | ------------------------------------------------ |
| HTTP           | **200**, перевод принят                          |
| Списание       | **150** Br                                       |
| Баланс `acc-1` | **1134.51** (= 1284.51 − 150)                    |
| UI             | В поле `1,50`; остаток падает на 150, не на 1,50 |

## Ожидаемый результат

- Списание **1.50** Br (internal, комиссия 0)
- Баланс `acc-1` = **1283.01**
- Требование: `docs/ASSIGNMENT.md` п.1–2; `docs/openapi.yaml` → `POST /api/transfers`
