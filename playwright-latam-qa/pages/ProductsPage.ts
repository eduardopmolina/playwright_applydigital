import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class ProductsPage extends BasePage {
  constructor(page: Page) { super(page); }
  productCards = ".features_items .col-sm-4";
  async openThirdProduct() {
    await this.page.waitForSelector(this.productCards);
    const third = this.page.locator(this.productCards).nth(2);
    await third.scrollIntoViewIfNeeded();
    const viewBtn = third.locator("a", { hasText: "View Product" });
    await viewBtn.click();
    // cSpell:ignore networkidle
    //await page.waitForLoadState('networkidle'); // Wait for the network to become idle
  }
}