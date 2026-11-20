# BUG-004: [API][UI][Security] Видны полные `pan` и `cvv` в списке карт и на экране "Карты"

## Краткое описание

`GET /api/cards` возвращает полный PAN и CVV. Кнопка "Показать реквизиты" на UI просто показывает уже пришедшие секреты — отдельной безопасной выдачи нет.

## Severity / Priority

|              | Оценка   | Обоснование                                                  |
| ------------ | -------- | ------------------------------------------------------------ |
| **Severity** | Critical | Компрометация платёжных реквизитов                           |
| **Priority** | High     | Полные PAN/CVV не должны уходить в обычный ответ списка карт |

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

3. Войти через UI (или оставаться на стенде после reset) для проверки экрана карт.

## Шаги воспроизведения

1. В DevTools → Console запросить карты:

```js
const cards = await fetch('https://fulcrum81.github.io/alfa-task/api/cards', {
  headers: { Authorization: `Bearer ${token}` }
});
const cardsBody = await cards.json();
console.log('status', cards.status);
console.log(
  'pan/cvv',
  cardsBody.data?.map((card) => ({ pan: card.pan, cvv: card.cvv }))
);
```

2. В UI: Карты → Показать реквизиты на любой карте.

## Фактический результат

| Где                           | Факт                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| API                           | **200**; в списке карт полный `"pan"` и `"cvv"` (например `4276380012345678` / `482`)                                |
| UI до клика                   | На пластике номер уже маскируется локально (`maskPan`), но полный PAN/CVV уже лежат в ответе API / в памяти страницы |
| UI после "Показать реквизиты" | Показывает полный номер и CVV из того же ответа списка — отдельного безопасного запроса нет                          |

## Ожидаемый результат

- **API:** в ответе списка только маска (как `maskedPan` в openapi), без полного номера и без CVV
- **UI:** на экране "Карты" — маскированный номер; "Показать реквизиты" не должно доставать полный PAN/CVV из ответа списка (их там не должно быть). Если показ полного номера вообще предусмотрен продуктом — только через отдельный защищённый сценарий, которого в ТЗ нет; по п.10 полные реквизиты в API не передаются
- Требование: `docs/ASSIGNMENT.md` п.10; `docs/openapi.yaml` → схема `Card` (`maskedPan`, без `pan`/`cvv`)
