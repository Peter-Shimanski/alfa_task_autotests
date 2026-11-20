/** Баг: playwright/bugs/BUG-008-external-fee-rounded-to-rubles-not-kopecks.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader, getStandState } from '@helpers/stand-api.helper';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

const expectedFee = (amount: number) => Math.round(amount * 0.015 * 100) / 100;

type TransferResponse = {
  success: boolean;
  data?: { fee: number; total: number; balance: number };
};

describeTest({
  epic: epics.api,
  feature: features.transfers
});

test(stories.externalFeeIsRoundedToCents, async ({ page }) => {
  const amount = 100;
  let balanceBefore: number;
  let response: ApiResult<TransferResponse>;


  await step('Отправить внешний перевод на 100', async () => {
    const headers = await getAuthHeader(page);
    balanceBefore = (await getStandState(page)).accounts.find(
      (a) => a.id === testParams.ACC_IVANOV_CURRENT
    ).balance;

    response = await apiFetch<TransferResponse>(page, 'api/transfers', {
      method: 'POST',
      headers: {
        ...headers,
        'Idempotency-Key': `fee-${Date.now()}`
      },
      body: {
        fromAccountId: testParams.ACC_IVANOV_CURRENT,
        recipient: '4276380011112222',
        // без запятой — изолируем дефект комиссии от дефекта парсинга (BUG-007)
        amount: String(amount)
      }
    });
  });

  await step('Проверить комиссию 1,5% с округлением до копеек (п.5, п.7)', async () => {
    expect(response.status).toBe(200);
    expect(response.body.data?.fee).toBe(expectedFee(amount));
    expect(response.body.data?.total).toBe(amount + expectedFee(amount));
    expect(response.body.data?.balance).toBeCloseTo(balanceBefore - (amount + expectedFee(amount)), 2);
  });
});
