import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class LoginPage extends BasePage {
  constructor(page: Page) { 
    super(page); 
  }

  // Login selectors
  loginEmailInput = 'input[data-qa="login-email"]';
  loginPasswordInput = 'input[data-qa="login-password"]';
  loginButton = 'button[data-qa="login-button"]';
  
  // Signup selectors
  signupNameInput = 'input[data-qa="signup-name"]';
  signupEmailInput = 'input[data-qa="signup-email"]';
  signupButton = 'button[data-qa="signup-button"]';
  
  // Common elements
  signupLoginLink = 'a[href="/login"]';
  pageTitle = 'h2';
  errorMessage = '.text-center.alert.alert-danger';

  async navigateToLogin() {
    await this.page.click(this.signupLoginLink);
    // Apply Copilot instructions - avoid networkidle, use selector waits instead
    await this.page.waitForSelector(this.loginEmailInput, { timeout: 5000 }).catch(() => {});
  }

  async login(email: string, password: string) {
    // Apply Copilot instructions error handling patterns
    await this.page.waitForSelector(this.loginEmailInput, { timeout: 5000 }).catch(() => {});
    
    if (await this.page.locator(this.loginEmailInput).isVisible({ timeout: 2000 })) {
      await this.page.fill(this.loginEmailInput, email);
      await this.page.fill(this.loginPasswordInput, password);
      await this.page.click(this.loginButton);
    } else {
      // Fallback selectors
      await this.page.fill('input[name="email"]', email);
      await this.page.fill('input[name="password"]', password);
      await this.page.click('button:has-text("Login")');
    }
    
    // Apply Copilot instructions - use selector waits instead of networkidle
    await this.page.waitForSelector('a:has-text("Logout"), .alert, [data-qa="continue-button"]', { timeout: 5000 }).catch(() => {});
  }

  async signup(name: string, email: string) {
    // Apply error handling patterns from Copilot instructions
    await this.page.waitForSelector(this.signupNameInput, { timeout: 5000 }).catch(() => {});
    
    const nameField = this.page.locator(this.signupNameInput);
    const emailField = this.page.locator(this.signupEmailInput);
    
    if (await nameField.isVisible({ timeout: 2000 })) {
      await nameField.fill(name);
      await emailField.fill(email);
      await this.page.click(this.signupButton);
    } else {
      // Fallback selector strategy from instructions
      await this.page.locator('input[name="name"], input[placeholder*="Name"]').first().fill(name);
      await this.page.locator('input[name="email"], input[placeholder*="Email"]').first().fill(email);
      await this.page.click('button:has-text("Signup")');
    }
    
    // Apply Copilot instructions - use specific selector waits instead of networkidle
    await this.page.waitForSelector('h1, .alert, [data-qa="continue-button"], .text-center', { timeout: 5000 }).catch(() => {});
  }

  async isLoginFormVisible() {
    return await this.page.locator(this.loginEmailInput).isVisible({ timeout: 2000 });
  }

  async isSignupFormVisible() {
    return await this.page.locator(this.signupNameInput).isVisible({ timeout: 2000 });
  }

  async getErrorMessage() {
    const errorElement = this.page.locator(this.errorMessage);
    if (await errorElement.isVisible({ timeout: 2000 })) {
      return await errorElement.textContent();
    }
    return null;
  }
}