import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * Logs in to the application and navigates to the home page with proper synchronization
 * @param page - Playwright page object
 * @param loginData - Login credentials
 * @returns Promise<void>
 */
export async function loginAndNavigateHome(
  page: Page, 
  loginData: { companyId: string; userId: string; password: string }
): Promise<void> {
  // Initialize login page and wait for load
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  
  // Wait for page to be ready
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Perform login with credentials
  await loginPage.login(loginData.companyId, loginData.userId, loginData.password);

  // Wait for successful login
  const homeMenuItem = page.getByRole('menuitem', { name: 'Home' });
  await expect(homeMenuItem).toBeVisible({ timeout: 30000 });

  // Click home menu and wait for navigation
  await Promise.all([
    page.waitForLoadState('networkidle'),
    homeMenuItem.click()
  ]);
}