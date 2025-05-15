// pages/DomesticWirePage.ts
import { Page } from '@playwright/test';

export interface InternationalWirePaymentCSVData {
        TestCase: string;
        PaymentType: string;
        Req_FromAccountNumber: string;
        Opt_CustomerReference: string;
        Opt_InternalComments: string;
        Req_ToName: string;
        Opt_AddressLine1: string;
        Opt_AddressLine2: string;
        Req_Country: string;
        Req_city: string;
        Opt_State: string;
        Opt_PostalCode: string;
        Opt_Email: string;
        Req_accountType: string;
        Req_ToAccountNumber: string;
        Req_BankCodeType: string;
        Req_BankCode: string;
        Req_ValueDate: string;
        Opt_charges: string;
        Req_CreditAmount: string;
        Opt_PurposeOfPayment: string;
    }

export class InternationalWirePaymentPage {
  constructor(private page: Page) {}

// ---- CREATE PAYMENT ------------------------------------------------------------------------------------------------------
  public async createPayment(data: InternationalWirePaymentCSVData): Promise<void> {
    // Select "From Account"
    await this.page.getByRole('button', { name: '* Account Number  ??dropdown' }).click();
    await this.page.getByRole('option', { name: data.Req_FromAccountNumber, exact: true }).click();

    // Customer Reference
    await this.page.getByRole('textbox', { name: 'Customer Reference' }).fill(data.Opt_CustomerReference || '');

    // Internal Comments
    await this.page.getByRole('textbox', { name: 'Internal Comment' }).fill(data.Opt_InternalComments || '');

    // Beneficiary Name
    await this.page.getByRole('textbox', { name: '* " / "Name' }).fill(data.Req_ToName);

    // Address Line 1
    await this.page.getByRole('textbox', { name: 'Address Line 1' }).fill(data.Opt_AddressLine1 || '');

    // Address Line 2
    await this.page.getByRole('textbox', { name: 'Address Line 2' }).fill(data.Opt_AddressLine2 || '');

    // Country
    await this.page.getByRole('button', { name: '* " / " Country ??dropdown??' }).click();    
    await this.page.locator('div').filter({ hasText: new RegExp(`^${data.Req_Country}$`) }).click();

    // City
    //await this.page.getByRole('textbox', { name: '* " / "City' }).fill(data.Opt_City || ' ');
    await this.page.getByRole('textbox', { name: 'City' }).fill(data.Req_city || '');

    // State
    await this.page.getByRole('textbox', { name: 'State/Province' }).fill(data.Opt_State || '');

    // Postal Code
    await this.page.getByRole('textbox', { name: 'Postal Code' }).fill(data.Opt_PostalCode || ' ');

    // Email
    await this.page.getByRole('textbox', { name: 'Email' }).fill(data.Opt_Email || '');

    // Account Type
    await this.page.getByRole('link', { name: 'Other clear' }).click();
    await this.page.getByRole('option', { name: data.Req_accountType }).click();

    // Account Number
    await this.page.getByRole('textbox', { name: 'Account Number' }).fill('123456');

    // Bank Code Type
    //await this.page.getByRole('link', { name: 'SWIFT' }).click();
    //await this.page.getByRole('option', { name: data.Req_BankCodeType, exact: true }).click();

    // Bank Code
    await this.page.locator('#s2id_BENE_BANK_ID').getByRole('link').click();
    await this.page.getByRole('option', { name: data.Req_BankCode, exact: true }).click();

    // Value Date
    await this.page.getByRole('textbox', { name: '* " / "Value Date' }).click();
    await this.page.getByRole('textbox', { name: '* " / "Value Date' }).fill(data.Req_ValueDate);

    // Charges
    await this.page.getByRole('button', { name: 'Charges ??dropdown??' }).click();
    await this.page.getByRole('option', { name: data.Opt_charges, exact: true }).click();

    // Credit Amount
    await this.page.getByRole('textbox', { name: 'Credit Amount' }).fill(data.Req_CreditAmount);

    // Purpose of Payment
    await this.page.getByRole('textbox', { name: 'Purpose of Payment' }).fill(data.Opt_PurposeOfPayment || '');

    // Submit Payment
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


