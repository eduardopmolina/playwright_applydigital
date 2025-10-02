$PROJECT = "playwright-latam-qa"

# Clean old project if exists
if (Test-Path $PROJECT) { Remove-Item $PROJECT -Recurse -Force }
if (Test-Path "$PROJECT.zip") { Remove-Item "$PROJECT.zip" }

# Create folder structure
New-Item -ItemType Directory -Force -Path "$PROJECT/pages","$PROJECT/tests","$PROJECT/utils","$PROJECT/scripts","$PROJECT/reports" | Out-Null
New-Item -ItemType Directory -Force -Path "$PROJECT/.github/workflows" | Out-Null

# ---------- package.json ----------
@'
{
  "name": "playwright-latam-qa",
  "version": "1.0.0",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:report": "playwright show-report",
    "install:all": "npm install && npx playwright install",
    "lighthouse:accessibility": "node ./scripts/run-lighthouse.js accessibility",
    "lighthouse:performance": "node ./scripts/run-lighthouse.js performance"
  },
  "devDependencies": {
    "@playwright/test": "^1.36.0",
    "@faker-js/faker": "^8.0.0",
    "lighthouse": "^10.0.0",
    "chrome-launcher": "^0.16.0",
    "typescript": "^5.0.0"
  }
}
'@ | Set-Content "$PROJECT/package.json"

# ---------- tsconfig.json ----------
@'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "types": ["node", "jest", "@playwright/test"]
  },
  "include": ["**/*.ts"]
}
'@ | Set-Content "$PROJECT/tsconfig.json"

# ---------- playwright.config.ts ----------
@'
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 5000 },
  reporter: [['html', { outputFolder: 'reports/playwright-report', open: 'never' }]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    baseURL: 'https://automationexercise.com/',
    ignoreHTTPSErrors: true
  },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } } },
    { name: 'webkit-mobile', use: { browserName: 'webkit', ...devices['iPhone 12'] } }
  ]
};

export default config;
'@ | Set-Content "$PROJECT/playwright.config.ts"

# ---------- BasePage.ts ----------
@'
import { Page } from '@playwright/test';

export default class BasePage {
  protected page: Page;
  constructor(page: Page) { this.page = page; }
  async goto(path = '/') { await this.page.goto(path); }
}
'@ | Set-Content "$PROJECT/pages/BasePage.ts"

# ---------- HomePage.ts ----------
@'
import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class HomePage extends BasePage {
  constructor(page: Page) { super(page); }
  productsLink = "a[href='/products']";
  async goToProducts() {
    await this.page.click(this.productsLink);
    // cSpell:ignore networkidle
    await page.waitForLoadState('networkidle',{timeout:30000});
  }
}
'@ | Set-Content "$PROJECT/pages/HomePage.ts"

# ---------- ProductsPage.ts ----------
@'
import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class ProductsPage extends BasePage {
  constructor(page: Page) { super(page); }
  productCards = ".features_items .col-sm-4";
  async openThirdProduct() {
    await this.page.waitForSelector(this.productCards);
    const third = this.page.locator(this.productCards).nth(2);
    await third.scrollIntoViewIfNeeded();
    const viewBtn = third.locator("a", { hasText: "View Product" });
    await viewBtn.click();
    await this.page.waitForLoadState("networkidle");
  }
}
'@ | Set-Content "$PROJECT/pages/ProductsPage.ts"

# ---------- ProductDetailsPage.ts ----------
@'
import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class ProductDetailsPage extends BasePage {
  constructor(page: Page) { super(page); }
  quantityInput = "#quantity";
  addToCartButton = "button:has-text('Add to cart')";
  proceedToCheckoutBtn = "a:has-text('Proceed To Checkout'), button:has-text('Proceed To Checkout')";
  async setQuantity(qty: number) { await this.page.fill(this.quantityInput, String(qty)); }
  async addToCart() {
    await this.page.click(this.addToCartButton);
    await this.page.waitForSelector("div.modal-content, #cartModal", { timeout: 5000 }).catch(() => {});
  }
  async proceedToCheckout() {
    const proceed = this.page.locator(this.proceedToCheckoutBtn);
    if (await proceed.count()) { await proceed.first().click(); }
    else { await this.page.goto("/view_cart"); }
    await this.page.waitForLoadState("networkidle");
  }
}
'@ | Set-Content "$PROJECT/pages/ProductDetailsPage.ts"

# ---------- CartPage.ts ----------
@'
import BasePage from "./BasePage";
import { Page } from "@playwright/test";

export default class CartPage extends BasePage {
  constructor(page: Page) { super(page); }
  registerLoginModal = "#checkoutModal, #register-login-modal, #loginModal";
  async isRegisterLoginModalVisible() {
    const visible = await this.page.locator("text=Register / Login").count() || await this.page.locator(this.registerLoginModal).count();
    return visible > 0;
  }
}
'@ | Set-Content "$PROJECT/pages/CartPage.ts"

# ---------- Utils/random.ts ----------
@'
export function randomInt(min = 1, max = 20): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
'@ | Set-Content "$PROJECT/utils/random.ts"

# ---------- Test file ----------
@'
import { test, expect } from "@playwright/test";
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import { randomInt } from "../utils/random";

test.describe("Add third product and proceed to checkout", () => {
  test("Desktop & Mobile flow", async ({ page }) => {
    const home = new HomePage(page);
    const products = new ProductsPage(page);
    const details = new ProductDetailsPage(page);
    const cart = new CartPage(page);

    await home.goto("/");
    await home.goToProducts();
    await products.openThirdProduct();

    const qty = randomInt(1, 20);
    await details.setQuantity(qty);
    await details.addToCart();
    await details.proceedToCheckout();

    expect(await cart.isRegisterLoginModalVisible()).toBeTruthy();
  });
});
'@ | Set-Content "$PROJECT/tests/product.spec.ts"

# ---------- Lighthouse script ----------
@'
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs");

(async () => {
  const category = process.argv[2] || "accessibility";
  const url = "https://automationexercise.com/";
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = { port: chrome.port, output: "json" };
  const runnerResult = await lighthouse(url, options);
  const categories = runnerResult.lhr.categories;
  const result = {
    accessibility: categories.accessibility.score * 100,
    performance: categories.performance.score * 100,
    seo: categories.seo.score * 100
  };
  fs.writeFileSync(`reports/lighthouse-${category}.json`, JSON.stringify(result, null, 2));
  console.log("Lighthouse scores:", result);
  await chrome.kill();
})();
'@ | Set-Content "$PROJECT/scripts/run-lighthouse.js"

# ---------- GitHub Actions Workflow ----------
@'
name: Playwright Tests and Lighthouse Audits

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: reports/playwright-report

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: node ./scripts/run-lighthouse.js accessibility
      - run: node ./scripts/run-lighthouse.js performance
      - name: Upload Lighthouse Reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-reports
          path: reports/*.json
'@ | Set-Content "$PROJECT/.github/workflows/ci.yml"
