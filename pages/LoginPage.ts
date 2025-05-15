/*import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://4423-tst3.btbanking.com/ui');
  }

  async login(companyId: string, userId: string, password: string) {
    await this.page.fill('#user-name', companyId);
    await this.page.fill('#password', userId);
    await this.page.fill('#password', password);
    await this.page.getByRole('button', { name: 'Sign In' });
  }*/

/*   async isLoginSuccessful() {
    await this.page.waitForLoadState('networkidle');
    return this.page.url().includes('/inventory.html');
  }

  async isLoginError() {
    const errorLocator = this.page.locator('[data-test="error"]');
    await errorLocator.waitFor({ state: 'visible', timeout: 5000 });
    return await errorLocator.isVisible();
  }

  async getLoginErrorMessage() {
    const errorLocator = this.page.locator('[data-test="error"]');
    await errorLocator.waitFor({ state: 'visible', timeout: 5000 });
    return await errorLocator.textContent(); // Return the error message text
  } */
// }



// pages/loginPage.ts
import { Page, Locator } from '@playwright/test';
const { expect } = require('@playwright/test');


export class LoginPage {
  readonly page: Page;
  readonly companyIdInput: Locator;
  readonly userIdInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.companyIdInput = page.getByRole('textbox', { name: 'Company ID' });
    this.userIdInput = page.getByRole('textbox', { name: 'User ID' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('https://4423-tst3.btbanking.com/ui', { timeout: 300000 }); // Set a timeout for navigation
  }

  async login(companyId: string, userId: string, password: string): Promise<void> {
    await expect(this.companyIdInput).toBeVisible({ timeout: 300000 });
    await this.companyIdInput.click();
    await this.companyIdInput.fill(companyId);
    await this.userIdInput.click();
    await this.userIdInput.fill(userId);
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async isLoginSuccessful() {
    await this.page.waitForLoadState('networkidle');
    const homeMenuItem = this.page.getByRole('menuitem', { name: 'Home' });
    await homeMenuItem.click();
    
    // Assert that clicking on the Home menu item navigates correctly,
    // e.g., by checking that the URL or a page element is as expected.
    // This assertion will vary depending on your application.
    await expect(homeMenuItem).toBeVisible();
  }

}