# API Testing Guide

## Overview
This guide provides comprehensive documentation for API testing strategies and implementation in the Playwright test automation framework. It covers both REST API testing and network monitoring techniques for e-commerce applications.

## Table of Contents
- [API Testing Fundamentals](#api-testing-fundamentals)
- [Network Interception](#network-interception)
- [Authentication API Testing](#authentication-api-testing)
- [E-commerce API Patterns](#e-commerce-api-patterns)
- [Response Validation](#response-validation)
- [Performance Testing](#performance-testing)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## API Testing Fundamentals

### What is API Testing?
API (Application Programming Interface) testing involves testing the communication between different software components to ensure they work correctly together. In web applications, this typically means testing REST APIs that handle data exchange between frontend and backend systems.

### Why API Testing is Important
- **Faster Feedback**: API tests run faster than UI tests
- **Data Validation**: Ensure correct data flow and transformations
- **Integration Testing**: Verify component interactions
- **Security Testing**: Validate authentication and authorization
- **Performance Testing**: Monitor response times and throughput

### Types of API Testing
1. **Functional Testing**: Verify API behavior meets requirements
2. **Load Testing**: Test performance under various loads
3. **Security Testing**: Validate authentication, authorization, and data protection
4. **Integration Testing**: Test API interactions with other systems
5. **Contract Testing**: Ensure API contracts are maintained

---

## Network Interception

### Playwright Network Monitoring
Playwright provides powerful network interception capabilities that allow you to:
- Monitor all network requests and responses
- Modify requests before they're sent
- Mock responses for testing
- Capture API data for validation

### Basic Network Interception Setup
```typescript
import { test, expect } from '@playwright/test';

test('Basic API monitoring', async ({ page }) => {
  // Listen to all network requests
  page.on('request', request => {
    console.log(`>> ${request.method()} ${request.url()}`);
  });

  // Listen to all network responses
  page.on('response', response => {
    console.log(`<< ${response.status()} ${response.url()}`);
  });

  // Navigate and interact with the page
  await page.goto('https://example.com');
});
```

### Advanced Request Filtering
```typescript
test('Filter specific API endpoints', async ({ page }) => {
  // Monitor only API calls to specific endpoints
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/') || url.includes('/login') || url.includes('/signup')) {
      console.log('API Request:', {
        method: request.method(),
        url: url,
        headers: request.headers(),
        postData: request.postData()
      });
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('/login') || url.includes('/signup')) {
      const responseBody = await response.text().catch(() => 'Could not read body');
      console.log('API Response:', {
        status: response.status(),
        url: url,
        headers: response.headers(),
        body: responseBody.substring(0, 500) + '...'
      });
    }
  });
});
```

---

## Authentication API Testing

### Login API Monitoring
```typescript
test('Monitor login API flow', async ({ page }) => {
  const loginData: any[] = [];
  
  // Intercept login-related requests
  await page.route('**/login**', async (route) => {
    const request = route.request();
    const postData = request.postData();
    
    console.log('Login Request Intercepted:', {
      method: request.method(),
      url: request.url(),
      postData: postData
    });
    
    loginData.push({
      type: 'request',
      method: request.method(),
      url: request.url(),
      data: postData,
      timestamp: new Date().toISOString()
    });
    
    // Continue with the original request
    const response = await route.fetch();
    
    // Capture response
    const responseText = await response.text();
    loginData.push({
      type: 'response',
      status: response.status(),
      statusText: response.statusText(),
      body: responseText,
      timestamp: new Date().toISOString()
    });
    
    console.log('Login Response:', {
      status: response.status(),
      body: responseText.substring(0, 200) + '...'
    });
    
    route.fulfill({ response });
  });

  // Perform login
  await page.goto('/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.click('#login-button');
  
  // Wait for API calls to complete
  await page.waitForTimeout(2000);
  
  // Validate captured data
  expect(loginData.length).toBeGreaterThan(0);
  console.log('Captured login data:', loginData);
});
```

### Session Management Testing
```typescript
test('Validate session management', async ({ page }) => {
  let authToken = '';
  
  // Capture authentication token
  page.on('response', async response => {
    if (response.url().includes('/login')) {
      try {
        const responseData = await response.json();
        if (responseData.token) {
          authToken = responseData.token;
          console.log('Auth token captured:', authToken);
        }
      } catch (error) {
        console.log('Response not JSON or no token found');
      }
    }
  });
  
  // Monitor subsequent requests for token usage
  page.on('request', request => {
    const authHeader = request.headers()['authorization'];
    if (authHeader && authToken) {
      console.log('Request uses auth token:', authHeader.includes(authToken));
    }
  });
  
  // Perform login and subsequent actions
  await page.goto('/login');
  // ... login steps ...
  await page.goto('/dashboard');
  
  // Validate token was used
  expect(authToken).toBeTruthy();
});
```

---

## E-commerce API Patterns

### Shopping Cart API Testing
```typescript
test('Monitor shopping cart operations', async ({ page }) => {
  const cartOperations: any[] = [];
  
  // Monitor cart-related API calls
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/cart') || url.includes('/add-to-cart') || url.includes('/update-cart')) {
      cartOperations.push({
        operation: 'request',
        method: request.method(),
        url: url,
        data: request.postData(),
        timestamp: Date.now()
      });
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/cart') || url.includes('/add-to-cart') || url.includes('/update-cart')) {
      const responseData = await response.text().catch(() => 'Could not read response');
      cartOperations.push({
        operation: 'response',
        status: response.status(),
        url: url,
        data: responseData,
        timestamp: Date.now()
      });
    }
  });
  
  // Simulate shopping flow
  await page.goto('/products');
  await page.click('.add-to-cart-button');
  await page.goto('/cart');
  await page.click('.update-quantity');
  
  // Analyze cart operations
  const requests = cartOperations.filter(op => op.operation === 'request');
  const responses = cartOperations.filter(op => op.operation === 'response');
  
  console.log('Cart API Summary:', {
    totalRequests: requests.length,
    totalResponses: responses.length,
    operations: cartOperations
  });
});
```

### Product Search API Testing
```typescript
test('Monitor product search API', async ({ page }) => {
  const searchQueries: any[] = [];
  
  // Intercept search API calls
  await page.route('**/search**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const searchTerm = url.searchParams.get('q') || url.searchParams.get('query');
    
    console.log('Search API called:', {
      searchTerm: searchTerm,
      url: request.url(),
      method: request.method()
    });
    
    searchQueries.push({
      searchTerm: searchTerm,
      url: request.url(),
      timestamp: Date.now()
    });
    
    const response = await route.fetch();
    const results = await response.json();
    
    console.log('Search results:', {
      resultsCount: results.length || results.total || 'unknown',
      firstResult: results[0] || results.items?.[0] || 'none'
    });
    
    route.fulfill({ response });
  });
  
  // Perform searches
  await page.goto('/');
  await page.fill('#search-input', 'laptop');
  await page.press('#search-input', 'Enter');
  await page.waitForTimeout(1000);
  
  // Validate search functionality
  expect(searchQueries.length).toBeGreaterThan(0);
});
```

---

## Response Validation

### JSON Response Validation
```typescript
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

test('Validate API response structure', async ({ page }) => {
  let apiResponse: ApiResponse | null = null;
  
  // Intercept and validate API responses
  await page.route('**/api/**', async (route) => {
    const response = await route.fetch();
    
    try {
      const responseData = await response.json();
      apiResponse = responseData;
      
      // Validate response structure
      expect(typeof responseData.success).toBe('boolean');
      expect(typeof responseData.message).toBe('string');
      
      if (responseData.success) {
        console.log('✅ API call successful:', responseData.message);
      } else {
        console.log('❌ API call failed:', responseData.message);
        if (responseData.errors) {
          console.log('Errors:', responseData.errors);
        }
      }
      
    } catch (error) {
      console.log('Response is not valid JSON');
    }
    
    route.fulfill({ response });
  });
  
  // Trigger API calls
  await page.goto('/dashboard');
  await page.waitForTimeout(2000);
  
  // Validate captured response
  if (apiResponse) {
    expect(apiResponse).toHaveProperty('success');
    expect(apiResponse).toHaveProperty('message');
  }
});
```

### Status Code Validation
```typescript
test('Monitor and validate HTTP status codes', async ({ page }) => {
  const statusCodes: { [key: string]: number } = {};
  
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    
    // Count status codes
    statusCodes[status] = (statusCodes[status] || 0) + 1;
    
    // Log important status codes
    if (status >= 400) {
      console.log(`❌ HTTP ${status} error: ${url}`);
    } else if (status >= 300) {
      console.log(`🔄 HTTP ${status} redirect: ${url}`);
    } else if (status === 200) {
      console.log(`✅ HTTP 200 success: ${url}`);
    }
  });
  
  // Navigate and interact
  await page.goto('/');
  await page.click('a[href="/products"]');
  await page.waitForLoadState('networkidle');
  
  // Report status code summary
  console.log('HTTP Status Code Summary:', statusCodes);
  
  // Validate no critical errors
  expect(statusCodes['500'] || 0).toBe(0); // No server errors
  expect(statusCodes['404'] || 0).toBeLessThan(5); // Minimal not found errors
});
```

---

## Performance Testing

### Response Time Monitoring
```typescript
test('Monitor API response times', async ({ page }) => {
  const performanceMetrics: any[] = [];
  
  page.on('request', request => {
    // Mark request start time
    (request as any).startTime = Date.now();
  });
  
  page.on('response', response => {
    const request = response.request();
    const startTime = (request as any).startTime;
    
    if (startTime) {
      const duration = Date.now() - startTime;
      const metric = {
        url: response.url(),
        method: request.method(),
        status: response.status(),
        duration: duration,
        size: response.headers()['content-length'] || 'unknown'
      };
      
      performanceMetrics.push(metric);
      
      // Log slow requests
      if (duration > 2000) {
        console.log(`🐌 Slow request (${duration}ms):`, response.url());
      } else if (duration > 1000) {
        console.log(`⚠️  Moderate request (${duration}ms):`, response.url());
      }
    }
  });
  
  // Execute test scenario
  await page.goto('/');
  await page.click('[href="/products"]');
  await page.waitForLoadState('networkidle');
  
  // Analyze performance
  const apiRequests = performanceMetrics.filter(m => 
    m.url.includes('/api/') || m.method === 'POST'
  );
  
  if (apiRequests.length > 0) {
    const avgResponseTime = apiRequests.reduce((sum, req) => sum + req.duration, 0) / apiRequests.length;
    const maxResponseTime = Math.max(...apiRequests.map(req => req.duration));
    
    console.log('API Performance Summary:', {
      totalApiRequests: apiRequests.length,
      averageResponseTime: `${avgResponseTime.toFixed(2)}ms`,
      maxResponseTime: `${maxResponseTime}ms`,
      requestsOver1s: apiRequests.filter(req => req.duration > 1000).length
    });
    
    // Performance assertions
    expect(avgResponseTime).toBeLessThan(1000); // Average under 1 second
    expect(maxResponseTime).toBeLessThan(5000); // Max under 5 seconds
  }
});
```

### Throughput Testing
```typescript
test('Test API throughput', async ({ page }) => {
  const startTime = Date.now();
  let requestCount = 0;
  let responseCount = 0;
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      requestCount++;
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      responseCount++;
    }
  });
  
  // Simulate heavy usage
  await page.goto('/');
  
  // Rapid navigation and interactions
  for (let i = 0; i < 5; i++) {
    await page.goto('/products');
    await page.waitForTimeout(100);
    await page.goto('/cart');
    await page.waitForTimeout(100);
    await page.goto('/account');
    await page.waitForTimeout(100);
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000; // Convert to seconds
  
  console.log('Throughput Analysis:', {
    duration: `${duration}s`,
    totalRequests: requestCount,
    totalResponses: responseCount,
    requestsPerSecond: (requestCount / duration).toFixed(2),
    responsesPerSecond: (responseCount / duration).toFixed(2)
  });
});
```

---

## Error Handling

### Network Error Detection
```typescript
test('Monitor and handle network errors', async ({ page }) => {
  const networkErrors: any[] = [];
  
  // Capture failed requests
  page.on('requestfailed', request => {
    const error = {
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText,
      timestamp: new Date().toISOString()
    };
    
    networkErrors.push(error);
    console.log('❌ Request failed:', error);
  });
  
  // Monitor error responses
  page.on('response', response => {
    if (response.status() >= 400) {
      const error = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      };
      
      networkErrors.push(error);
      console.log('❌ HTTP Error:', error);
    }
  });
  
  // Execute test that might encounter errors
  await page.goto('/');
  
  // Try to access potentially problematic endpoints
  await page.evaluate(() => {
    // Simulate API calls that might fail
    fetch('/api/nonexistent-endpoint').catch(() => {});
    fetch('/api/unauthorized').catch(() => {});
  });
  
  await page.waitForTimeout(2000);
  
  // Report errors
  console.log('Error Summary:', {
    totalErrors: networkErrors.length,
    errors: networkErrors
  });
});
```

### Retry Logic Testing
```typescript
test('Test API retry mechanisms', async ({ page }) => {
  let attemptCount = 0;
  
  // Intercept and simulate failures
  await page.route('**/api/flaky-endpoint**', async (route) => {
    attemptCount++;
    
    console.log(`API attempt #${attemptCount}`);
    
    if (attemptCount < 3) {
      // Simulate failure for first 2 attempts
      console.log('Simulating API failure');
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server Error' })
      });
    } else {
      // Succeed on 3rd attempt
      console.log('API call succeeds');
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: 'Success after retry' })
      });
    }
  });
  
  // Trigger the flaky API call
  await page.goto('/test-retry');
  
  // Validate retry behavior
  expect(attemptCount).toBe(3); // Should have retried 3 times
});
```

---

## Best Practices

### 1. Organize API Tests
```typescript
// Group related API tests together
test.describe('User Authentication APIs', () => {
  test('Login API validation', async ({ page }) => {
    // Login test implementation
  });
  
  test('Logout API validation', async ({ page }) => {
    // Logout test implementation
  });
  
  test('Token refresh API validation', async ({ page }) => {
    // Token refresh test implementation
  });
});

