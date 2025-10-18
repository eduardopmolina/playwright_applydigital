# API Testing Guide: Login Authentication Flow

## Overview
This guide demonstrates how to intercept, monitor, and validate API requests during the login and signup flow on AutomationExercise.com. Using Playwright's network interception capabilities, we can capture and analyze authentication API calls in real-time.

## Table of Contents
- [Network Interception Fundamentals](#network-interception-fundamentals)
- [Login API Monitoring](#login-api-monitoring)
- [Signup API Monitoring](#signup-api-monitoring)
- [API Response Validation](#api-response-validation)
- [Implementation Examples](#implementation-examples)
- [Debugging and Troubleshooting](#debugging-and-troubleshooting)

---

## Network Interception Fundamentals

### Basic Network Monitoring Setup
```typescript
// Enable request/response logging
await page.route('**/*', (route) => {
  const request = route.request();
  console.log(`${request.method()} ${request.url()}`);
  route.continue();
});

// Listen to all network responses
page.on('response', response => {
  console.log(`${response.status()} ${response.url()}`);
});
```

### Filtering Login-Related Requests
```typescript
// Monitor only authentication-related endpoints
await page.route('**/login**', (route) => {
  const request = route.request();
  console.log('Login API Request:', {
    method: request.method(),
    url: request.url(),
    headers: request.headers(),
    postData: request.postData()
  });
  route.continue();
});

await page.route('**/signup**', (route) => {
  const request = route.request();
  console.log('Signup API Request:', {
    method: request.method(),
    url: request.url(),
    headers: request.headers(),
    postData: request.postData()
  });
  route.continue();
});
```

---

## Login API Monitoring

### Complete Login Flow with API Capture

```typescript
import { test, expect } from '@playwright/test';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';

test.describe('Login API Monitoring', () => {
  
  test('Capture and validate login API requests', async ({ page }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);
    
    // Storage for captured API data
    const apiRequests: any[] = [];
    const apiResponses: any[] = [];
    
    // Set up network interception
    await page.route('**/*', async (route) => {
      const request = route.request();
      
      // Capture all requests
      apiRequests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      });
      
      // Continue with the request
      const response = await route.fetch();
      
      // Capture response data
      if (request.url().includes('login') || request.url().includes('signin')) {
        const responseBody = await response.text();
        apiResponses.push({
          status: response.status(),
          statusText: response.statusText(),
          url: response.url(),
          headers: response.headers(),
          body: responseBody,
          timestamp: new Date().toISOString()
        });
        
        console.log('🔍 LOGIN API RESPONSE:', {
          status: response.status(),
          url: response.url(),
          body: responseBody.substring(0, 200) + '...'
        });
      }
      
      route.fulfill({ response });
    });
    
    // Navigate to login page
    await home.goto('/');
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    
    // Perform login with test credentials
    const email = 'testuser@example.com';
    const password = 'testpassword';
    
    console.log('📝 Attempting login with:', { email, password });
    
    await login.login(email, password);
    
    // Wait for potential API calls to complete
    await page.waitForTimeout(2000);
    
    // Analyze captured data
    console.log('📊 API ANALYSIS RESULTS:');
    console.log('Total requests captured:', apiRequests.length);
    console.log('Login-related responses:', apiResponses.length);
    
    // Filter login-specific requests
    const loginRequests = apiRequests.filter(req => 
      req.url.includes('login') || 
      req.url.includes('signin') ||
      req.url.includes('authenticate')
    );
    
    console.log('🔐 LOGIN REQUESTS FOUND:', loginRequests.length);
    loginRequests.forEach((req, index) => {
      console.log(`Request ${index + 1}:`, {
        method: req.method,
        url: req.url,
        hasPostData: !!req.postData,
        timestamp: req.timestamp
      });
    });
    
    // Validate API responses
    apiResponses.forEach((response, index) => {
      console.log(`Response ${index + 1}:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        hasBody: !!response.body,
        timestamp: response.timestamp
      });
    });
  });
});
```

---

## Signup API Monitoring

### Capture Signup Flow with Network Analysis

```typescript
test('Monitor signup API calls and responses', async ({ page }) => {
  const home = new HomePage(page);
  const login = new LoginPage(page);
  
  // Network monitoring setup
  const networkActivity = {
    requests: [] as any[],
    responses: [] as any[],
    errors: [] as any[]
  };
  
  // Comprehensive network listener
  page.on('request', request => {
    networkActivity.requests.push({
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType(),
      headers: request.headers(),
      postData: request.postData(),
      timestamp: Date.now()
    });
    
    if (request.url().includes('signup') || request.url().includes('register')) {
      console.log('🚀 SIGNUP REQUEST DETECTED:', {
        method: request.method(),
        url: request.url(),
        postData: request.postData()
      });
    }
  });
  
  page.on('response', async response => {
    networkActivity.responses.push({
      status: response.status(),
      statusText: response.statusText(),
      url: response.url(),
      headers: response.headers(),
      timestamp: Date.now()
    });
    
    if (response.url().includes('signup') || response.url().includes('register')) {
      const responseText = await response.text().catch(() => 'Unable to read response body');
      console.log('✅ SIGNUP RESPONSE:', {
        status: response.status(),
        statusText: response.statusText(),
        url: response.url(),
        bodyPreview: responseText.substring(0, 150) + '...'
      });
    }
  });
  
  page.on('requestfailed', request => {
    networkActivity.errors.push({
      method: request.method(),
      url: request.url(),
      failure: request.failure()?.errorText,
      timestamp: Date.now()
    });
    
    console.error('❌ REQUEST FAILED:', {
      url: request.url(),
      error: request.failure()?.errorText
    });
  });
  
  // Execute signup flow
  await home.goto('/');
  await page.getByRole('link', { name: ' Signup / Login' }).click();
  
  // Generate test data
  const testUser = {
    name: `TestUser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`
  };
  
  console.log('👤 Creating user:', testUser);
  
  await login.signup(testUser.name, testUser.email);
  
  // Wait for network activity to complete
  await page.waitForTimeout(3000);
  
  // Generate comprehensive network report
  console.log('\n📈 NETWORK ACTIVITY SUMMARY:');
  console.log('─'.repeat(50));
  console.log(`Total Requests: ${networkActivity.requests.length}`);
  console.log(`Total Responses: ${networkActivity.responses.length}`);
  console.log(`Failed Requests: ${networkActivity.errors.length}`);
  
  // Analyze signup-specific activity
  const signupRequests = networkActivity.requests.filter(req => 
    req.url.toLowerCase().includes('signup') || 
    req.url.toLowerCase().includes('register') ||
    req.url.toLowerCase().includes('account')
  );
  
  const signupResponses = networkActivity.responses.filter(res => 
    res.url.toLowerCase().includes('signup') || 
    res.url.toLowerCase().includes('register') ||
    res.url.toLowerCase().includes('account')
  );
  
  console.log('\n🔍 SIGNUP-SPECIFIC ANALYSIS:');
  console.log('─'.repeat(50));
  console.log(`Signup Requests: ${signupRequests.length}`);
  console.log(`Signup Responses: ${signupResponses.length}`);
  
  signupRequests.forEach((req, i) => {
    console.log(`\nSignup Request ${i + 1}:`);
    console.log(`  Method: ${req.method}`);
    console.log(`  URL: ${req.url}`);
    console.log(`  Resource Type: ${req.resourceType}`);
    if (req.postData) {
      console.log(`  POST Data: ${req.postData.substring(0, 100)}...`);
    }
  });
  
  signupResponses.forEach((res, i) => {
    console.log(`\nSignup Response ${i + 1}:`);
    console.log(`  Status: ${res.status} ${res.statusText}`);
    console.log(`  URL: ${res.url}`);
  });
});
```

---

## API Response Validation

### Structured Response Validation

```typescript
interface LoginApiResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  errors?: string[];
}

