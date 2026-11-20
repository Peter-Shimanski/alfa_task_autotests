# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\api\transfers\concurrent-transfers-cannot-overdraw-account.spec.ts >> Параллельные переводы не должны уводить баланс в минус (п.4) [BUG-006]
- Location: src\tests\api\transfers\concurrent-transfers-cannot-overdraw-account.spec.ts:12:1

# Error details

```
Error: Баланс не должен уходить в минус

expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 0
Received:    -101.49000000000001
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
  1  | /** Баг: playwright/bugs/BUG-006-simultaneous-transfers-drive-balance-negative.md */
  2  | import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
  3  | import { apiFetch, getAuthHeader, getStandState } from '@helpers/stand-api.helper';
  4  | import { testParams } from '@testParams';
  5  | import { epics, features, stories } from '@tests/constants';
  6  | 
  7  | describeTest({
  8  |   epic: epics.api,
  9  |   feature: features.transfers
  10 | });
  11 | 
  12 | test(stories.concurrentTransfersCannotOverdrawAccount, async ({ page }) => {
  13 |   let balanceBefore: number;
  14 | 
  15 |   await step('Зафиксировать баланс acc-1', async () => {
  16 |     const state = await getStandState(page);
  17 |     balanceBefore = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
  18 |   });
  19 | 
  20 |   await step('Отправить два параллельных перевода, в сумме превышающих баланс (п.4)', async () => {
  21 |     const halfPlus = Math.ceil(balanceBefore / 2 + 50);
  22 |     const headers = await getAuthHeader(page);
  23 |     const stamp = Date.now();
  24 |     const body = {
  25 |       fromAccountId: testParams.ACC_IVANOV_CURRENT,
  26 |       toAccountId: testParams.ACC_IVANOV_SAVINGS,
  27 |       // API: без запятой — иначе сработает BUG-007 (`692,00` → 69200). Запятая — кейс UI/п.2.
  28 |       amount: String(halfPlus)
  29 |     };
  30 | 
  31 |     await Promise.all([
  32 |       apiFetch(page, 'api/transfers', {
  33 |         method: 'POST',
  34 |         headers: { ...headers, 'Idempotency-Key': `race-a-${stamp}` },
  35 |         body
  36 |       }),
  37 |       apiFetch(page, 'api/transfers', {
  38 |         method: 'POST',
  39 |         headers: { ...headers, 'Idempotency-Key': `race-b-${stamp}` },
  40 |         body
  41 |       })
  42 |     ]);
  43 |   });
  44 | 
  45 |   await step('Баланс не уходит в минус', async () => {
  46 |     const state = await getStandState(page);
  47 |     const balanceAfter = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
> 48 |     expect(balanceAfter, 'Баланс не должен уходить в минус').toBeGreaterThanOrEqual(0);
     |                                                              ^ Error: Баланс не должен уходить в минус
  49 |   });
  50 | });
  51 | 
```