/** Баг: playwright/bugs/BUG-003-own-login-opens-foreign-account-and-history.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader } from '@helpers/stand-api.helper';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.api,
  feature: features.access
});

test(stories.foreignAccountReadIsDenied, async ({ page }) => {
  let accountResponse: ApiResult;
  let transactionsResponse: ApiResult;


  await step('Запросить GET чужого счёта acc-3', async () => {
    const headers = await getAuthHeader(page);
    accountResponse = await apiFetch(page, `api/accounts/${testParams.ACC_PETROVA_CURRENT}`, {
      headers
    });
  });

  await step('Проверить, что чужой счёт запрещён — 403 (п.9)', async () => {
    expect(accountResponse.status, 'Чужой счёт должен быть запрещён').toBe(403);
  });

  await step('Запросить GET операций чужого счёта', async () => {
    const headers = await getAuthHeader(page);
    transactionsResponse = await apiFetch(
      page,
      `api/transactions?accountId=${testParams.ACC_PETROVA_CURRENT}`,
      { headers }
    );
  });

  await step('Проверить, что чужие операции запрещены — 403 (п.9)', async () => {
    expect(transactionsResponse.status, 'Чужие операции должны быть запрещены').toBe(403);
  });
});
