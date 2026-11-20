# Баг-репорты: Наш банк (alfa-task)

Стенд: https://fulcrum81.github.io/alfa-task/  
Требования: `docs/ASSIGNMENT.md` (п.1–22), `docs/openapi.yaml`  
Эталон оформления: [BUG-001](./BUG-001-can-debit-foreign-account-via-transfer.md)

## Правило стенда: как дергать API

На GitHub Pages **API обслуживает service worker открытой вкладки стенда**.

| Способ                                                                           | Работает?                                               |
| -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Браузер: вкладка стенда → F12 → **Console** → полный URL `.../alfa-task/api/...` | **Да**                                                  |
| `fetch('./api/...')` (относительный путь)                                        | **Нет** — часто уходит на `github.io/api/...` → **405** |
| Postman, curl, Insomnia                                                          | **Нет**                                                 |

Всегда открывайте https://fulcrum81.github.io/alfa-task/ и в DevTools → Console копируйте сниппеты с **полным** URL (как в BUG-001). Не используйте `./api/...`.

Для чистого состояния в DevTools → Console:

```js
await fetch('https://fulcrum81.github.io/alfa-task/api/__test__/reset', { method: 'POST' });
```

## Структура каждого файла BUG-XXX

1. `# BUG-XXX: <заголовок>` — `[API]` / `[UI]` / `[Security]` + суть ("возможно…" / что ломается) + условие; эндпоинт — в шагах, не в title
2. `## Краткое описание` — что сломано, простым языком
3. `## Severity / Priority` — таблица: оценка + обоснование
4. `## Окружение` — ОС, браузер (стенд — в шапке README и в шаге "Открыть…"; DevTools — в шагах, не здесь)
5. `## Предусловия` — учётка, исходные данные; сниппеты DevTools → Console (см. правило API выше)
6. `## Шаги воспроизведения` — DevTools → Console `fetch` или клики в UI
7. `## Фактический результат` — status, body, UI
8. `## Ожидаемый результат` — со ссылкой на ТЗ / `openapi.yaml`

## Сводка

