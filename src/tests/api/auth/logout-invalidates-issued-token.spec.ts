/** Баг: playwright/bugs/BUG-005-access-token-still-works-after-logout.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-api-as-ivanov';
import { apiFetch, ApiResult, getAuthHeader } from '@helpers/stand-api.helper';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.api,
  feature: features.auth
});

test(stories.logoutInvalidatesIssuedToken, async ({ page }) => {
  let token: string;
  let logoutResponse: ApiResult;
  let meResponse: ApiResult;

  await step('Сохранить токен из localStorage', async () => {
    const headers = await getAuthHeader(page);
    token = headers.Authorization.replace(/^Bearer\s+/i, '');
  });

  await step('Выйти через API', async () => {
    logoutResponse = await apiFetch(page, 'api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  });

  await step('Проверить успешный logout', async () => {
    expect(logoutResponse.status).toBe(200);
  });

  await step('Запросить /api/me прежним токеном', async () => {
    meResponse = await apiFetch(page, 'api/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
  });

  await step('Проверить, что токен недействителен — 401 (п.11)', async () => {
    expect(meResponse.status, 'После выхода токен должен быть недействителен').toBe(401);
  });
});
