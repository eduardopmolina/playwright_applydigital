import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class ProductsPage extends BasePage {
  constructor(page: Page) { super(page); }
  productCards = ".features_items .col-sm-4";
  async openThirdProduct() {
    await this.page.waitForSelector(this.productCards);
    const third = this.page.locator(this.productCards).nth(2);
    await third.scrollIntoViewIfNeeded();
    
    // Apply error handling patterns from Copilot instructions
    const viewBtn = third.locator("a", { hasText: "View Product" });
    
    // Wait for element to be visible with fallback handling
    await this.page.waitForSelector(`${this.productCards}:nth-child(3) a:has-text('View Product')`, { timeout: 5000 }).catch(() => {});
    
    if (await viewBtn.isVisible({ timeout: 2000 })) {
      await viewBtn.click();
    } else {
      // Fallback navigation pattern from instructions
      const productLink = third.locator("a").first();
      await productLink.click();
    }
    // cSpell:ignore networkidle
    //await page.waitForLoadState('networkidle'); // Wait for the network to become idle
  }
}