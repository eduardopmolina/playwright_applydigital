# UI Testing & User Experience Guide (UIMD)

## Overview
This User Interface and User Experience Markdown Documentation (UIMD) provides comprehensive guidelines for testing user interfaces, user experience patterns, and visual regression testing in the Playwright automation framework.

## Table of Contents
- [UI Testing Fundamentals](#ui-testing-fundamentals)
- [Visual Testing Strategies](#visual-testing-strategies)
- [Responsive Design Testing](#responsive-design-testing)
- [Accessibility Testing](#accessibility-testing)
- [User Experience Validation](#user-experience-validation)
- [Cross-Browser UI Testing](#cross-browser-ui-testing)
- [Performance & UX Metrics](#performance--ux-metrics)
- [UI Component Testing](#ui-component-testing)

---

## UI Testing Fundamentals

### What is UI Testing?
User Interface testing validates that the graphical interface of an application functions correctly and provides an optimal user experience. This includes testing visual elements, interactions, layouts, and user workflows.

### UI Testing Pyramid
1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing  
3. **Visual Tests**: Screenshot comparison and visual regression
4. **E2E UI Tests**: Complete user journey validation
5. **Manual Testing**: Exploratory and usability testing

### Key UI Testing Areas
- **Layout & Positioning**: Element placement and alignment
- **Visual Design**: Colors, fonts, images, branding
- **Interactions**: Buttons, forms, navigation, animations
- **Responsiveness**: Multi-device and viewport testing
- **Accessibility**: Screen reader and keyboard navigation support

---

## Visual Testing Strategies

### Screenshot Comparison Testing
```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  
  test('Homepage visual validation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-fullpage.png');
    
    // Take specific component screenshots
    await expect(page.locator('.header')).toHaveScreenshot('header-component.png');
    await expect(page.locator('.hero-section')).toHaveScreenshot('hero-section.png');
    await expect(page.locator('.footer')).toHaveScreenshot('footer-component.png');
  });
  
  test('Product page visual validation', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Test different product states
    const productCard = page.locator('.product-card').first();
    
    // Normal state
    await expect(productCard).toHaveScreenshot('product-card-normal.png');
    
    // Hover state
    await productCard.hover();
    await expect(productCard).toHaveScreenshot('product-card-hover.png');
    
    // Add to cart state
    await productCard.locator('.add-to-cart').click();
    await page.waitForTimeout(500); // Wait for animation
    await expect(productCard).toHaveScreenshot('product-card-added.png');
  });
});
```

### Advanced Visual Testing Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Visual testing configuration
    screenshot: 'only-on-failure',
  },
  
  expect: {
    // Visual comparison threshold
    toHaveScreenshot: { 
      threshold: 0.3,
      mode: 'percent' 
    },
    toMatchSnapshot: { 
      threshold: 0.3,
      mode: 'percent' 
    }
  },
  
  projects: [
    {
      name: 'visual-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Consistent visual testing environment
        deviceScaleFactor: 1,
        hasTouch: false,
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'visual-mobile',
      use: { 
        ...devices['iPhone 12'],
        deviceScaleFactor: 2
      },
    }
  ]
});
```

### Element-Specific Visual Testing
```typescript
test('Component visual states', async ({ page }) => {
  await page.goto('/components');
  
  const button = page.locator('#test-button');
  
  // Test all button states
  const states = [
    { name: 'default', action: () => {} },
    { name: 'hover', action: () => button.hover() },
    { name: 'focus', action: () => button.focus() },
    { name: 'active', action: () => button.press() },
    { name: 'disabled', action: () => button.evaluate(el => el.setAttribute('disabled', 'true')) }
  ];
  
  for (const state of states) {
    await state.action();
    await expect(button).toHaveScreenshot(`button-${state.name}.png`);
    
    // Reset button state
    await page.reload();
    await page.waitForLoadState('networkidle');
  }
});
```

---

## Responsive Design Testing

### Multi-Viewport Testing
```typescript
const viewports = [
  { name: 'mobile-portrait', width: 375, height: 667 },
  { name: 'mobile-landscape', width: 667, height: 375 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'desktop-small', width: 1366, height: 768 },
  { name: 'desktop-large', width: 1920, height: 1080 },
];

test.describe('Responsive Design Testing', () => {
  viewports.forEach(viewport => {
    test(`Layout validation - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test critical elements visibility
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.navigation')).toBeVisible();
      await expect(page.locator('.main-content')).toBeVisible();
      await expect(page.locator('.footer')).toBeVisible();
      
      // Take responsive screenshot
      await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`);
      
      // Test responsive navigation
      if (viewport.width < 768) {
        // Mobile navigation testing
        await expect(page.locator('.mobile-menu-toggle')).toBeVisible();
        await page.click('.mobile-menu-toggle');
        await expect(page.locator('.mobile-navigation')).toBeVisible();
        await expect(page.locator('.mobile-navigation')).toHaveScreenshot(`mobile-nav-${viewport.name}.png`);
      } else {
        // Desktop navigation testing
        await expect(page.locator('.desktop-navigation')).toBeVisible();
        await expect(page.locator('.mobile-menu-toggle')).toBeHidden();
      }
    });
  });
});
```

### Breakpoint Testing
```typescript
test('CSS breakpoint validation', async ({ page }) => {
  await page.goto('/');
  
  // Test major CSS breakpoints
  const breakpoints = [
    { name: 'xs', width: 320 },
    { name: 'sm', width: 576 },
    { name: 'md', width: 768 },
    { name: 'lg', width: 992 },
    { name: 'xl', width: 1200 },
    { name: 'xxl', width: 1400 }
  ];
  
  for (const bp of breakpoints) {
    console.log(`Testing breakpoint: ${bp.name} (${bp.width}px)`);
    
    await page.setViewportSize({ width: bp.width, height: 800 });
    await page.waitForTimeout(500); // Allow CSS transitions
    
    // Validate layout adjustments
    const container = page.locator('.container');
    const containerWidth = await container.evaluate(el => 
      window.getComputedStyle(el).maxWidth
    );
    
    console.log(`Container max-width at ${bp.name}: ${containerWidth}`);
    
    // Test grid system
    const columns = page.locator('.col, [class*="col-"]');
    const columnCount = await columns.count();
    
    if (columnCount > 0) {
      const firstColumn = columns.first();
      const columnStyles = await firstColumn.evaluate(el => ({
        width: window.getComputedStyle(el).width,
        display: window.getComputedStyle(el).display,
        flexBasis: window.getComputedStyle(el).flexBasis
      }));
      
      console.log(`Column styles at ${bp.name}:`, columnStyles);
    }
    
    // Take breakpoint screenshot
    await expect(page).toHaveScreenshot(`breakpoint-${bp.name}.png`);
  }
});
```

### Orientation Testing
```typescript
test('Device orientation testing', async ({ page }) => {
  const orientations = [
    { name: 'portrait', width: 375, height: 667 },
    { name: 'landscape', width: 667, height: 375 }
  ];
  
  for (const orientation of orientations) {
    console.log(`Testing ${orientation.name} orientation`);
    
    await page.setViewportSize({
      width: orientation.width,
      height: orientation.height
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test orientation-specific layouts
    const header = page.locator('.header');
    const headerHeight = await header.boundingBox();
    
    if (orientation.name === 'landscape') {
      // Landscape should have more compact header
      expect(headerHeight?.height).toBeLessThan(100);
    } else {
      // Portrait can have taller header
      expect(headerHeight?.height).toBeGreaterThan(0);
    }
    
    await expect(page).toHaveScreenshot(`orientation-${orientation.name}.png`);
  }
});
```

---

## Accessibility Testing

### Keyboard Navigation Testing
```typescript
test.describe('Accessibility Testing', () => {
  
  test('Keyboard navigation flow', async ({ page }) => {
    await page.goto('/');
    
    // Test tab order
    const focusableElements = [
      '.skip-link',
      '.logo',
      '.nav-item:first-child a',
      '.search-input',
      '.cta-button',
      '.footer-link:first-child'
    ];
    
    // Start from first element
    await page.keyboard.press('Tab');
    
    for (let i = 0; i < focusableElements.length; i++) {
      const activeElement = await page.evaluate(() => document.activeElement?.className);
      console.log(`Tab ${i + 1}: Focus on element with class "${activeElement}"`);
      
      // Validate focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Take screenshot of focused state
      await expect(focusedElement).toHaveScreenshot(`focus-state-${i + 1}.png`);
      
      // Move to next element
      await page.keyboard.press('Tab');
    }
    
    // Test reverse tab order
    console.log('Testing reverse tab order (Shift+Tab)');
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      console.log(`Shift+Tab ${i + 1}: Focus on ${activeElement}`);
    }
  });
  
  test('Skip links functionality', async ({ page }) => {
    await page.goto('/');
    
    // Test skip to main content
    await page.keyboard.press('Tab'); // Focus skip link
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeFocused();
    
    await page.keyboard.press('Enter');
    
    // Verify main content is focused
    const mainContent = page.locator('#main-content, main');
    await expect(mainContent).toBeFocused();
  });
});
```

### ARIA and Semantic Testing
```typescript
test('ARIA attributes and semantic structure', async ({ page }) => {
  await page.goto('/');
  
  // Test landmark roles
  const landmarks = [
    { selector: 'header, [role="banner"]', role: 'banner' },
    { selector: 'nav, [role="navigation"]', role: 'navigation' },
    { selector: 'main, [role="main"]', role: 'main' },
    { selector: 'footer, [role="contentinfo"]', role: 'contentinfo' }
  ];
  
  for (const landmark of landmarks) {
    const element = page.locator(landmark.selector).first();
    await expect(element).toBeVisible();
    
    const role = await element.getAttribute('role');
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    
    console.log(`Landmark: ${tagName} with role="${role}" (expected: ${landmark.role})`);
  }
  
  // Test headings hierarchy
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  const headingCount = await headings.count();
  
  console.log(`Found ${headingCount} headings on the page`);
  
  for (let i = 0; i < headingCount; i++) {
    const heading = headings.nth(i);
    const text = await heading.textContent();
    const tagName = await heading.evaluate(el => el.tagName);
    
    console.log(`${tagName}: "${text}"`);
  }
  
  // Verify proper heading hierarchy (h1 -> h2 -> h3, etc.)
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBe(1); // Should have exactly one h1
  
  // Test form labels
  const inputs = page.locator('input[type="text"], input[type="email"], textarea, select');
  const inputCount = await inputs.count();
  
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledby = await input.getAttribute('aria-labelledby');
    
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      const labelExists = await label.count() > 0;
      console.log(`Input #${id} has label: ${labelExists}`);
    }
    
    if (ariaLabel) {
      console.log(`Input has aria-label: "${ariaLabel}"`);
    }
    
    if (ariaLabelledby) {
      console.log(`Input has aria-labelledby: "${ariaLabelledby}"`);
    }
  }
});
```

### Color Contrast Testing
```typescript
test('Color contrast validation', async ({ page }) => {
  await page.goto('/');
  
  // Inject axe-core for accessibility testing
  await page.addScriptTag({ 
    url: 'https://unpkg.com/axe-core@4.7.0/axe.min.js' 
  });
  
  // Run color contrast analysis
  const results = await page.evaluate(() => {
    return new Promise((resolve) => {
      // @ts-ignore
      axe.run({ 
        tags: ['wcag21aa', 'color-contrast'] 
      }, (err: any, results: any) => {
        resolve(results);
      });
    });
  });
  
  console.log('Color contrast violations:', (results as any).violations);
  
  // Assert no color contrast violations
  expect((results as any).violations.length).toBe(0);
});
```

---

## User Experience Validation

### Form Usability Testing
```typescript
test.describe('Form UX Testing', () => {
  
  test('Login form user experience', async ({ page }) => {
    await page.goto('/login');
    
    // Test form validation feedback
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const submitButton = page.locator('#login-submit');
    
    // Test empty form submission
    await submitButton.click();
    
    // Check for validation messages
    const emailError = page.locator('#email-error, .email-error');
    const passwordError = page.locator('#password-error, .password-error');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
    
    // Test invalid email format
    await emailInput.fill('invalid-email');
    await emailInput.blur(); // Trigger validation
    
    const emailValidation = await emailInput.evaluate(el => 
      (el as HTMLInputElement).validationMessage
    );
    console.log('Email validation message:', emailValidation);
    
    // Test password requirements feedback
    await passwordInput.fill('123'); // Too short
    await passwordInput.blur();
    
    const passwordValidation = await passwordInput.evaluate(el => 
      (el as HTMLInputElement).validationMessage
    );
    console.log('Password validation message:', passwordValidation);
    
    // Test successful form completion
    await emailInput.fill('user@example.com');
    await passwordInput.fill('securepassword123');
    
    // Validate form is ready for submission
    const isEmailValid = await emailInput.evaluate(el => 
      (el as HTMLInputElement).checkValidity()
    );
    const isPasswordValid = await passwordInput.evaluate(el => 
      (el as HTMLInputElement).checkValidity()
    );
    
    expect(isEmailValid).toBe(true);
    expect(isPasswordValid).toBe(true);
    
    // Test submit button state
    const isSubmitEnabled = await submitButton.isEnabled();
    expect(isSubmitEnabled).toBe(true);
  });
  
  test('Search functionality UX', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('#search-input, .search-input');
    const searchButton = page.locator('#search-button, .search-button');
    
    // Test search suggestions/autocomplete
    await searchInput.fill('lap');
    await page.waitForTimeout(500); // Wait for suggestions
    
    const suggestions = page.locator('.search-suggestions, .autocomplete');
    const suggestionCount = await suggestions.locator('li, .suggestion').count();
    
    if (suggestionCount > 0) {
      console.log(`Found ${suggestionCount} search suggestions`);
      
      // Test keyboard navigation in suggestions
      await page.keyboard.press('ArrowDown');
      const highlightedSuggestion = page.locator('.suggestion.highlighted, .suggestion:focus');
      await expect(highlightedSuggestion).toBeVisible();
      
      // Select suggestion with Enter
      await page.keyboard.press('Enter');
      
      // Verify search was executed
      await expect(page).toHaveURL(/.*search.*/);
    }
    
    // Test direct search
    await searchInput.fill('laptop');
    await searchButton.click();
    
    // Verify search results page
    await expect(page).toHaveURL(/.*search.*laptop.*/);
    await expect(page.locator('.search-results')).toBeVisible();
  });
});
```

### Navigation UX Testing
```typescript
test('Navigation user experience', async ({ page }) => {
  await page.goto('/');
  
  // Test main navigation
  const mainNav = page.locator('.main-navigation, nav');
  await expect(mainNav).toBeVisible();
  
  // Test dropdown menus
  const dropdownTriggers = page.locator('.dropdown-toggle, .has-dropdown > a');
  const dropdownCount = await dropdownTriggers.count();
  
  for (let i = 0; i < dropdownCount; i++) {
    const trigger = dropdownTriggers.nth(i);
    const triggerText = await trigger.textContent();
    
    console.log(`Testing dropdown: "${triggerText}"`);
    
    // Test hover behavior
    await trigger.hover();
    await page.waitForTimeout(300); // Wait for hover effect
    
    const dropdown = page.locator('.dropdown-menu').nth(i);
    await expect(dropdown).toBeVisible();
    
    // Test dropdown content
    const dropdownItems = dropdown.locator('a, button');
    const itemCount = await dropdownItems.count();
    expect(itemCount).toBeGreaterThan(0);
    
    // Test keyboard accessibility
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(dropdown).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(dropdown).toBeHidden();
    
    // Move focus away
    await page.keyboard.press('Tab');
  }
  
  // Test breadcrumb navigation (if present)
  const breadcrumbs = page.locator('.breadcrumbs, .breadcrumb');
  if (await breadcrumbs.count() > 0) {
    const breadcrumbItems = breadcrumbs.locator('a, span');
    const breadcrumbCount = await breadcrumbItems.count();
    
    console.log(`Found ${breadcrumbCount} breadcrumb items`);
    
    // Test breadcrumb navigation
    if (breadcrumbCount > 1) {
      const parentBreadcrumb = breadcrumbItems.nth(breadcrumbCount - 2);
      await parentBreadcrumb.click();
      
      // Verify navigation worked
      await page.waitForLoadState('networkidle');
      expect(page.url()).not.toContain(await page.title());
    }
  }
});
```

### Loading States and Feedback
```typescript
test('Loading states and user feedback', async ({ page }) => {
  await page.goto('/');
  
  // Test form submission loading states
  await page.goto('/contact');
  
  const form = page.locator('#contact-form');
  const submitButton = form.locator('button[type="submit"]');
  
  // Fill form
  await form.locator('#name').fill('Test User');
  await form.locator('#email').fill('test@example.com');
  await form.locator('#message').fill('This is a test message');
  
  // Monitor for loading states
  const loadingStates: string[] = [];
  
  // Listen for button state changes
  await page.evaluate(() => {
    const button = document.querySelector('#contact-form button[type="submit"]') as HTMLButtonElement;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
          console.log('Button disabled state:', button.disabled);
        }
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          console.log('Button text:', button.textContent);
        }
      });
    });
    
    observer.observe(button, { 
      attributes: true, 
      childList: true, 
      subtree: true,
      characterData: true 
    });
  });
  
  // Submit form and monitor loading state
  await submitButton.click();
  
  // Check for loading indicators
  const loadingSpinner = page.locator('.spinner, .loading, .loader');
  const loadingText = page.locator(':has-text("Loading"), :has-text("Sending"), :has-text("Please wait")');
  
  if (await loadingSpinner.count() > 0) {
    await expect(loadingSpinner).toBeVisible();
    console.log('Loading spinner is visible');
  }
  
  if (await loadingText.count() > 0) {
    await expect(loadingText).toBeVisible();
    console.log('Loading text is visible');
  }
  
  // Wait for form submission completion
  await page.waitForTimeout(3000);
  
  // Check for success/error feedback
  const successMessage = page.locator('.success, .alert-success, :has-text("Thank you")');
  const errorMessage = page.locator('.error, .alert-error, .alert-danger');
  
  const hasSuccess = await successMessage.count() > 0;
  const hasError = await errorMessage.count() > 0;
  
  if (hasSuccess) {
    await expect(successMessage).toBeVisible();
    console.log('Success message displayed');
  } else if (hasError) {
    await expect(errorMessage).toBeVisible();
    console.log('Error message displayed');
  }
  
  // Verify button is re-enabled
  await expect(submitButton).toBeEnabled();
});
```

---

## Cross-Browser UI Testing

### Browser-Specific Visual Testing
```typescript
test.describe('Cross-Browser Visual Testing', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  browsers.forEach(browserName => {
    test(`Visual consistency - ${browserName}`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test critical page elements
      const elements = [
        { name: 'header', selector: '.header' },
        { name: 'navigation', selector: '.navigation' },
        { name: 'hero-section', selector: '.hero' },
        { name: 'product-grid', selector: '.products' },
        { name: 'footer', selector: '.footer' }
      ];
      
      for (const element of elements) {
        const locator = page.locator(element.selector);
        if (await locator.count() > 0) {
          await expect(locator).toHaveScreenshot(`${element.name}-${browserName}.png`);
        }
      }
      
      // Full page screenshot
      await expect(page).toHaveScreenshot(`fullpage-${browserName}.png`);
    });
  });
});
```

### CSS Feature Support Testing
```typescript
test('CSS feature support across browsers', async ({ page }) => {
  await page.goto('/');
  
  // Test modern CSS features support
  const cssFeatures = [
    'display: grid',
    'display: flex',
    'position: sticky',
    'backdrop-filter: blur(5px)',
    'clip-path: circle(50%)',
    'transform: translateZ(0)'
  ];
  
  const supportResults = await page.evaluate((features) => {
    const testElement = document.createElement('div');
    document.body.appendChild(testElement);
    
    const results: { [key: string]: boolean } = {};
    
    features.forEach(feature => {
      try {
        const [property, value] = feature.split(': ');
        testElement.style.setProperty(property, value);
        const computedStyle = window.getComputedStyle(testElement);
        results[feature] = computedStyle.getPropertyValue(property) === value;
      } catch (error) {
        results[feature] = false;
      }
    });
    
    document.body.removeChild(testElement);
    return results;
  }, cssFeatures);
  
  console.log('CSS Feature Support:', supportResults);
  
  // Test critical features are supported
  expect(supportResults['display: flex']).toBe(true);
  expect(supportResults['display: grid']).toBe(true);
});
```

---

## Performance & UX Metrics

### Core Web Vitals Testing
```typescript
test('Core Web Vitals measurement', async ({ page }) => {
  // Navigate to page
  await page.goto('/');
  
  // Measure Core Web Vitals
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      const metrics: { [key: string]: number } = {};
      
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.LCP = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay (FID) - simulated
      let firstInputDelay = 0;
      const observer = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        firstInputDelay = firstInput.processingStart - firstInput.startTime;
        metrics.FID = firstInputDelay;
      });
      observer.observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift (CLS)
      let cumulativeLayoutShift = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cumulativeLayoutShift += (entry as any).value;
          }
        }
        metrics.CLS = cumulativeLayoutShift;
      }).observe({ entryTypes: ['layout-shift'] });
      
      // Wait and resolve metrics
      setTimeout(() => {
        resolve(metrics);
      }, 3000);
    });
  });
  
  console.log('Core Web Vitals:', metrics);
  
  // Assert performance thresholds
  // LCP should be under 2.5 seconds
  if ((metrics as any).LCP) {
    expect((metrics as any).LCP).toBeLessThan(2500);
  }
  
  // CLS should be under 0.1
  if ((metrics as any).CLS) {
    expect((metrics as any).CLS).toBeLessThan(0.1);
  }
});
```

### Page Load Performance
```typescript
test('Page load performance metrics', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const endTime = Date.now();
  const totalLoadTime = endTime - startTime;
  
  console.log(`Total page load time: ${totalLoadTime}ms`);
  
  // Get detailed performance metrics
  const performanceMetrics = await page.evaluate(() => {
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      firstByte: timing.responseStart - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      resourceLoadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      redirectTime: navigation?.redirectEnd - navigation?.redirectStart || 0,
      dnsLookupTime: navigation?.domainLookupEnd - navigation?.domainLookupStart || 0,
      connectTime: navigation?.connectEnd - navigation?.connectStart || 0
    };
  });
  
  console.log('Performance Metrics:', performanceMetrics);
  
  // Performance assertions
  expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
  expect(performanceMetrics.firstByte).toBeLessThan(1000); // 1 second
  expect(totalLoadTime).toBeLessThan(5000); // 5 seconds total
});
```

---

## UI Component Testing

### Interactive Component Testing
```typescript
test.describe('Interactive Components', () => {
  
  test('Modal dialog functionality', async ({ page }) => {
    await page.goto('/');
    
    // Trigger modal
    const modalTrigger = page.locator('[data-modal-trigger], .modal-trigger');
    await modalTrigger.click();
    
    // Verify modal appears
    const modal = page.locator('.modal, [role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Test modal content
    const modalTitle = modal.locator('.modal-title, h1, h2');
    const modalContent = modal.locator('.modal-body, .modal-content');
    const modalClose = modal.locator('.modal-close, [aria-label="Close"]');
    
    await expect(modalTitle).toBeVisible();
    await expect(modalContent).toBeVisible();
    await expect(modalClose).toBeVisible();
    
    // Test modal backdrop click to close
    await page.click('.modal-backdrop', { position: { x: 10, y: 10 } });
    await expect(modal).toBeHidden();
    
    // Test modal keyboard interaction
    await modalTrigger.click(); // Open modal again
    await expect(modal).toBeVisible();
    
    // Test Escape key closes modal
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    
    // Test focus management
    await modalTrigger.click(); // Open modal again
    const focusedElement = page.locator(':focus');
    
    // First focusable element in modal should be focused
    const firstFocusable = modal.locator('button, input, select, textarea, a[href]').first();
    await expect(firstFocusable).toBeFocused();
  });
  
  test('Dropdown component functionality', async ({ page }) => {
    await page.goto('/components');
    
    const dropdown = page.locator('.dropdown').first();
    const dropdownToggle = dropdown.locator('.dropdown-toggle, button');
    const dropdownMenu = dropdown.locator('.dropdown-menu');
    
    // Test dropdown toggle
    await expect(dropdownMenu).toBeHidden();
    await dropdownToggle.click();
    await expect(dropdownMenu).toBeVisible();
    
    // Test dropdown options
    const dropdownItems = dropdownMenu.locator('a, button, .dropdown-item');
    const itemCount = await dropdownItems.count();
    expect(itemCount).toBeGreaterThan(0);
    
    // Test item selection
    const firstItem = dropdownItems.first();
    const itemText = await firstItem.textContent();
    await firstItem.click();
    
    // Verify dropdown closes after selection
    await expect(dropdownMenu).toBeHidden();
    
    // Verify selection is reflected (if applicable)
    const selectedText = await dropdownToggle.textContent();
    if (selectedText?.includes(itemText || '')) {
      console.log('Dropdown selection updated toggle text');
    }
  });
  
  test('Carousel/slider component', async ({ page }) => {
    await page.goto('/');
    
    const carousel = page.locator('.carousel, .slider, .swiper');
    
    if (await carousel.count() > 0) {
      const slides = carousel.locator('.slide, .carousel-item');
      const slideCount = await slides.count();
      
      if (slideCount > 1) {
        // Test navigation controls
        const nextButton = carousel.locator('.next, .carousel-next, .swiper-button-next');
        const prevButton = carousel.locator('.prev, .carousel-prev, .swiper-button-prev');
        
        // Test next button
        if (await nextButton.count() > 0) {
          await nextButton.click();
          await page.waitForTimeout(500); // Wait for animation
          
          // Verify slide changed
          const activeSlide = carousel.locator('.active, .current');
          await expect(activeSlide).toBeVisible();
        }
        
        // Test pagination dots (if present)
        const paginationDots = carousel.locator('.pagination .dot, .carousel-indicators button');
        const dotCount = await paginationDots.count();
        
        if (dotCount > 0) {
          const secondDot = paginationDots.nth(1);
          await secondDot.click();
          await page.waitForTimeout(500);
          
          // Verify correct slide is active
          const activeSlide = slides.nth(1);
          await expect(activeSlide).toHaveClass(/active|current/);
        }
        
        // Test keyboard navigation
        await carousel.focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);
        
        // Test autoplay behavior (if enabled)
        console.log('Testing carousel autoplay...');
        await page.waitForTimeout(3000);
        
        // Take screenshots of different states
        await expect(carousel).toHaveScreenshot('carousel-state.png');
      }
    }
  });
});
```

---

## Testing Configuration & Best Practices

### Test Environment Setup
```typescript
// ui-test-config.ts
export const UITestConfig = {
  // Visual testing settings
  visual: {
    threshold: 0.3,
    updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true',
    fullPage: true,
    animations: 'disabled' as const,
  },
  
  // Viewport configurations
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    widescreen: { width: 1920, height: 1080 }
  },
  
  // Performance thresholds
  performance: {
    maxLoadTime: 5000,
    maxLCP: 2500,
    maxFID: 100,
    maxCLS: 0.1
  },
  
  // Accessibility standards
  accessibility: {
    standard: 'WCAG21AA',
    includeTags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    excludeRules: ['color-contrast'] // if needed
  }
};
```

### Utility Functions
```typescript
// ui-test-helpers.ts
export class UITestHelpers {
  
