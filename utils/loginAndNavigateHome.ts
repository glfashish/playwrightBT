import { Page, expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as fs from 'fs';
import * as path from 'path';
import { userSessionManager } from '../utils/userSessionManager';

/**
 * Set the execution mode to use admin user
 * @param useAdmin - Whether to use admin user for tests
 */
export function setAdminMode(useAdmin: boolean): void {
  userSessionManager.setAdminMode(useAdmin);
}

/**
 * Logs in to the application and navigates to the home page
 * Uses admin or general user based on configured mode
 * @param page - Playwright page object
 */
export async function loginAndNavigateHome(page: Page): Promise<void> {
  // Get worker ID from test info or generate a unique one
  const workerId = test.info().workerIndex.toString();
  
  try {
    // Acquire a user credential from the pool based on mode
    const credentials = await userSessionManager.acquireUser(workerId);
    console.log(`Worker ${workerId} using user: ${credentials.userId}`);
    
    // Initialize login page and wait for load
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    // Perform login with acquired credentials
    await loginPage.login(credentials.companyId, credentials.userId, credentials.password);

    // Wait for successful login
    const homeMenuItem = page.getByRole('menuitem', { name: 'Home' });
    await expect(homeMenuItem).toBeVisible({ timeout: 300000 });

    // Click home menu and wait for navigation
    await Promise.all([
      page.waitForLoadState('networkidle'),
      homeMenuItem.click()
    ]);
    
    console.log(`Worker ${workerId} successfully logged in with user: ${credentials.userId}`);
  } catch (error) {
    console.error(`Worker ${workerId} login failed:`, error);
    throw error;
  }
}

/**
 * Releases a user session at the end of the test
 * No-op if in admin mode
 */
export async function releaseUserSession(): Promise<void> {
  const workerId = test.info().workerIndex.toString();
  userSessionManager.releaseUser(workerId);
}
