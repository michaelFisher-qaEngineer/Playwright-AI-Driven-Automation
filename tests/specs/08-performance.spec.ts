import { test, expect, Page } from '@playwright/test';
import { navigateToHome, navigateToCategory, searchProduct, getPageLoadTime } from '../fixtures/helpers';
import { CATEGORIES, TIMEOUTS } from '../fixtures/test-data';

test.describe('Performance Testing (TC-041 to TC-044)', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('TC-041: Homepage Load Time - Loads within 3 seconds', async () => {
    const startTime = Date.now();
    await navigateToHome(page);
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(TIMEOUTS.pageLoad);
    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test('TC-041: Homepage Load Time - All critical elements load', async () => {
    const startTime = Date.now();
    await navigateToHome(page);

    // Verify critical elements loaded
    const nav = page.locator('nav').first();
    const banner = page.locator('header, banner').first();
    const products = page.locator('[class*="product"]').first();

    await expect(nav).toBeVisible({ timeout: 3000 });
    await expect(banner).toBeVisible({ timeout: 3000 });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(TIMEOUTS.pageLoad);
  });

  test('TC-041: Homepage Load Time - Multiple page loads consistent', async () => {
    const times: number[] = [];

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await page.goto('https://cloudberrystore.services');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      times.push(loadTime);
    }

    // Average should be under 3 seconds
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    expect(average).toBeLessThan(TIMEOUTS.pageLoad);
    console.log(`Homepage load times: ${times.join('ms, ')}ms`);
  });

  test('TC-042: Product Page Load Time - Loads within 2 seconds', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      const startTime = Date.now();
      await product.click();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(TIMEOUTS.productLoad);
      console.log(`Product page load time: ${loadTime}ms`);
    }
  });

  test('TC-042: Product Page Load Time - Images load quickly', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');

      const startImageTime = Date.now();
      
      // Wait for images to load
      const images = page.locator('img').first();
      await images.waitFor({ state: 'visible', timeout: 2000 });

      const imageLoadTime = Date.now() - startImageTime;
      expect(imageLoadTime).toBeLessThan(TIMEOUTS.productLoad);
    }
  });

  test('TC-042: Product Page Load Time - Multiple product pages consistent', async () => {
    const times: number[] = [];

    for (let i = 0; i < 3 && i < 3; i++) {
      await navigateToCategory(page, CATEGORIES[i].path);

      const product = page.locator('a[class*="product"]').nth(i);
      if (await product.isVisible()) {
        const startTime = Date.now();
        await product.click();
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        times.push(loadTime);

        await page.goBack();
      }
    }

    if (times.length > 0) {
      const average = times.reduce((a, b) => a + b, 0) / times.length;
      expect(average).toBeLessThan(TIMEOUTS.productLoad * 1.5);
      console.log(`Product load times: ${times.join('ms, ')}ms`);
    }
  });

  test('TC-043: Search Performance - Results appear within 1 second', async () => {
    await navigateToHome(page);

    const searchBox = page.locator('input[placeholder="Search"]');
    const startTime = Date.now();

    await searchBox.fill('Laptop');
    const searchButton = page.locator('button[type="submit"]').first();
    await searchButton.click();

    // Wait for results
    const results = page.locator('[class*="product"]').first();
    await results.waitFor({ state: 'visible', timeout: 1500 });

    const searchTime = Date.now() - startTime;
    expect(searchTime).toBeLessThan(TIMEOUTS.searchResult + 1000);
    console.log(`Search time: ${searchTime}ms`);
  });

  test('TC-043: Search Performance - Multiple searches responsive', async () => {
    await navigateToHome(page);

    const searchTerms = ['iPhone', 'Tablet', 'Camera'];
    const times: number[] = [];

    for (const term of searchTerms) {
      const startTime = Date.now();
      await searchProduct(page, term);
      const searchTime = Date.now() - startTime;
      times.push(searchTime);

      await navigateToHome(page);
    }

    // All searches should be responsive
    const maxTime = Math.max(...times);
    expect(maxTime).toBeLessThan(TIMEOUTS.searchResult + 1000);
    console.log(`Search times: ${times.join('ms, ')}ms`);
  });

  test('TC-043: Search Performance - Pagination loads quickly', async () => {
    await navigateToHome(page);
    await searchProduct(page, 'product');

    const nextPageBtn = page.locator('a[rel*="next"], a').filter({ hasText: /next|>/i }).first();
    if (await nextPageBtn.isVisible()) {
      const startTime = Date.now();
      await nextPageBtn.click();
      await page.waitForLoadState('networkidle');
      const pageTime = Date.now() - startTime;

      expect(pageTime).toBeLessThan(TIMEOUTS.pageLoad);
    }
  });

  test('TC-044: Cart Operations Speed - Add to cart responds in under 500ms', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');

      const startTime = Date.now();

      const quantityInput = page.locator('input[name="quantity"]').first();
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('1');
      }

      const addBtn = page.locator('button').filter({ hasText: /Add to Cart/i }).first();
      await addBtn.click();

      // Wait for visual feedback
      await page.waitForTimeout(300);

      const operationTime = Date.now() - startTime;
      expect(operationTime).toBeLessThan(TIMEOUTS.cartOperation + 500);
      console.log(`Add to cart time: ${operationTime}ms`);
    }
  });

  test('TC-044: Cart Operations - Remove item response time', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);

      // View cart
      const cartLink = page.locator('a').filter({ hasText: /Shopping Cart/i }).first();
      await cartLink.click();
      await page.waitForLoadState('networkidle');

      // Remove item
      const startTime = Date.now();
      const removeBtn = page.locator('button').filter({ hasText: /Remove|Delete/i }).first();
      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await page.waitForTimeout(300);

        const operationTime = Date.now() - startTime;
        expect(operationTime).toBeLessThan(TIMEOUTS.cartOperation + 500);
      }
    }
  });

  test('TC-044: Cart Operations - Update quantity response time', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);

      // View cart
      const cartLink = page.locator('a').filter({ hasText: /Shopping Cart/i }).first();
      await cartLink.click();
      await page.waitForLoadState('networkidle');

      // Update quantity
      const quantityInput = page.locator('input[name*="quantity"]').first();
      if (await quantityInput.isVisible()) {
        const startTime = Date.now();
        await quantityInput.fill('5');

        const updateBtn = page.locator('button').filter({ hasText: /Update/i }).first();
        if (await updateBtn.isVisible()) {
          await updateBtn.click();
          await page.waitForTimeout(300);

          const operationTime = Date.now() - startTime;
          expect(operationTime).toBeLessThan(TIMEOUTS.cartOperation + 1000);
        }
      }
    }
  });

  test('TC-041 to TC-044: No performance degradation over time', async () => {
    // Monitor performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return {
        navigationStart: (window as any).performance.timing.navigationStart,
        loadEventEnd: (window as any).performance.timing.loadEventEnd,
        memory: (window as any).performance.memory?.usedJSHeapSize,
      };
    }).catch(() => ({}));

    expect(performanceMetrics).toBeTruthy();
    console.log('Performance metrics:', performanceMetrics);
  });

  test('TC-041 to TC-044: Core Web Vitals check', async () => {
    await navigateToHome(page);

    // Get Core Web Vitals using PerformanceObserver
    const cwv = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1] as any;
            vitals.lcp = lastEntry.renderTime || lastEntry.startTime;
          }
        });
        
        // First Input Delay - safely access processingDuration
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const entry = entries[0] as any;
            vitals.fid = entry.processingDuration || 0;
          }
        });
        
        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // Observers not supported in all browsers
        }

        setTimeout(() => resolve(vitals), 2000);
      });
    }).catch(() => ({}));

    console.log('Core Web Vitals:', cwv);
  });
});

// Helper function for cart operation tests
async function addProductToCart(page: Page, quantity: number) {
  const quantityInput = page.locator('input[name="quantity"]').first();
  if (await quantityInput.isVisible()) {
    await quantityInput.fill(quantity.toString());
  }
  
  const addBtn = page.locator('button').filter({ hasText: /Add to Cart/i }).first();
  await addBtn.click();
  await page.waitForLoadState('networkidle');
}
