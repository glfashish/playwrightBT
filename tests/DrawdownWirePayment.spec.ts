// ===================================================================================
// IMPORT MODULES
// ===================================================================================
import { test, expect } from '@playwright/test';

// Page objects
import { LoginPage } from '../pages/LoginPage';
import { PaymentPage } from '../pages/PaymentPage';
import { DrawdownWirePaymentPage, DrawdownWirePaymentCSVData } from '../pages/DrawdownWirePage';
import { POManager } from  '../pages/POManager';

// Import Utilities
import { csvToJson } from '../utils/csvtojson';
import { loginAndNavigateHome, releaseUserSession } from '../utils/loginAndNavigateHome';

// —— load & type the CSV rows as PaymentData[]
const DrawdownWireData = csvToJson<DrawdownWirePaymentCSVData>('test-data/DrawdownWireData.csv');

// =========================================================================================================
// DRAWDOWN WIRE PAYMENT TEST
// 1. Create Drawdown wire payment with all fields
// 2. Create Drawdown wire payment with only required fields
// 3. Create Drawdown wire payment with all required fields and invalid data (Negative test case)
// ==========================================================================================================

test.describe('Drawdown Wire Payment Creation Test', () => {
    // Add afterEach hook to release user session
    test.beforeEach(async ({ page }, testInfo) => {
      console.log(`Test ${testInfo.title} running on worker: ${testInfo.workerIndex}`);
    });
    
    test.afterEach(async () => {
    await releaseUserSession();
  });

    DrawdownWireData.forEach((paymentTestData, index) => {
    test(`Test ${index + 1}: ${paymentTestData.TestCase}`, async ({ page }) => {
    // Start POManager
      const pom = new POManager(page);
      //wait page.pause(); // Pause for debugging
      
    // —— LOGIN ————————————————————————————————————————————————————————————————————————————————————————————
      // Updated login call without loginData parameter
      await loginAndNavigateHome(page);
      await expect(page.getByRole('menuitem', { name: 'Home' })).toBeVisible()

    // —— PAYMENT PAGE —————————————————————————————————————————————————————————————————————————————————————
      const paymentPage = pom.getPaymentPage();
      await paymentPage.payment_management_navigate();
            // Wait for Payment Management Menu to be visible
            await page.waitForLoadState('networkidle');
            await expect(page.getByRole('button', { name: ' Add a New Payment' })).toBeEnabled();
      await paymentPage.initiateNewPayment();
      await paymentPage.selectPaymentType(paymentTestData.PaymentType);
            // Verify if payment template is selected
            await expect(page).toHaveURL(/.*\/PAY_LIST_VIEW/);

    // —— DRAWDOWN WIRE  ——————————————————————————————————————————————————————————————————————————————————
      const drawdownWirePage = new DrawdownWirePaymentPage(page);
      await drawdownWirePage.createPayment(paymentTestData);

    // —— VALIDATION FOR PAYMENT SUCCESS  —————————————————————————————————————————————————————————————————————
      const errors = page.locator('.has-error, [aria-invalid="true"]');
      if (await errors.count() > 0) {
        const msgs = await page.locator('.help-block').allTextContents();
        console.log(`Errors on row ${index + 1}:`, msgs);
      }
    
    // —— APPROVE PAYMENT —————————————————————————————————————————————————————————————————————————————————————
      // PICKUP ID FROM PAGE & PASS IT TO APPROVE PAYMENT
      const id = (await page.getByText('ID').locator('xpath=following-sibling::span').textContent())!.trim();
      await drawdownWirePage.approvePayment(id, 'Account');
      console.log(`Payment with ID ${id} approved successfully.`);
    });
  });
});
