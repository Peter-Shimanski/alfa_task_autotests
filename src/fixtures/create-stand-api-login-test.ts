import { test as baseTest } from '@fixtures/base-test';
import { loginViaApi, prepareStand } from '@helpers/stand-api.helper';

export { afterAll, describeTest, expect, step } from '@fixtures/base-test';

export function createStandApiLoginTest(config: { login: string; password: string }) {
  return baseTest.extend({
    page: async ({ page }, use) => {
      await prepareStand(page);
      await loginViaApi(page, config.login, config.password);
      await use(page);
    }
  });
}
