export const transferPage = {
  rdoExternalMode: '//label[text()="По реквизитам получателя"]//input[@name="mode"]',
  rdoInternalMode: '//label[text()="Между своими счетами"]//input[@name="mode"]',
  ddFromAccount: '//select[@name="fromAccountId"]',
  ddToAccount: '//select[@name="toAccountId"]',
  inpRecipient: '//input[@name="recipient"]',
  inpAmount: '//input[@name="amount"]',
  inpComment: '//input[@name="comment"]',
  btnTransfer: '//button[@name="submit-transfer"]',
  alertError: '//div[@class="alert alert--error"]',
  alertErrorNotEnoughFunds: '//div[@class="alert alert--error"][text()="Недостаточно средств на счёте"]',
  alertOk: '//div[@class="alert alert--ok"]',
  availableBalance: '//div[contains(@class,"small") and contains(.,"Доступно на счёте")]'
};
