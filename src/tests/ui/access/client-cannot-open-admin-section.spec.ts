/** Баг: playwright/bugs/BUG-009-regular-client-can-open-admin-section.md */
import { describeTest, step, test } from '@fixtures/base-test-as-ivanov';
import { adminPage } from '@page-objects/admin-page/locators';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.ui,
  feature: features.access
});

test(stories.clientCannotOpenAdminSection, async ({ actionsBrowser, actionsAdminPage }) => {
  await step('Открыть прямой роут /admin', async () => {
    await actionsAdminPage.goTo(false);
  });

  await step('Проверить, что служебный раздел клиенту недоступен (п.13)', async () => {
    await actionsBrowser.checkThatElementIsNotVisible(adminPage.title);
    await actionsBrowser.checkThatElementIsNotVisible(adminPage.subtitle);
  });
});
