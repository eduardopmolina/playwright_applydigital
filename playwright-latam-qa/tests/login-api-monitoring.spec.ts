import { test, expect } from '@playwright/test';
import HomePage from '../pages/HomePage';
import { faker } from '@faker-js/faker';

// Helper function to print network analysis summary
function printDetailedNetworkAnalysis(networkData: any) {
  console.log(`\n🔍 AUTH REQUESTS: ${networkData.authRequests.length}`);
  console.log(`📥 RESPONSES: ${networkData.responses.length}`);
  console.log(`❌ ERRORS: ${networkData.errors.length}`);
}

test.describe('Login API Monitoring & Network Analysis', () => {
  
  test('Monitor login API calls and network activity', async ({ page, browserName }) => {
    const home = new HomePage(page);
    
    console.log(`🌐 Running API monitoring test on: ${browserName}`);
    
    // Network monitoring storage
    const networkData = {
      allRequests: [] as any[],
      authRequests: [] as any[],
      formSubmissions: [] as any[],
      responses: [] as any[],
      errors: [] as any[]
    };
    
    // Set up comprehensive network interception
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = request.url();
      const method = request.method();
      const postData = request.postData();
      
      // Capture all requests
      const requestData = {
        method,
        url,
        headers: request.headers(),
        postData,
        resourceType: request.resourceType(),
        timestamp: new Date().toISOString()
      };
      
      networkData.allRequests.push(requestData);
      
      // Identify authentication-related requests
      const isAuthRelated = url.includes('login') || 
                           url.includes('signin') || 
                           url.includes('authenticate') ||
                           url.includes('verify') ||
                           (method === 'POST' && postData?.includes('email'));
      
      if (isAuthRelated) {
        networkData.authRequests.push(requestData);
        console.log('🔐 AUTH REQUEST CAPTURED:', {
          method,
          url: url.substring(url.lastIndexOf('/') + 1),
          hasPostData: !!postData,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      // Track form submissions
      if (method === 'POST' && postData) {
        networkData.formSubmissions.push({
          url,
          postData: postData.substring(0, 100) + (postData.length > 100 ? '...' : ''),
          timestamp: new Date().toISOString()
        });
        console.log('📝 FORM SUBMISSION DETECTED:', {
          url: url.substring(url.lastIndexOf('/') + 1),
          dataLength: postData.length,
          preview: postData.substring(0, 50) + '...'
        });
      }
      
      try {
        // Continue request and capture response
        const response = await route.fetch();
        
        // Capture response data for auth-related calls
        if (isAuthRelated) {
          let responseBody = '';
          try {
            responseBody = await response.text();
          } catch (e) {
            console.warn('Could not read response body:', e);
            responseBody = 'Could not read response body';
          }
          
          const responseData = {
            status: response.status(),
            statusText: response.statusText(),
            url: response.url(),
            headers: response.headers(),
            body: responseBody.substring(0, 200) + (responseBody.length > 200 ? '...' : ''),
            timestamp: new Date().toISOString()
          };
          
          networkData.responses.push(responseData);
          console.log('✅ AUTH RESPONSE:', {
            status: response.status(),
            statusText: response.statusText(),
            url: response.url().substring(response.url().lastIndexOf('/') + 1),
            bodyLength: responseBody.length
          });
        }
        
        route.fulfill({ response });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        networkData.errors.push({
          url,
          method,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
        console.error('❌ REQUEST ERROR:', {
          url: url.substring(url.lastIndexOf('/') + 1),
          error: errorMessage
        });
        route.abort();
      }
    });
    
    // Monitor failed requests
    page.on('requestfailed', request => {
      networkData.errors.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      });
      
      console.error('💥 REQUEST FAILED:', {
        url: request.url().substring(request.url().lastIndexOf('/') + 1),
        error: request.failure()?.errorText
      });
    });
    
    // Execute login flow with network monitoring
    console.log('\n🚀 Starting monitored login flow...');
    
    // 1. Navigate to homepage
    await home.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);
    console.log('📍 Homepage loaded');
    
    // 2. Navigate to login page
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    await expect(page).toHaveURL(/\/login/);
    console.log('📍 Login page loaded');
    
    // 3. Test multiple login scenarios to capture different API responses
    const loginScenarios = [
      {
        name: 'Empty Credentials Test',
        email: '',
        password: '',
        description: 'Test validation with empty fields'
      },
      {
        name: 'Invalid Email Format Test', 
        email: 'invalid-email',
        password: 'somepassword',
        description: 'Test email format validation'
      },
      {
        name: 'Non-existent Account Test',
        email: faker.internet.email(),
        password: faker.internet.password(),
        description: 'Test login with non-existent account'
      },
      {
        name: 'SQL Injection Test',
        email: "test'; DROP TABLE users; --",
        password: 'password',
        description: 'Test security against SQL injection'
      }
    ];
    
    for (const [index, scenario] of loginScenarios.entries()) {
      console.log(`\n🧪 Scenario ${index + 1}: ${scenario.name}`);
      console.log(`   Description: ${scenario.description}`);
      
      // Clear previous form data
      await page.fill('[data-qa="login-email"]', '');
      await page.fill('[data-qa="login-password"]', '');
      
      // Record network state before this scenario
      const preScenarioRequests = networkData.authRequests.length;
      const preScenarioResponses = networkData.responses.length;
      
      // Fill login form
      await page.fill('[data-qa="login-email"]', scenario.email);
      await page.fill('[data-qa="login-password"]', scenario.password);
      
      console.log(`   Credentials: ${scenario.email} / ${scenario.password}`);
      
      // Submit form and monitor network activity
      await page.click('[data-qa="login-button"]');
      
      // Wait for potential network activity
      await page.waitForTimeout(2000);
      
      // Analyze network activity for this scenario
      const newRequests = networkData.authRequests.length - preScenarioRequests;
      const newResponses = networkData.responses.length - preScenarioResponses;
      
      console.log(`   📊 Network Activity:`);
      console.log(`     New requests: ${newRequests}`);
      console.log(`     New responses: ${newResponses}`);
      
      // Check for UI error messages
      const errorElements = [
        '.alert-danger',
        '.error-message', 
        '.text-danger',
        '.alert.alert-danger',
        '[data-qa="error"]'
      ];
      
      for (const selector of errorElements) {
        const errorText = await page.locator(selector).textContent().catch(() => null);
        if (errorText?.trim()) {
          console.log(`   ⚠️  UI Error: ${errorText.trim()}`);
        }
      }
      
      // Check if still on login page or redirected
      const currentUrl = page.url();
      if (currentUrl.includes('login')) {
        console.log(`   📍 Remained on login page`);
      } else {
        console.log(`   📍 Redirected to: ${currentUrl}`);
      }
      
      // Refresh page for next scenario (except last one)
      if (index < loginScenarios.length - 1) {
        await page.reload();
        await page.waitForSelector('[data-qa="login-email"]', { timeout: 5000 });
      }
    }
    
    // Generate comprehensive network analysis report
    console.log('\n📈 COMPREHENSIVE NETWORK ANALYSIS');
    console.log('═'.repeat(80));
    
    console.log(`\n🔢 SUMMARY STATISTICS:`);
    console.log(`   Total Requests: ${networkData.allRequests.length}`);
    console.log(`   Auth-Related Requests: ${networkData.authRequests.length}`);
    console.log(`   Form Submissions: ${networkData.formSubmissions.length}`);
    console.log(`   Responses Captured: ${networkData.responses.length}`);
    console.log(`   Network Errors: ${networkData.errors.length}`);
    
    // Analyze request types
    const requestsByType = networkData.allRequests.reduce((acc, req) => {
      acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`\n📊 REQUEST TYPES:`);
    for (const [type, count] of Object.entries(requestsByType)) {
      console.log(`   ${type}: ${count}`);
    }
    
    // Analyze HTTP methods for auth requests
    const authMethods = networkData.authRequests.reduce((acc, req) => {
      acc[req.method] = (acc[req.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`\n🔐 AUTH REQUEST METHODS:`);
    for (const [method, count] of Object.entries(authMethods)) {
      console.log(`   ${method}: ${count}`);
    }
    
    // Analyze response status codes
    const statusCodes = networkData.responses.reduce((acc, res) => {
      acc[res.status] = (acc[res.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`\n📋 RESPONSE STATUS CODES:`);
    for (const [status, count] of Object.entries(statusCodes)) {
      console.log(`   ${status}: ${count}`);
    }
    
    // Print detailed network analysis
    printDetailedNetworkAnalysis(networkData);
    
    // Export data for further analysis
    const networkReport = {
      testMetadata: {
        browser: browserName,
        timestamp: new Date().toISOString(),
        scenariosExecuted: loginScenarios.length,
        testDuration: 'Approx 30-60 seconds'
      },
      statistics: {
        totalRequests: networkData.allRequests.length,
        authRequests: networkData.authRequests.length,
        formSubmissions: networkData.formSubmissions.length,
        responses: networkData.responses.length,
        errors: networkData.errors.length
      },
      analysis: {
        requestsByType,
        authMethods,
        statusCodes
      },
      rawData: {
        authRequests: networkData.authRequests,
        responses: networkData.responses,
        errors: networkData.errors
      }
    };
    
    console.log('\n💾 NETWORK MONITORING REPORT GENERATED');
    console.log('─'.repeat(80));
    console.log('Report can be exported to JSON for further analysis:');
    console.log(JSON.stringify(networkReport, null, 2));
    
    // Final assertions
    expect(networkData.allRequests.length).toBeGreaterThan(0);
    console.log('\n✅ Network monitoring test completed successfully');
  });
  
  test('Monitor signup API with user registration flow', async ({ page }) => {
    const home = new HomePage(page);
    
    console.log('🚀 Starting signup API monitoring test...');
    
    // Track signup-specific network activity
    const signupNetworkData = {
      requests: [] as any[],
      responses: [] as any[],
      formData: [] as any[]
    };
    
    // Intercept signup-related requests
    await page.route('**/signup**', async (route) => {
      const request = route.request();
      
      const requestData = {
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      };
      
      signupNetworkData.requests.push(requestData);
      
      console.log('📝 SIGNUP REQUEST:', {
        method: request.method(),
        url: request.url(),
        hasPostData: !!request.postData()
      });
      
      const response = await route.fetch();
      
      const responseText = await response.text();
      signupNetworkData.responses.push({
        status: response.status(),
        statusText: response.statusText(),
        body: responseText,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ SIGNUP RESPONSE:', {
        status: response.status(),
        bodyLength: responseText.length
      });
      
      route.fulfill({ response });
    });
    
    // Monitor all form submissions
    page.on('request', request => {
      if (request.method() === 'POST' && request.postData()) {
        signupNetworkData.formData.push({
          url: request.url(),
          postData: request.postData(),
          timestamp: new Date().toISOString()
        });
        
        console.log('📋 FORM SUBMISSION:', {
          url: request.url().substring(request.url().lastIndexOf('/') + 1),
          dataLength: request.postData()?.length || 0
        });
      }
    });
    
    // Execute signup flow
    await home.goto('/');
    await page.getByRole('link', { name: ' Signup / Login' }).click();
    
    // Generate test user data
    const testUser = {
      name: faker.person.firstName() + '_' + Date.now(),
      email: `test_${Date.now()}@example.com`
    };
    
    console.log('👤 Testing signup with:', testUser);
    
    // Fill signup form
    await page.fill('[data-qa="signup-name"]', testUser.name);
    await page.fill('[data-qa="signup-email"]', testUser.email);
    await page.click('[data-qa="signup-button"]');
    
    // Wait for network activity
    await page.waitForTimeout(3000);
    
    // Generate signup network report
    console.log('\n📊 SIGNUP NETWORK ANALYSIS:');
    console.log('─'.repeat(50));
    console.log(`Signup Requests: ${signupNetworkData.requests.length}`);
    console.log(`Signup Responses: ${signupNetworkData.responses.length}`);
    console.log(`Form Submissions: ${signupNetworkData.formData.length}`);
    
    if (signupNetworkData.requests.length > 0) {
      console.log('\n📝 SIGNUP REQUEST DETAILS:');
      for (let i = 0; i < signupNetworkData.requests.length; i++) {
        const req = signupNetworkData.requests[i];
        console.log(`  Request ${i + 1}: ${req.method} ${req.url}`);
      }
    }
    
    if (signupNetworkData.responses.length > 0) {
      console.log('\n📥 SIGNUP RESPONSE DETAILS:');
      for (let i = 0; i < signupNetworkData.responses.length; i++) {
        const res = signupNetworkData.responses[i];
        console.log(`  Response ${i + 1}: ${res.status} ${res.statusText}`);
      }
    }
    
    console.log('\n✅ Signup API monitoring completed');
  });
});