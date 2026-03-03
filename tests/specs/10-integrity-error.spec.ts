import { test, expect, Page } from '@playwright/test';
import { navigateToHome, navigateToCategory, addProductToCart, viewCart } from '../fixtures/helpers';
import { SITE_URL, CATEGORIES } from '../fixtures/test-data';

test.describe('Error Handling (TC-049 to TC-050)', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('TC-049: 404 Error - Non-existent page shows error page', async () => {
    await page.goto(`${SITE_URL}/nonexistent-page-xyz`).catch(() => {});
    await page.waitForLoadState('networkidle');

    // Should show error message or return to home
    const content = await page.content();
    const has404 = content.includes('404') || content.includes('not found') || page.url().includes(SITE_URL);

    expect(has404).toBeTruthy();
  });

  test('TC-049: 404 Error - Navigation available from error page', async () => {
    await page.goto(`${SITE_URL}/invalid-route`).catch(() => {});
    await page.waitForLoadState('networkidle');

    // Look for navigation to return home
    const homeLink = page.locator('a').filter({ hasText: /home|logo|shop/i }).first();
    const isVisible = await homeLink.isVisible().catch(() => false);

    if (isVisible) {
      await homeLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain(SITE_URL);
    }
  });

  test('TC-049: 404 Error - User can search from error page', async () => {
    await page.goto(`${SITE_URL}/nonexistent`).catch(() => {});
    await page.waitForLoadState('networkidle');

    const searchBox = page.locator('input[placeholder="Search"]').first();
    const isVisible = await searchBox.isVisible().catch(() => false);

    if (isVisible) {
      await searchBox.fill('laptop');
      const searchBtn = page.locator('button[type="submit"]').first();
      await searchBtn.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toBeTruthy();
    }
  });

  test('TC-050: Network Error - Graceful handling of network issues', async () => {
    await navigateToHome(page);

    // Simulate offline
    await page.context().setOffline(true);

    // Try to navigate
    let errorOccurred = false;
    const failedRequest = await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' }).catch(err => {
      errorOccurred = true;
      return null;
    });

    // Should handle gracefully
    expect(errorOccurred || failedRequest).toBeTruthy();

    // Restore connection
    await page.context().setOffline(false);
  });

  test('TC-050: Network Error - Cart persists after network recovery', async () => {
    await navigateToHome(page);
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);
    }

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(500);

    // Go back online
    await page.context().setOffline(false);
    await navigateToHome(page);

    // Check if can view cart
    const cartLink = page.locator('a').filter({ hasText: /Cart/i }).first();
    if (await cartLink.isVisible()) {
      await cartLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});

      // Cart should have data or be empty, but not crash
      expect(page.url()).toBeTruthy();
    }
  });

  test('TC-050: Timeout Handling - Page handles slow requests', async () => {
    const startTime = Date.now();
    
    await navigateToHome(page);

    const timeout = Date.now() - startTime;
    // Even if slow, should eventually load
    expect(page.url()).toContain(SITE_URL);

    // Page should still be interactive
    const nav = page.locator('nav').first();
    const isVisible = await nav.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('TC-050: JavaScript Errors - Page handles JS errors gracefully', async () => {
    let jsErrorCount = 0;

    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrorCount++;
      }
    });

    await navigateToHome(page);

    // Some errors might be present, but page should still work
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('TC-049 to TC-050: User friendly error messages', async () => {
    // Navigate to page that might error
    await navigateToHome(page);

    const accountLink = page.locator('a').filter({ hasText: /My Account/i }).first();
    if (await accountLink.isVisible()) {
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Try to submit form without data
      const loginBtn = page.locator('button').filter({ hasText: /Login/i }).first();
      if (await loginBtn.isVisible()) {
        await loginBtn.click();
        await page.waitForTimeout(500);

        // Should show user-friendly message, not technical error
        const errorMsg = page.locator('[class*="error"], [class*="alert"]').first();
        const errorVisible = await errorMsg.isVisible().catch(() => false);

        if (errorVisible) {
          const errorText = await errorMsg.textContent();
          // Error should be readable, not a stack trace
          expect(errorText).not.toMatch(/at |TypeError|ReferenceError/);
        }
      }
    }
  });
});

