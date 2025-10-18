import { test, expect } from '@playwright/test';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import { faker } from '@faker-js/faker';

test.describe('Login & Registration Debugging', () => {
  
  test('Debug: Navigate to login page and inspect elements', async ({ page, browserName }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);

    console.log(`Running on: ${browserName}`);

    // 1. Navigate to homepage
    await home.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);

    // 2. Navigate to login page
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    // Apply Copilot instructions - avoid networkidle, use selector waits instead
    await page.waitForSelector('[data-qa="login-email"]', { timeout: 5000 }).catch(() => {});

    // 3. Verify we're on the login page
    await expect(page).toHaveURL(/\/login/);

    // 4. Check for login form visibility
    console.log('Login form visible:', await login.isLoginFormVisible());
    console.log('Signup form visible:', await login.isSignupFormVisible());

    // 5. Debug: Log all form elements found
    const loginElements = await page.locator('input').all();
    console.log('Found input elements:', loginElements.length);
    
    for (let i = 0; i < loginElements.length; i++) {
      const element = loginElements[i];
      const placeholder = await element.getAttribute('placeholder');
      const name = await element.getAttribute('name');
      const dataQa = await element.getAttribute('data-qa');
      console.log(`Input ${i}: placeholder="${placeholder}", name="${name}", data-qa="${dataQa}"`);
    }

    // 6. Debug: Log page content structure
    const pageText = await page.textContent('body');
    console.log('Page contains "Login":', pageText?.includes('Login'));
    console.log('Page contains "Signup":', pageText?.includes('Signup'));
  });

  test('Debug: Test signup flow with detailed logging', async ({ page, browserName }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);

    // Generate test data
    const name = faker.person.firstName();
    const email = faker.internet.email();

    console.log(`Testing signup with: ${name}, ${email}`);

    // 1. Navigate and go to login page
    await home.goto('/');
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    // Apply Copilot instructions - avoid networkidle, use selector waits instead
    await page.waitForSelector('[data-qa="signup-name"]', { timeout: 5000 }).catch(() => {});

    // 2. Debug: Check current page state - removed screenshot

    // 3. Try to fill signup form
    console.log('Attempting to fill signup form...');
    
    try {
      await login.signup(name, email);
      console.log('Signup form filled successfully');
      
      // Check if we moved to account creation page or stayed on same page
      const currentUrl = page.url();
      console.log('Current URL after signup:', currentUrl);
      
      // Check for any error messages
      const errorMsg = await login.getErrorMessage();
      if (errorMsg) {
        console.log('Error message:', errorMsg);
      }
      
    } catch (error) {
      console.error('Signup failed:', error);
    }
  });

  test('Debug: Test login flow with existing account', async ({ page, browserName }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);

    // Use test credentials (you might need to create an account first)
    const email = 'test@example.com';
    const password = 'testpassword';

    console.log(`Testing login with: ${email}`);

    // 1. Navigate to login page
    await home.goto('/');
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    // Apply Copilot instructions - avoid networkidle, use selector waits instead
    await page.waitForSelector('[data-qa="login-email"]', { timeout: 5000 }).catch(() => {});

    // 2. Debug: Check login form state - removed screenshot

    // 3. Try to login
    console.log('Attempting to login...');
    
    try {
      await login.login(email, password);
      console.log('Login form filled successfully');
      
      // Check current state
      const currentUrl = page.url();
      console.log('Current URL after login:', currentUrl);
      
      // Check for error messages
      const errorMsg = await login.getErrorMessage();
      if (errorMsg) {
        console.log('Login error message:', errorMsg);
      }
      
      // Check if login was successful (look for logout link or user info)
      const logoutLink = await page.locator('a:has-text("Logout")').isVisible();
      console.log('Logout link visible (login successful):', logoutLink);
      
    } catch (error) {
      console.error('Login failed:', error);
    }
  });
});