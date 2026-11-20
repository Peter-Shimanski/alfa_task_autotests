/** Баг: playwright/bugs/BUG-007-transfer-amount-1-50-debited-as-150.md */
import { faker } from '@faker-js/faker';
import { describeTest, expect, step, test } from '@fixtures/base-test-as-ivanov';
import { getStandState } from '@helpers/stand-api.helper';
import { transferPage } from '@page-objects/transfer-page/locators';
import { testParams } from '@testParams';
import { epics, features, stories } from '@tests/constants';

const amountInput = '1,50';
const amountValue = parseFloat(amountInput.replace(',', '.'));
const feeValue = Math.round(amountValue * 0.015 * 100) / 100;
const totalValue = amountValue + feeValue;

describeTest({
  epic: epics.ui,
  feature: features.transfers
});

test(stories.transferAmountUsesCommaAsDecimalSeparator, async ({ page, actionsBrowser, actionsTransferPage }) => {
  let balanceFromBefore: number;
  let balanceSavingsBefore: number;
  const recipient = faker.string.numeric(16);

  await step('Предусловие API: Зафиксировать балансы', async () => {
    const state = await getStandState(page);
    balanceFromBefore = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT).balance;
    balanceSavingsBefore = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_SAVINGS).balance;
  });

  await step('Отправить external-перевод с суммой "1,50" через UI (п.2)', async () => {
    await actionsTransferPage.goTo();
    await actionsTransferPage.fillExternalTransfer({
      fromAccountId: testParams.ACC_IVANOV_CURRENT,
      recipient,
      amount: amountInput
    });
    await actionsTransferPage.clickBtnTransfer();
    await actionsBrowser.checkThatElementIsVisible(transferPage.alertOk);
  });

  await step('Списание 1,50 + комиссия 0,02 (п.1, п.2, п.5, п.7)', async () => {
    const state = await getStandState(page);
    const from = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_CURRENT);
    const savings = state.accounts.find((a) => a.id === testParams.ACC_IVANOV_SAVINGS);

    expect(from.balance).toBeCloseTo(balanceFromBefore - totalValue, 2);
    expect(savings.balance).toBe(balanceSavingsBefore);
    expect(from.balance).not.toBeCloseTo(balanceFromBefore - 150, 2);
  });
});
