import { test as baseTest } from '@fixtures/base-test';
import { loginViaApi, prepareStand } from '@helpers/stand-api.helper';
import ActionsBrowser from '@page-objects/browser.actions';
import { headerMenu } from '@page-objects/header-menu/locators';

export { afterAll, describeTest, expect, step } from '@fixtures/base-test';

interface StandLoginConfig {
  login: string;
  password: string;
}

export function createStandLoginTest(config: StandLoginConfig) {
  return baseTest.extend({
    page: async ({ page }, use) => {
      await prepareStand(page);
      await loginViaApi(page, config.login, config.password);
      const actionsBrowser = new ActionsBrowser(page);
      await actionsBrowser.waitForVisibility(headerMenu.btnLogout);
      await use(page);
    }
  });
}
