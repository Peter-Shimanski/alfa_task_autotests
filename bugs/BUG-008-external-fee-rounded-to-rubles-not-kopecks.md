# BUG-008: [API] Комиссия 1,5% по реквизитам округляется до рублей вместо копеек

## Краткое описание

За перевод по реквизитам комиссия должна быть 1,5% с округлением до копеек. Фактически округление идёт до целых рублей: для суммы `100` комиссия **2** вместо **1.50**; для `33` ожидается **0.50**, фактически **0**.

## Severity / Priority

|              | Оценка | Обоснование                                        |
| ------------ | ------ | -------------------------------------------------- |
| **Severity** | Major  | Систематическая ошибка тарифа на внешних переводах |
| **Priority** | High   | Неверная комиссия в типовом сценарии               |

## Окружение

- ОС: Windows 10
- Браузер: Chrome

## Предусловия

- Учётка: `ivanov` / `password123`
- Важно: сумму передавать **без запятой** (`"100"`), иначе вмешивается BUG-007.

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

1. Внешний перевод на `100`:

```js
const transfer = await fetch('https://fulcrum81.github.io/alfa-task/api/transfers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'Idempotency-Key': `fee-check-${Date.now()}`
  },
  body: JSON.stringify({
    fromAccountId: 'acc-1',
    recipient: '4276380011112222',
    amount: '100'
  })
});
const body = await transfer.json();
console.log('status', transfer.status);
console.log('fee', body.data?.fee, 'total', body.data?.total);
```

2. (Опционально) повторить reset/login и проверить `amount: "33"`.

## Фактический результат

| Сумма | Ожидание fee | Факт                |
| ----- | ------------ | ------------------- |
| `100` | 1.50         | **2**; `total: 102` |
| `33`  | 0.50         | **0**               |

## Ожидаемый результат

- `fee = 1.50`, `total = 101.50`
- Списание с баланса на **101.50**
- Для `33`: `fee = 0.50`
- Требование: `docs/ASSIGNMENT.md` п.5, п.7
