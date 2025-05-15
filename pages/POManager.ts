// pages/PageObjectManager.ts
import { Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { PaymentPage } from './PaymentPage';
import { DomesticWirePage } from './DomesticWirePage';
import { InternationalWirePaymentPage } from './InternationalWirePaymentPage';
import { DomesticWireTemplatePayment } from './DomesticWireTemplatePayment';

export class POManager {
  private readonly page: Page;
  private loginPage?: LoginPage;
  private paymentPage?: PaymentPage;
  private domesticWirePage?: DomesticWirePage;
  private internationalWirePaymentPage?: InternationalWirePaymentPage
  private domesticWireTemplatePayment?: DomesticWireTemplatePayment

  constructor(page: Page) {
    this.page = page;
  }

  getLoginPage(): LoginPage {
    if (!this.loginPage) {
      this.loginPage = new LoginPage(this.page);
    }
    return this.loginPage;
  }

  getPaymentPage(): PaymentPage {
    if (!this.paymentPage) {
      this.paymentPage = new PaymentPage(this.page);
    }
    return this.paymentPage;
  }

  getdomesticWirePage(): DomesticWirePage {
    if (!this.domesticWirePage) {
      this.domesticWirePage = new DomesticWirePage(this.page);
    }
    return this.domesticWirePage;
  }

  getinternationalWirePaymentPage(): InternationalWirePaymentPage {
    if (!this.internationalWirePaymentPage) {
      this.internationalWirePaymentPage = new InternationalWirePaymentPage(this.page);
    }
    return this.internationalWirePaymentPage;
  }

  getDomesticWireTemplatePayment(): DomesticWireTemplatePayment {
    if (!this.domesticWireTemplatePayment) {
      this.domesticWireTemplatePayment = new DomesticWireTemplatePayment(this.page);
    }
    return this.domesticWireTemplatePayment;
  }
}