  static async waitForAnimations(page: Page) {
    await page.waitForFunction(() => {
      const animations = document.getAnimations();
      return animations.every(animation => 
        animation.playState === 'finished' || 
        animation.playState === 'idle'
      );
    });
  }
  
  static async disableAnimations(page: Page) {
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  }
  
  static async measureElementPerformance(page: Page, selector: string) {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return null;
      
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      
      return {
        dimensions: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        },
        styles: {
          display: styles.display,
          position: styles.position,
          zIndex: styles.zIndex,
          opacity: styles.opacity
        },
        isVisible: rect.width > 0 && rect.height > 0,
        isInViewport: rect.top >= 0 && rect.left >= 0 && 
                      rect.bottom <= window.innerHeight && 
                      rect.right <= window.innerWidth
      };
    }, selector);
  }
  
  static async captureUserFlow(page: Page, flowName: string, steps: Array<() => Promise<void>>) {
    const screenshots: string[] = [];
    
    for (let i = 0; i < steps.length; i++) {
      await steps[i]();
      await this.waitForAnimations(page);
      
      const screenshotName = `${flowName}-step-${i + 1}.png`;
      await page.screenshot({ path: `test-results/${screenshotName}` });
      screenshots.push(screenshotName);
    }
    
    return screenshots;
  }
}
```

---

## Reporting & Documentation

### Test Results Documentation
```typescript
test('Generate UI test report', async ({ page }) => {
  const testReport = {
    testName: 'UI Validation Suite',
    startTime: new Date().toISOString(),
    results: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      screenshots: 0
    }
  };
  
  // Run test suite and collect results
  const testCases = [
    { name: 'Visual Consistency', test: () => visualConsistencyTest(page) },
    { name: 'Responsive Design', test: () => responsiveDesignTest(page) },
    { name: 'Accessibility', test: () => accessibilityTest(page) },
    { name: 'Performance', test: () => performanceTest(page) }
  ];
  
  for (const testCase of testCases) {
    try {
      const result = await testCase.test();
      testReport.results.push({
        name: testCase.name,
        status: 'passed',
        result: result,
        timestamp: new Date().toISOString()
      });
      testReport.summary.passed++;
    } catch (error) {
      testReport.results.push({
        name: testCase.name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      testReport.summary.failed++;
    }
    testReport.summary.total++;
  }
  
  testReport.summary.screenshots = testReport.results.length;
  
  // Save report
  const reportPath = `test-results/ui-test-report-${Date.now()}.json`;
  await page.evaluate((report, path) => {
    console.log('UI Test Report:', report);
  }, testReport, reportPath);
});

// Helper test functions
async function visualConsistencyTest(page: Page) {
  await page.goto('/');
  await expect(page).toHaveScreenshot('visual-consistency.png');
  return { status: 'Visual consistency validated' };
}

async function responsiveDesignTest(page: Page) {
  const viewports = [
    { width: 375, height: 667 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 }
  ];
  
  const results = [];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    results.push({
      viewport: `${viewport.width}x${viewport.height}`,
      status: 'passed'
    });
  }
  
  return { viewports: results };
}

async function accessibilityTest(page: Page) {
  await page.goto('/');
  
  // Basic accessibility checks
  const h1Count = await page.locator('h1').count();
  const skipLink = await page.locator('.skip-link').count();
  const altTexts = await page.locator('img[alt]').count();
  const totalImages = await page.locator('img').count();
  
  return {
    h1Count: h1Count,
    hasSkipLink: skipLink > 0,
    imageAltCoverage: `${altTexts}/${totalImages}`
  };
}

async function performanceTest(page: Page) {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const endTime = Date.now();
  
  return {
    loadTime: endTime - startTime,
    status: endTime - startTime < 5000 ? 'passed' : 'failed'
  };
}
```

---

## Related Files & Resources

- [API Testing Guide](./api-testing-guide.md)
- [Test Cases Documentation](./test-cases-main-page-objects.md)  
- [Copilot Instructions](./copilot-instructions.md)
- [Page Object Models](../playwright-latam-qa/pages/)
- [Playwright Configuration](../playwright-latam-qa/playwright.config.ts)

---

*This UI Testing & User Experience Guide (UIMD) provides comprehensive coverage of visual testing, accessibility validation, and user experience testing strategies in Playwright. Use this guide alongside the API testing documentation for complete test coverage.*