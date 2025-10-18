# Copilot Instructions for Playwright E-commerce Test Automation

## Project Overview
This is a Playwright-based test automation framework for the AutomationExercise e-commerce site. The codebase follows a Page Object Model (POM) pattern and includes multi-viewport testing (desktop/mobile) with Lighthouse performance/accessibility audits.

## Key Architecture Components

### Project Structure
- **Main workspace**: `playwright-latam-qa/` contains the core test framework
- **Page Objects**: Located in `pages/` - each page inherits from `BasePage.ts`
- **Test Files**: Located in `tests/` - use `.spec.ts` naming convention
- **Utilities**: `utils/random.ts` provides random data generation helpers
- **Scripts**: `scripts/run-lighthouse.js` handles Lighthouse audits

### Page Object Pattern Implementation
All page objects extend `BasePage` which provides:
```typescript
// BasePage provides common navigation via goto() method
export default class BasePage {
  protected page: Page;
  constructor(page: Page) { this.page = page; }
  async goto(path = 'https://automationexercise.com/') { /* ... */ }
}
```

Page-specific classes follow this pattern:
- Constructor calls `super(page)`
- Selectors defined as class properties (e.g., `productCards = ".features_items .col-sm-4"`)
- Methods use async/await with Playwright actions

### Multi-Viewport Configuration
The project runs tests on two configurations simultaneously:
- `chromium-desktop`: Chrome browser (1280x720 viewport)
- `chromium-mobile`: Chrome mobile simulation (iPhone 12 device settings)

Configure in `playwright.config.ts` projects array. Tests automatically run on both viewports unless filtered with `--project` flag.

## Critical Workflows

### Running Tests
```powershell
# All tests on both viewports
npm run test

# Headed mode (visible browser)
npm run test:headed

# Run specific browser projects
npx playwright test --project=chromium-desktop
npx playwright test --project=chromium-mobile
npx playwright test --project="chromium-*"  # Both Chrome configurations

# Install dependencies and browsers
npm run install:all
```

### Lighthouse Integration
```powershell
# Performance audit
npm run lighthouse:performance

# Accessibility audit  
npm run lighthouse:accessibility
```

Results saved to `reports/lighthouse-{category}.json` with scores 0-100.

## Project-Specific Conventions

### Test Structure
Tests follow the mandatory user flow pattern:
1. Navigate to homepage → Products → Third product → Set quantity → Add to cart → Checkout → Register/Login modal
2. Use `randomInt(1, 20)` from `utils/random.ts` for quantity generation
3. Leverage `@faker-js/faker` for user data generation

### Error Handling Patterns
- Use `.catch(() => {})` for optional waits: `await this.page.waitForSelector("selector", { timeout: 5000 }).catch(() => {});`
- Implement fallback navigation when buttons aren't visible:
```typescript
if (await proceedToCheckoutBtn.isVisible({ timeout: 1000 })) {
  await proceedToCheckoutBtn.first().click();
} else {
  await this.page.goto("https://automationexercise.com/view_cart");
}
```

### Selector Strategy
- Prefer semantic selectors: `page.getByRole('link', { name: ' Signup / Login' })`
- Fallback to CSS selectors as class properties
- Use `:has-text()` for button identification: `"button:has-text('Add to cart')"`

## Integration Points

### Base URL Configuration
All tests use `baseURL: 'https://automationexercise.com'` in config. Page objects can use relative paths with `goto('/products')`.

### Reporting & Artifacts
- HTML reports: `reports/playwright-report/`
- Trace files: Enabled by default (`trace: 'on'`)
- Video: On first retry (`video: 'on-first-retry'`)
- Screenshots: Disabled (removed from configuration)

### CI/CD Integration
GitHub Actions workflows run tests and Lighthouse audits on push/PR to main. Located in `.github/workflows/`.

## Development Guidelines

### Adding New Page Objects
1. Extend `BasePage`
2. Define selectors as class properties
3. Implement page-specific methods with descriptive names
4. Use proper typing with `Page` parameter

### Adding New Tests
1. Import required page objects and utilities
2. Follow `test.describe` → `test` structure
3. Use descriptive test names indicating viewport support
4. Include proper assertions with `expect()`

### Debugging Failed Tests
1. Check `test-results/` for failure artifacts
2. Use `--headed` flag to see browser actions
3. Examine trace files in reports for step-by-step replay
4. Review error-context.md files in test result directories