# Test Cases: Main Page Object Display and Interaction

## Overview
This document outlines test cases for displaying and interacting with page objects on the AutomationExercise e-commerce main page. Each test case follows a structured use case format with preconditions, test steps, expected results, and post-conditions.

## Test Environment
- **Base URL**: https://automationexercise.com
- **Browsers**: Chrome Desktop (1280x720), Chrome Mobile (iPhone 12)
- **Framework**: Playwright with Page Object Model (POM)

---

## UC-001: Display Main Navigation Elements

### Objective
Verify that all main navigation elements are visible and accessible on the homepage.

### Preconditions
- Browser is launched
- User navigates to the homepage

### Test Steps
1. Navigate to `https://automationexercise.com`
2. Wait for page to fully load
3. Verify presence of main navigation elements:
   - Home link
   - Products link
   - Cart link
   - Signup/Login link
   - Test Cases link
   - API Testing link
   - Video Tutorials link
   - Contact us link

### Expected Results
- All navigation links are visible
- All links are clickable and accessible
- Navigation maintains consistent styling across viewports

### Page Objects Used
```typescript
HomePage.productsLink = "a[href='/products']"
HomePage.signupLoginLink = "a[href='/login']"
HomePage.cartLink = "a[href='/view_cart']"
```

### Post-conditions
- User remains on homepage
- All navigation elements are functional

---

## UC-002: Display Product Categories Sidebar

### Objective
Verify that the product categories sidebar displays correctly with all category options.

### Preconditions
- User is on the homepage
- Page has fully loaded

### Test Steps
1. Locate the categories sidebar section
2. Verify "CATEGORY" heading is visible
3. Check for presence of main categories:
   - Women
   - Men
   - Kids
4. Verify each category is expandable/clickable
5. Test category navigation functionality

### Expected Results
- Categories sidebar is prominently displayed
- All main categories are visible
- Categories are interactive and lead to appropriate product pages
- Responsive behavior on mobile devices

### Page Objects Used
```typescript
HomePage.categoriesSection = ".left-sidebar .category-products"
HomePage.womenCategory = "a[href='#Women']"
HomePage.menCategory = "a[href='#Men']"
HomePage.kidsCategory = "a[href='#Kids']"
```

### Post-conditions
- Categories remain functional
- User can navigate back to homepage

---

## UC-003: Display Featured Items Section

### Objective
Verify that the featured items section displays products correctly with all necessary information.

### Preconditions
- User is on the homepage
- Internet connection is stable

### Test Steps
1. Scroll to "FEATURES ITEMS" section
2. Verify section heading is visible
3. Count number of displayed product cards
4. For each product card, verify:
   - Product image is loaded
   - Product name is displayed
   - Price information is visible
   - "Add to cart" button is present
   - "View Product" link is available
5. Test product card interactions

### Expected Results
- Featured items section displays multiple products (typically 8-12)
- All product information is clearly visible
- Images load without broken links
- Interactive elements (buttons/links) are functional
- Responsive layout works on mobile

### Page Objects Used
```typescript
ProductsPage.productCards = ".features_items .col-sm-4"
ProductsPage.productImage = ".productinfo img"
ProductsPage.productName = ".productinfo p"
ProductsPage.productPrice = ".productinfo h2"
ProductsPage.addToCartBtn = ".productinfo .btn"
ProductsPage.viewProductLink = "a[contains(text(), 'View Product')]"
```

### Post-conditions
- Products remain clickable
- Cart functionality is preserved

---

## UC-004: Display Footer Information

### Objective
Verify that footer section displays complete information and links.

### Preconditions
- User is on any page of the website
- User can scroll to bottom of page

### Test Steps
1. Scroll to bottom of the page
2. Verify footer sections are visible:
   - Company information
   - Contact details
   - Social media links
   - Newsletter subscription
   - Copyright information
3. Test footer link functionality
4. Verify newsletter subscription form

### Expected Results
- Footer is consistently displayed across all pages
- All footer information is legible
- Links open correctly (internal/external as appropriate)
- Newsletter form accepts input and submits
- Social media links are functional

### Page Objects Used
```typescript
BasePage.footer = "footer"
BasePage.companyInfo = ".footer-widget .single-widget"
BasePage.socialLinks = ".footer-widget .social-media"
BasePage.newsletterForm = "#susbscribe_email"
BasePage.subscribeBtn = "#subscribe"
```

### Post-conditions
- Footer remains functional
- Newsletter subscription works if tested

---

## UC-005: Display Search Functionality

### Objective
Verify that search functionality is accessible and functional from the main page.

### Preconditions
- User is on the homepage
- Search feature is enabled

### Test Steps
1. Navigate to Products page
2. Locate search input field
3. Verify search button is present
4. Enter test search term
5. Execute search
6. Verify search results display
7. Test search with various inputs:
   - Valid product names
   - Partial matches
   - Invalid/empty searches

### Expected Results
- Search input is clearly visible
- Search executes without errors
- Results are displayed appropriately
- No results message appears for invalid searches
- Search maintains functionality across devices

### Page Objects Used
```typescript
ProductsPage.searchInput = "#search_product"
ProductsPage.searchButton = "#submit_search"
ProductsPage.searchResults = ".features_items"
ProductsPage.noResultsMessage = ".text-center"
```

### Post-conditions
- Search functionality remains active
- User can perform additional searches

---

## UC-006: Display Shopping Cart Icon and Counter