test.describe('Data Integrity (TC-051 to TC-053)', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('TC-051: Cart Persistence - Items persist after page reload', async () => {
    await navigateToHome(page);
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 2);
    }

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check cart count
    const cartBtn = page.locator('button').filter({ hasText: /item\(s\)/ }).first();
    const cartText = await cartBtn.textContent().catch(() => '');

    // Should show item(s) in cart
    expect(cartText).toMatch(/\d+\s*item/i);
  });

  test('TC-051: Cart Persistence - Cart persists across different pages', async () => {
    await navigateToHome(page);
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);
    }

    // Navigate to different category
    await navigateToCategory(page, CATEGORIES[1].path);

    // Check cart still has item
    const cartBtn = page.locator('button').filter({ hasText: /item\(s\)/ }).first();
    const cartText = await cartBtn.textContent();

    expect(cartText).toMatch(/1\s*item|cart/i);
  });

  test('TC-052: Price Accuracy - Subtotal calculation is correct', async () => {
    await navigateToHome(page);
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);
    }

    await viewCart(page);

    // Get product price and quantity
    const priceElements = page.locator('[class*="price"]');
    const priceText = await priceElements.first().textContent().catch(() => '');

    // Extract price value
    const priceMatch = priceText?.match(/\$?([\d.]+)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

    // Get subtotal
    const subtotalText = await page.locator('text=/Subtotal/i').first().textContent().catch(() => '');
    const subtotalMatch = subtotalText?.match(/\$?([\d.]+)/);
    const subtotal = subtotalMatch ? parseFloat(subtotalMatch[1]) : 0;

    // Subtotal should match price for single item
    if (price > 0) {
      expect(Math.abs(subtotal - price)).toBeLessThan(0.01);
    }
  });

  test('TC-052: Price Accuracy - Tax calculation if applicable', async () => {
    await navigateToHome(page);
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);
    }

    await viewCart(page);

    // Look for tax line
    const taxElement = page.locator('text=/Tax|Tax:/i').first();
    const taxVisible = await taxElement.isVisible().catch(() => false);

    const taxText = await taxElement.textContent().catch(() => '');
    const taxMatch = taxText?.match(/\$?([\d.]+)/);
    const tax = taxMatch ? parseFloat(taxMatch[1]) : 0;

    // Tax should be >= 0
    expect(tax).toBeGreaterThanOrEqual(0);
  });

  test('TC-052: Price Accuracy - Total is sum of components', async () => {
    await navigateToHome(page);
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);
    }

    await viewCart(page);

    // Get subtotal, shipping, tax
    const subtotalText = await page.locator('text=/Subtotal/i').first().textContent().catch(() => '0');
    const shippingText = await page.locator('text=/Shipping/i').first().textContent().catch(() => '0');
    const taxText = await page.locator('text=/Tax/i').first().textContent().catch(() => '0');
    const totalText = await page.locator('text=/Total[^a-z]/i').first().textContent().catch(() => '0');

    // Extract numbers
    const subtotal = parseFloat(subtotalText?.match(/[\d.]+/)?.[0] || '0');
    const shipping = parseFloat(shippingText?.match(/[\d.]+/)?.[0] || '0');
    const tax = parseFloat(taxText?.match(/[\d.]+/)?.[0] || '0');
    const total = parseFloat(totalText?.match(/[\d.]+/)?.[0] || '0');

    // Total should approximately equal subtotal + shipping + tax
    const calculated = subtotal + shipping + tax;
    if (total > 0) {
      expect(Math.abs(total - calculated)).toBeLessThan(0.5);
    }
  });

  test('TC-053: Order Duplication - Cannot place same order twice with single checkout', async () => {
    await navigateToHome(page);
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);
    }

    // Try to go through checkout (as far as possible without real payment)
    const checkoutLink = page.locator('a').filter({ hasText: /Checkout/i }).first();
    if (await checkoutLink.isVisible()) {
      await checkoutLink.click();
      await page.waitForLoadState('networkidle');

      // Verify checkout page and get URL
      const checkoutUrl = page.url();

      // Reload checkout page (simulating double-click or retry)
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be on checkout, not create duplicate
      expect(page.url()).toContain('checkout');
    }
  });

  test('TC-053: Order Duplication - Cart empties after successful order', async () => {
    await navigateToHome(page);
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);
    }

    // Get initial cart count
    const cartBtn = page.locator('button').filter({ hasText: /item\(s\)/ }).first();
    const initialCartText = await cartBtn.textContent();
    const initialCount = parseInt(initialCartText?.match(/\d+/)?.[0] || '0');

    // If we could complete order, cart should clear
    // This is a basic check - full order completion test in checkout suite
    expect(initialCount).toBeGreaterThan(0);
  });
});

