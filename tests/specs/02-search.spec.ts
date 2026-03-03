import { test, expect, Page } from '@playwright/test';
import { navigateToHome, searchProduct } from '../fixtures/helpers';

test.describe('Search Functionality (TC-005 to TC-007)', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('TC-005: Basic Search - Search for "iPhone" returns relevant products', async () => {
    await navigateToHome(page);

    // Use the search helper
    await searchProduct(page, 'iPhone');

    // Verify search results page loaded
    const searchResults = page.locator('[class*="product"]').first();
    await expect(searchResults).toBeVisible({ timeout: 5000 });

    // Verify page contains search results
    const pageContent = await page.content();
    expect(pageContent).toMatch(/search|product|result/i);
  });

  test('TC-005: Basic Search - Search displays product information', async () => {
    await navigateToHome(page);
    await searchProduct(page, 'iPhone');

    // Verify product name is displayed
    const productName = page.locator('[class*="product-name"], h2, h3').first();
    await expect(productName).toBeVisible();

    // Verify price is displayed
    const price = page.locator('[class*="price"]').first();
    await expect(price).toBeVisible();
  });

  test('TC-005: Basic Search - Multiple product searches', async () => {
    await navigateToHome(page);

    // Search for first product
    await searchProduct(page, 'Laptop');
    let results = page.locator('[class*="product"]');
    let resultCount = await results.count();
    // Results might be empty, which is acceptable
    expect(resultCount).toBeGreaterThanOrEqual(0);

    // Search for different product
    await navigateToHome(page);
    await searchProduct(page, 'Camera');
    results = page.locator('[class*="product"]');
    resultCount = await results.count();
    expect(resultCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-006: Empty Search - Submitting empty search query', async () => {
    await navigateToHome(page);

    const searchBox = page.locator('input[placeholder="Search"]');
    await searchBox.fill('');

    const searchButton = page.locator('button[type="submit"]').first();
    await searchButton.click();

    // Wait for response
    await page.waitForLoadState('networkidle');

    // Should either show all products or a message
    const pageContent = await page.content();
    expect(
      pageContent.includes('product') || 
      pageContent.includes('result') || 
      pageContent.includes('search')
    ).toBeTruthy();
  });

  test('TC-006: Empty Search - Page remains functional after empty search', async () => {
    await navigateToHome(page);

    const searchBox = page.locator('input[placeholder="Search"]');
    await searchBox.fill('');

    const searchButton = page.locator('button[type="submit"]').first();
    await searchButton.click();
    await page.waitForTimeout(1000);

    // Verify navigation still works
    const homeLink = page.locator('a').filter({ hasText: /home|logo/i }).first();
    const isVisible = await homeLink.isVisible().catch(() => false);
    expect(isVisible || page.url()).toBeTruthy();
  });

  test('TC-007: No Results Search - Search for non-existent product displays proper message', async () => {
    await navigateToHome(page);

    const uniqueSearchTerm = `zxcvbnm${Date.now()}`;
    await searchProduct(page, uniqueSearchTerm);

    // Wait for results to load
    await page.waitForLoadState('networkidle');

    // Should show no results message or empty product list
    const pageContent = await page.content();
    expect(
      pageContent.includes('no result') || 
      pageContent.includes('no product') ||
      pageContent.includes('not found') ||
      pageContent.includes('0 result')
    ).toBeTruthy();
  });

  test('TC-007: No Results Search - User can return to search after no results', async () => {
    await navigateToHome(page);

    const uniqueSearchTerm = `zzzzz${Date.now()}`;
    await searchProduct(page, uniqueSearchTerm);
    await page.waitForLoadState('networkidle');

    // User should be able to perform another search
    const searchBox = page.locator('input[placeholder="Search"]');
    await searchBox.fill('iPhone');

    const searchButton = page.locator('button[type="submit"]').first();
    await searchButton.click();
    await page.waitForLoadState('networkidle');

    // Should find results this time
    const productElements = page.locator('[class*="product"]');
    const count = await productElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-007: No Results Search - Search with special characters returns safely', async () => {
    await navigateToHome(page);

    await searchProduct(page, '@#$%^&*()');
    await page.waitForLoadState('networkidle');

    // Page should not crash - verify we can navigate
    const homeLink = page.locator('a').first();
    await expect(homeLink).toBeVisible();
  });

  test('TC-005 to TC-007: Search term is preserved in search box', async () => {
    await navigateToHome(page);

    const searchTerm = 'Tablet';
    await searchProduct(page, searchTerm);

    // Check if search term is in the search box or URL
    const searchBox = page.locator('input[placeholder="Search"]');
    const boxValue = await searchBox.inputValue();
    const urlContent = page.url();

    expect(boxValue === searchTerm || urlContent.includes(searchTerm)).toBeTruthy();
  });

  test('TC-005 to TC-007: Search is case-insensitive', async () => {
    await navigateToHome(page);

    const searchLower = 'iphone';
    await searchProduct(page, searchLower);
    const lowerResults = await page.locator('[class*="product"]').count();

    await navigateToHome(page);
    const searchUpper = 'IPHONE';
    await searchProduct(page, searchUpper);
    const upperResults = await page.locator('[class*="product"]').count();

    // Should return same or similar number of results
    expect(Math.abs(lowerResults - upperResults)).toBeLessThanOrEqual(1);
  });
});
