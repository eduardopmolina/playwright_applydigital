import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class HomePage extends BasePage {
  page: Page;
  productsLink = "a[href='/products']";

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async goToProducts() {
    await this.page.click(this.productsLink);
    // cSpell:ignore networkidle
    //await this.page.waitForLoadState('networkidle');
  }
}