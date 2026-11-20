import ActionsBrowser from '@page-objects/browser.actions';
import { Page } from '@playwright/test';
import { logInPage } from './locators';

export default class ActionsLogInPage {
  constructor(private page: Page) {
    this.actionsBrowser = new ActionsBrowser(page);
  }

  private actionsBrowser: ActionsBrowser;

  async goTo() {
    await this.page.goto('./login');
    await this.actionsBrowser.waitForVisibility(logInPage.btnLogIn);
  }

  async enterCredentials({ login, password }: { login: string; password: string }) {
    await this.actionsBrowser.enterText(logInPage.inpLogin, login);
    await this.actionsBrowser.enterText(logInPage.inpPassword, password);
  }

  async clickBtnLogIn() {
    await this.actionsBrowser.click(logInPage.btnLogIn);
  }

  async loginAs(login: string, password: string) {
    await this.goTo();
    await this.enterCredentials({ login, password });
    await this.clickBtnLogIn();
    await this.page.waitForURL(/\/(alfa-task\/?)?$/);
  }
}
