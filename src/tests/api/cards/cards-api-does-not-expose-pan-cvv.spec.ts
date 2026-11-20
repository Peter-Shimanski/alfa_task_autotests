/** Баг: playwright/bugs/BUG-004-cards-list-and-ui-show-full-pan-and-cvv.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader } from '@helpers/stand-api.helper';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.api,
  feature: features.cards
});

test(stories.cardsApiDoesNotExposePanCvv, async ({ page }) => {
  let response: ApiResult<{
    success: boolean;
    data?: Array<Record<string, unknown>>;
  }>;


  await step('Запросить GET /api/cards', async () => {
    const headers = await getAuthHeader(page);
    response = await apiFetch(page, 'api/cards', { headers });
  });

  await step('Проверить отсутствие pan и cvv в ответе (п.10)', async () => {
    expect(response.status).toBe(200);
    expect(response.body.data?.length).toBeGreaterThan(0);

    for (const card of response.body.data ?? []) {
      expect(card, 'Полный PAN не должен возвращаться').not.toHaveProperty('pan');
      expect(card, 'CVV не должен возвращаться').not.toHaveProperty('cvv');
      expect(JSON.stringify(card)).not.toMatch(/\b\d{16}\b/);
      expect(JSON.stringify(card)).not.toMatch(/"cvv"\s*:/);
    }
  });
});
