import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Retrieves login credentials from configuration
 * Uses machine-specific config if available or falls back to default
 */
export function getLoginCredentials(): { companyId: string; userId: string; password: string } {
  try {
    // Read login configuration from the file prepared by workflow
    const configPath = path.join(process.cwd(), 'config', 'login.json');
    console.log(`Reading login configuration from: ${configPath}`);
    
    if (fs.existsSync(configPath)) {
      const loginConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(`Using credentials for user: ${loginConfig.userId}`);
      return loginConfig;
    } else {
      throw new Error('Login configuration file not found');
    }
  } catch (error) {
    console.error('Error reading login configuration:', error);
    throw error;
  }
}

/**
 * Logs in to the application and navigates to the home page with proper synchronization
 * Uses machine-specific credentials from configuration file
 * @param page - Playwright page object
 * @returns Promise<void>
 */
export async function loginAndNavigateHome(page: Page): Promise<void> {
  // Get login credentials from configuration
  const loginData = getLoginCredentials();
  
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
  
  console.log(`Successfully logged in with user: ${loginData.userId}`);
}