test.describe('E-commerce APIs', () => {
  test('Product search API', async ({ page }) => {
    // Product search test implementation
  });
  
  test('Shopping cart API', async ({ page }) => {
    // Cart test implementation
  });
});
```

### 2. Use Data-Driven Testing
```typescript
const testUsers = [
  { email: 'valid@example.com', password: 'validpass', expectSuccess: true },
  { email: 'invalid@example.com', password: 'wrongpass', expectSuccess: false },
  { email: '', password: '', expectSuccess: false },
];

testUsers.forEach(user => {
  test(`Login with ${user.email}`, async ({ page }) => {
    // Test implementation using user data
  });
});
```

### 3. Create Reusable Utilities
```typescript
// api-helpers.ts
export class ApiTestHelper {
  static async captureApiRequests(page: Page, urlPattern: string) {
    const requests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes(urlPattern)) {
        requests.push({
          method: request.method(),
          url: request.url(),
          data: request.postData(),
          timestamp: Date.now()
        });
      }
    });
    
    return requests;
  }
  
  static async validateJsonResponse(response: Response) {
    try {
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      return data;
    } catch (error) {
      throw new Error('Response is not valid JSON');
    }
  }
}
```

### 4. Environment Configuration
```typescript
// test-config.ts
export const config = {
  baseUrl: process.env.BASE_URL || 'https://localhost:3000',
  apiUrl: process.env.API_URL || 'https://localhost:3000/api',
  timeout: parseInt(process.env.API_TIMEOUT || '5000'),
};

