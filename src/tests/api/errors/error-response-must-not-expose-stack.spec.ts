/** Баг: playwright/bugs/BUG-012-server-error-response-exposes-stack-trace.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader } from '@helpers/stand-api.helper';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.api,
  feature: features.errors
});

test(stories.errorResponseMustNotExposeStack, async ({ page }) => {
  let response: ApiResult;

  await step('Вызвать сбой перевода amount=1337', async () => {
    const headers = await getAuthHeader(page);
    response = await apiFetch(page, 'api/transfers', {
      method: 'POST',
      headers: {
        ...headers,
        'Idempotency-Key': `fault-${Date.now()}`
      },
      body: {
        fromAccountId: testParams.ACC_IVANOV_CURRENT,
        recipient: '4276380011112222',
        amount: '1337'
      }
    });
  });

  await step('Проверить, что тело 500 не содержит stack (п.15)', async () => {
    expect(response.status).toBe(500);
    expect(response.body).not.toHaveProperty('stack');
  });
});
