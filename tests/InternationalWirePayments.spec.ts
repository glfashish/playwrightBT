// ===================================================================================
// IMPORT MODULES
// ===================================================================================
import { test, expect } from '@playwright/test';

// Page objects
import { LoginPage } from '../pages/LoginPage';
import { PaymentPage } from '../pages/PaymentPage';
import { InternationalWirePaymentPage, InternationalWirePaymentCSVData } from '../pages/InternationalWirePaymentPage';
import { POManager } from  '../pages/POManager';

// JSON data
import loginData from '../test-data/login.json';

// Import Utilities
import { csvToJson } from '../utils/csvtojson';
import { loginAndNavigateHome } from '../utils/loginAndNavigateHome';

// —— load & type the CSV rows as PaymentData[]
const InternationalWireData = csvToJson<InternationalWirePaymentCSVData>('test-data/InternationalWirePaymentData.csv');
const DrawdownWireData = csvToJson<InternationalWirePaymentCSVData>('test-data/DrawdownWireData.csv');

// =========================================================================================================
// WIRE DOMESTIC PAYMENT TEST
// 1. Create Domestic wire payment with all fields
// 2. Create Domestic wire payment with only required fields
// 3. Create Domestic wire payment with all required fields and invalid data (Negative test case)
// ==========================================================================================================

test.describe('International Wire Payment Creation Test', () => {
    InternationalWireData.forEach((paymentTestData, index) => {
    test(`Test ${index + 1}: ${paymentTestData.TestCase}`, async ({ page }) => {
    // Start POManager
      const pom = new POManager(page);
      await page.pause(); // Pause for debugging
      
    // —— LOGIN ————————————————————————————————————————————————————————————————————————————————————————————
      await loginAndNavigateHome(page, loginData);
        // Wait for Login Menu to be visible
        await expect(page.getByRole('menuitem', { name: 'Home' })).toBeVisible();

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

    // —— INTERNATION WIRE  ——————————————————————————————————————————————————————————————————————————————————
      const internationalwirepage = new InternationalWirePaymentPage(page);
      await internationalwirepage.createPayment(paymentTestData);

    // —— VALIDATION FOR PAYMENT SUCCESS  —————————————————————————————————————————————————————————————————————
      const errors = page.locator('.has-error, [aria-invalid="true"]');
      if (await errors.count() > 0) {
        const msgs = await page.locator('.help-block').allTextContents();
        console.log(`Errors on row ${index + 1}:`, msgs);
      }
    
    // —— APPROVE PAYMENT —————————————————————————————————————————————————————————————————————————————————————
      // PICKUP ID FROM PAGE & PASS IT TO APPROVE PAYMENT
      const id = (await page.getByText('ID').locator('xpath=following-sibling::span').textContent())!.trim();
      await internationalwirepage.approvePayment(id, 'Account');
      console.log(`Payment with ID ${id} approved successfully.`);
    });
  });
});