// Use in tests
test('API test with environment config', async ({ page }) => {
  await page.goto(config.baseUrl);
  // Test implementation
});
```

### 5. Comprehensive Logging
```typescript
class ApiLogger {
  static logRequest(request: Request) {
    console.log(`📤 ${request.method()} ${request.url()}`, {
      headers: request.headers(),
      data: request.postData()?.substring(0, 200) + '...',
      timestamp: new Date().toISOString()
    });
  }
  
  static logResponse(response: Response) {
    console.log(`📥 ${response.status()} ${response.url()}`, {
      status: response.status(),
      statusText: response.statusText(),
      timestamp: new Date().toISOString()
    });
  }
}

test('API test with comprehensive logging', async ({ page }) => {
  page.on('request', ApiLogger.logRequest);
  page.on('response', ApiLogger.logResponse);
  
  // Test implementation
});
```

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install
      
      - name: Run API tests
        run: npx playwright test --grep "API"
        env:
          BASE_URL: ${{ secrets.TEST_BASE_URL }}
          API_URL: ${{ secrets.TEST_API_URL }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: api-test-results
          path: test-results/
```

---

## Troubleshooting Common Issues

### 1. CORS Issues
```typescript
// Handle CORS in tests
await page.addInitScript(() => {
  delete window.Response.prototype.redirect;
});
```

### 2. Authentication Tokens
```typescript
// Preserve auth tokens across requests
let globalAuthToken = '';

page.on('response', async response => {
  if (response.url().includes('/login')) {
    const data = await response.json().catch(() => ({}));
    if (data.token) {
      globalAuthToken = data.token;
    }
  }
});

// Use token in subsequent requests
await page.setExtraHTTPHeaders({
  'Authorization': `Bearer ${globalAuthToken}`
});
```

### 3. Rate Limiting
```typescript
// Add delays to handle rate limiting
test('API test with rate limiting', async ({ page }) => {
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => fetch('/api/endpoint'));
    await page.waitForTimeout(1000); // 1 second delay
  }
});
```

---

## Related Files

- [Login API Monitoring Implementation](./api-testing-login.md)
- [Test Cases Documentation](../.github/test-cases-main-page-objects.md)
- [Copilot Instructions](../.github/copilot-instructions.md)
- [Page Object Models](../pages/)

---

*This guide provides comprehensive coverage of API testing strategies in Playwright. For specific implementation examples, refer to the test files in the `tests/` directory.*