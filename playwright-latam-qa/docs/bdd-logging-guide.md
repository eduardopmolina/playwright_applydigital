# BDD Logging Guide for Playwright Tests

This guide demonstrates how to use the BDD (Behavior-Driven Development) Logger to create comprehensive Markdown reports with Given-When-Then language for your Playwright test automation.

## Overview

The BDD Logger automatically generates detailed Markdown reports that document your test scenarios using natural language descriptions, making them readable by both technical and non-technical stakeholders.

## Key Features

- **Natural Language Documentation**: Uses Given-When-Then BDD syntax
- **Automatic Markdown Generation**: Creates formatted reports with timestamps and status
- **API Call Logging**: Captures network requests and responses
- **Screenshot Integration**: Embeds failure screenshots in reports
- **Multi-Browser Support**: Tracks browser and viewport information
- **Step-by-Step Tracking**: Detailed execution timeline with status indicators

## Quick Start

### 1. Import the BDD Logger

```typescript
import { createBDDLogger, BDDLogger } from '../utils/bdd-logger';

let bddLogger: BDDLogger;
```

### 2. Initialize in Test Setup

```typescript
test.beforeEach(async ({ page, browserName }) => {
  // Create logger for this feature
  bddLogger = createBDDLogger('Feature Name');
  
  // Start scenario with context
  bddLogger.startScenario(
    'Scenario description',
    ['@tag1', '@tag2'],
    'Background information',
    browserName,
    `${page.viewportSize()?.width}x${page.viewportSize()?.height}`
  );
});
```

### 3. Log BDD Steps in Your Test

```typescript
test('Example test with BDD logging', async ({ page }) => {
  try {
    // GIVEN - Preconditions
    bddLogger.given('the user is on the homepage', {
      url: 'https://example.com',
      expectedElements: ['header', 'navigation']
    });
    
    await page.goto('/');
    await expect(page).toHaveTitle(/Expected Title/);
    bddLogger.stepPassed(); // Mark step as successful

    // WHEN - Actions  
    bddLogger.when('the user clicks the login button');
    
    await page.click('[data-testid="login-btn"]');
    bddLogger.stepPassed();
    
    // THEN - Expected outcomes
    bddLogger.thenStep('the login form should be visible', {
      formFields: ['email', 'password'],
      submitButton: 'Login'
    });
    
    await expect(page.locator('#login-form')).toBeVisible();
    bddLogger.stepPassed();
    
  } catch (error) {
    bddLogger.stepFailed(error.message);
    throw error;
  }
});
```

### 4. Generate Report

```typescript
test.afterEach(async () => {
  bddLogger.endScenario();
  bddLogger.generateReport();
});
```

## BDD Methods Reference

### Scenario Management

| Method | Purpose | Example |
|--------|---------|---------|
| `startScenario(title, tags, background, browser, viewport)` | Begin new test scenario | `bddLogger.startScenario('User Login', ['@auth'])` |
| `endScenario()` | Complete scenario and calculate status | `bddLogger.endScenario()` |
| `generateReport()` | Create final Markdown report | `bddLogger.generateReport()` |

### BDD Steps

| Method | BDD Type | Purpose | Example |
|--------|----------|---------|---------|
| `given(description, details)` | Precondition | Set up test context | `bddLogger.given('user is logged in')` |
| `when(description, details)` | Action | Describe user actions | `bddLogger.when('user clicks submit')` |
| `thenStep(description, details)` | Assertion | Expected outcomes | `bddLogger.thenStep('form is submitted')` |
| `and(description, details)` | Additional | Extra conditions/actions | `bddLogger.and('confirmation appears')` |
| `but(description, details)` | Contrast | Alternative conditions | `bddLogger.but('error is not shown')` |

### Step Status Methods

| Method | Purpose | When to Use |
|--------|---------|-------------|
| `stepPassed(screenshot?)` | Mark step successful | After successful assertions |
| `stepFailed(error, screenshot?)` | Mark step failed | In catch blocks or on assertion failures |
| `stepSkipped(reason?)` | Mark step skipped | When conditions not met |

### Additional Logging

| Method | Purpose | Example |
|--------|---------|---------|
| `addNote(note)` | Add contextual information | `bddLogger.addNote('Using test data set A')` |
| `logApiCall(method, url, status, time)` | Log API requests | `bddLogger.logApiCall('POST', '/login', 200, 150)` |

## Generated Report Structure

The BDD Logger creates Markdown reports with the following structure:

```markdown
# BDD Test Report: Feature Name

**Generated:** 10/18/2025, 2:30:00 PM  
**Test Suite:** Playwright E-commerce Automation  
**Feature:** User Authentication

## Test Summary
- **Total Scenarios:** 3
- **Passed:** 2 ✅
- **Failed:** 1 ❌
- **Skipped:** 0
- **Pending:** 0

**Success Rate:** 67%

## Scenarios

### ✅ Scenario: User completes signup flow (2450ms)

**Tags:** `@authentication` `@smoke`

**Environment:**
- Browser: chromium
- Viewport: 1280x720

**Steps:**

01. ✅ **Given** the user is on the homepage
    - 📋 **Details:** {"url": "https://example.com"}
    - ⏰ **Timestamp:** 10/18/2025, 2:30:15 PM

02. 🎯 **When** the user clicks signup button  
    - 🌐 API: GET /signup → 200 (145ms)
    - ⏰ **Timestamp:** 10/18/2025, 2:30:16 PM

03. ✅ **Then** the signup form should be displayed
    - 💡 Note: Form validation enabled
    - ⏰ **Timestamp:** 10/18/2025, 2:30:17 PM
```

