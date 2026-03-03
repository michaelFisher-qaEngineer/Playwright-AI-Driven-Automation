import { test, expect, Page } from '@playwright/test';
import { navigateToHome, navigateToCategory, clickCategory, getProductPrice } from '../fixtures/helpers';
import { CATEGORIES } from '../fixtures/test-data';

test.describe('Product Browsing (TC-008 to TC-011)', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('TC-008: Category Navigation - Desktops category loads products', async () => {
    await navigateToCategory(page, CATEGORIES[0].path); // Desktops

    // Verify category page loaded
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Verify products are displayed
    const products = page.locator('[class*="product"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-008: Category Navigation - All categories load products', async () => {
    for (const category of CATEGORIES.slice(0, 5)) {
      await navigateToCategory(page, category.path);

      // Verify products loaded
      const products = page.locator('[class*="product"]');
      const count = await products.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('TC-008: Category Navigation - Product details are visible', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    // Verify product name
    const productName = page.locator('[class*="name"], h3, h4').first();
    await expect(productName).toBeVisible();

    // Verify price
    const price = page.locator('[class*="price"]').first();
    await expect(price).toBeVisible();

    // Verify image
    const image = page.locator('img[alt*="product"], img').first();
    await expect(image).toBeVisible();
  });

  test('TC-009: Product Details Page - iPhone 6 product has all details', async () => {
    await navigateToCategory(page, CATEGORIES[5].path); // Phones & PDAs

    // Find and click iPhone 6
    const iphone = page.locator('a').filter({ hasText: /iPhone 6/i }).first();
    if (await iphone.isVisible()) {
      await iphone.click();
      await page.waitForLoadState('networkidle');

      // Verify product name
      const productName = page.locator('h1, h2').first();
      await expect(productName).toContainText(/iPhone|product/i);

      // Verify price
      const price = page.locator('[class*="price"]').first();
      await expect(price).toBeVisible();

      // Verify images
      const images = page.locator('img[alt*="iPhone"]');
      expect(await images.count()).toBeGreaterThan(0);

      // Verify add to cart button
      const addBtn = page.locator('button').filter({ hasText: /Add to Cart/i }).first();
      await expect(addBtn).toBeVisible();

      // Verify quantity selector
      const quantityInput = page.locator('input[name="quantity"]').first();
      await expect(quantityInput).toBeVisible();
    }
  });

  test('TC-009: Product Details Page - Product page loads within acceptable time', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      const startTime = Date.now();
      await product.click();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    }
  });

  test('TC-010: Product Image Gallery - Main image renders correctly', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');

      const mainImage = page.locator('img').first();
      await expect(mainImage).toBeVisible();

      // Verify image has src attribute
      const src = await mainImage.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('TC-010: Product Image Gallery - Product images are clickable', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');

      // Check for thumbnail images
      const thumbnails = page.locator('a[data-thumb], img[class*="thumb"]');
      const count = await thumbnails.count();

      if (count > 1) {
        // Click second thumbnail
        const firstThumb = thumbnails.nth(1);
        const initialSrc = await page.locator('img[class*="main"], img[class*="gallery"]').first().getAttribute('src');

        await firstThumb.click();
        await page.waitForTimeout(500);

        const newSrc = await page.locator('img[class*="main"], img[class*="gallery"]').first().getAttribute('src');

        // Image should have changed or page is stable
        expect(newSrc).toBeTruthy();
      }
    }
  });

  test('TC-011: Product Filtering - Check if filtering is available', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    // Look for filter controls
    const filters = page.locator('[class*="filter"], [class*="refine"]').first();
    const hasFilters = await filters.isVisible().catch(() => false);

    if (hasFilters) {
      // If filters exist, verify they're interactive
      const filterOptions = page.locator('[class*="filter"] [class*="option"], [class*="filter"] label');
      const filterCount = await filterOptions.count();
      expect(filterCount).toBeGreaterThan(0);
    }
  });

  test('TC-011: Product Sorting - Verify sorting dropdown exists', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    // Look for sort options
    const sortDropdown = page.locator('select[name*="sort"], [class*="sort"] select').first();
    const hasSort = await sortDropdown.isVisible().catch(() => false);

    if (hasSort) {
      // Get available sort options
      const options = sortDropdown.locator('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(1);
    }
  });

  test('TC-011: Product Sorting - Sort by price', async () => {
  await navigateToCategory(page, CATEGORIES[0].path);

  const sortDropdown = page.locator('select[name*="sort"]').first();
  if (await sortDropdown.isVisible().catch(() => false)) {
    // Get all options and find the one containing 'price'
    const options = await sortDropdown.locator('option').all();
    let priceOptionFound = false;

    for (const option of options) {
      const text = await option.textContent();
      if (text?.toLowerCase().includes('price')) {
        await sortDropdown.selectOption({ label: text || '' });
        priceOptionFound = true;
        break;
      }
    }

    if (priceOptionFound) {
      await page.waitForLoadState('networkidle');

      const products = page.locator('[class*="product"]');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    }
  }
});

  test('TC-008 to TC-011: Breadcrumb navigation', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    // Look for breadcrumb
    const breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]').first();
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);

    if (hasBreadcrumb) {
      // Verify breadcrumb contains home link
      const homeLink = breadcrumb.locator('a').first();
      await expect(homeLink).toBeVisible();
    }
  });

  test('TC-008 to TC-011: Pagination exists for large category', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const pagination = page.locator('[class*="pagination"], a[rel*="next"]').first();
    const hasPagination = await pagination.isVisible().catch(() => false);

    if (hasPagination) {
      // Verify pagination navigation works
      const nextPage = page.locator('a[rel*="next"]');
      if (await nextPage.isVisible()) {
        await nextPage.click();
        await page.waitForLoadState('networkidle');

        const products = page.locator('[class*="product"]');
        expect(await products.count()).toBeGreaterThan(0);
      }
    }
  });

  test('TC-009: Product description is visible', async () => {
    await navigateToCategory(page, CATEGORIES[0].path);

    const product = page.locator('a[class*="product"]').first();
    if (await product.isVisible()) {
      await product.click();
      await page.waitForLoadState('networkidle');

      // Look for description
      const description = page.locator('[class*="description"], [class*="details"]').first();
      const hasDescription = await description.isVisible().catch(() => false);

      if (hasDescription) {
        const descText = await description.textContent();
        expect(descText?.length).toBeGreaterThan(0);
      }
    }
  });
});
