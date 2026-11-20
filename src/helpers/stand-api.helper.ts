import { Page } from '@playwright/test';
import { testParams } from '@testParams';

export type ApiResult<T = unknown> = {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: T;
};

type FetchInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

/**
 * API стенда живёт в service worker — запросы только из контекста страницы.
 * `path` без ведущего `/` (например `api/transfers`): BASE_URL уже со `/` на конце.
 */
export async function apiFetch<T = unknown>(page: Page, path: string, init: FetchInit = {}): Promise<ApiResult<T>> {
  const url = `${testParams.BASE_URL}${path}`;

  return page.evaluate(
    async ({ url, init }) => {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(init.headers ?? {})
      };
      let body: string | undefined;
      if (init.body !== undefined) {
        headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
        body = typeof init.body === 'string' ? init.body : JSON.stringify(init.body);
      }

      const response = await fetch(url, {
        method: init.method ?? 'GET',
        headers,
        body
      });

      const headerEntries: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headerEntries[key] = value;
      });

      let parsed: unknown = null;
      try {
        parsed = await response.json();
      } catch {
        parsed = null;
      }

      return {
        status: response.status,
        ok: response.ok,
        headers: headerEntries,
        body: parsed as T
      };
    },
    { url, init }
  );
}

export async function waitForWorker(page: Page, attempts = 60): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await apiFetch(page, 'api/__test__/state');
      if (result.status === 200) return;
    } catch {
      // API ещё не готов
    }
    await page.waitForTimeout(250);
  }
  throw new Error('Stand API is not ready (api/__test__/state)');
}

/**
 * POST /api/__test__/reset — по требованию ASSIGNMENT §3 / §5.
 * Знаю, что Playwright на каждый тест и так даёт новый BrowserContext
 * с чистым localStorage (и стенд при cold start сам поднимет seed).
 * Reset здесь не "потому что Playwright не чистит", а потому что ТЗ
 * явно требует сброс через API стенда перед тестом.
 */
export async function resetStand(page: Page, keepSession = false): Promise<void> {
  const path = keepSession ? 'api/__test__/reset?keepSession=1' : 'api/__test__/reset';
  const result = await apiFetch(page, path, { method: 'POST' });
  if (result.status !== 200) {
    throw new Error(`Stand reset failed with status ${result.status}`);
  }
}

export async function prepareStand(page: Page): Promise<void> {
  await page.goto('./');
  await waitForWorker(page);
  await resetStand(page);
  // UI мог закэшировать данные до reset — подтягиваем чистое состояние.
  await page.reload();
  await waitForWorker(page);
}

export async function loginViaApi(
  page: Page,
  login: string,
  password: string
): Promise<{ token: string; user: unknown }> {
  const result = await apiFetch<{
    success: boolean;
    data?: { token: string; user: unknown };
    message?: string;
  }>(page, 'api/auth/login', {
    method: 'POST',
    body: { login, password }
  });

  if (result.status !== 200 || !result.body?.data?.token) {
    throw new Error(`Login failed (${result.status}): ${JSON.stringify(result.body)}`);
  }

  const token = result.body.data.token;
  await page.evaluate(({ key, token }) => localStorage.setItem(key, token), {
    key: testParams.TOKEN_STORAGE_KEY,
    token
  });
  // AuthContext читает токен только на mount — без reload UI останется на /login.
  await page.reload();
  await waitForWorker(page);

  return { token, user: result.body.data.user };
}

export async function getAuthHeader(page: Page): Promise<Record<string, string>> {
  const token = await page.evaluate((key) => localStorage.getItem(key), testParams.TOKEN_STORAGE_KEY);
  if (!token) throw new Error('No auth token in localStorage');
  return { Authorization: `Bearer ${token}` };
}

export async function getStandState(page: Page): Promise<{
  accounts: Array<{ id: string; ownerId: string; balance: number; title: string }>;
  transactions: number;
  sessions: number;
  revokedTokens: number;
}> {
  const result = await apiFetch<{
    success: boolean;
    data: {
      accounts: Array<{ id: string; ownerId: string; balance: number; title: string }>;
      transactions: number;
      sessions: number;
      revokedTokens: number;
    };
  }>(page, 'api/__test__/state');

  if (result.status !== 200 || !result.body?.data) {
    throw new Error(`Cannot read stand state: ${JSON.stringify(result.body)}`);
  }
  return result.body.data;
}