test('Validate login API response structure', async ({ page }) => {
  const home = new HomePage(page);
  
  let loginApiResponse: any = null;
  
  // Intercept and capture login API response
  await page.route('**/login**', async (route) => {
    const response = await route.fetch();
    
    if (response.status() !== 200) {
      console.warn(`⚠️  Login API returned status: ${response.status()}`);
    }
    
    try {
      const responseText = await response.text();
      loginApiResponse = JSON.parse(responseText);
      
      console.log('📦 LOGIN API RESPONSE CAPTURED:');
      console.log(JSON.stringify(loginApiResponse, null, 2));
      
      // Validate response structure
      validateLoginResponse(loginApiResponse);
      
    } catch (error) {
      console.error('❌ Failed to parse login response as JSON:', error);
      console.log('Raw response:', await response.text());
    }
    
    route.fulfill({ response });
  });
  
  // Perform login
  await home.goto('/');
  await page.getByRole('link', { name: ' Signup / Login' }).click();
  
  await page.fill('[data-qa="login-email"]', 'test@example.com');
  await page.fill('[data-qa="login-password"]', 'password123');
  await page.click('[data-qa="login-button"]');
  
  // Wait for API call
  await page.waitForTimeout(2000);
  
  // Assertions based on captured API response
  if (loginApiResponse) {
    expect(typeof loginApiResponse.success).toBe('boolean');
    expect(typeof loginApiResponse.message).toBe('string');
    
    if (loginApiResponse.success) {
      console.log('✅ Login successful via API');
      // Additional successful login validations
      if (loginApiResponse.token) {
        expect(typeof loginApiResponse.token).toBe('string');
        console.log('🔑 Auth token received:', loginApiResponse.token.substring(0, 20) + '...');
      }
    } else {
      console.log('❌ Login failed via API:', loginApiResponse.message);
      // Validate error structure
      expect(loginApiResponse.errors).toBeDefined();
    }
  } else {
    console.log('ℹ️  No JSON API response captured - site may use form-based auth');
  }
});

