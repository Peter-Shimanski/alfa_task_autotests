/** Баги: playwright/bugs/BUG-014-history-search-finds-only-on-current-page.md
 *        playwright/bugs/BUG-015-history-amount-sort-works-as-text.md
 *        playwright/bugs/BUG-016-today-filter-drops-ops-due-to-timezone.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader } from '@helpers/stand-api.helper';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

type TxPage = {
  success: boolean;
  data?: {
    items: Array<{ id: string; amount: number; counterparty: string; createdAt: string }>;
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

describeTest({
  epic: epics.api,
  feature: features.history
});

test(stories.historySearchSortAndTodayFilter, async ({ page }) => {
  let sortResponse: ApiResult<TxPage>;
  let searchResponse: ApiResult<TxPage>;
  let todayResponse: ApiResult<TxPage>;

  await step('Запросить историю с sort=amount', async () => {
    const headers = await getAuthHeader(page);
    sortResponse = await apiFetch<TxPage>(
      page,
      `api/transactions?accountId=${testParams.ACC_IVANOV_CURRENT}&sort=amount&limit=50`,
      { headers }
    );
  });

  await step('Проверить числовую сортировку по сумме (п.19)', async () => {
    expect(sortResponse.status).toBe(200);
    const amounts = sortResponse.body.data?.items.map((i) => i.amount) ?? [];
    const sorted = [...amounts].sort((a, b) => a - b);
    expect(amounts, 'sort=amount должен упорядочивать числа по возрастанию').toEqual(sorted);
  });

  await step('Запросить историю с q=Пятёрочка', async () => {
    const headers = await getAuthHeader(page);
    searchResponse = await apiFetch<TxPage>(
      page,
      `api/transactions?accountId=${testParams.ACC_IVANOV_CURRENT}&limit=100&q=Пятёрочка`,
      { headers }
    );
  });

  await step('Проверить поиск по всем операциям, не только по странице (п.17)', async () => {
    expect(searchResponse.status).toBe(200);
    const found = searchResponse.body.data?.items.length ?? 0;
    const totalReported = searchResponse.body.data?.total ?? 0;
    expect(found, 'Поиск должен возвращать подходящие операции').toBeGreaterThan(0);
    expect(totalReported, 'total должен отражать найденные записи, а не весь объём без поиска').toBe(found);
  });

  await step('Запросить историю с period=today', async () => {
    const headers = await getAuthHeader(page);
    todayResponse = await apiFetch<TxPage>(
      page,
      `api/transactions?accountId=${testParams.ACC_IVANOV_CURRENT}&period=today&limit=100`,
      { headers }
    );
  });

  await step('Проверить, что period=today — локальные сутки клиента (п.18)', async () => {
    expect(todayResponse.status).toBe(200);
    const now = new Date();
    for (const item of todayResponse.body.data?.items ?? []) {
      const created = new Date(item.createdAt);
      expect(created.getFullYear()).toBe(now.getFullYear());
      expect(created.getMonth()).toBe(now.getMonth());
      expect(created.getDate()).toBe(now.getDate());
    }
  });
});
