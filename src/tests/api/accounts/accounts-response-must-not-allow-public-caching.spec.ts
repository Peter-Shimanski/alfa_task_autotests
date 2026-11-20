/** Баг: playwright/bugs/BUG-011-accounts-list-marked-for-public-caching.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader } from '@helpers/stand-api.helper';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.api,
  feature: features.accounts
});

test(stories.accountsResponseMustNotAllowPublicCaching, async ({ page }) => {
  let response: ApiResult;

  await step('Запросить GET /api/accounts', async () => {
    const headers = await getAuthHeader(page);
    response = await apiFetch(page, 'api/accounts', { headers });
  });

  await step('Проверить отсутствие Cache-Control: public (п.14)', async () => {
    expect(response.status).toBe(200);
    expect(response.headers['cache-control'] || '').not.toContain('public');
  });
});
