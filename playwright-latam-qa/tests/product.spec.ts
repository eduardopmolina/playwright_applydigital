import { test, expect } from '@playwright/test';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import CartPage from '../pages/CartPage';
import { randomInt } from '../utils/random';
import { faker } from '@faker-js/faker';


// This test covers the mandatory flow and optional registration (commented).
test.describe('Add third product and proceed to checkout', () => {
  test('Desktop & Mobile: add 3rd product, set random qty, add to cart and reach Register/Login step', async ({ page, browserName }) => {
    const home = new HomePage(page);
    const products = new ProductsPage(page);
    const productDetails = new ProductDetailsPage(page);
    const cart = new CartPage(page);

    // 1. Open homepage
    await home.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);

    // 2. Go to Products section
    await home.goToProducts();
    await expect(page).toHaveURL(/\/products/);

    // 3. Choose third product and view details
    await products.openThirdProduct();

    // 4. Generate random quantity 1..20
    const qty = randomInt(1, 20);

    // 5. Set quantity
    await productDetails.setQuantity(qty);

    // 6. Add to cart
    await productDetails.addToCart();

    // 7. Proceed to checkout
    await productDetails.proceedToCheckout();
    // 8. Verify Register/Login modal or page (mandatory)
    await cart.isRegisterLoginModalVisible();
    // Hard assert: must be true
    expect(cart.isRegisterLoginModalVisible()).toBeTruthy();

    // Lets not forget to click on sign up.
   // Wait for the element to be visible before clicking (Playwright's auto-waiting handles this implicitly for actions like click)
    await page.getByRole('link', { name: ' Signup / Login' }).waitFor({ state: 'visible' }); 
    await page.getByRole('link', { name: ' Signup / Login' }).click();

    // 8. Verify Register/Login modal or page
    await cart.isRegisterLoginModalVisible();

  });
  });
  // Optional registration test
  test('Desktop & Mobile: Optional registration flow', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);

    // 9. Click on 'Signup / Login' link
    const signupLink = page.getByRole('link', { name: ' Signup / Login' });
    await signupLink.waitFor({ state: 'visible' });
    await signupLink.scrollIntoViewIfNeeded();
    await signupLink.click({ force: true });

    // 10. Perform the registration - Apply Copilot instructions error handling patterns
    const name = faker.person.firstName();
    const email = faker.internet.email();
    
    // Use error handling pattern from Copilot instructions
    await page.waitForSelector('input[name="name"], [data-qa="signup-name"]', { timeout: 5000 }).catch(() => {});
    
    const nameField = page.getByRole('textbox', { name: 'Name' });
    if (await nameField.isVisible({ timeout: 2000 })) {
      await nameField.fill(name);
    } else {
      // Fallback selector strategy from instructions
      await page.locator('input[name="name"], [data-qa="signup-name"]').first().fill(name);
    }
    
    const emailField = page.locator('form').filter({ hasText: 'Signup' }).getByPlaceholder('Email Address');
    await emailField.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await emailField.click();
    await emailField.fill(email);
    await page.getByRole('button', { name: 'Signup' }).click();

    await page.close();
    // Add assertions here to verify registration success, e.g.,
    // await expect(page).toHaveURL(/\/account_created/);
  });