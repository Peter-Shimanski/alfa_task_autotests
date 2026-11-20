import ActionsAdminPage from '@page-objects/admin-page/actions';
import ActionsBrowser from '@page-objects/browser.actions';
import ActionsDashboardPage from '@page-objects/dashboard-page/actions';
import ActionsHistoryPage from '@page-objects/history-page/actions';
import ActionsLogInPage from '@page-objects/log-in-page/actions';
import ActionsTransferPage from '@page-objects/transfer-page/actions';
import { prepareStand } from '@helpers/stand-api.helper';
import { test as baseTest } from '@playwright/test';
import { epic, feature } from 'allure-js-commons';

export { expect } from '@playwright/test';

export type BaseTestFixtures = {
  actionsBrowser: ActionsBrowser;
  actionsLogInPage: ActionsLogInPage;
  actionsTransferPage: ActionsTransferPage;
  actionsHistoryPage: ActionsHistoryPage;
  actionsDashboardPage: ActionsDashboardPage;
  actionsAdminPage: ActionsAdminPage;
};

/**
 * Перед тестом: worker + reset + reload.
 * Playwright сам чистит localStorage новым BrowserContext — это известно;
 * reset добавлен потому что так требует ASSIGNMENT §3/§5, см. resetStand.
 */
export const test = baseTest.extend<BaseTestFixtures>({
  page: async ({ page }, use) => {
    await prepareStand(page);
    await use(page);
  },

  actionsBrowser: async ({ page }, use) => {
    await use(new ActionsBrowser(page));
  },

  actionsLogInPage: async ({ page }, use) => {
    await use(new ActionsLogInPage(page));
  },

  actionsTransferPage: async ({ page }, use) => {
    await use(new ActionsTransferPage(page));
  },

  actionsHistoryPage: async ({ page }, use) => {
    await use(new ActionsHistoryPage(page));
  },

  actionsDashboardPage: async ({ page }, use) => {
    await use(new ActionsDashboardPage(page));
  },

  actionsAdminPage: async ({ page }, use) => {
    await use(new ActionsAdminPage(page));
  }
});

export const describeTest = (testDecomposition: { epic: string; feature: string }) => {
  test.beforeAll(async () => {
    epic(testDecomposition.epic);
    feature(testDecomposition.feature);
  });
};

export const afterAll = test.afterEach;
export const step = test.step;
