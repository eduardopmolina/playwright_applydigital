import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class ProductDetailsPage extends BasePage {
  constructor(page: Page) { super(page); }
  quantityInput = "#quantity";
  addToCartButton = "button:has-text('Add to cart')";
  proceedToCheckoutBtn = "a:has-text('Proceed To Checkout'), button:has-text('Proceed To Checkout')";
  async setQuantity(qty: number) { await this.page.fill(this.quantityInput, String(qty)); }
  async addToCart() {
    await this.page.click(this.addToCartButton);
    await this.page.waitForSelector("div.modal-content, #cartModal", { timeout: 5000 }).catch(() => {});
  }
async proceedToCheckout() {
  const proceedToCheckoutBtn = this.page.locator(this.proceedToCheckoutBtn);
  
  if (await proceedToCheckoutBtn.isVisible({ timeout: 1000 })) {
    await proceedToCheckoutBtn.first().click();
  } else {
    await this.page.goto("https://automationexercise.com/view_cart");
  }


}
}