function validateLoginResponse(response: any) {
  console.log('🔍 VALIDATING RESPONSE STRUCTURE:');
  
  const requiredFields = ['success', 'message'];
  const missingFields = requiredFields.filter(field => !(field in response));
  
  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields);
  } else {
    console.log('✅ All required fields present');
  }
  
  // Log field types
  Object.keys(response).forEach(key => {
    console.log(`  ${key}: ${typeof response[key]} = ${JSON.stringify(response[key])}`);
  });
}
```

---

## Implementation Examples

### Complete Test File: `login-api-monitoring.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import { faker } from '@faker-js/faker';

test.describe('Login API Monitoring & Validation', () => {
  
  test('End-to-end login with complete API monitoring', async ({ page, browserName }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);
    
    console.log(`🌐 Testing on: ${browserName}`);
    
    // Network monitoring state
    const networkMonitor = {
      allRequests: [] as any[],
      authRequests: [] as any[],
      authResponses: [] as any[],
      formSubmissions: [] as any[],
      redirects: [] as any[]
    };
    
    // Comprehensive request interceptor
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = request.url();
      const method = request.method();
      
      // Log all requests
      networkMonitor.allRequests.push({
        method,
        url,
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      });
      
      // Identify authentication-related requests
      const isAuthRequest = url.includes('login') || 
                           url.includes('signin') || 
                           url.includes('authenticate') ||
                           method === 'POST' && request.postData()?.includes('email');
      
      if (isAuthRequest) {
        const authData = {
          method,
          url,
          headers: request.headers(),
          postData: request.postData(),
          timestamp: new Date().toISOString()
        };
        
        networkMonitor.authRequests.push(authData);
        console.log('🔐 AUTH REQUEST:', authData);
      }
      
      // Track form submissions
      if (method === 'POST' && request.postData()) {
        networkMonitor.formSubmissions.push({
          url,
          postData: request.postData(),
          timestamp: new Date().toISOString()
        });
        console.log('📝 FORM SUBMISSION:', url);
      }
      
      // Continue request and capture response
      const response = await route.fetch();
      
      // Monitor auth responses
      if (isAuthRequest) {
        const responseBody = await response.text();
        const authResponse = {
          status: response.status(),
          statusText: response.statusText(),
          url: response.url(),
          headers: response.headers(),
          body: responseBody,
          timestamp: new Date().toISOString()
        };
        
        networkMonitor.authResponses.push(authResponse);
        console.log('✅ AUTH RESPONSE:', {
          status: response.status(),
          url: response.url(),
          bodyLength: responseBody.length
        });
      }
      
      // Track redirects
      if (response.status() >= 300 && response.status() < 400) {
        const redirectLocation = response.headers()['location'];
        networkMonitor.redirects.push({
          from: url,
          to: redirectLocation,
          status: response.status(),
          timestamp: new Date().toISOString()
        });
        console.log('🔄 REDIRECT:', `${url} -> ${redirectLocation}`);
      }
      
      route.fulfill({ response });
    });
    
    // Execute login flow
    console.log('🚀 Starting login flow...');
    
    await home.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);
    
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    await expect(page).toHaveURL(/\/login/);
    
    // Test with various scenarios
    const scenarios = [
      {
        name: 'Invalid credentials',
        email: 'invalid@example.com',
        password: 'wrongpassword',
        expectSuccess: false
      },
      {
        name: 'Empty credentials',
        email: '',
        password: '',
        expectSuccess: false
      },
      {
        name: 'Valid format test',
        email: faker.internet.email(),
        password: faker.internet.password(),
        expectSuccess: false // Assuming account doesn't exist
      }
    ];
    
    for (const scenario of scenarios) {
      console.log(`\n🧪 Testing scenario: ${scenario.name}`);
      
      // Clear previous data
      await page.fill('[data-qa="login-email"]', '');
      await page.fill('[data-qa="login-password"]', '');
      
      // Fill credentials
      await page.fill('[data-qa="login-email"]', scenario.email);
      await page.fill('[data-qa="login-password"]', scenario.password);
      
      // Reset monitoring for this scenario
      const preSubmissionRequests = networkMonitor.authRequests.length;
      const preSubmissionResponses = networkMonitor.authResponses.length;
      
      // Submit form
      await page.click('[data-qa="login-button"]');
      
      // Wait for network activity
      await page.waitForTimeout(3000);
      
      // Analyze results for this scenario
      const newRequests = networkMonitor.authRequests.length - preSubmissionRequests;
      const newResponses = networkMonitor.authResponses.length - preSubmissionResponses;
      
      console.log(`📊 Scenario results:`);
      console.log(`  New auth requests: ${newRequests}`);
      console.log(`  New auth responses: ${newResponses}`);
      
      // Check for error messages in UI
      const errorMessage = await page.locator('.alert-danger, .error, .text-danger').textContent().catch(() => null);
      if (errorMessage) {
        console.log(`  UI Error: ${errorMessage.trim()}`);
      }
      
      // Refresh page for next scenario
      if (scenario !== scenarios[scenarios.length - 1]) {
        await page.reload();
        await page.waitForSelector('[data-qa="login-email"]', { timeout: 5000 });
      }
    }
    
    // Final network analysis
    console.log('\n📈 FINAL NETWORK ANALYSIS:');
    console.log('═'.repeat(60));
    console.log(`Total requests: ${networkMonitor.allRequests.length}`);
    console.log(`Auth requests: ${networkMonitor.authRequests.length}`);
    console.log(`Auth responses: ${networkMonitor.authResponses.length}`);
    console.log(`Form submissions: ${networkMonitor.formSubmissions.length}`);
    console.log(`Redirects: ${networkMonitor.redirects.length}`);
    
    // Export monitoring data for analysis
    const monitoringReport = {
      testRun: {
        browser: browserName,
        timestamp: new Date().toISOString(),
        scenarios: scenarios.length
      },
      networkActivity: networkMonitor,
      summary: {
        totalRequests: networkMonitor.allRequests.length,
        authRequests: networkMonitor.authRequests.length,
        authResponses: networkMonitor.authResponses.length,
        formSubmissions: networkMonitor.formSubmissions.length,
        redirects: networkMonitor.redirects.length
      }
    };
    
    console.log('\n💾 MONITORING REPORT GENERATED');
    console.log(JSON.stringify(monitoringReport, null, 2));
  });
});
```

---

## Debugging and Troubleshooting

### Common API Monitoring Issues

1. **No API calls detected**
   ```typescript
   // Debug: Check if site uses AJAX or form submissions
   page.on('request', request => {
     console.log(`${request.method()} ${request.url()}`);
     if (request.postData()) {
       console.log('POST data:', request.postData());
     }
   });
   ```

2. **CORS or security restrictions**
   ```typescript
   // Handle CORS issues
   await page.route('**/*', (route) => {
     const response = route.fetch({
       headers: {
         ...route.request().headers(),
         'Access-Control-Allow-Origin': '*'
       }
     });
     route.fulfill({ response });
   });
   ```

3. **Response parsing errors**
   ```typescript
   // Safe response parsing
   page.on('response', async response => {
     if (response.url().includes('login')) {
       try {
         const text = await response.text();
         console.log('Raw response:', text);
         
         // Try JSON parse
         try {
           const json = JSON.parse(text);
           console.log('Parsed JSON:', json);
         } catch {
           console.log('Response is not JSON');
         }
       } catch (error) {
         console.log('Could not read response:', error);
       }
     }
   });
   ```

### Performance Monitoring Integration

```typescript
test('Login performance with API timing', async ({ page }) => {
  const performanceMetrics = {
    requestTimes: new Map(),
    responseTimes: new Map()
  };
  
  page.on('request', request => {
    performanceMetrics.requestTimes.set(request.url(), Date.now());
  });
  
  page.on('response', response => {
    const requestTime = performanceMetrics.requestTimes.get(response.url());
    if (requestTime) {
      const duration = Date.now() - requestTime;
      performanceMetrics.responseTimes.set(response.url(), duration);
      
      if (response.url().includes('login')) {
        console.log(`🕒 Login API took ${duration}ms`);
      }
    }
  });
  
  // ... rest of test
});
```

---

## Usage Commands

```bash
# Run login API monitoring tests
npx playwright test login-api-monitoring.spec.ts

# Run with debug output
npx playwright test login-api-monitoring.spec.ts --headed --debug

# Generate detailed report
npx playwright test login-api-monitoring.spec.ts --reporter=html

# Run on specific browser
npx playwright test login-api-monitoring.spec.ts --project=chromium-desktop
```

---

## Expected API Endpoints (AutomationExercise)

Based on common e-commerce patterns, monitor for:

- `POST /login` - User authentication
- `POST /signup` - User registration  
- `POST /register` - Account creation
- `GET /logout` - Session termination
- `POST /verify_login` - Login validation
- `GET /account_created` - Registration success
- `POST /authenticate` - Alternative auth endpoint

**Note**: AutomationExercise may use form-based authentication rather than AJAX APIs. This guide covers both scenarios with comprehensive network monitoring.

---

## Related Documentation

- [Test Cases: Main Page Objects](./test-cases-main-page-objects.md)
- [Copilot Instructions](./copilot-instructions.md)
- [Login Page Object Implementation](../pages/LoginPage.ts)
- [Playwright Network API Documentation](https://playwright.dev/docs/network)