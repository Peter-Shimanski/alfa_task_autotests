import { createStandApiLoginTest } from '@fixtures/create-stand-api-login-test';
import { testParams } from '@testParams';

export { afterAll, describeTest, expect, step } from '@fixtures/create-stand-api-login-test';

export const test = createStandApiLoginTest({
  login: testParams.ADMIN_LOGIN,
  password: testParams.ADMIN_PASSWORD
});
