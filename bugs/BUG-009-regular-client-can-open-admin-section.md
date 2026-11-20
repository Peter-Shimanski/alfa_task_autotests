# BUG-009: [API][UI][Security] Обычный клиент открывает служебный раздел без роли admin

## Краткое описание

Под ролью клиента (`ivanov`) доступны `GET /api/admin/operations` и страница `/admin` ("Операции клиентов"). Пункт меню "Админ" скрыт, но это только косметика UI.

## Severity / Priority

|              | Оценка | Обоснование                                         |
| ------------ | ------ | --------------------------------------------------- |
| **Severity** | Major  | Нарушение конфиденциальности                        |
| **Priority** | High   | Служебный контур должен быть закрыт для роли `user` |

## Окружение

- ОС: Windows 10
- Браузер: Chrome

## Предусловия

- Учётка: `ivanov` / `password123` (роль клиента)

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

### API

1. В DevTools → Console от имени клиента (`ivanov`) запросить служебный список операций всех пользователей:

```js
const admin = await fetch('https://fulcrum81.github.io/alfa-task/api/admin/operations', {
  headers: { Authorization: `Bearer ${token}` }
});
const adminBody = await admin.json();
console.log('status', admin.status);
console.log('total', adminBody.data?.total);
console.log(
  'чужие счета в выборке',
  adminBody.data?.items?.some((item) => item.accountId === 'acc-3')
);
```

### UI

2. Оставаясь залогиненным как `ivanov` в UI, в адресной строке открыть:

   `https://fulcrum81.github.io/alfa-task/admin`

3. Проверить: открылась ли страница "Операции клиентов", видны ли чужие операции; при этом пункта "Админ" в меню нет.

## Фактический результат

| Где                                 | Факт                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **API** `GET /api/admin/operations` | **200** вместо 403; `total` ≈ 272; в `items` есть операции чужих счетов (`acc-3` и др.)                            |
| **UI** `/admin`                     | Страница открывается: заголовок "Операции клиентов", в таблице чужие счета; пункт "Админ" в меню скрыт (косметика) |

## Ожидаемый результат

- **API:** **403**, без списка чужих операций
- **UI:** служебный раздел клиенту недоступен (не только скрытая ссылка в меню)
- Требование: `docs/ASSIGNMENT.md` п.13; `docs/openapi.yaml` → `GET /api/admin/operations` → 403
