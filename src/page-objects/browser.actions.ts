import { WAITING_TIME } from '@constants';
import { Locator, Page, expect } from '@playwright/test';

const defaultTimeout = WAITING_TIME.XXL;

export default class ActionsBrowser {
  constructor(page: Page) {
    this.page = page;
  }

  page: Page;

  getElement(locator: string | Locator): Locator {
    return typeof locator === 'string' ? this.page.locator(locator) : locator;
  }

  waitForElement(
    locator: string | Locator,
    state: 'attached' | 'detached' | 'visible' | 'hidden',
    options?: { timeout?: number }
  ) {
    return this.getElement(locator)
      .first()
      .waitFor({ state, timeout: options?.timeout || defaultTimeout });
  }

  async waitForVisibility(locator: string | Locator, options?: { timeout?: number }) {
    await this.waitForElement(locator, 'visible', { timeout: options?.timeout });
  }

  async waitForNotVisibility(locator: string | Locator, options?: { timeout?: number }) {
    await this.waitForElement(locator, 'hidden', { timeout: options?.timeout });
  }

  async waitForPresence(locator: string | Locator, options?: { timeout?: number }) {
    await this.waitForElement(locator, 'attached', { timeout: options?.timeout });
  }

  async enterText(locator: string | Locator, textToEnter: string) {
    await this.getElement(locator).fill(textToEnter, { timeout: defaultTimeout });
  }

  async selectOption(locator: string | Locator, value: string | string[], options?: { timeout?: number }) {
    await this.getElement(locator).selectOption(value, {
      timeout: options?.timeout || defaultTimeout
    });
  }

  async click(locator: string | Locator, options?: { timeout?: number }) {
    await this.getElement(locator).click({
      timeout: options?.timeout || defaultTimeout
    });
  }

  async tickCheckBoxOrRadioButton(locator: string | Locator) {
    await this.getElement(locator).check({ timeout: defaultTimeout });
  }

  async getElementText(locator: string | Locator) {
    await this.waitForPresence(locator);
    return this.getElement(locator).innerText({ timeout: defaultTimeout });
  }

  async isElementVisible(locator: string | Locator) {
    return this.getElement(locator).isVisible();
  }

  async checkThatElementIsVisible(locator: string | Locator, options?: { timeout?: number }) {
    await expect(
      this.getElement(locator),
      `Элемент с локатором: "${locator}" не стал видимым за отведённое время`
    ).toBeVisible({ timeout: options?.timeout });
  }

  async checkThatElementIsNotVisible(locator: string | Locator, timeout?: number) {
    await expect(
      this.getElement(locator),
      `Элемент с локатором: "${locator}" всё ещё видим по истечении времени`
    ).not.toBeVisible({ timeout });
  }

  async checkThatElementContainText(locator: string | Locator, textToCheck: string, options?: { timeout?: number }) {
    await expect
      .poll(async () => this.getElementText(locator), {
        timeout: options?.timeout,
        message: `Текст в элементе ${locator} не содержит "${textToCheck}"`
      })
      .toContain(textToCheck);
  }
}
