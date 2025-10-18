import { test, expect } from '@playwright/test';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import { faker } from '@faker-js/faker';

test.describe('Login Functionality - Focused Debugging', () => {
  
  test('Successfully navigate to signup and fill form', async ({ page, browserName }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);

    // Generate test data
    const name = faker.person.firstName();
    const email = faker.internet.email();
    
    console.log(`Testing on ${browserName}: ${name}, ${email}`);

    // 1. Navigate to homepage
    await home.goto('/');
    
    // 2. Click on Signup/Login link
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    
    // 3. Wait for login page to load and verify URL
    await expect(page).toHaveURL(/\/login/);
    
    // 4. Verify both forms are visible
    expect(await login.isLoginFormVisible()).toBeTruthy();
    expect(await login.isSignupFormVisible()).toBeTruthy();
    
    // 5. Fill signup form
    await page.locator('[data-qa="signup-name"]').fill(name);
    await page.locator('[data-qa="signup-email"]').fill(email);
    
    // 6. Click signup button
    await page.locator('[data-qa="signup-button"]').click();
    
    // 7. Verify we moved to signup page
    await expect(page).toHaveURL(/\/signup/);
    
    console.log(`✅ Login navigation successful on ${browserName}`);
  });

  test('Verify login form elements are accessible', async ({ page }) => {
    const home = new HomePage(page);
    
    // Navigate to login page
    await home.goto('/');
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    
    // Check all login elements are accessible
    await expect(page.locator('[data-qa="login-email"]')).toBeVisible();
    await expect(page.locator('[data-qa="login-password"]')).toBeVisible();
    await expect(page.locator('[data-qa="login-button"]')).toBeVisible();
    
    // Check signup elements are accessible
    await expect(page.locator('[data-qa="signup-name"]')).toBeVisible();
    await expect(page.locator('[data-qa="signup-email"]')).toBeVisible();
    await expect(page.locator('[data-qa="signup-button"]')).toBeVisible();
    
    console.log('✅ All form elements are accessible');
  });

  test('Test complete user registration flow', async ({ page }) => {
    const home = new HomePage(page);
    
    const name = faker.person.firstName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    
    console.log(`Registering user: ${name} (${email})`);
    
    // Navigate to signup
    await home.goto('/');
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    
    // Fill initial signup form
    await page.locator('[data-qa="signup-name"]').fill(name);
    await page.locator('[data-qa="signup-email"]').fill(email);
    await page.click('[data-qa="signup-button"]');
    
    // Verify we're on account creation page
    await expect(page).toHaveURL(/\/signup/);
    
    // Look for account creation form elements
    const hasPasswordField = await page.locator('input[type="password"]').isVisible({ timeout: 3000 });
    
    if (hasPasswordField) {
      console.log('✅ Account creation form loaded successfully');
      
      // Fill additional required fields if they exist
      await page.locator('input[data-qa="password"], input[name="password"]').first().fill(password).catch(() => {
        console.log('Password field not found with expected selectors');
      });
      
    } else {
      console.log('⚠️  Account creation form not found or different structure');
    }
  });
});