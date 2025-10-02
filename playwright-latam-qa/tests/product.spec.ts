import { test, expect } from "@playwright/test";
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import { randomInt } from "../utils/random";

test.describe("Add third product and proceed to checkout", () => {
  test("Desktop & Mobile flow", async ({ page }) => {
    const home = new HomePage(page);
    const products = new ProductsPage(page);
    const details = new ProductDetailsPage(page);
    const cart = new CartPage(page);

    await home.goto("https://automationexercise.com");
    await home.goToProducts();
    await products.openThirdProduct();

    const qty = randomInt(1, 20);
    await details.setQuantity(qty);
    await details.addToCart();
    await details.proceedToCheckout();

    expect(await cart.isRegisterLoginModalVisible()).toBeTruthy();
  });
});
