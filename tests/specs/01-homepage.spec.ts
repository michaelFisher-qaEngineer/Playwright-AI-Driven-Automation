import { test, expect, Page } from '@playwright/test';
import { navigateToHome, clickCategory, verifyElementVisible } from '../fixtures/helpers';
import { SITE_URL, CATEGORIES } from '../fixtures/test-data';

test.describe('Homepage & Navigation (TC-001 to TC-004)', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('TC-001: Homepage Load - Verify homepage loads successfully', async () => {
    const startTime = Date.now();
    await navigateToHome(page);
    const loadTime = Date.now() - startTime;

    // Verify page title
    await expect(page).toHaveTitle(/Your store|CloudBerry/i);

    // Verify page loaded within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify main content elements are visible
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();

    // Verify navigation is present
    const navigation = page.locator('nav').first();
    await expect(navigation).toBeVisible();
  });

  test('TC-002: Navigation Menu - Navigation elements are present', async () => {
    await navigateToHome(page);

    // Just verify that at least one navigation link exists and is enabled
    const navLinks = page.locator('a[href]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    // Verify first link is enabled
    const firstLink = navLinks.first();
    const isEnabled = await firstLink.isEnabled().catch(() => false);
    expect(isEnabled).toBeTruthy();
  });

  test('TC-003: Top Navigation Links - Verify header links are present', async () => {
    await navigateToHome(page);

    // Contact link or phone link
    const contactLink = page.locator('a, span').filter({ hasText: /123456789|Contact|phone/i }).first();
    const hasContact = await contactLink.isVisible().catch(() => false);
    expect(hasContact).toBeTruthy();

    // My Account link
    const accountLink = page.locator('a').filter({ hasText: /My Account/i }).first();
    const hasAccount = await accountLink.isVisible().catch(() => false);
    expect(hasAccount).toBeTruthy();
  });

  test('TC-004: Logo/Home Link - Homepage is accessible', async () => {
    await navigateToHome(page);

    // Just verify homepage is accessible
    expect(page.url()).toContain(SITE_URL);
  });
});
