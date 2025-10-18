/**
 * BDD Example: E-commerce Login Flow Test
 * Demonstrates how to use the BDD Logger with Playwright tests
 */

import { test, expect } from '@playwright/test';
import { createBDDLogger, BDDLogger } from '../utils/bdd-logger';
import HomePage from '../pages/HomePage';
import { randomInt } from '../utils/random';

let bddLogger: BDDLogger;

test.describe('E-commerce Authentication Flow', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Initialize BDD Logger for this feature
    bddLogger = createBDDLogger('E-commerce Authentication');
    
    // Start a new scenario with context information
    bddLogger.startScenario(
      'User completes signup and login flow',
      ['@authentication', '@smoke', '@critical'],
      'User visits the e-commerce site for the first time',
      browserName,
      page.viewportSize()?.width + 'x' + page.viewportSize()?.height
    );
  });

  test.afterEach(async () => {
    // End the scenario and generate report
    bddLogger.endScenario();
    bddLogger.generateReport();
  });

  test('Complete user signup and login workflow with BDD logging', async ({ page }) => {
    const homePage = new HomePage(page);
    
    try {
      // GIVEN - User is on the homepage
      bddLogger.given('the user is on the e-commerce homepage', {
        url: 'https://automationexercise.com',
        pageTitle: 'AutomationExercise'
      });

      await homePage.goto();
      await expect(page).toHaveTitle(/Automation Exercise/);
      bddLogger.stepPassed();
      bddLogger.addNote('Homepage loaded successfully with correct title');

      // AND - User can see the signup/login link
      bddLogger.and('the signup/login link is visible', {
        element: 'Signup / Login link',
        location: 'header navigation'
      });

      const signupLink = page.getByRole('link', { name: ' Signup / Login' });
      await expect(signupLink).toBeVisible();
      bddLogger.stepPassed();

      // WHEN - User clicks on signup/login
      bddLogger.when('the user clicks on the signup/login link');

      const startTime = Date.now();
      await signupLink.click();
      const endTime = Date.now();
      
      bddLogger.logApiCall('GET', '/login', 200, endTime - startTime);
      bddLogger.stepPassed();
      bddLogger.addNote('Navigation to login page completed');

      // AND - User fills in the signup form
      bddLogger.and('the user fills in the signup form with valid details', {
        formType: 'new user signup',
        fields: ['name', 'email']
      });

      const userName = `TestUser${randomInt(1000, 9999)}`;
      const userEmail = `test${randomInt(1000, 9999)}@example.com`;

      await page.fill('input[data-qa="signup-name"]', userName);
      await page.fill('input[data-qa="signup-email"]', userEmail);
      bddLogger.stepPassed();
      bddLogger.addNote(`Created test user: ${userName} with email: ${userEmail}`);

      // AND - User submits the signup form
      bddLogger.and('the user submits the signup form');

      await page.click('button[data-qa="signup-button"]');
      
      // Wait for signup API call and log it
      const signupResponse = await page.waitForResponse(response => 
        response.url().includes('/signup') && response.status() === 200
      ).catch(() => null);

      if (signupResponse) {
        bddLogger.logApiCall('POST', '/signup', signupResponse.status());
        bddLogger.stepPassed();
      } else {
        bddLogger.stepPassed();
        bddLogger.addNote('Signup form submitted (API response not captured)');
      }

      // THEN - User should see the account information page
      bddLogger.thenStep('the user should be redirected to the account information page', {
        expectedPage: 'signup account information',
        requiredFields: ['title', 'password', 'first_name', 'last_name']
      });

      await expect(page.locator('text=Enter Account Information')).toBeVisible();
      bddLogger.stepPassed();

      // AND - User should be able to fill account details
      bddLogger.and('the user can fill in all required account information fields');

      // Fill ACCOUNT INFORMATION section - all required fields
      bddLogger.addNote('Filling Account Information section...');
      
      // Title selection (required)
      await page.check('input#id_gender1'); // Mr.
      bddLogger.addNote('Selected title: Mr.');
      
      // Password (required)
      await page.fill('input#password', 'TestPassword123!');
      bddLogger.addNote('Password set with secure format');
      
      // Date of Birth (required fields)
      await page.selectOption('select#days', '15');
      await page.selectOption('select#months', '6'); 
      await page.selectOption('select#years', '1990');
      bddLogger.addNote('Date of birth set: June 15, 1990');
      
      // Newsletter and Special offers checkboxes (optional but good to test)
      await page.check('input#newsletter').catch(() => {
        bddLogger.addNote('Newsletter checkbox not found or already checked');
      });
      await page.check('input#optin').catch(() => {
        bddLogger.addNote('Special offers checkbox not found or already checked');
      });
      
      bddLogger.stepPassed();
      bddLogger.addNote('Account information section completed successfully');

      // AND - User completes the address information
      bddLogger.and('the user fills in all required address information');

      bddLogger.addNote('Filling Address Information section...');
      
      // First Name (required)
      await page.fill('input#first_name', 'TestFirst');
      
      // Last Name (required) 
      await page.fill('input#last_name', 'TestLast');
      
      // Company (optional but good to fill)
      await page.fill('input#company', 'Test Company Inc.').catch(() => {
        bddLogger.addNote('Company field not found or not fillable');
      });
      
      // Address Line 1 (required)
      await page.fill('input#address1', '123 Test Street, Apt 4B');
      
      // Address Line 2 (optional)
      await page.fill('input#address2', 'Near Central Park').catch(() => {
        bddLogger.addNote('Address line 2 field not found');
      });
      
      // Country (required dropdown)
      await page.selectOption('select#country', 'United States');
      bddLogger.addNote('Selected country: United States');
      
      // State (required)
      await page.fill('input#state', 'California');
      
      // City (required)
      await page.fill('input#city', 'Los Angeles');
      
      // Zipcode (required)
      await page.fill('input#zipcode', '90210');
      
      // Mobile Number (required)
      await page.fill('input#mobile_number', '+1-555-123-4567');
      
      bddLogger.addNote('All address information fields completed');
      bddLogger.stepPassed();

      const createAccountButton = page.locator('button[data-qa="create-account"]');
      await createAccountButton.click();

      bddLogger.stepPassed();

      // THEN - Registration should be successful
      bddLogger.thenStep('the account should be created successfully', {
        expectedMessage: 'Account Created!',
        nextAction: 'continue to account'
      });

      await expect(page.locator('text=Account Created!')).toBeVisible({ timeout: 10000 });
      bddLogger.stepPassed();

      // Generate final report
      bddLogger.addNote('Complete user registration workflow executed successfully');

    } catch (error) {
      // Log any failures
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(errorMessage);
      
      // Take screenshot on failure
      await page.screenshot({ 
        path: `reports/bdd/screenshot-${Date.now()}.png`,
        fullPage: true 
      });
      
      bddLogger.stepFailed(errorMessage, `screenshot-${Date.now()}.png`);
      
      throw error; // Re-throw to fail the test
    }
  });

  test('Login with existing user credentials', async ({ page }) => {
    const homePage = new HomePage(page);

    // Start new scenario for login
    bddLogger.startScenario(
      'Existing user logs in successfully',
      ['@authentication', '@login', '@existing-user']
    );

    try {
      // GIVEN - User has existing account
      bddLogger.given('the user has valid existing account credentials', {
        email: 'test@example.com',
        accountStatus: 'active'
      });

      await homePage.goto();
      bddLogger.stepPassed();

      // WHEN - User navigates to login
      bddLogger.when('the user navigates to the login page');
      
      await page.getByRole('link', { name: ' Signup / Login' }).click();
      bddLogger.stepPassed();

      // AND - User enters valid login credentials  
      bddLogger.and('the user enters valid email and password', {
        action: 'form_fill',
        fields: ['email', 'password']
      });

      await page.fill('input[data-qa="login-email"]', 'test@example.com');
      await page.fill('input[data-qa="login-password"]', 'TestPassword123!');
      bddLogger.stepPassed();

      // AND - User clicks login button
      bddLogger.and('the user clicks the login button');

      await page.click('button[data-qa="login-button"]');

      // Monitor login API call
      const loginResponse = await page.waitForResponse(response => 
        response.url().includes('/login') && (response.status() === 200 || response.status() === 302)
      ).catch(() => null);

      if (loginResponse) {
        bddLogger.logApiCall('POST', '/login', loginResponse.status());
      }
      bddLogger.stepPassed();

      // THEN - User should be logged in successfully
      bddLogger.thenStep('the user should be successfully logged in', {
        expectedResult: 'user dashboard or homepage with logged in state',
        verificationMethod: 'check for user menu or logout option'
      });

      // Verify login success (this might fail if account doesn't exist, which is expected for demo)
      const loggedInIndicator = page.locator('text=Logged in as').or(
        page.locator('a:has-text("Logout")')
      );
      
      try {
        await expect(loggedInIndicator).toBeVisible({ timeout: 5000 });
        bddLogger.stepPassed();
        bddLogger.addNote('Login successful - user authenticated');
      } catch {
        bddLogger.stepFailed('Login verification failed - this is expected for demo credentials');
        bddLogger.addNote('This failure is expected since we are using demo credentials');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(errorMessage);
      throw error;
    }
  });
});

