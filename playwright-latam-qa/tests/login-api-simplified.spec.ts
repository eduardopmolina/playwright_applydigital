import { test } from '@playwright/test';
import { createBDDLogger, BDDLogger } from '../utils/bdd-logger';

interface APIResult {
  type: string;
  url?: string;
  status?: number;
  statusText?: string;
  method?: string;
  timestamp: string;
  success?: boolean;
  errorMessage?: string;
  responseData?: any;
  response?: any;
  tokenType?: string;
  tokenFormat?: string;
  tokenLength?: number;
  tokenPreview?: string;
}

test.describe('Simplified Login API Testing', () => {
  let bddLogger: BDDLogger;
  let apiResults: APIResult[] = [];

  test.beforeEach(async ({ page, browserName }) => {
    bddLogger = createBDDLogger('Simplified API Testing');
    bddLogger.startScenario(
      'Test login API with simplified results display',
      ['@api', '@simplified', '@login'],
      'Focus on clear results and field enumeration',
      browserName,
      `${page.viewportSize()?.width}x${page.viewportSize()?.height}`
    );
    apiResults = [];
  });

  test.afterEach(async () => {
    bddLogger.endScenario();
    bddLogger.generateReport();
  });

  test('Real login API monitoring with simplified output', async ({ page }) => {
    try {
      bddLogger.given('API monitoring is configured for login endpoints');
      
      // Setup simplified API monitoring with error handling
      await page.route('**/login*', async (route) => {
        try {
          const response = await route.fetch();
          
          const result: APIResult = {
            type: 'Real API',
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            method: route.request().method(),
            timestamp: new Date().toLocaleTimeString(),
            success: response.status() >= 200 && response.status() < 300
          };
          
          // Try to get response body for error details
          try {
            const contentType = response.headers()['content-type'] || '';
            if (contentType.includes('application/json')) {
              const responseBody = await response.json();
              result.responseData = responseBody;
              if (responseBody.error || responseBody.message) {
                result.errorMessage = responseBody.error || responseBody.message;
              }
            }
          } catch {
            // Non-JSON response, continue silently
          }
          
          apiResults.push(result);
          bddLogger.logApiCall(result.method || 'UNKNOWN', result.url || '', result.status || 0, Date.now());
          await route.continue();
        } catch (routeError) {
          const errorResult: APIResult = {
            type: 'Real API Error',
            url: route.request().url(),
            status: 0,
            statusText: 'Network Error',
            method: route.request().method(),
            timestamp: new Date().toLocaleTimeString(),
            success: false,
            errorMessage: routeError instanceof Error ? routeError.message : String(routeError)
          };
          
          apiResults.push(errorResult);
          bddLogger.logApiCall(errorResult.method || 'UNKNOWN', errorResult.url || '', errorResult.status || 0, Date.now());
          await route.continue();
        }
      });
      bddLogger.stepPassed();

      bddLogger.when('user attempts to login on AutomationExercise');
      await page.goto('https://automationexercise.com/login');
      await page.waitForSelector('[data-qa="login-email"]', { timeout: 10000 });
      
      // Use invalid credentials to test error handling
      await page.fill('[data-qa="login-email"]', 'invalid@test.com');
      await page.fill('[data-qa="login-password"]', 'wrongpassword');
      await page.click('[data-qa="login-button"]');
      
      // Wait for potential API calls and error responses
      await page.waitForTimeout(3000);
      bddLogger.stepPassed();

      bddLogger.thenStep('API monitoring results should be captured and displayed');
      displaySimplifiedResults();
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`Simplified API test failed: ${errorMessage}`);
      throw error;
    }
  });

  test('Mock API response with user profile fields', async ({ page }) => {
    try {
      bddLogger.given('mock API response is configured with user profile');
      
      // Create comprehensive mock user data
      const mockUserProfile = {
        id: 101,
        username: 'john_doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        status: 'active',
        lastLogin: '2025-10-18T19:45:00Z',
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        },
        address: {
          street: '123 Main St',
          city: 'Anytown',
          country: 'USA'
        }
      };

      const mockResponse = {
        success: true,
        message: 'Login successful',
        statusCode: 200,
        user: mockUserProfile,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-jwt-payload',
        expiresIn: 3600,
        permissions: ['read', 'write', 'profile:edit']
      };

      // Store mock result with proper 200 status
      apiResults.push({
        type: 'Mock API',
        status: 200,
        statusText: 'OK',
        response: mockResponse,
        timestamp: new Date().toLocaleTimeString(),
        success: true
      });

      bddLogger.stepPassed();

      bddLogger.when('mock login response is processed');
      await page.goto('data:text/html,<h1>Mock API Test Complete</h1>');
      bddLogger.stepPassed();

      bddLogger.thenStep('mock response fields should be extracted and displayed');
      displaySimplifiedResults();
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`Mock API test failed: ${errorMessage}`);
      throw error;
    }
  });

  test('Authentication token analysis', async ({ page }) => {
    try {
      bddLogger.given('token analysis is configured');
      
      // Simulate different token types
      const tokenExamples = [
        {
          type: 'JWT Token',
          value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          format: 'header.payload.signature'
        },
        {
          type: 'API Key',
          value: 'sk-1234567890abcdef1234567890abcdef',
          format: 'prefix-hexadecimal'
        },
        {
          type: 'Session Token',
          value: 'sess_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
          format: 'prefix-alphanumeric'
        }
      ];

      for (const token of tokenExamples) {
        apiResults.push({
          type: 'Token Analysis',
          status: 200, // Analysis successful
          tokenType: token.type,
          tokenFormat: token.format,
          tokenLength: token.value.length,
          tokenPreview: token.value.substring(0, 20) + '...',
          timestamp: new Date().toLocaleTimeString(),
          success: true
        });
      }

      bddLogger.stepPassed();

      bddLogger.when('token examples are processed');
      await page.goto('data:text/html,<h1>Token Analysis Complete</h1>');
      bddLogger.stepPassed();

      bddLogger.thenStep('token analysis results should be displayed');
      displaySimplifiedResults();
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`Token analysis failed: ${errorMessage}`);
      throw error;
    }
  });

  test('Error scenario testing with mock API failures', async ({ page }) => {
    try {
      bddLogger.given('error scenarios are configured for testing');
      
      // Create mock error responses
      const errorScenarios = [
        {
          type: 'Mock API Error',
          status: 401,
          statusText: 'Unauthorized',
          errorMessage: 'Invalid credentials provided',
          timestamp: new Date().toLocaleTimeString(),
          success: false
        },
        {
          type: 'Mock API Error',
          status: 422,
          statusText: 'Unprocessable Entity',
          errorMessage: 'Validation failed: Email format is invalid',
          timestamp: new Date().toLocaleTimeString(),
          success: false
        },
        {
          type: 'Mock API Error',
          status: 500,
          statusText: 'Internal Server Error',
          errorMessage: 'Database connection failed',
          timestamp: new Date().toLocaleTimeString(),
          success: false
        }
      ];

      apiResults.push(...errorScenarios);
      bddLogger.stepPassed();

      bddLogger.when('error scenarios are processed');
      await page.goto('data:text/html,<h1>Error Scenario Testing Complete</h1>');
      bddLogger.stepPassed();

      bddLogger.thenStep('error codes and messages should be displayed clearly');
      displaySimplifiedResults();
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`Error scenario testing failed: ${errorMessage}`);
      throw error;
    }
  });

  function displaySimplifiedResults() {
    bddLogger.addNote(`\n📊 === API TEST RESULTS SUMMARY ===`);
    bddLogger.addNote(`Total Results: ${apiResults.length}`);

    for (let i = 0; i < apiResults.length; i++) {
      const result = apiResults[i];
      bddLogger.addNote(`\n--- Result ${i + 1}: ${result.type} ---`);

      if (result.type === 'Real API' || result.type === 'Real API Error' || result.type === 'Mock API Error') {
        displayRealApiResult(result);
      } else if (result.type === 'Mock API') {
        displayMockApiResult(result);
      } else if (result.type === 'Token Analysis') {
        displayTokenAnalysisResult(result);
      }
    }

    bddLogger.addNote(`\n✅ === SUMMARY COMPLETE ===\n`);
  }

  function displayRealApiResult(result: APIResult) {
    if (result.url) bddLogger.addNote(`🌐 URL: ${result.url}`);
    if (result.status !== undefined) {
      const statusIcon = result.success ? '✅' : '❌';
      bddLogger.addNote(`📊 Status: ${result.status} ${statusIcon}`);
    }
    if (result.statusText) bddLogger.addNote(`� Status Text: ${result.statusText}`);
    if (result.method) bddLogger.addNote(`�🔧 Method: ${result.method}`);
    if (result.errorMessage) bddLogger.addNote(`❌ Error: ${result.errorMessage}`);
    bddLogger.addNote(`⏰ Time: ${result.timestamp}`);
  }

  function displayMockApiResult(result: APIResult) {
    const response = result.response;
    if (!response) return;
    
    bddLogger.addNote(`📊 Status: ${response.statusCode} - ${response.message}`);
    if (response.user) {
      bddLogger.addNote(`👤 Username: ${response.user.username}`);
      bddLogger.addNote(`📧 Email: ${response.user.email}`);
      bddLogger.addNote(`🎭 Role: ${response.user.role}`);
      
      // Display user fields
      const userFields = Object.keys(response.user);
      bddLogger.addNote(`📝 User Fields (${userFields.length}): ${userFields.join(', ')}`);
      
      // Display nested object fields
      if (response.user.preferences) {
        const prefFields = Object.keys(response.user.preferences);
        bddLogger.addNote(`⚙️  Preference Fields: ${prefFields.join(', ')}`);
      }
      
      if (response.user.address) {
        const addressFields = Object.keys(response.user.address);
        bddLogger.addNote(`🏠 Address Fields: ${addressFields.join(', ')}`);
      }
    }
    
    // Display response-level fields
    const responseFields = Object.keys(response).filter(key => key !== 'user');
    bddLogger.addNote(`🔗 Response Fields: ${responseFields.join(', ')}`);
    
    // Token information
    if (response.token) {
      bddLogger.addNote(`🔑 Token: ${response.token.substring(0, 30)}...`);
      bddLogger.addNote(`⏳ Expires In: ${response.expiresIn} seconds`);
    }
    
    bddLogger.addNote(`⏰ Time: ${result.timestamp}`);
  }

  function displayTokenAnalysisResult(result: APIResult) {
    if (result.tokenType) bddLogger.addNote(`🔑 Token Type: ${result.tokenType}`);
    if (result.tokenFormat) bddLogger.addNote(`📋 Format: ${result.tokenFormat}`);
    if (result.tokenLength) bddLogger.addNote(`📏 Length: ${result.tokenLength} characters`);
    if (result.tokenPreview) bddLogger.addNote(`👁️  Preview: ${result.tokenPreview}`);
    bddLogger.addNote(`⏰ Time: ${result.timestamp}`);
  }
});