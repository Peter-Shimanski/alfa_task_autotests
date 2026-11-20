import ActionsBrowser from '@page-objects/browser.actions';
import { Page } from '@playwright/test';
import { transferPage } from './locators';

export default class ActionsTransferPage {
  constructor(private page: Page) {
    this.actionsBrowser = new ActionsBrowser(page);
  }

  private actionsBrowser: ActionsBrowser;

  async goTo() {
    await this.page.goto('./transfer');
    await this.actionsBrowser.waitForVisibility(transferPage.btnTransfer);
  }

  async tickRdoInternalMode() {
    await this.actionsBrowser.tickCheckBoxOrRadioButton(transferPage.rdoInternalMode);
  }

  async tickRdoExternalMode() {
    await this.actionsBrowser.tickCheckBoxOrRadioButton(transferPage.rdoExternalMode);
  }

  async fillExternalTransfer(params: { fromAccountId?: string; recipient: string; amount: string; comment?: string }) {
    await this.tickRdoExternalMode();
    if (params.fromAccountId) {
      await this.actionsBrowser.selectOption(transferPage.ddFromAccount, params.fromAccountId);
    }
    await this.actionsBrowser.enterText(transferPage.inpRecipient, params.recipient);
    await this.actionsBrowser.enterText(transferPage.inpAmount, params.amount);
    if (params.comment) {
      await this.actionsBrowser.enterText(transferPage.inpComment, params.comment);
    }
  }

  async fillInternalTransfer(params: {
    fromAccountId?: string;
    toAccountId?: string;
    amount: string;
    comment?: string;
  }) {
    await this.tickRdoInternalMode();
    if (params.fromAccountId) {
      await this.actionsBrowser.selectOption(transferPage.ddFromAccount, params.fromAccountId);
    }
    if (params.toAccountId) {
      await this.actionsBrowser.selectOption(transferPage.ddToAccount, params.toAccountId);
    }
    await this.actionsBrowser.enterText(transferPage.inpAmount, params.amount);
    if (params.comment) {
      await this.actionsBrowser.enterText(transferPage.inpComment, params.comment);
    }
  }

  async clickBtnTransfer() {
    await this.actionsBrowser.click(transferPage.btnTransfer);
  }
}
