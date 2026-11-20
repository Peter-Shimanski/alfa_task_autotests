# BUG-003: [API][Security] Возможно прочитать чужой счёт и историю при указании чужого `accountId`

## Краткое описание

Под токеном `ivanov` доступны детали счёта и история операций другого клиента (`acc-3` / petrova).

## Severity / Priority

|              | Оценка   | Обоснование                                     |
| ------------ | -------- | ----------------------------------------------- |
| **Severity** | Critical | Утечка чужих финансовых и персональных данных   |
| **Priority** | High     | Базовое разграничение доступа к данным клиентов |

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

1. Запросить **чужой** счёт:

```js
const acc = await fetch('https://fulcrum81.github.io/alfa-task/api/accounts/acc-3', {
  headers: { Authorization: `Bearer ${token}` }
});
console.log('accounts status', acc.status);
console.log('accounts body', await acc.json());
```

2. Запросить **чужие** операции:

```js
const tx = await fetch('https://fulcrum81.github.io/alfa-task/api/transactions?accountId=acc-3', {
  headers: { Authorization: `Bearer ${token}` }
});
console.log('transactions status', tx.status);
console.log('transactions body', await tx.json());
```

## Фактический результат

| Запрос                                   | HTTP    | Факт                                            |
| ---------------------------------------- | ------- | ----------------------------------------------- |
| `GET ./api/accounts/acc-3`               | **200** | Данные счёта petrova, например `balance: 932.1` |
| `GET ./api/transactions?accountId=acc-3` | **200** | Список операций чужого клиента                  |

## Ожидаемый результат

- Оба запроса → **403**
- Чужой счёт и список операций не возвращаются
- Требование: `docs/ASSIGNMENT.md` п.9; `docs/openapi.yaml` → `GET /api/accounts/{id}`, `GET /api/transactions`
