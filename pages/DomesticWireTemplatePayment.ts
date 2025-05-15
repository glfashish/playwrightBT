import { Page, Locator } from '@playwright/test';

export interface DomesticWireTemplatePaymenttData {
    TestCase: string;
    templateName: string;
    customerReference: string;
    internalComment: string;
    email: string;
    purposeOfPayment: string;
    // Full string from CSV that uniquely identifies the account checkbox option.
    accountDetails: string;
    CreditAmount: string;
}

export class DomesticWireTemplatePayment {
    readonly page: Page;
    readonly continueButton: Locator;
    readonly customerReferenceInput: Locator;
    readonly internalCommentInput: Locator;
    readonly emailInput: Locator;
    readonly purposeOfPaymentInput: Locator;
    readonly submitButton: Locator;
    readonly approveButton: Locator;
    readonly yesButton: Locator;
    readonly CreditAmount: Locator;

    constructor(page: Page) {
        this.page = page;
        this.continueButton = page.getByRole('button', { name: 'Continue' });
        this.customerReferenceInput = page.getByRole('textbox', { name: 'Customer Reference' });
        this.internalCommentInput = page.getByRole('textbox', { name: 'Internal Comment' });
        this.emailInput = page.getByRole('textbox', { name: 'Email' });
        this.purposeOfPaymentInput = page.getByRole('textbox', { name: 'Purpose of Payment' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        // Approve button is located under a specific region.
        this.approveButton = page.locator('#dashboard-region-10').getByRole('button', { name: 'Approve', exact: true });
        this.yesButton = page.getByRole('button', { name: 'Yes' });
        this.CreditAmount = page.getByRole('textbox', { name: 'Credit Amount' });
    }

    /**
     * Processes the domestic wire template payment using data passed from CSV.
     * @param data - Data for the template payment.
     */
    async processTemplatePayment(data: DomesticWireTemplatePaymenttData): Promise<void> {
        
        await this.customerReferenceInput.click();
        await this.customerReferenceInput.fill(data.customerReference);
        
        await this.internalCommentInput.click();
        await this.internalCommentInput.fill(data.internalComment);
        
        await this.emailInput.click();
        await this.emailInput.fill(data.email);

        await this.CreditAmount.click();
        await this.CreditAmount.fill(data.CreditAmount);
        
        await this.purposeOfPaymentInput.click();
        await this.purposeOfPaymentInput.fill(data.purposeOfPayment);
        
        await this.submitButton.click();
        
    }

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