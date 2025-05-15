import { Page } from '@playwright/test';

// Interface to represent data from DrawdownWireData.csv
export interface DrawdownWirePaymentCSVData {
  TestCase: string;
  PaymentType: string;
  Req_Account: string;
  Opt_CustomerReference?: string;
  Opt_InternalComment?: string;
  Req_name: string;
  Opt_AddressLine_1?: string;
  Opt_Address_line_2?: string;
  Opt_Country?: string;
  Opt_City: string;
  Opt_State?: string;
  Opt_PostalCode?: string;
  Req_AccountType: string;
  Req_AccountNumber: string;
  Req_BankCode: string;
  Req_ValueDate: string;
  Opt_Charges?: string;
  Req_Amount: string;
}

export class DrawdownWirePaymentPage {
  constructor(private page: Page) {}

  /**
   * Creates a drawdown wire payment using the provided payment data
   * @param paymentData Data from the DrawdownWireData.csv file
   */
  async createPayment(paymentData: DrawdownWirePaymentCSVData): Promise<void> {
    // Select Account
    await this.page.getByRole('button', { name: '* Account  ??dropdown??' }).click();
    await this.page.getByRole('option', { name: paymentData.Req_Account.split(' - ')[0] }).click();

    // Fill optional customer reference
    if (paymentData.Opt_CustomerReference) {
      await this.page.getByRole('textbox', { name: 'Customer Reference' }).click();
      await this.page.getByRole('textbox', { name: 'Customer Reference' }).fill(paymentData.Opt_CustomerReference);
    }

    // Fill optional internal comment
    if (paymentData.Opt_InternalComment) {
      await this.page.getByRole('textbox', { name: 'Internal Comment' }).click();
      await this.page.getByRole('textbox', { name: 'Internal Comment' }).fill(paymentData.Opt_InternalComment);
    }

    // Fill required name
    await this.page.getByRole('textbox', { name: '* " / "Name' }).click();
    await this.page.getByRole('textbox', { name: '* " / "Name' }).fill(paymentData.Req_name);

    // Fill optional address line 1
    if (paymentData.Opt_AddressLine_1) {
      await this.page.getByRole('textbox', { name: 'Address Line 1' }).click();
      await this.page.getByRole('textbox', { name: 'Address Line 1' }).fill(paymentData.Opt_AddressLine_1);
    }

    // Fill optional address line 2
    if (paymentData.Opt_Address_line_2) {
      await this.page.getByRole('textbox', { name: 'Address Line 2' }).click();
      await this.page.getByRole('textbox', { name: 'Address Line 2' }).fill(paymentData.Opt_Address_line_2);
    }

    // Fill required city
    await this.page.getByRole('textbox', { name: '* " / "City' }).click();
    await this.page.getByRole('textbox', { name: '* " / "City' }).fill(paymentData.Opt_City);

    // Select state if provided
    if (paymentData.Opt_State) {
      await this.page.getByRole('button', { name: 'State ??dropdown??' }).click();
      await this.page.getByRole('searchbox', { name: 'Filter' }).click();
      await this.page.getByRole('searchbox', { name: 'Filter' }).fill(paymentData.Opt_State);
      await this.page.getByRole('option', { name: paymentData.Opt_State }).click();
    }

    // Fill optional postal code
    if (paymentData.Opt_PostalCode) {
      await this.page.getByRole('textbox', { name: 'Postal Code' }).click();
      await this.page.getByRole('textbox', { name: 'Postal Code' }).fill(paymentData.Opt_PostalCode);
    }

    // Select account type
    await this.page.getByRole('link', { name: '--Select--' }).click();
    await this.page.getByRole('option', { name: paymentData.Req_AccountType }).click();

    // Fill account number
    await this.page.getByRole('textbox', { name: 'Account Number' }).click();
    await this.page.getByRole('textbox', { name: 'Account Number' }).fill(paymentData.Req_AccountNumber);

    // Select bank code
    await this.page.locator('#s2id_BENE_BANK_ID').getByRole('link').click();
    await this.page.getByRole('option', { name: paymentData.Req_BankCode, exact: true }).click();

    // Value Date
    await this.page.getByRole('textbox', { name: '* " / "Value Date' }).click();
    await this.page.getByRole('textbox', { name: '* " / "Value Date' }).fill(paymentData.Req_ValueDate);

    // Select charges if provided
    if (paymentData.Opt_Charges) {
      await this.page.getByRole('button', { name: 'Charges ??dropdown??' }).click();
      await this.page.getByRole('option', { name: paymentData.Opt_Charges }).click();
    }

    // Fill amount
    await this.page.getByRole('textbox', { name: 'Amount' }).click();
    await this.page.getByRole('textbox', { name: 'Amount' }).fill(paymentData.Req_Amount);

    // Submit the payment
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

// ---- APPROVE PAYMENT ---------------------------------------------------------------------------------------------------
    /**
     * Approves the payment by performing search, selecting the account checkbox, and clicking Approve.
     * @param searchValue - The value to search in the 'Search value' field.
     * @param checkboxName - The partial name value for the checkbox (using contains match).
     */
    async approvePayment(searchValue: string, checkboxName: string): Promise<void> {
        // Click to expand the search filter options.
        await this.page.locator('#dashboard-region-10').getByText('Select fields 0 Selected caret-down').click();
        
        // Select search field (ID).
        await this.page.getByRole('link', { name: 'ID', exact: true }).click();
        
        // Fill in the search value.
        await this.page.getByRole('textbox', { name: 'Search value' }).click();
        await this.page.getByRole('textbox', { name: 'Search value' }).fill(searchValue);
        await this.page.getByRole('textbox', { name: 'Search value' }).press('Enter');
        
        // Apply search filter.
        //await this.page.getByRole('button', { name: 'Apply' }).click();
        
        // Locate and check the account checkbox using a contains match on its aria-label.
        await this.page.locator('#dashboard-region-10').getByText('View').first().click();
        
        // Click the Approve button and then confirm with Yes.
        await this.page.getByRole('button', { name: 'Approve', exact: true }).click();
        //await this.page.getByRole('button', { name: 'Yes' }).click();
    }
}
