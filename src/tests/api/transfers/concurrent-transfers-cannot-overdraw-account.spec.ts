/** Баг: playwright/bugs/BUG-006-simultaneous-transfers-drive-balance-negative.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, getAuthHeader, getStandState } from '@helpers/stand-api.helper';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.api,
  feature: features.transfers
});

test(stories.concurrentTransfersCannotOverdrawAccount, async ({ page }) => {
  let balanceBefore: number;

  await step('Зафиксировать баланс acc-1', async () => {
    const state = await getStandState(page);
    balanceBefore = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
  });

  await step('Отправить два параллельных перевода, в сумме превышающих баланс (п.4)', async () => {
    const halfPlus = Math.ceil(balanceBefore / 2 + 50);
    const headers = await getAuthHeader(page);
    const stamp = Date.now();
    const body = {
      fromAccountId: testParams.ACC_IVANOV_CURRENT,
      toAccountId: testParams.ACC_IVANOV_SAVINGS,
      // API: без запятой — иначе сработает BUG-007 (`692,00` → 69200). Запятая — кейс UI/п.2.
      amount: String(halfPlus)
    };

    await Promise.all([
      apiFetch(page, 'api/transfers', {
        method: 'POST',
        headers: { ...headers, 'Idempotency-Key': `race-a-${stamp}` },
        body
      }),
      apiFetch(page, 'api/transfers', {
        method: 'POST',
        headers: { ...headers, 'Idempotency-Key': `race-b-${stamp}` },
        body
      })
    ]);
  });

  await step('Баланс не уходит в минус', async () => {
    const state = await getStandState(page);
    const balanceAfter = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
    expect(balanceAfter, 'Баланс не должен уходить в минус').toBeGreaterThanOrEqual(0);
  });
});