## Best Practices

### 1. Descriptive Step Names
```typescript
// Good
bddLogger.given('the user has a valid account with premium subscription');

// Avoid
bddLogger.given('user setup');
```

### 2. Include Relevant Details
```typescript
bddLogger.when('the user submits the form', {
  formData: { email: 'test@example.com', name: 'Test User' },
  validationRules: ['email format', 'required fields']
});
```

### 3. Log API Interactions
```typescript
// Monitor API responses
page.on('response', response => {
  if (response.url().includes('/api/')) {
    bddLogger.logApiCall(
      response.request().method(),
      response.url(),
      response.status()
    );
  }
});
```

### 4. Capture Failure Context
```typescript
try {
  await expect(element).toBeVisible();
  bddLogger.stepPassed();
} catch (error) {
  // Take screenshot and log failure
  await page.screenshot({ path: 'failure-screenshot.png' });
  bddLogger.stepFailed(error.message, 'failure-screenshot.png');
  throw error;
}
```

### 5. Use Tags for Organization
```typescript
// Organize scenarios with meaningful tags
bddLogger.startScenario(
  'Critical user workflow',
  ['@critical', '@smoke', '@authentication', '@regression']
);
```

## Integration with CI/CD

### Report Generation in Pipeline

```yaml
# Example GitHub Actions step
- name: Run BDD Tests
  run: npx playwright test --reporter=html
  
- name: Archive BDD Reports
  uses: actions/upload-artifact@v3
  with:
    name: bdd-reports
    path: reports/bdd/
```

### Report Storage

Reports are automatically saved to:
- **Location**: `reports/bdd/`
- **Naming**: `{feature-name}-bdd-report.md`
- **Screenshots**: Referenced within reports
- **Timestamps**: All steps include execution times

## Advanced Usage

### Custom Report Directory

```typescript
// Specify custom report location
const logger = createBDDLogger('Feature Name', 'custom/report/path');
```

### Scenario Background

```typescript
// Add background context for all steps
bddLogger.startScenario(
  'User checkout process',
  ['@checkout', '@payment'],
  'User has items in cart and is logged in' // Background
);
```

### API Testing Integration

```typescript
test('API endpoint validation', async ({ request }) => {
  bddLogger = createBDDLogger('API Testing');
  
  bddLogger.startScenario('Validate login endpoint');
  
  bddLogger.given('the API endpoint is available');
  bddLogger.when('a POST request is made with valid credentials');
  
  const response = await request.post('/api/login', { 
    data: { email: 'test@example.com', password: 'password' } 
  });
  
  bddLogger.logApiCall('POST', '/api/login', response.status());
  
  bddLogger.thenStep('the response should contain authentication token');
  expect(response.status()).toBe(200);
  bddLogger.stepPassed();
});
```

### API Response Interception

```typescript
test('Intercept successful login API response', async ({ page }) => {
  bddLogger = createBDDLogger('Login API Interception');
  
  bddLogger.startScenario('Capture login success response with profile data');
  
  // Setup API interception
  await page.route('**/login', async (route) => {
    const response = await route.fetch();
    const responseBody = await response.text();
    
    // Log the intercepted response
    bddLogger.logApiCall(
      response.request().method(),
      response.url(),
      response.status()
    );
    
    // Parse and validate profile data
    try {
      const jsonBody = JSON.parse(responseBody);
      if (jsonBody.user || jsonBody.profile) {
        bddLogger.addNote(`Profile data intercepted: ${JSON.stringify(jsonBody.user || jsonBody.profile)}`);
      }
    } catch (error) {
      bddLogger.addNote('Response is not JSON format');
    }
    
    await route.continue();
  });
  
  bddLogger.given('the login API interception is configured');
  bddLogger.when('the user submits login credentials');
  
  await page.goto('/login');
  await page.fill('[data-qa="login-email"]', 'test@example.com');
  await page.fill('[data-qa="login-password"]', 'password');
  await page.click('[data-qa="login-button"]');
  
  bddLogger.thenStep('the API response should be captured with profile data');
  bddLogger.stepPassed();
});
```

## Report Examples

### Successful Scenario
- ✅ Clear step progression
- 🌐 API call logging  
- 💡 Contextual notes
- ⏰ Execution timeline

### Failed Scenario
- ❌ Error details captured
- 📸 Screenshot references
- 🔍 Debugging information
- 📋 Failure context

This BDD logging approach transforms your Playwright tests into living documentation that serves both as test validation and feature documentation for stakeholders.