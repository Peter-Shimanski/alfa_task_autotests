/** Баг: playwright/bugs/BUG-010-same-transfer-repeat-creates-second-debit.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader, getStandState } from '@helpers/stand-api.helper';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.api,
  feature: features.transfers
});

test(stories.sameIdempotencyKeyDoesNotCreateSecondTransfer, async ({ page }) => {
  const idempotencyKey = `idem-${Date.now()}`;
  let balanceBefore: number;
  let txBefore: number;
  let first: ApiResult;
  let second: ApiResult;

  await step('Зафиксировать состояние', async () => {
    const state = await getStandState(page);
    balanceBefore = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
    txBefore = state.transactions;
  });

  await step('Отправить один и тот же перевод дважды с одним Idempotency-Key', async () => {
    const headers = await getAuthHeader(page);
    const payload = {
      fromAccountId: testParams.ACC_IVANOV_CURRENT,
      toAccountId: testParams.ACC_IVANOV_SAVINGS,
      amount: '10'
    };

    first = await apiFetch(page, 'api/transfers', {
      method: 'POST',
      headers: { ...headers, 'Idempotency-Key': idempotencyKey },
      body: payload
    });
    second = await apiFetch(page, 'api/transfers', {
      method: 'POST',
      headers: { ...headers, 'Idempotency-Key': idempotencyKey },
      body: payload
    });
  });

  await step('Проверить HTTP-статусы обоих ответов', async () => {
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  await step('Проверить, что списание произошло только один раз (п.8)', async () => {
    const state = await getStandState(page);
    const balanceAfter = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
    expect(balanceAfter).toBeCloseTo(balanceBefore - 10, 2);
    expect(state.transactions).toBe(txBefore + 1);
  });
});
