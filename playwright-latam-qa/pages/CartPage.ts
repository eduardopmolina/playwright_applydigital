import BasePage from './BasePage';
import { Page } from '@playwright/test';

export default class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  registerLoginModal = '#checkoutModal, #register-login-modal, #loginModal';
  checkoutHeading = 'text=Checkout';

  async isRegisterLoginModalVisible() {
    // Check for presence of register/login elements
    const visible = await this.page.locator('text=Register / Login').count() || await this.page.locator(this.registerLoginModal).count();
    return visible > 0;
  }
}
