// pages/DomesticWirePage.ts
import { Page } from '@playwright/test';

export interface PaymentData {
  TestCase: string;
  paymentType: string;
  Req_FromAccountNumber: string;
  Opt_CustomerReference?: string;
  Opt_InternalComments?: string;
  Req_Name: string;
  Opt_AddressLine1?: string;
  Opt_AddressLine2?: string;
  Opt_City?: string;
  Opt_State?: string;
  Opt_PostalCode?: string;
  Opt_Email?: string;
  Req_ToAccountNumber: string;
  Req_BankCodeType: string;
  Req_BankCode: string;
  Req_ValueDate?: string;
  Req_Charges: string;
  Req_CreditAmount: string;
  Opt_PurposeOfPayment?: string;
}

export class DomesticWirePage {
  constructor(private page: Page) {}

  public async createPayment(data: PaymentData): Promise<void> {
    // Select "From Account"
    await this.page.getByRole('button', { name: '* Account Number  ??dropdown' }).click();
    await this.page.getByRole('option', { name: data.Req_FromAccountNumber, exact: true }).click();

    // Customer Reference
    await this.page.getByRole('textbox', { name: 'Customer Reference' }).fill(data.Opt_CustomerReference || ' ');

    // Internal Comments
    await this.page.getByRole('textbox', { name: 'Internal Comment' }).fill(data.Opt_InternalComments || ' ');

    // Beneficiary Name
    await this.page.getByRole('textbox', { name: '* " / "Name' }).fill(data.Req_Name);

    // Address Line 1
    await this.page.getByRole('textbox', { name: 'Address Line 1' }).fill(data.Opt_AddressLine1 || '');

    // Address Line 2
    await this.page.getByRole('textbox', { name: 'Address Line 2' }).fill(data.Opt_AddressLine2 || '');

    // City
    //await this.page.getByRole('textbox', { name: '* " / "City' }).fill(data.Opt_City || ' ');
    await this.page.getByRole('textbox', { name: 'City' }).fill(data.Opt_City || '');

    // State
    await this.page.getByRole('button', { name: 'State ??dropdown??' }).click();
    await this.page.getByRole('option', { name: data.Opt_State, exact: true }).click();

    // Postal Code
    await this.page.getByRole('textbox', { name: 'Postal Code' }).fill(data.Opt_PostalCode || ' ');

    // Email
    await this.page.getByRole('textbox', { name: 'Email' }).fill(data.Opt_Email || '');

    // To Account Number
    await this.page.getByRole('textbox', { name: 'Account Number' }).fill(data.Req_ToAccountNumber);

    // Bank Code Type
    await this.page.getByRole('link', { name: 'ABA clear' }).click();
    await this.page.getByRole('option', { name: data.Req_BankCodeType, exact: true }).click();

    // Bank Code
    await this.page.locator('#s2id_BENE_BANK_ID').getByRole('link').click();
    await this.page.getByRole('option', { name: data.Req_BankCode, exact: true }).click();

    // Charges
    await this.page.getByRole('button', { name: 'Charges ??dropdown??' }).click();
    await this.page.getByRole('option', { name: data.Req_Charges, exact: true }).click();

    // Credit Amount
    await this.page.getByRole('textbox', { name: 'Credit Amount' }).fill(data.Req_CreditAmount);

    // Purpose of Payment
    await this.page.getByRole('textbox', { name: 'Purpose of Payment' }).fill(data.Opt_PurposeOfPayment || '');

    // Submit Payment
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }
}
