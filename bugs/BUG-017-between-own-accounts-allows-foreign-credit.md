# BUG-017: [API][Security] Возможно зачислить на чужой счёт без комиссии при указании чужого `toAccountId`

## Краткое описание

В режиме "между своими" (`toAccountId`) нет проверки владельца счёта зачисления. Можно перевести на `acc-3` (petrova) с `fee: 0`, обойдя и доступ к счетам, и тариф внешнего перевода.

## Severity / Priority

|              | Оценка | Обоснование                                    |
| ------------ | ------ | ---------------------------------------------- |
| **Severity** | Major  | Зачисление на чужой счёт + обход комиссии 1,5% |
| **Priority** | High   | Связан с границами доступа; рядом с BUG-001    |

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

1. В DevTools → Console от имени `ivanov` выполнить перевод «между своими», но на чужой счёт:

Что делает шаг:

- `POST /api/transfers` с токеном клиента `ivanov`;
- списание с **своего** `acc-1`, зачисление на **чужой** `acc-3` (petrova) через `toAccountId` (режим без `recipient`);
- сумма `50`; в ответе смотрим HTTP-статус, `success` и `fee` (для "между своими" комиссия 0);
- затем `GET /api/__test__/state` — читаем балансы `acc-1` и `acc-3`, чтобы увидеть фактическое движение денег.

```js
const transfer = await fetch('https://fulcrum81.github.io/alfa-task/api/transfers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'Idempotency-Key': `bug017-${Date.now()}`
  },
  body: JSON.stringify({
    fromAccountId: 'acc-1',
    toAccountId: 'acc-3',
    amount: '50'
  })
});

console.log('status', transfer.status);
console.log('body', await transfer.json());

const after = await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/state').then((response) =>
  response.json()
);
const bal1 = after.data.accounts.find((account) => account.id === 'acc-1').balance;
const bal3 = after.data.accounts.find((account) => account.id === 'acc-3').balance;
console.log('acc-1', bal1, 'acc-3', bal3);
```

## Фактический результат

| Что смотреть | Факт                      |
| ------------ | ------------------------- |
| HTTP         | **200**                   |
| Тело         | `success: true`, `fee: 0` |
| Балансы      | `acc-1` −50, `acc-3` +50  |

## Ожидаемый результат

- Отказ (**403** / ошибка доступа к чужому счёту зачисления)
- Требование: `docs/ASSIGNMENT.md` п.5, п.9; `docs/openapi.yaml` → `POST /api/transfers`
