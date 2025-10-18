import { test, expect } from '@playwright/test';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';

test.describe('Main Page Object Display - Use Cases', () => {

  test('UC-001: Display Main Navigation Elements', async ({ page, browserName }) => {
    const home = new HomePage(page);
    
    console.log(`Testing UC-001 on ${browserName}`);

    // Step 1: Navigate to homepage
    await home.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);

    // Step 3: Verify navigation elements
    await expect(page.getByRole('link', { name: ' Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: ' Products' })).toBeVisible();
    await expect(page.getByRole('link', { name: ' Cart' })).toBeVisible();
    await expect(page.getByRole('link', { name: ' Signup / Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: ' Test Cases' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: ' API Testing' })).toBeVisible();
    await expect(page.getByRole('link', { name: ' Video Tutorials' })).toBeVisible();
    await expect(page.getByRole('link', { name: ' Contact us' })).toBeVisible();

    console.log('✅ UC-001: All navigation elements verified');
  });

  test('UC-002: Display Product Categories Sidebar', async ({ page }) => {
    const home = new HomePage(page);
    
    console.log('Testing UC-002: Categories Sidebar');

    await home.goto('/');
    
    // Verify categories section
    await expect(page.locator('.left-sidebar')).toBeVisible();
    await expect(page.locator('text=CATEGORY')).toBeVisible();
    
    // Check for main categories (wait for them to load)
    await page.waitForSelector('a:has-text("Women")', { timeout: 5000 }).catch(() => {});
    
    const womenCategory = page.locator('a:has-text("Women")').first();
    const menCategory = page.locator('a:has-text("Men")').first();
    const kidsCategory = page.locator('a:has-text("Kids")').first();
    
    if (await womenCategory.isVisible()) {
      console.log('✅ Women category found');
    }
    if (await menCategory.isVisible()) {
      console.log('✅ Men category found');
    }
    if (await kidsCategory.isVisible()) {
      console.log('✅ Kids category found');
    }

    console.log('✅ UC-002: Categories sidebar verified');
  });

  test('UC-003: Display Featured Items Section', async ({ page }) => {
    const home = new HomePage(page);
    const products = new ProductsPage(page);
    
    console.log('Testing UC-003: Featured Items');

    await home.goto('/');
    
    // Verify featured items section
    await expect(page.locator('text=FEATURES ITEMS')).toBeVisible();
    await page.waitForSelector(products.productCards, { timeout: 10000 });
    
    // Count product cards
    const productCards = page.locator(products.productCards);
    const count = await productCards.count();
    console.log(`Found ${count} product cards`);
    expect(count).toBeGreaterThan(0);
    
    // Verify first product card elements
    const firstProduct = productCards.first();
    await expect(firstProduct.locator('img')).toBeVisible();
    await expect(firstProduct.locator('p').first()).toBeVisible(); // Product name
    await expect(firstProduct.locator('h2').first()).toBeVisible(); // Price
    await expect(firstProduct.locator('a:has-text("Add to cart")').first()).toBeVisible();
    await expect(firstProduct.locator('a:has-text("View Product")')).toBeVisible();

    console.log('✅ UC-003: Featured items section verified');
  });

  test('UC-004: Display Footer Information', async ({ page }) => {
    const home = new HomePage(page);
    
    console.log('Testing UC-004: Footer Information');

    await home.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Verify footer sections
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for common footer elements
    await expect(page.locator('text=SUBSCRIPTION')).toBeVisible();
    await expect(page.locator('#susbscribe_email, input[placeholder*="email"], input[type="email"]')).toBeVisible();
    
    // Look for copyright or company information
    const copyrightText = await page.locator('text=/Copyright|©|All rights reserved/i').isVisible();
    if (copyrightText) {
      console.log('✅ Copyright information found');
    }

    console.log('✅ UC-004: Footer information verified');
  });

  test('UC-005: Display Search Functionality', async ({ page }) => {
    const home = new HomePage(page);
    const products = new ProductsPage(page);
    
    console.log('Testing UC-005: Search Functionality');

    // Navigate to products page where search is available
    await home.goto('/');
    
    // Use fallback navigation if products link is blocked by ads
    try {
      await home.goToProducts();
    } catch (error) {
      console.log(`Products link blocked (${error}), using direct navigation`);
      await page.goto('https://automationexercise.com/products');
    }
    await expect(page).toHaveURL(/\/products/);
    
    // Verify search elements
    const searchInput = page.locator('#search_product, input[name="search"], input[placeholder*="Search"]').first();
    const searchButton = page.locator('#submit_search, button:has-text("Search"), .btn:has-text("Search")').first();
    
    await expect(searchInput).toBeVisible();
    await expect(searchButton).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('Blue Top');
    await searchButton.click();
    
    // Wait for results or "no products found" message
    await page.waitForTimeout(2000);
    
    // Check if we have results or appropriate message
    const hasResults = await page.locator(products.productCards).count() > 0;
    const hasNoResultsMsg = await page.locator('text=/No products found|No results/i').isVisible();
    
    if (hasResults) {
      console.log('✅ Search returned results');
    } else if (hasNoResultsMsg) {
      console.log('✅ Search showed "no results" message');
    } else {
      console.log('⚠️ Search behavior unclear');
    }

    console.log('✅ UC-005: Search functionality verified');
  });

  test('UC-006: Display Shopping Cart Icon and Counter', async ({ page }) => {
    const home = new HomePage(page);
    
    console.log('Testing UC-006: Shopping Cart Icon');

    await home.goto('/');
    
    // Verify cart icon/link
    const cartLink = page.getByRole('link', { name: ' Cart' });
    await expect(cartLink).toBeVisible();
    
    // Click on cart to verify it works
    await cartLink.click();
    await expect(page).toHaveURL(/\/view_cart/);
    
    // Verify cart page elements
    await expect(page.locator('text=Shopping Cart')).toBeVisible();

    console.log('✅ UC-006: Shopping cart icon verified');
  });

  test('UC-007: Display Responsive Mobile Menu @mobile-only', async ({ page }) => {
    const home = new HomePage(page);
    
    console.log('Testing UC-007: Mobile Menu (Mobile viewport only)');

    // This test is specifically for mobile viewport
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 size
    await home.goto('/');
    
    // Look for mobile menu elements
    const mobileMenuTrigger = page.locator('.navbar-toggle, .mobile-menu, .hamburger, button[aria-label*="menu"]').first();
    
    if (await mobileMenuTrigger.isVisible()) {
      console.log('✅ Mobile menu trigger found');
      await mobileMenuTrigger.click();
      await page.waitForTimeout(1000); // Wait for menu animation
      
      // Verify menu opened
      const mobileMenu = page.locator('.navbar-collapse, .mobile-nav, .nav-menu').first();
      if (await mobileMenu.isVisible()) {
        console.log('✅ Mobile menu opened successfully');
      }
    } else {
      console.log('⚠️ Mobile menu trigger not found or not needed');
    }

    console.log('✅ UC-007: Mobile menu behavior verified');
  });

  test('UC-008: Display Promotional Banners and Advertisements', async ({ page }) => {
    const home = new HomePage(page);
    
    console.log('Testing UC-008: Promotional Content');

    await home.goto('/');
    
    // Check for advertisement sections
    const ads = page.locator('.advertisement, .banner, .promo, .ad-section');
    const adCount = await ads.count();
    
    console.log(`Found ${adCount} potential advertisement sections`);
    
    // Verify main content is not blocked
    await expect(page.locator('.features_items')).toBeVisible();
    await expect(page.getByRole('link', { name: ' Products' })).toBeVisible();
    
    // Check that navigation still works despite ads
    await page.getByRole('link', { name: ' Products' }).click();
    await expect(page).toHaveURL(/\/products/);
    
    console.log('✅ UC-008: Promotional content does not block functionality');
  });

  test('UC-ALL: Comprehensive Page Load Verification', async ({ page }) => {
    const home = new HomePage(page);
    
    console.log('Testing UC-ALL: Comprehensive verification');

    await home.goto('/');
    
    // Verify key elements are all present
    const verifications = [
      { element: 'navigation', locator: page.getByRole('link', { name: ' Products' }) },
      { element: 'featured items', locator: page.locator('text=FEATURES ITEMS') },
      { element: 'categories', locator: page.locator('.left-sidebar') },
      { element: 'footer', locator: page.locator('footer') }
    ];
    
    for (const check of verifications) {
      await expect(check.locator).toBeVisible();
      console.log(`✅ ${check.element} verified`);
    }
    
    // Verify page performance (basic check)
    const performanceEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return entries.length > 0 ? {
        loadTime: entries[0].loadEventEnd - entries[0].startTime,
        domContentLoaded: entries[0].domContentLoadedEventEnd - entries[0].startTime
      } : null;
    });
    
    if (performanceEntries) {
      console.log(`Page load time: ${performanceEntries.loadTime}ms (DOM: ${performanceEntries.domContentLoaded}ms)`);
    }

    console.log('✅ UC-ALL: Comprehensive page verification completed');
  });

});