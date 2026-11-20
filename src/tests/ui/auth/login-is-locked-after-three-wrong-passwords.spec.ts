/** Дефекта нет (п.12) — см. playwright/bugs/VERIFIED_OK.md */
import { describeTest, step, test } from '@fixtures/base-test';
import { logInPage } from '@page-objects/log-in-page/locators';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.ui,
  feature: features.auth
});

test(stories.loginIsLockedAfterThreeWrongPasswords, async ({ actionsBrowser, actionsLogInPage }) => {
  await step('Открыть форму входа', async () => {
    await actionsLogInPage.goTo();
  });

  await step('Трижды ошибиться паролем в UI', async () => {
    for (let i = 0; i < 3; i++) {
      await actionsLogInPage.enterCredentials({
        login: testParams.IVANOV_LOGIN,
        password: 'wrong-password'
      });
      await actionsLogInPage.clickBtnLogIn();
      await actionsBrowser.checkThatElementIsVisible(logInPage.alertError);
    }
  });

  await step('Отправить верный пароль после трёх ошибок', async () => {
    await actionsLogInPage.enterCredentials({
      login: testParams.IVANOV_LOGIN,
      password: testParams.IVANOV_PASSWORD
    });
    await actionsLogInPage.clickBtnLogIn();
  });

  await step('Проверить сообщение о блокировке на форме (п.12)', async () => {
    await actionsBrowser.checkThatElementIsVisible(logInPage.alertError);
    await actionsBrowser.checkThatElementContainText(
      logInPage.alertError,
      'Учётная запись временно заблокирована. Повторите попытку через'
    );
  });
});
