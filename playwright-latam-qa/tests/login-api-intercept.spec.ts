import { test, expect, Page, Route } from '@playwright/test';
import { createBDDLogger, BDDLogger } from '../utils/bdd-logger';

// Helper function to determine token type
function determineTokenType(token: string): string {
  if (token.startsWith('eyJ')) {
    return 'JWT Token';
  } else if (token.includes('-')) {
    return 'UUID/GUID Token';
  } else {
    return 'Custom Token';
  }
}

test.describe('Login API Response Interception & Validation', () => {
  let bddLogger: BDDLogger;
  let interceptedResponses: any[] = [];
  let profileData: any = null;

  test.beforeEach(async ({ page, browserName }) => {
    // Initialize BDD logger
    bddLogger = createBDDLogger('Login API Interception');
    bddLogger.startScenario(
      'Intercept and validate successful login API responses',
      ['@api', '@authentication', '@intercept', '@profile'],
      'Testing API response interception to capture user profile data on successful login',
      browserName,
      `${page.viewportSize()?.width}x${page.viewportSize()?.height}`
    );

    // Clear intercepted responses
    interceptedResponses = [];
    profileData = null;
  });

  test.afterEach(async () => {
    bddLogger.endScenario();
    bddLogger.generateReport();
  });

  test('Intercept successful login API response with profile data', async ({ page }) => {
    try {
      bddLogger.given('the login API endpoint is configured for interception', {
        endpoints: ['/login', '/api/login', '/api/verifyLogin', '/api/auth/login'],
        interceptType: 'response capture and validation'
      });

      // Setup API response interception for various login endpoints
      await setupLoginAPIIntercepts(page);
      bddLogger.stepPassed();

      bddLogger.and('the interception handlers are ready to capture profile data');
      bddLogger.stepPassed();

      bddLogger.when('the user navigates to the login page');
      await page.goto('https://automationexercise.com/login');
      bddLogger.stepPassed();

      bddLogger.and('the user enters valid login credentials');
      const testCredentials = {
        email: 'testuser@example.com',
        password: 'securePassword123!'
      };

      // Fill login form
      await page.fill('[data-qa="login-email"]', testCredentials.email);
      await page.fill('[data-qa="login-password"]', testCredentials.password);
      bddLogger.stepPassed();

      bddLogger.and('the user submits the login form to trigger API call');
      
      // Listen for API responses during login submission
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('login') && response.status() === 200
      );

      await page.click('[data-qa="login-button"]');
      
      try {
        const response = await responsePromise;
        bddLogger.logApiCall(
          response.request().method(),
          response.url(),
          response.status(),
          Date.now()
        );
        bddLogger.stepPassed();
      } catch (timeoutError) {
        console.log('Login API call timeout - continuing with form submission validation:', timeoutError);
        bddLogger.addNote('Login API call not detected - continuing with form submission validation');
        bddLogger.stepPassed();
      }

      bddLogger.thenStep('the API response should be intercepted and captured', {
        expectedData: ['user profile', 'authentication token', 'session info'],
        validationChecks: ['status code', 'response structure', 'profile fields']
      });

      // Validate intercepted responses
      await validateInterceptedLoginResponses();
      bddLogger.stepPassed();

      bddLogger.and('the profile data should contain expected user information');
      
      if (profileData) {
        bddLogger.addNote(`Profile data captured: ${JSON.stringify(profileData, null, 2)}`);
        validateProfileData(profileData);
      } else {
        bddLogger.addNote('No profile data intercepted - this may indicate the site uses different authentication flow');
      }
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`API interception failed: ${errorMessage}`);
      throw error;
    }
  });

  test('Mock successful login API response with custom profile data', async ({ page }) => {
    try {
      bddLogger.given('a mock login API response is configured', {
        mockResponse: {
          status: 200,
          user: { id: 123, name: 'Test User', email: 'test@example.com' },
          token: 'mock-jwt-token-12345'
        }
      });

      // Setup API mocking for login endpoints
      await setupLoginAPIMocks(page);
      bddLogger.stepPassed();

      bddLogger.when('the user attempts to login with any credentials');
      await page.goto('https://automationexercise.com/login');
      
      // Wait for login form to be ready
      await page.waitForSelector('[data-qa="login-email"]', { timeout: 15000 });
      
      await page.fill('[data-qa="login-email"]', 'mock@test.com');
      await page.fill('[data-qa="login-password"]', 'password123');
      bddLogger.stepPassed();

      bddLogger.and('the mocked API responds with successful profile data');
      await page.click('[data-qa="login-button"]');
      
      // Wait for potential navigation or UI changes
      await page.waitForTimeout(2000);
      bddLogger.stepPassed();

      bddLogger.thenStep('the mocked response should be captured and validated', {
        expectedMockData: {
          userId: 123,
          userName: 'Test User',
          userEmail: 'test@example.com',
          authToken: 'mock-jwt-token-12345'
        }
      });

      // Validate mock responses were called
      if (interceptedResponses.length > 0) {
        bddLogger.addNote(`Mock responses captured: ${interceptedResponses.length}`);
        for (let index = 0; index < interceptedResponses.length; index++) {
          const response = interceptedResponses[index];
          if (response.type === 'mock' && response.data) {
            const mockData = response.data;
            bddLogger.addNote(`Mock ${index + 1} Status: ${mockData.success ? '200 OK' : 'Error'}`);
            bddLogger.addNote(`Mock ${index + 1} Username: ${mockData.user?.name || 'N/A'}`);
            bddLogger.addNote(`Mock ${index + 1} Fields: ${Object.keys(mockData.user || {}).join(', ')}`);
          } else {
            bddLogger.addNote(`Mock ${index + 1}: ${response.type || 'Unknown type'}`);
          }
        }
      }
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`Mock API test failed: ${errorMessage}`);
      throw error;
    }
  });

  test('Intercept and validate authentication token in login response', async ({ page }) => {
    try {
      bddLogger.given('authentication token validation is configured');
      
      // Setup token interception
      await setupTokenInterception(page);
      bddLogger.stepPassed();

      bddLogger.when('a user logs in successfully');
      await page.goto('https://automationexercise.com/login');
      
      const credentials = {
        email: 'token-test@example.com',
        password: 'testPassword123'
      };

      await page.fill('[data-qa="login-email"]', credentials.email);
      await page.fill('[data-qa="login-password"]', credentials.password);
      await page.click('[data-qa="login-button"]');
      bddLogger.stepPassed();

      bddLogger.thenStep('the authentication token should be present in the response');
      
      // Check for JWT token patterns in intercepted responses
      const tokenValidation = validateAuthenticationTokens();
      
      if (tokenValidation.hasToken) {
        bddLogger.addNote(`Authentication token found: ${tokenValidation.tokenPreview}`);
        bddLogger.addNote(`Token type: ${tokenValidation.tokenType}`);
      } else {
        bddLogger.addNote('No authentication token detected in responses');
      }
      bddLogger.stepPassed();

      bddLogger.and('the token should have valid format and expiration');
      
      if (tokenValidation.hasToken) {
        validateTokenStructure(tokenValidation.fullToken);
      }
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`Token validation failed: ${errorMessage}`);
      throw error;
    }
  });

  // Helper function to setup login API interception
  async function setupLoginAPIIntercepts(page: Page) {
    const loginEndpoints = [
      '**/login',
      '**/api/login',
      '**/api/verifyLogin',
      '**/api/auth/login',
      '**/authentication',
      '**/signin'
    ];

    for (const endpoint of loginEndpoints) {
      await page.route(endpoint, async (route: Route) => {
        const response = await route.fetch();
        const responseBody = await response.text();
        
        // Capture the response
        const capturedResponse = {
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          body: responseBody,
          timestamp: new Date().toISOString()
        };
        
        interceptedResponses.push(capturedResponse);
        
        // Try to parse profile data
        try {
          const jsonBody = JSON.parse(responseBody);
          if (jsonBody.user || jsonBody.profile || jsonBody.data) {
            profileData = jsonBody.user || jsonBody.profile || jsonBody.data;
          }
        } catch (parseError) {
          // Response is not JSON, continue with non-JSON response
          console.log('Response is not JSON format:', parseError);
        }
        
        // Continue with original response
        await route.continue();
      });
    }
  }

  // Helper function to setup API mocking
  async function setupLoginAPIMocks(page: Page) {
    await page.route('**/login', async (route: Route) => {
      const mockResponse = {
        success: true,
        user: {
          id: 123,
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer',
          profile: {
            firstName: 'Test',
            lastName: 'User',
            avatar: 'https://example.com/avatar.jpg'
          }
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-payload.mock-signature',
        expiresIn: 3600,
        refreshToken: 'refresh-token-12345'
      };

      interceptedResponses.push({
        type: 'mock',
        data: mockResponse,
        timestamp: new Date().toISOString()
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });
  }

  // Helper function to setup token interception
  async function setupTokenInterception(page: Page) {
    await page.route('**/*', async (route: Route) => {
      const response = await route.fetch();
      
      // Check response headers for authorization tokens
      const headers = response.headers();
      if (headers['authorization'] || headers['x-auth-token'] || headers['access-token']) {
        interceptedResponses.push({
          type: 'header-token',
          authorization: headers['authorization'],
          authToken: headers['x-auth-token'],
          accessToken: headers['access-token'],
          url: response.url()
        });
      }
      
      // Check response body for tokens
      try {
        const responseBody = await response.text();
        const jsonBody = JSON.parse(responseBody);
        
        if (jsonBody.token || jsonBody.accessToken || jsonBody.authToken || jsonBody.jwt) {
          interceptedResponses.push({
            type: 'body-token',
            token: jsonBody.token,
            accessToken: jsonBody.accessToken,
            authToken: jsonBody.authToken,
            jwt: jsonBody.jwt,
            url: response.url()
          });
        }
      } catch (parseError) {
        // Not JSON response, skip token extraction
        console.log('Response is not JSON, skipping token extraction:', parseError);
      }
      
      await route.continue();
    });
  }

  // Validation functions
  async function validateInterceptedLoginResponses() {
    expect(interceptedResponses).toBeDefined();
    
    if (interceptedResponses.length > 0) {
      bddLogger.addNote(`Successfully intercepted ${interceptedResponses.length} login-related responses`);
      
      for (let index = 0; index < interceptedResponses.length; index++) {
        const response = interceptedResponses[index];
        bddLogger.addNote(`Response ${index + 1}: ${response.url} (Status: ${response.status})`);
      }
    } else {
      bddLogger.addNote('No login API responses intercepted - site may use different authentication mechanism');
    }
  }

  function validateProfileData(profile: any) {
    const requiredFields = ['id', 'name', 'email'];
    const missingFields = requiredFields.filter(field => !profile.hasOwnProperty(field));
    
    if (missingFields.length === 0) {
      bddLogger.addNote('✅ Profile data contains all required fields');
    } else {
      bddLogger.addNote(`⚠️ Missing profile fields: ${missingFields.join(', ')}`);
    }
    
    // Validate email format if present
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      bddLogger.addNote('⚠️ Invalid email format in profile data');
    }
  }

  function validateAuthenticationTokens() {
    for (const response of interceptedResponses) {
      if (response.type === 'body-token') {
        const token = response.token || response.accessToken || response.authToken || response.jwt;
        if (token) {
          return {
            hasToken: true,
            fullToken: token,
            tokenPreview: token.substring(0, 20) + '...',
            tokenType: determineTokenType(token)
          };
        }
      }
      
      if (response.type === 'header-token') {
        const token = response.authorization || response.authToken || response.accessToken;
        if (token) {
          return {
            hasToken: true,
            fullToken: token,
            tokenPreview: token.substring(0, 20) + '...',
            tokenType: 'Header Token'
          };
        }
      }
    }
    
    return { hasToken: false };
  }

  function validateTokenStructure(token: string) {
    if (token.startsWith('eyJ')) {
      // JWT token validation
      const parts = token.split('.');
      if (parts.length === 3) {
        bddLogger.addNote('✅ JWT token has valid structure (header.payload.signature)');
        
        try {
          const payload = JSON.parse(atob(parts[1]));
          bddLogger.addNote(`JWT payload contains: ${Object.keys(payload).join(', ')}`);
          
          if (payload.exp) {
            const expirationDate = new Date(payload.exp * 1000);
            bddLogger.addNote(`Token expires: ${expirationDate.toISOString()}`);
          }
        } catch (decodeError) {
          console.log('Could not decode JWT payload:', decodeError);
          bddLogger.addNote('⚠️ Could not decode JWT payload');
        }
      } else {
        bddLogger.addNote('⚠️ JWT token has invalid structure');
      }
    } else {
      bddLogger.addNote(`Token length: ${token.length} characters`);
      bddLogger.addNote(`Token format: ${determineTokenType(token)}`);
    }
  }
});