### Objective
Verify that shopping cart icon displays correctly and shows accurate item counts.

### Preconditions
- User is on any page
- Cart functionality is enabled

### Test Steps
1. Locate cart icon in navigation
2. Verify cart counter displays (initially 0 or empty)
3. Add product to cart from featured items
4. Verify cart counter updates
5. Click cart icon to view cart page
6. Verify cart contents match counter

### Expected Results
- Cart icon is prominently displayed
- Counter updates accurately when items are added
- Cart icon links correctly to cart page
- Visual feedback confirms item additions
- Mobile cart icon remains accessible

### Page Objects Used
```typescript
BasePage.cartIcon = "a[href='/view_cart']"
BasePage.cartCounter = ".cart-count"
ProductDetailsPage.addToCartButton = "button:has-text('Add to cart')"
CartPage.cartItems = ".cart_info"
```

### Post-conditions
- Cart maintains accurate count
- Cart contents are preserved

---

## UC-007: Display Responsive Mobile Menu

### Objective
Verify that mobile navigation menu displays and functions correctly on mobile devices.

### Preconditions
- User accesses site on mobile device or mobile viewport
- Mobile responsive design is enabled

### Test Steps
1. Set viewport to mobile size (iPhone 12: 390x844)
2. Navigate to homepage
3. Locate mobile menu trigger (hamburger menu)
4. Tap/click to open mobile menu
5. Verify all navigation options are accessible
6. Test mobile menu navigation
7. Verify menu closes appropriately

### Expected Results
- Mobile menu trigger is visible on small screens
- Menu opens smoothly with proper animation
- All navigation items remain accessible
- Menu items are properly sized for touch
- Menu closes when item is selected or when clicking outside

### Page Objects Used
```typescript
HomePage.mobileMenuTrigger = ".navbar-toggle"
HomePage.mobileMenu = ".navbar-collapse"
HomePage.mobileNavItems = ".navbar-nav li"
```

### Post-conditions
- Mobile navigation remains functional
- Desktop menu is restored on larger screens

---

## UC-008: Display Promotional Banners and Advertisements

### Objective
Verify that promotional content displays appropriately without interfering with functionality.

### Preconditions
- User is on the homepage
- Advertisements are enabled

### Test Steps
1. Navigate to homepage
2. Identify promotional banners/ads
3. Verify ads do not block main content
4. Test interaction with main page elements
5. Verify ads are non-intrusive
6. Check ad placement on mobile vs desktop

### Expected Results
- Promotional content displays without blocking navigation
- Main functionality remains unimpaired by ads
- Ad content is appropriate and relevant
- Mobile ad placement doesn't interfere with touch targets
- Page performance remains acceptable

### Page Objects Used
```typescript
BasePage.advertisementBanners = ".advertisement"
BasePage.mainContent = ".main-content"
BasePage.navigationElements = ".navbar"
```

### Post-conditions
- Core functionality remains unaffected
- User experience is not significantly impacted

---

## Test Data Requirements

### Sample Product Information
- **Product Names**: Blue Top, Men Tshirt, Sleeveless Dress
- **Price Range**: Rs. 500 - Rs. 2000
- **Categories**: Women > Tops, Men > Tshirts, Kids > Dress

### User Credentials (for authenticated tests)
- **Test Email**: testuser@example.com
- **Test Password**: TestPass123
- **Test Name**: John Doe

### Search Terms
- **Valid**: "Blue Top", "Tshirt", "Dress"
- **Invalid**: "xyz123", "@#$%", ""
- **Partial**: "Blue", "Top", "Shirt"

---

## Automation Implementation Notes

### Page Object Implementation
```typescript
// HomePage.ts - Main page elements
export default class HomePage extends BasePage {
  // Navigation elements
  productsLink = "a[href='/products']";
  signupLoginLink = "a[href='/login']";
  
  // Featured items
  featuredItemsSection = ".features_items";
  productCards = ".features_items .col-sm-4";
  
  // Categories
  categoriesSection = ".left-sidebar";
  
  async verifyMainElements() {
    await expect(this.page.locator(this.productsLink)).toBeVisible();
    await expect(this.page.locator(this.featuredItemsSection)).toBeVisible();
    await expect(this.page.locator(this.categoriesSection)).toBeVisible();
  }
}
```

### Test Execution Commands
```bash
# Run all main page display tests
npx playwright test main-page-display.spec.ts

# Run specific use case
npx playwright test --grep "UC-001"

# Run on specific browser
npx playwright test --project=chromium-desktop main-page-display.spec.ts

# Generate test report
npx playwright test main-page-display.spec.ts --reporter=html
```

---

## Acceptance Criteria Summary

✅ **All navigation elements are visible and functional**  
✅ **Product listings display with complete information**  
✅ **Categories and filters work correctly**  
✅ **Search functionality operates as expected**  
✅ **Shopping cart updates accurately**  
✅ **Mobile responsiveness is maintained**  
✅ **Footer information is complete and accessible**  
✅ **Performance remains acceptable with all elements loaded**

---

## Related Documentation
- [Copilot Instructions](./copilot-instructions.md)
- [Page Object Model Implementation](../playwright-latam-qa/pages/)
- [Test Configuration](../playwright-latam-qa/playwright.config.ts)
- [API Testing Guide](./api-testing-guide.md)
- [UI Testing & UX Guide](./ui-testing-guide.md)
- [Test Documentation Index](./test-documentation-index.md)