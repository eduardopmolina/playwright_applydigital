import { test } from '@playwright/test';
import { createBDDLogger, BDDLogger } from '../utils/bdd-logger';

interface MockAPIResult {
  type: string;
  status: number;
  statusText: string;
  response: any;
  timestamp: string;
  success: boolean;
}

test.describe('Extended Mock API Testing', () => {
  let bddLogger: BDDLogger;
  let apiResults: MockAPIResult[] = [];

  test.beforeEach(async ({ page, browserName }) => {
    bddLogger = createBDDLogger('Extended Mock API Testing');
    bddLogger.startScenario(
      'Test various mock API user profiles',
      ['@api', '@mock', '@profiles'],
      'Testing different user types and field variations',
      browserName,
      `${page.viewportSize()?.width}x${page.viewportSize()?.height}`
    );
    apiResults = [];
  });

  test.afterEach(async () => {
    bddLogger.endScenario();
    bddLogger.generateReport();
  });

  test('Multiple mock user profiles with different roles', async ({ page }) => {
    try {
      bddLogger.given('multiple mock user profiles are configured');
      
      // Customer Profile
      const customerProfile = {
        id: 101,
        username: 'customer_user',
        email: 'customer@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'customer',
        status: 'active',
        membershipLevel: 'premium',
        lastLogin: '2025-10-18T16:30:00Z',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en',
          newsletter: true
        },
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          country: 'USA',
          zipCode: '62701'
        },
        paymentMethods: ['credit_card', 'paypal'],
        orderHistory: [
          { orderId: 'ORD-001', amount: 99.99, date: '2025-10-15' },
          { orderId: 'ORD-002', amount: 149.5, date: '2025-10-10' }
        ]
      };

      // Admin Profile
      const adminProfile = {
        id: 102,
        username: 'admin_user',
        email: 'admin@company.com',
        firstName: 'Robert',
        lastName: 'Johnson',
        role: 'admin',
        status: 'active',
        department: 'IT',
        accessLevel: 'full',
        lastLogin: '2025-10-18T14:45:00Z',
        preferences: {
          theme: 'dark',
          notifications: false,
          language: 'en',
          dashboardLayout: 'compact'
        },
        permissions: [
          'user_management',
          'system_settings',
          'reports_access',
          'data_export'
        ],
        managedUsers: 45,
        lastActions: [
          { action: 'user_created', timestamp: '2025-10-18T14:30:00Z' },
          { action: 'settings_updated', timestamp: '2025-10-18T14:15:00Z' }
        ]
      };

      // Guest Profile
      const guestProfile = {
        id: 103,
        username: 'guest_user_7892',
        email: 'guest7892@tempmail.com',
        firstName: 'Guest',
        lastName: 'User',
        role: 'guest',
        status: 'temporary',
        sessionId: 'sess_abc123def456',
        createdAt: '2025-10-18T16:45:00Z',
        expiresAt: '2025-10-18T20:45:00Z',
        preferences: {
          theme: 'auto',
          language: 'en'
        },
        limitations: {
          maxActions: 10,
          currentActions: 3,
          canPurchase: false,
          canComment: false
        }
      };

      const mockProfiles = [
        {
          name: 'Customer Profile',
          user: customerProfile,
          response: {
            success: true,
            message: 'Customer login successful',
            statusCode: 200,
            user: customerProfile,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.customer-token-payload',
            expiresIn: 7200,
            permissions: ['shop', 'profile:edit', 'orders:view']
          }
        },
        {
          name: 'Admin Profile',
          user: adminProfile,
          response: {
            success: true,
            message: 'Admin login successful',
            statusCode: 200,
            user: adminProfile,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin-token-payload',
            expiresIn: 14400,
            permissions: ['*']
          }
        },
        {
          name: 'Guest Profile',
          user: guestProfile,
          response: {
            success: true,
            message: 'Guest session created',
            statusCode: 200,
            user: guestProfile,
            sessionToken: 'temp_sess_xyz789abc',
            expiresIn: 3600,
            permissions: ['browse', 'read']
          }
        }
      ];

      // Store all mock results
      for (const profile of mockProfiles) {
        apiResults.push({
          type: `Mock API - ${profile.name}`,
          status: 200,
          statusText: 'OK',
          response: profile.response,
          timestamp: new Date().toLocaleTimeString(),
          success: true
        });
      }

      bddLogger.stepPassed();

      bddLogger.when('multiple mock profiles are processed');
      await page.goto('data:text/html,<h1>Multiple Mock API Profiles Test Complete</h1>');
      bddLogger.stepPassed();

      bddLogger.thenStep('all profile fields should be extracted and displayed');
      displayExtendedResults();
      bddLogger.stepPassed();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      bddLogger.stepFailed(`Extended mock API test failed: ${errorMessage}`);
      throw error;
    }
  });

  function displayExtendedResults() {
    bddLogger.addNote(`\n📊 === EXTENDED MOCK API TEST RESULTS ===`);
    bddLogger.addNote(`Total Profiles Tested: ${apiResults.length}`);

    for (const result of apiResults) {
      const response = result.response;
      
      bddLogger.addNote(`\n🔸 === ${result.type} ===`);
      bddLogger.addNote(`📊 Status: ${result.status} - ${response.message}`);
      
      if (response.user) {
        displayUserProfile(response.user);
      }
      
      // Display response-level fields
      const responseFields = Object.keys(response).filter(key => key !== 'user');
      bddLogger.addNote(`🔗 Response Fields (${responseFields.length}): ${responseFields.join(', ')}`);
      
      displayTokenInfo(response);
      bddLogger.addNote(`⏰ Time: ${result.timestamp}`);
    }

    bddLogger.addNote(`\n✅ === EXTENDED TESTING COMPLETE ===\n`);
  }

  function displayUserProfile(user: any) {
    bddLogger.addNote(`👤 Username: ${user.username}`);
    bddLogger.addNote(`📧 Email: ${user.email}`);
    bddLogger.addNote(`🎭 Role: ${user.role}`);
    bddLogger.addNote(`🏷️  Status: ${user.status}`);
    
    // Count and display all user fields
    const userFields = Object.keys(user);
    bddLogger.addNote(`📝 User Fields (${userFields.length}): ${userFields.join(', ')}`);
    
    displayRoleSpecificFields(user);
    displayNestedFields(user);
  }

  function displayRoleSpecificFields(user: any) {
    if (user.role === 'customer') {
      bddLogger.addNote(`💎 Membership: ${user.membershipLevel || 'standard'}`);
      if (user.orderHistory) {
        bddLogger.addNote(`📦 Order History: ${user.orderHistory.length} orders`);
      }
      if (user.paymentMethods) {
        bddLogger.addNote(`💳 Payment Methods: ${user.paymentMethods.join(', ')}`);
      }
    } else if (user.role === 'admin') {
      bddLogger.addNote(`🏢 Department: ${user.department || 'N/A'}`);
      bddLogger.addNote(`🔑 Access Level: ${user.accessLevel || 'standard'}`);
      if (user.managedUsers) {
        bddLogger.addNote(`👥 Managed Users: ${user.managedUsers}`);
      }
      if (user.permissions) {
        bddLogger.addNote(`🛡️  Admin Permissions: ${user.permissions.join(', ')}`);
      }
    } else if (user.role === 'guest') {
      bddLogger.addNote(`🕐 Session ID: ${user.sessionId || 'N/A'}`);
      bddLogger.addNote(`⏳ Expires At: ${user.expiresAt || 'N/A'}`);
      if (user.limitations) {
        const limits = user.limitations;
        bddLogger.addNote(`🚫 Limitations: ${limits.maxActions - limits.currentActions} actions remaining`);
      }
    }
  }

  function displayNestedFields(user: any) {
    if (user.preferences) {
      const prefFields = Object.keys(user.preferences);
      bddLogger.addNote(`⚙️  Preference Fields (${prefFields.length}): ${prefFields.join(', ')}`);
    }
    
    if (user.address) {
      const addressFields = Object.keys(user.address);
      bddLogger.addNote(`🏠 Address Fields (${addressFields.length}): ${addressFields.join(', ')}`);
    }
  }

  function displayTokenInfo(response: any) {
    if (response.token) {
      bddLogger.addNote(`🔑 Auth Token: ${response.token.substring(0, 30)}...`);
      bddLogger.addNote(`⏳ Token Expires In: ${response.expiresIn} seconds`);
    }
    
    if (response.sessionToken) {
      bddLogger.addNote(`🔑 Session Token: ${response.sessionToken}`);
    }
    
    if (response.permissions) {
      bddLogger.addNote(`🛡️  Permissions: ${response.permissions.join(', ')}`);
    }
  }
});