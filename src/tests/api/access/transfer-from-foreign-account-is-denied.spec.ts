/** Баг: playwright/bugs/BUG-001-can-debit-foreign-account-via-transfer.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader, getStandState } from '@helpers/stand-api.helper';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.api,
  feature: features.access
});

test(stories.transferFromForeignAccountIsDenied, async ({ page }) => {
  let balanceBefore: number;
  let response: ApiResult;

  await step('Зафиксировать баланс petrova', async () => {
    const state = await getStandState(page);
    const petrovaAccount = state.accounts.find((a) => a.id === testParams.ACC_PETROVA_CURRENT);
    expect(petrovaAccount).toBeTruthy();
    balanceBefore = petrovaAccount.balance;
  });

  await step('Отправить перевод с чужого fromAccountId', async () => {
    const headers = await getAuthHeader(page);
    response = await apiFetch(page, 'api/transfers', {
      method: 'POST',
      headers: {
        ...headers,
        'Idempotency-Key': `foreign-${Date.now()}`
      },
      body: {
        fromAccountId: testParams.ACC_PETROVA_CURRENT,
        toAccountId: testParams.ACC_IVANOV_CURRENT,
        amount: '50'
      }
    });
  });

  await step('Проверить ответ 403 (п.9)', async () => {
    expect(response.status, 'Чужой fromAccountId должен вернуть 403').toBe(403);
  });

  await step('Проверить, что баланс чужого счёта не изменился', async () => {
    const state = await getStandState(page);
    const petrovaAccount = state.accounts.find((a) => a.id === testParams.ACC_PETROVA_CURRENT);
    expect(petrovaAccount.balance).toBe(balanceBefore);
  });
});