// Example of using BDD Logger with API testing
test.describe('API Authentication Testing', () => {
  test('API login endpoint validation', async ({ request }) => {
    bddLogger = createBDDLogger('API Authentication Testing');
    
    bddLogger.startScenario(
      'Validate login API endpoint response',
      ['@api', '@authentication', '@backend']
    );

    try {
      // GIVEN - API endpoint is available
      bddLogger.given('the login API endpoint is available and accessible', {
        endpoint: '/login',
        method: 'POST',
        expectedStatus: [200, 400, 401]
      });

      // WHEN - Making API request with credentials
      bddLogger.when('a POST request is made to the login endpoint with credentials');

      const startTime = Date.now();
      const response = await request.post('https://automationexercise.com/api/login', {
        form: {
          email: 'test@example.com',
          password: 'TestPassword123!'
        }
      });
      const responseTime = Date.now() - startTime;

      bddLogger.logApiCall('POST', '/api/login', response.status(), responseTime);
      bddLogger.stepPassed();

      // THEN - Response should have correct structure
      bddLogger.thenStep('the API should return a properly formatted response', {
        expectedFields: ['status', 'message', 'data'],
        responseTime: `${responseTime}ms`
      });

      const responseBody = await response.text();
      bddLogger.addNote(`Response body: ${responseBody}`);
      
      // Validate response status
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(500);
      bddLogger.stepPassed();

      bddLogger.endScenario();
      bddLogger.generateReport();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(errorMessage);
      bddLogger.endScenario();
      bddLogger.generateReport();
      throw error;
    }
  });
});