import ActionsBrowser from '@page-objects/browser.actions';
import { Page } from '@playwright/test';
import { dashboardPage } from './locators';

export default class ActionsDashboardPage {
  constructor(private page: Page) {
    this.actionsBrowser = new ActionsBrowser(page);
  }

  private actionsBrowser: ActionsBrowser;

  async goTo() {
    await this.page.goto('./');
    await this.actionsBrowser.waitForVisibility(dashboardPage.txtTotalAmount);
  }

  async getTotalAmountText() {
    return this.actionsBrowser.getElementText(dashboardPage.txtTotalAmount);
  }
}
