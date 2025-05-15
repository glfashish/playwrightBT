// ===================================================================================
// IMPORT MODULES
// ===================================================================================
import { test, expect } from '@playwright/test';

// Page objects
import { LoginPage } from '../pages/LoginPage';
import { PaymentPage } from '../pages/PaymentPage';
import { DomesticWirePage, PaymentData } from '../pages/DomesticWirePage';
import { DomesticWireTemplatePayment, DomesticWireTemplatePaymenttData } from '../pages/DomesticWireTemplatePayment';
import { POManager } from  '../pages/POManager';

// JSON data
import loginData from '../test-data/login.json';
import paymentdata from '../test-data/domestic_wire_payment_data.json';

// Import Utilities
import { csvToJson } from '../utils/csvtojson';
import { loginAndNavigateHome } from '../utils/loginAndNavigateHome';

// —— load & type the CSV rows as PaymentData[]
const domesticWireData = csvToJson<PaymentData>('test-data/domesticWireData.csv');
const domesticWireTemplateData = csvToJson<DomesticWireTemplatePaymenttData>('test-data/DomesticWireTemplatePaymentData.csv');

// ===================================================================================
// WIRE DOMESTIC PAYMENT TEST
// 1. Create Domestic wire payment with all fields
// 2. Create Domestic wire payment with only required fields
// 3. Create Domestic wire payment with all required fields and invalid data (Negative test case)
// ===================================================================================

test.describe('Domestic Wire Payment Creation Test', () => {
  domesticWireData.forEach((paymentTestData, index) => {
    test(`Test ${index + 1}: ${paymentTestData.TestCase}`, async ({ page }) => {
      // Start POManager
      const pom = new POManager(page);
      //await page.pause(); // Pause for debugging
      
      // —— LOGIN ————————————————————————————————————————————————————————————————————————————————————————————
      await loginAndNavigateHome(page, loginData);
        // Wait for Login Menu to be visible
        await expect(page.getByRole('menuitem', { name: 'Home' })).toBeVisible();

      // —— PAYMENT PAGE ——
      const paymentPage = pom.getPaymentPage();
      await paymentPage.payment_management_navigate();
        // Wait for Payment Management Menu to be visible
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('button', { name: ' Add a New Payment' })).toBeEnabled();
      await paymentPage.initiateNewPayment();
      await paymentPage.selectPaymentType(paymentdata.paymentType);
        // Verify if payment template is selected
        await expect(page).toHaveURL(/.*\/PAY_LIST_VIEW/);

      // —— DOMESTIC WIRE ——
      const domesticWirePage = pom.getdomesticWirePage();
      await domesticWirePage.createPayment(paymentTestData);

      // —— VALIDATION ——
      const errors = page.locator('.has-error, [aria-invalid="true"]');
      if (await errors.count() > 0) {
        const msgs = await page.locator('.help-block').allTextContents();
        console.log(`Errors on row ${index + 1}:`, msgs);
      }
    });
  });
});


// ===================================================================================
// WIRE DOMESTIC PAYMENT TEST USING TEMPLATES
// 1. Create Domestic wire payment with existing templates and required fields
// ===================================================================================

test.describe('Domestic Wire Template Payments', () => {
  domesticWireTemplateData.forEach((templateData, index) => {
    test(`Test ${index + 1}: ${templateData.TestCase}`, async ({ page }) => {
      
      await page.pause(); 
      // Start POManager
      const pom = new POManager(page);
      console.log(page);

    
      //await page.pause(); // Pause for debugging if needed

      // —— LOGIN ————————————————————————————————————————————————————————————————————————————————————————————
      await loginAndNavigateHome(page, loginData);
      await expect(page.getByRole('menuitem', { name: 'Home' })).toBeVisible();

      // —— PAYMENT PAGE ——————————————————————————————————————————————————————————————————————————————————————
      const paymentPage = pom.getPaymentPage();
      await paymentPage.payment_management_navigate();
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('button', { name: ' Add a New Payment' })).toBeEnabled();
      await paymentPage.initiateNewPayment();
      await paymentPage.selectPaymentTemplate(templateData.templateName);
        // Verify if payment template is selected
        await expect(page).toHaveURL(/.*\/addPaymentFromTemplate/);

      // —— DOMESTIC WIRE TEMPLATE PAYMENT ————————————————————————————————————————————————————————————————————
      const domesticWireTemplatePage = pom.getDomesticWireTemplatePayment();
      await domesticWireTemplatePage.processTemplatePayment(templateData);
      await page.waitForLoadState('networkidle');
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('menuitem', { name: 'Home' })).toBeVisible();
      await expect(page.getByText('Payment Submitted')).toBeVisible({ timeout: 10000 });


      // —— VALIDATE PAYMENT SUCCESS ———————————————————————————————————————————————————————————————————————————
      // Validate that a success element (e.g., a message "Payment Approved") appears on the page.
      const successMessage = page.getByText('Payment Submitted');
      if (await successMessage.isVisible({ timeout: 30000 })) {
              console.log('Domestic Wire Template Payment validated successfully.');
            } else {
              console.error('Error: Payment was not Submitted. "Payment Submitted" message not found.');
              throw new Error('Payment validation failed.');
         }

      // —— APPROVE PAYMENT —————————————————————————————————————————————————————————————————————————————————————
      // PICKUP ID FROM PAGE & PASS IT TO APPROVE PAYMENT
      const id = (await page.getByText('ID').locator('xpath=following-sibling::span').textContent())!.trim();
      await domesticWireTemplatePage.approvePayment(id, 'Account');
      console.log(`Payment with ID ${id} approved successfully.`);
      
    });
  });
});
