import ActionsBrowser from '@page-objects/browser.actions';
import { dashboardPage } from '@page-objects/dashboard-page/locators';
import { headerMenu } from '@page-objects/header-menu/locators';
import { Page } from '@playwright/test';
import { adminPage } from './locators';

export default class ActionsAdminPage {
  constructor(private page: Page) {
    this.actionsBrowser = new ActionsBrowser(page);
  }

  private actionsBrowser: ActionsBrowser;

  async goTo(isPageAvailable: boolean) {
    await this.page.goto('./admin');
    if (isPageAvailable) {
      await this.actionsBrowser.waitForVisibility(adminPage.title);
      await this.actionsBrowser.waitForVisibility(headerMenu.btnLogout);
    } else {
      await this.actionsBrowser.waitForNotVisibility(adminPage.title);
      await this.actionsBrowser.waitForVisibility(dashboardPage.title);
    }
  }

  async waitForOpened() {
    await this.actionsBrowser.waitForVisibility(adminPage.title);
  }
}
