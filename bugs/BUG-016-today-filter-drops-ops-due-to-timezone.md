# BUG-016: [API][UI] Фильтр "Сегодня" отсекает операции при сравнении дат по UTC

## Краткое описание

`period=today` сравнивает **UTC-даты**. Операции после локальной полуночи, но до полуночи UTC, могут не попасть в "Сегодня".

## Severity / Priority

|              | Оценка | Обоснование                              |
| ------------ | ------ | ---------------------------------------- |
| **Severity** | Major  | Нарушение п.18 (локальные сутки клиента) |
| **Priority** | Medium | Логика фильтра неверна независимо от TZ  |

## Окружение

- ОС: Windows 10
- Браузер: Chrome
- Часовой пояс: Europe/Minsk (UTC+3)

## Предусловия

- Учётка: `ivanov` / `password123`
- Часовой пояс клиента: например Europe/Minsk (UTC+3)
- После reset в seed есть операции около 00:30 / 01:15 **локально**

1. Открыть https://fulcrum81.github.io/alfa-task/ (TZ браузера не UTC, если возможно).
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
const res = await fetch(
  'https://fulcrum81.github.io/alfa-task/api/transactions?accountId=acc-1&period=today&limit=100',
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
const body = await res.json();
console.log('status', res.status);
console.log(
  'today items',
  body.data?.items?.map((item) => ({ createdAt: item.createdAt, counterparty: item.counterparty }))
);
```

2. Найти в полном списке (без `period=today`) операции с локальным временем "сегодня 00:30" — проверить, входят ли они в выборку `today`.

3. UI: "История" → период "Сегодня".

## Фактический результат

| Где | Факт                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------- |
| API | **200**; сравнение UTC-даты из ISO; операция в 00:30 локально (UTC+3) имеет UTC-дату "вчера" и может **не** попасть |
| UI  | Период "Сегодня" — тот же урезанный набор                                                                           |

## Ожидаемый результат

- Отбор по **локальным** суткам клиента
- Требование: `docs/ASSIGNMENT.md` п.18; `docs/openapi.yaml` → `period=today`
