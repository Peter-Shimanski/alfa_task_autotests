import ActionsBrowser from '@page-objects/browser.actions';
import { Page } from '@playwright/test';
import { historyPage } from './locators';

export default class ActionsHistoryPage {
  constructor(private page: Page) {
    this.actionsBrowser = new ActionsBrowser(page);
  }

  private actionsBrowser: ActionsBrowser;

  async goTo() {
    await this.page.goto('./history');
    await this.actionsBrowser.waitForVisibility(historyPage.ddAccount);
  }

  async selectAccount(accountId: string) {
    await this.actionsBrowser.selectOption(historyPage.ddAccount, accountId);
  }

  async selectPeriod(period: 'all' | 'today') {
    await this.actionsBrowser.selectOption(historyPage.ddPeriod, period);
  }

  async selectSort(sort: 'date' | 'amount' | 'amount-desc') {
    await this.actionsBrowser.selectOption(historyPage.ddSort, sort);
  }

  async selectLimit(limit: '10' | '25' | '50') {
    await this.actionsBrowser.selectOption(historyPage.ddLimit, limit);
  }

  async search(query: string) {
    await this.actionsBrowser.enterText(historyPage.inpSearch, query);
    await this.actionsBrowser.click(historyPage.btnSearch);
  }

  async getSummaryText() {
    return this.actionsBrowser.getElementText(historyPage.txtSummary);
  }

  async getPageLabelText() {
    return this.actionsBrowser.getElementText(historyPage.txtPagination);
  }

  async clickBtnNext() {
    await this.actionsBrowser.click(historyPage.btnNext);
  }
}
