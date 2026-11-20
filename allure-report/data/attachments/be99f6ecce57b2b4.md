# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\api\access\foreign-account-read-is-denied.spec.ts >> Чтение чужого счёта запрещено (п.9) [BUG-003]
- Location: src\tests\api\access\foreign-account-read-is-denied.spec.ts:12:1

# Error details

```
Error: Чужой счёт должен быть запрещён

expect(received).toBe(expected) // Object.is equality

Expected: 403
Received: 200
```

# Page snapshot

```yaml
- generic [ref=f4e3]:
  - banner [ref=f4e4]:
    - generic [ref=f4e5]:
      - generic [ref=f4e6]:
        - generic [ref=f4e7]: Н
        - text: Наш банк
      - navigation [ref=f4e8]:
        - link "Счета" [ref=f4e9] [cursor=pointer]:
          - /url: /alfa-task
        - link "Перевод" [ref=f4e10] [cursor=pointer]:
          - /url: /alfa-task/transfer
        - link "История" [ref=f4e11] [cursor=pointer]:
          - /url: /alfa-task/history
        - link "Карты" [ref=f4e12] [cursor=pointer]:
          - /url: /alfa-task/cards
      - generic [ref=f4e13]:
        - generic [ref=f4e14]: Иван Иванов
        - button "Выйти" [ref=f4e15] [cursor=pointer]
  - main [ref=f4e16]:
    - heading "Здравствуйте, Иван Иванов" [level=1] [ref=f4e17]
    - paragraph [ref=f4e18]: Сводка по вашим продуктам
    - generic [ref=f4e20]:
      - generic [ref=f4e21]:
        - generic [ref=f4e22]: Всего на счетах
        - generic [ref=f4e23]: 6684.51 Br
      - generic [ref=f4e24]: "Операций сегодня: 2Счетов: 2 · Карт: 1"
    - generic [ref=f4e25]:
      - generic [ref=f4e26]:
        - generic [ref=f4e27]: Текущий счёт
        - generic [ref=f4e28]: 1284.51 Br
        - generic [ref=f4e29]: •••• 4312
        - link "История операций" [ref=f4e31] [cursor=pointer]:
          - /url: /alfa-task/history?accountId=acc-1
      - generic [ref=f4e32]:
        - generic [ref=f4e33]: Накопительный счёт
        - generic [ref=f4e34]: 5400.00 Br
        - generic [ref=f4e35]: •••• 1127
        - link "История операций" [ref=f4e37] [cursor=pointer]:
          - /url: /alfa-task/history?accountId=acc-2
    - generic [ref=f4e39]:
      - generic [ref=f4e40]:
        - generic [ref=f4e41]: Быстрые действия
        - generic [ref=f4e42]: Перевод между счетами или по реквизитам получателя
      - link "Сделать перевод" [ref=f4e43] [cursor=pointer]:
        - /url: /alfa-task/transfer
```

# Test source

```ts
  1  | /** Баг: playwright/bugs/BUG-003-own-login-opens-foreign-account-and-history.md */
  2  | import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
  3  | import { apiFetch, ApiResult, getAuthHeader } from '@helpers/stand-api.helper';
  4  | import { testParams } from '@testParams';
  5  | import { epics, features, stories } from '@tests/constants';
  6  | 
  7  | describeTest({
  8  |   epic: epics.api,
  9  |   feature: features.access
  10 | });
  11 | 
  12 | test(stories.foreignAccountReadIsDenied, async ({ page }) => {
  13 |   let accountResponse: ApiResult;
  14 |   let transactionsResponse: ApiResult;
  15 | 
  16 | 
  17 |   await step('Запросить GET чужого счёта acc-3', async () => {
  18 |     const headers = await getAuthHeader(page);
  19 |     accountResponse = await apiFetch(page, `api/accounts/${testParams.ACC_PETROVA_CURRENT}`, {
  20 |       headers
  21 |     });
  22 |   });
  23 | 
  24 |   await step('Проверить, что чужой счёт запрещён — 403 (п.9)', async () => {
> 25 |     expect(accountResponse.status, 'Чужой счёт должен быть запрещён').toBe(403);
     |                                                                       ^ Error: Чужой счёт должен быть запрещён
  26 |   });
  27 | 
  28 |   await step('Запросить GET операций чужого счёта', async () => {
  29 |     const headers = await getAuthHeader(page);
  30 |     transactionsResponse = await apiFetch(
  31 |       page,
  32 |       `api/transactions?accountId=${testParams.ACC_PETROVA_CURRENT}`,
  33 |       { headers }
  34 |     );
  35 |   });
  36 | 
  37 |   await step('Проверить, что чужие операции запрещены — 403 (п.9)', async () => {
  38 |     expect(transactionsResponse.status, 'Чужие операции должны быть запрещены').toBe(403);
  39 |   });
  40 | });
  41 | 
```