import { test, expect } from '@playwright/test';
import { createBDDLogger, BDDLogger } from '../utils/bdd-logger';

test.describe('Mock API Response Demo', () => {
  let bddLogger: BDDLogger;
  let interceptedResponses: any[] = [];

  test.beforeEach(async ({ page, browserName }) => {
    bddLogger = createBDDLogger('Mock API Demo');
    bddLogger.startScenario(
      'Demonstrate mock API response with simplified logging',
      ['@api', '@mock', '@demo'],
      'Show status code, username, and fields from mocked API responses',
      browserName,
      `${page.viewportSize()?.width}x${page.viewportSize()?.height}`
    );

    interceptedResponses = [];
  });

  test.afterEach(async () => {
    bddLogger.endScenario();
    bddLogger.generateReport();
  });

  test('Mock login API with simplified output display', async ({ page }) => {
    try {
      bddLogger.given('a mock login API response is configured with user data', {
        mockResponse: {
          status: 200,
          user: { id: 123, name: 'John Doe', email: 'john@example.com' },
          token: 'mock-jwt-token-12345'
        }
      });

      // Create mock response data
      const mockResponse = {
        success: true,
        status: 200,
        user: {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://example.com/avatar.jpg',
            preferences: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-payload.mock-signature',
        expiresIn: 3600,
        refreshToken: 'refresh-token-12345'
      };

      // Simulate captured mock response
      interceptedResponses.push({
        type: 'mock',
        data: mockResponse,
        timestamp: new Date().toISOString()
      });

      bddLogger.logApiCall('POST', '/api/login', 200, Date.now());
      bddLogger.stepPassed();

      bddLogger.when('a simulated API call captures the mock response');
      await page.goto('data:text/html,<html><body><h1>Mock API Test</h1><p>Response captured successfully</p></body></html>');
      bddLogger.stepPassed();

      bddLogger.thenStep('the mocked response should be captured with simplified display', {
        expectedFormat: ['status code', 'username', 'available fields']
      });

      // Display simplified mock response information
      if (interceptedResponses.length > 0) {
        bddLogger.addNote(`Mock responses captured: ${interceptedResponses.length}`);
        
        for (let index = 0; index < interceptedResponses.length; index++) {
          const response = interceptedResponses[index];
          if (response.type === 'mock' && response.data) {
            const mockData = response.data;
            
            // Status Code
            const statusDisplay = mockData.success ? '200 OK' : `${mockData.status || 'Error'}`;
            bddLogger.addNote(`📊 Mock ${index + 1} Status: ${statusDisplay}`);
            
            // Username
            const username = mockData.user?.name || 'N/A';
            bddLogger.addNote(`👤 Mock ${index + 1} Username: ${username}`);
            
            // User Fields
            const userFields = Object.keys(mockData.user || {});
            bddLogger.addNote(`📝 Mock ${index + 1} User Fields: ${userFields.join(', ')}`);
            
            // Profile Fields (if available)
            if (mockData.user?.profile) {
              const profileFields = Object.keys(mockData.user.profile);
              bddLogger.addNote(`🔧 Mock ${index + 1} Profile Fields: ${profileFields.join(', ')}`);
            }
            
            // Additional Response Fields
            const responseFields = Object.keys(mockData).filter(key => key !== 'user');
            bddLogger.addNote(`⚙️  Mock ${index + 1} Response Fields: ${responseFields.join(', ')}`);
            
          }
        }
      }
      
      bddLogger.stepPassed();

      bddLogger.and('the API response should contain expected user data structure');
      
      // Validate the mock response structure
      const response = mockResponse;
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user.name).toBe('John Doe');
      
      bddLogger.addNote(`✅ API Response validated: ${JSON.stringify({
        hasUser: !!response.user,
        userName: response.user?.name,
        hasToken: !!response.token,
        fieldsCount: Object.keys(response).length
      }, null, 2)}`);
      
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`Mock API demo failed: ${errorMessage}`);
      throw error;
    }
  });

  test('Mock multiple user profiles with different data', async ({ page }) => {
    try {
      bddLogger.given('multiple mock user profiles are configured');

      const users = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'customer' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'moderator' }
      ];

      // Create mock responses for each user
      for (const user of users) {
        const mockResponse = {
          success: true,
          status: 200,
          user: {
            ...user,
            profile: {
              firstName: user.name.split(' ')[0],
              lastName: user.name.split(' ')[1],
              joinDate: new Date().toISOString(),
              isActive: true
            }
          },
          metadata: {
            requestId: `req-${Date.now()}`,
            apiVersion: '1.0',
            timestamp: new Date().toISOString()
          }
        };

        interceptedResponses.push({
          type: 'mock',
          data: mockResponse,
          userId: user.id,
          timestamp: new Date().toISOString()
        });
      }
      bddLogger.stepPassed();

      bddLogger.when('requests are made for different user profiles');
      await page.goto('data:text/html,<html><body><h1>Multi-User Mock Test</h1><p>All user profiles loaded</p></body></html>');
      bddLogger.stepPassed();

      bddLogger.thenStep('all mock responses should be captured with user details');

      bddLogger.addNote(`📈 Total mock responses captured: ${interceptedResponses.length}`);
      
      for (let index = 0; index < interceptedResponses.length; index++) {
        const response = interceptedResponses[index];
        if (response.type === 'mock' && response.data) {
          const mockData = response.data;
          
          bddLogger.addNote(`\n--- User Profile ${index + 1} ---`);
          bddLogger.addNote(`📊 Status: ${mockData.success ? '200 OK' : 'Error'}`);
          bddLogger.addNote(`👤 Username: ${mockData.user?.name || 'N/A'}`);
          bddLogger.addNote(`📧 Email: ${mockData.user?.email || 'N/A'}`);
          bddLogger.addNote(`🎭 Role: ${mockData.user?.role || 'N/A'}`);
          bddLogger.addNote(`📝 User Fields: ${Object.keys(mockData.user || {}).join(', ')}`);
          
          if (mockData.user?.profile) {
            bddLogger.addNote(`🔧 Profile Fields: ${Object.keys(mockData.user.profile).join(', ')}`);
          }
        }
      }
      
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`Multi-user mock test failed: ${errorMessage}`);
      throw error;
    }
  });
});