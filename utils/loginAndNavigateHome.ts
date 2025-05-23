import { Page, expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as fs from 'fs';
import * as path from 'path';

// Define UserSessionManager class
class UserSessionManager {
  private sessions: Map<string, string> = new Map();
  private useAdminMode: boolean = false;
  
  constructor() {
    this.initializeSessions();
  }

  private initializeSessions() {
    try {
      const configDir = path.join(process.cwd(), 'config');
      
      // Load user credentials
      for (let i = 1; i <= 3; i++) {
        const filePath = path.join(configDir, `login-user${i}.json`);
        if (fs.existsSync(filePath)) {
          console.log(`Found user${i} configuration file`);
        }
      }
      
      // Load admin credentials
      const adminPath = path.join(configDir, 'login-admin.json');
      if (fs.existsSync(adminPath)) {
        console.log('Found admin configuration file');
      }
    } catch (error) {
      console.error('Error initializing sessions:', error);
    }
  }

  setAdminMode(enabled: boolean): void {
    this.useAdminMode = enabled;
    console.log(`Admin mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  async acquireUser(workerId: string): Promise<{ companyId: string; userId: string; password: string }> {
    try {
      // Choose user based on worker ID
      const userNumber = (parseInt(workerId) % a3) + 1;
      const configPath = path.join(
        process.cwd(), 
        'config', 
        this.useAdminMode ? 'login-admin.json' : `login-user${userNumber}.json`
      );
      
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }
      
      const content = fs.readFileSync(configPath, 'utf8');
      // Remove BOM if present
      const cleanContent = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
      const loginData = JSON.parse(cleanContent);
      
      // Store the user assignment
      this.sessions.set(workerId, loginData.userId);
      
      return loginData;
    } catch (error) {
      console.error(`Failed to acquire user for worker ${workerId}:`, error);
      throw error;
    }
  }

  releaseUser(workerId: string): void {
    if (this.sessions.has(workerId)) {
      const userId = this.sessions.get(workerId);
      console.log(`Releasing user ${userId} from worker ${workerId}`);
      this.sessions.delete(workerId);
    }
  }
}

// Create a singleton instance
const sessionManager = new UserSessionManager();

/**
 * Logs in to the application and navigates to the home page
 * @param page - Playwright page object
 */
export async function loginAndNavigateHome(page: Page): Promise<void> {
  try {
    // Get worker ID from test info
    const workerId = test.info().workerIndex.toString();
    console.log(`Worker ${workerId} attempting to acquire user`);
    
    // Get credentials using workerId
    const loginData = await sessionManager.acquireUser(workerId);
    console.log(`Worker ${workerId} using credentials for ${loginData.userId}`);
    
    // Initialize login page
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // Perform login
    await loginPage.login(loginData.companyId, loginData.userId, loginData.password);
    
    // Wait for successful login
    const homeMenuItem = page.getByRole('menuitem', { name: 'Home' });
    await expect(homeMenuItem).toBeVisible({ timeout: 30000 });
    
    // Navigate to home
    await Promise.all([
      page.waitForLoadState('networkidle'),
      homeMenuItem.click()
    ]);
    
    console.log(`Worker ${workerId} successfully logged in with user: ${loginData.userId}`);
  } catch (error) {
    console.error('Login failed:', error);
    // Log more details for debugging
    await page.screenshot({ path: `login-failure-${test.info().workerIndex}-${Date.now()}.png` });
    throw error;
  }
}

/**
 * Releases the user session when test is complete
 */
export async function releaseUserSession(): Promise<void> {
  const workerId = test.info().workerIndex.toString();
  sessionManager.releaseUser(workerId);
  console.log(`Worker ${workerId} released user session`);
}