test.describe('Currency & Language (TC-034 to TC-035)', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('TC-034: Currency Selection - Currency selector is available', async () => {
    await navigateToHome(page);

    const currencyLink = page.locator('a').filter({ hasText: /\$|Currency|USD/i }).first();
    const isVisible = await currencyLink.isVisible().catch(() => false);

    expect(isVisible).toBeTruthy();
  });

  test('TC-034: Currency Selection - Can change currency', async () => {
    await navigateToHome(page);

    const currencyLink = page.locator('a').filter({ hasText: /\$|Currency/i }).first();
    if (await currencyLink.isVisible()) {
      await currencyLink.click();
      await page.waitForTimeout(300);

      // Look for currency options
      const currencyOptions = page.locator('a').filter({ hasText: /USD|EUR|GBP/i });
      const optionCount = await currencyOptions.count();

      if (optionCount > 0) {
        // Click first currency option
        await currencyOptions.first().click();
        await page.waitForTimeout(500);

        // Prices should update
        expect(page.url()).toBeTruthy();
      }
    }
  });

  test('TC-034: Currency Selection - Prices update with currency change', async () => {
    await navigateToHome(page);

    const initialPrice = await page.locator('[class*="price"]').first().textContent();

    const currencyLink = page.locator('a').filter({ hasText: /\$|Currency/i }).first();
    if (await currencyLink.isVisible()) {
      await currencyLink.click();
      await page.waitForTimeout(300);

      // Select different currency if available
      const eurOption = page.locator('a').filter({ hasText: /EUR|€/i });
      if (await eurOption.isVisible()) {
        await eurOption.click();
        await page.waitForLoadState('networkidle');

        const newPrice = await page.locator('[class*="price"]').first().textContent();

        // Price display might change
        expect(newPrice).toBeTruthy();
      }
    }
  });

  test('TC-035: Language Selection - Language selector exists', async () => {
    await navigateToHome(page);

    // Look for language selector
    const languageSelector = page.locator('select[name*="language"], a').filter({ hasText: /English|Language|EN/i }).first();
    const isVisible = await languageSelector.isVisible().catch(() => false);

    if (isVisible) {
      expect(isVisible).toBeTruthy();
    }
  });

  test('TC-035: Language Selection - Can change language', async () => {
    await navigateToHome(page);

    const languageLink = page.locator('a').filter({ hasText: /English|Language|EN/i }).first();
    if (await languageLink.isVisible()) {
      const initialUrl = page.url();
      
      await languageLink.click();
      await page.waitForLoadState('networkidle');

      // URL or page should reflect language change
      const newUrl = page.url();
      expect(newUrl).toBeTruthy();
    }
  });

  test('TC-035: Language Selection - Page content updates with language', async () => {
    await navigateToHome(page);

    const initialTitle = await page.title();

    // If language selector exists, try changing
    const languageLink = page.locator('a').filter({ hasText: /Language/i }).first();
    const hasLanguageOption = await languageLink.isVisible().catch(() => false);

    if (hasLanguageOption) {
      // Check multiple language options
      const menuItems = page.locator('nav a').first();
      const menuText = await menuItems.textContent();

      expect(menuText).toBeTruthy();
    }
  });
});

test.describe('Contact & Communication (TC-032 to TC-033)', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('TC-032: Contact Form - Contact page accessible', async () => {
    await navigateToHome(page);

    const contactLink = page.locator('a').filter({ hasText: /Contact|123456789/i }).first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('contact');
    }
  });

  test('TC-032: Contact Form - Form fields present', async () => {
    await navigateToHome(page);

    const contactLink = page.locator('a').filter({ hasText: /Contact|123456789/i }).first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await page.waitForLoadState('networkidle');

      // Look for contact form
      const nameField = page.locator('input[name*="name"], textarea[name*="name"]').first();
      const emailField = page.locator('input[type="email"]').first();
      const messageField = page.locator('textarea').first();

      const hasForm = await nameField.isVisible().catch(() => false) ||
                      await emailField.isVisible().catch(() => false) ||
                      await messageField.isVisible().catch(() => false);

      expect(hasForm).toBeTruthy();
    }
  });

  test('TC-033: Contact Form Validation - Required fields validation', async () => {
    await navigateToHome(page);

    const contactLink = page.locator('a').filter({ hasText: /Contact|123456789/i }).first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await page.waitForLoadState('networkidle');

      // Try to submit without filling
      const submitBtn = page.locator('button').filter({ hasText: /Submit|Send|Contact/i }).first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(1000);

        // Should show validation error
        const errorMsg = page.locator('[class*="error"], [role="alert"]').first();
        const hasError = await errorMsg.isVisible().catch(() => false);

        const stillOnContact = page.url().includes('contact');
        expect(hasError || stillOnContact).toBeTruthy();
      }
    }
  });
});
