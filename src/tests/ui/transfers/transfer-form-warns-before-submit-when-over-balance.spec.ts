/** Баг: playwright/bugs/BUG-018-transfer-form-no-warning-when-over-balance.md */
import { describeTest, expect, step, test } from '@fixtures/base-test-as-ivanov';
import { getStandState } from '@helpers/stand-api.helper';
import { transferPage } from '@page-objects/transfer-page/locators';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

describeTest({
  epic: epics.ui,
  feature: features.transfers
});

test(stories.transferFormWarnsBeforeSubmitWhenOverBalance, async ({ page, actionsBrowser, actionsTransferPage }) => {
  let amountOverBalance: string;

  await step('Предусловие API: Взять сумму больше остатка', async () => {
    const balance = (await getStandState(page)).accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
    amountOverBalance = String(Math.ceil(balance + 100));
  });

  await step('Заполнить форму перевода суммой больше остатка (без submit)', async () => {
    await actionsTransferPage.goTo();
    await actionsTransferPage.fillInternalTransfer({
      fromAccountId: testParams.ACC_IVANOV_CURRENT,
      toAccountId: testParams.ACC_IVANOV_SAVINGS,
      amount: amountOverBalance
    });
  });

  await step('Проверить предупреждение UI до отправки (п.22)', async () => {
    const clientErrorVisible = await actionsBrowser.isElementVisible(transferPage.alertErrorNotEnoughFunds);
    expect(clientErrorVisible, 'Пользователь должен узнать о нехватке средств до отправки').toBeTruthy();
  });
});
