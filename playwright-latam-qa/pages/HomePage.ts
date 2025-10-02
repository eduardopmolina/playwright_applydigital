import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class HomePage extends BasePage {
  constructor(page: Page) { super(page); }
  productsLink = "a[href='/products']";
  async goToProducts() {
    await this.page.click(this.productsLink);
    // cSpell:ignore networkidle
    await this.page.waitForLoadState('networkidle');
  }
}