| ID                                                                    | Заголовок                                                                                       | Severity | Priority | Источник |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- | -------- | -------- |
| [BUG-001](./BUG-001-can-debit-foreign-account-via-transfer.md)        | [API][Security] Возможно списать средства с чужого счёта при указании чужого `fromAccountId`    | Critical | High     | Autotest |
| [BUG-002](./BUG-002-balance-grows-on-negative-transfer-amount.md)     | [API][UI] Возможно провести перевод с отрицательной суммой                                      | Critical | High     | Manual   |
| [BUG-003](./BUG-003-own-login-opens-foreign-account-and-history.md)   | [API][Security] Возможно прочитать чужой счёт и историю при указании чужого `accountId`         | Critical | High     | Autotest |
| [BUG-004](./BUG-004-cards-list-and-ui-show-full-pan-and-cvv.md)       | [API][UI][Security] Видны полные `pan` и `cvv` в списке карт и на экране "Карты"                | Critical | High     | Autotest |
| [BUG-005](./BUG-005-access-token-still-works-after-logout.md)         | [API][Security] Возможно пользоваться тем же Bearer после выхода                                | Critical | High     | Autotest |
| [BUG-006](./BUG-006-simultaneous-transfers-drive-balance-negative.md) | [API] Возможно увести баланс ниже нуля при двух почти одновременных переводах с одного счёта    | Critical | High     | Autotest |
| [BUG-007](./BUG-007-transfer-amount-1-50-debited-as-150.md)           | [API][UI] Сумма "1,50" списывается как 150 при вводе с запятой                                  | Major    | High     | Autotest |
| [BUG-008](./BUG-008-external-fee-rounded-to-rubles-not-kopecks.md)    | [API] Комиссия 1,5% по реквизитам округляется до рублей вместо копеек                           | Major    | High     | Autotest |
| [BUG-009](./BUG-009-regular-client-can-open-admin-section.md)         | [API][UI][Security] Обычный клиент открывает служебный раздел без роли admin                    | Major    | High     | Autotest |
| [BUG-010](./BUG-010-same-transfer-repeat-creates-second-debit.md)     | [API] Возможно списать деньги дважды при повторе с тем же `Idempotency-Key`                     | Major    | High     | Autotest |
| [BUG-011](./BUG-011-accounts-list-marked-for-public-caching.md)       | [API][Security] Персональный список счетов отдаётся с `Cache-Control: public`                   | Major    | Medium   | Autotest |
| [BUG-012](./BUG-012-server-error-response-exposes-stack-trace.md)     | [API][Security] В теле ответа 500 торчит `stack` при `amount=1337`                              | Major    | Medium   | Autotest |
| [BUG-013](./BUG-013-transfer-rejection-answered-as-success.md)        | [API] Отказ перевода из‑за нехватки средств приходит с HTTP 200 вместо 4xx                      | Major    | Medium   | Autotest |
| [BUG-014](./BUG-014-history-search-finds-only-on-current-page.md)     | [API][UI] Поиск по истории находит совпадения только на текущей странице                        | Major    | Medium   | Autotest |
| [BUG-015](./BUG-015-history-amount-sort-works-as-text.md)             | [API][UI] Сортировка истории по сумме идёт как по тексту, а не как по числам                    | Major    | Medium   | Autotest |
| [BUG-016](./BUG-016-today-filter-drops-ops-due-to-timezone.md)        | [API][UI] Фильтр "Сегодня" отсекает операции при сравнении дат по UTC                           | Major    | Medium   | Autotest |
| [BUG-017](./BUG-017-between-own-accounts-allows-foreign-credit.md)    | [API][Security] Возможно зачислить на чужой счёт без комиссии при указании чужого `toAccountId` | Major    | High     | Manual   |
| [BUG-018](./BUG-018-transfer-form-no-warning-when-over-balance.md)    | [UI] Возможно отправить сумму больше остатка — форма не предупреждает до submit                 | Minor    | Medium   | Autotest |
| [BUG-019](./BUG-019-dashboard-total-missing-cents.md)                 | [UI] Итог "Всего на счетах" как `1082.1` вместо двух знаков после запятой                       | Minor    | Low      | Manual   |
| [BUG-020](./BUG-020-money-shown-differently-across-sections.md)       | [UI] Одинаковые суммы отображаются в разном формате в истории, на счетах, картах и в алерте     | Minor    | Low      | Manual   |
| [BUG-021](./BUG-021-history-cannot-open-last-page.md)                 | [UI] Невозможно открыть последнюю страницу истории — число страниц считают через floor          | Minor    | Medium   | Manual   |
| [BUG-022](./BUG-022-zero-amount-transfer-accepted-as-success.md)      | [API] Возможно провести перевод с `amount: 0` как успешный                                      | Major    | Medium   | Manual   |
| [BUG-023](./BUG-023-dashboard-total-shows-float-tail.md)              | [UI] Итог "Всего на счетах" с float-хвостом после мелкого перевода                              | Minor    | Low      | Manual   |

См. также: [VERIFIED_OK.md](./VERIFIED_OK.md), [IMPROVEMENTS.md](./IMPROVEMENTS.md)

## Легенда

- **Severity** — насколько сильно бьёт по продукту / деньгам / безопасности при срабатывании
- **Priority** — в каком порядке чинить с учётом риска и частоты сценария
- **Источник** — `Autotest` = есть сценарий в `src/tests`; `Manual` = автотеста нет

### Что ловит автотест (актуально)

**14** спек ловят дефекты → **16** bug id (одна история-спека закрывает BUG-014, 015 и 016).  
Плюс 1 зелёный тест без бага: login lock (п.12). Всего спек: **15**.

| Спека | Bug id |
|---|---|
| `api/access/transfer-from-foreign-account-is-denied` | 001 |
| `api/access/foreign-account-read-is-denied` | 003 |
| `api/cards/cards-api-does-not-expose-pan-cvv` | 004 |
| `api/auth/logout-invalidates-issued-token` | 005 |
| `api/transfers/concurrent-transfers-cannot-overdraw-account` | 006 |
| `ui/transfers/transfer-amount-uses-comma-as-decimal-separator` | 007 |
| `api/transfers/external-fee-is-rounded-to-cents` | 008 |
| `ui/access/client-cannot-open-admin-section` | 009 |
| `api/transfers/same-idempotency-key-does-not-create-second-transfer` | 010 |
| `api/accounts/accounts-response-must-not-allow-public-caching` | 011 |
| `api/errors/error-response-must-not-expose-stack` | 012 |
| `api/transfers/insufficient-funds-transfer-is-rejected` | 013 |
| `api/history/history-search-sort-and-today-filter` | 014, 015, 016 |
| `ui/transfers/transfer-form-warns-before-submit-when-over-balance` | 018 |
| `ui/auth/login-is-locked-after-three-wrong-passwords` | — (п.12, без бага) |

Manual (автотеста нет): **002, 017, 019, 020, 021, 022, 023**.
