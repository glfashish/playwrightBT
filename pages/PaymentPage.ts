import { Page, Locator, expect } from '@playwright/test';

export class PaymentPage {
  readonly page: Page;
  readonly paymentManagementMenu: Locator;
  readonly addNewPaymentButton: Locator;
  readonly selectPaymentTypeLink: Locator;
  readonly continueButton: Locator;
  readonly payment_and_transfers: Locator;
  // New locators for payment template selection
  readonly paymentTemplateRadio: Locator;
  readonly selectTemplateLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Existing locators for payments and transfers
    this.payment_and_transfers = page.getByRole('menuitem', { name: 'Payments & Transfers' });
    this.paymentManagementMenu = page.getByRole('menuitem', { name: 'Payment Management' });
    this.addNewPaymentButton = page.getByRole('button', { name: ' Add a New Payment' });
    this.selectPaymentTypeLink = page.getByRole('link', { name: 'Select a Payment Type' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.paymentTemplateRadio = page.getByRole('radio', { name: 'Select a Payment Template' });
    this.selectTemplateLink = page.getByRole('link', { name: 'Select a Template' });
  }

  // Navigates to the Payment Management section
  async payment_management_navigate(): Promise<void> {
    await this.page.goto('https://4423-tst3.btbanking.com/ui/PAYMENTS/managePayments');
    this.page.waitForLoadState('domcontentloaded')
    //this.page.waitForLoadState('networkidle')
    await expect(this.page).toHaveURL(/.*\/managePayments/);
  }
  
  // Initiates the creation of a new payment by clicking the add button.
  async initiateNewPayment(): Promise<void> {
    await expect(this.addNewPaymentButton).toBeEnabled();
    await this.addNewPaymentButton.click();
    await expect(this.paymentTemplateRadio).toBeVisible({ timeout: 10000 });
  }

  /**
   * Selects a payment type from the dropdown.
   * @param paymentType - The payment type to select (e.g., 'Wire - Domestic').
   */
  async selectPaymentType(paymentType: string): Promise<void> {
    await expect(this.selectPaymentTypeLink).toBeEnabled();
    await this.selectPaymentTypeLink.click();
    await this.page.getByRole('option', { name: paymentType, exact: true }).click();
    await this.continueButton.click();
  }

  /**
   * Selects a payment template from the available options.
   * The template name (e.g., "007WireDom - 007wireT - Wire") is passed from the CSV.
   * @param templateName - The payment template to select.
   */
  async selectPaymentTemplate(templateName: string): Promise<void> {
    // Check the radio button to select a payment template.
    await this.paymentTemplateRadio.check();
    // Click the select template link.
    await this.selectTemplateLink.click();
    // Choose the specific option based on the template name.
    await this.page.getByRole('option', { name: templateName, exact: true }).click();
    await this.continueButton.click();
  }
}