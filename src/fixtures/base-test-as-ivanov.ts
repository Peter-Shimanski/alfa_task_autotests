import { createStandLoginTest } from '@fixtures/create-stand-login-test';
import { testParams } from '@testParams';

export { afterAll, describeTest, expect, step } from '@fixtures/create-stand-login-test';

export const test = createStandLoginTest({
  login: testParams.IVANOV_LOGIN,
  password: testParams.IVANOV_PASSWORD
});
