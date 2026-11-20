# BUG-012: [API][Security] В теле ответа 500 торчит `stack` при `amount=1337`

## Краткое описание

При искусственном сбое (инъекция стенда `amount=1337`) сервер отвечает **500** и кладёт в тело `stack` с путями исходников. Сам факт 500 по инъекции — **не баг** (см. ASSIGNMENT §4); баг — **утечка внутренностей** в ответе.

## Severity / Priority

|              | Оценка | Обоснование                                       |
| ------------ | ------ | ------------------------------------------------- |
| **Severity** | Major  | Information disclosure                            |
| **Priority** | Medium | Ниже прямого финансового ущерба на учебном стенде |

## Окружение

- ОС: Windows 10
- Браузер: Chrome

## Предусловия

- Учётка: `ivanov` / `password123`
- Триггер: сумма **`1337`** (ASSIGNMENT §4)

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
    'Idempotency-Key': `fault-${Date.now()}`
  },
  body: JSON.stringify({
    fromAccountId: 'acc-1',
    recipient: '4276380011112222',
    amount: '1337'
  })
});
const body = await transfer.json();
console.log('status', transfer.status);
console.log('stack', body.stack);
```

## Фактический результат

| Что смотреть | Факт                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP         | **500**                                                                                                                                           |
| Тело         | `success: false`, `code: INTERNAL_ERROR`, сообщение TypeError; поле **`stack`** с путями вроде `/srv/app/src/services/transfer.service.ts:142:23` |

## Ожидаемый результат

- Код **500** для инъекции — допустим
- В теле **нет** `stack`, путей `/srv/app/...`, внутренних имён файлов
- Требование: `docs/ASSIGNMENT.md` п.15
