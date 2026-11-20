/** Баг: playwright/bugs/BUG-013-transfer-rejection-answered-as-success.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader, getStandState } from '@helpers/stand-api.helper';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.api,
  feature: features.transfers
});

test(stories.insufficientFundsTransferIsRejected, async ({ page }) => {
  let balanceBefore: number;
  let response: ApiResult<{ success: boolean; code?: string }>;
  let balanceAfter: number;

  await step('Прочитать текущий баланс', async () => {
    const state = await getStandState(page);
    balanceBefore = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
  });

  await step('Отправить перевод свыше остатка через API', async () => {
    const headers = await getAuthHeader(page);
    const amount = String(Math.ceil(balanceBefore + 100));
    response = await apiFetch(page, 'api/transfers', {
      method: 'POST',
      headers: {
        ...headers,
        'Idempotency-Key': `overdraft-${Date.now()}`
      },
      body: {
        fromAccountId: testParams.ACC_IVANOV_CURRENT,
        toAccountId: testParams.ACC_IVANOV_SAVINGS,
        amount
      }
    });
    const state = await getStandState(page);
    balanceAfter = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
  });

  await step('Проверить отказ API и неизменный баланс (п.3)', async () => {
    expect(response.status, 'Код ответа должен быть 400').toBe(400);
    expect(response.body?.success, 'тело Error: success=false').toBe(false);
    expect(response.body?.code, 'тело Error: code=INSUFFICIENT_FUNDS').toBe('INSUFFICIENT_FUNDS');
    expect(balanceAfter).toBe(balanceBefore);
  });
});
