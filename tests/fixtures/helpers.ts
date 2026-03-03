// Helper functions for cloudberrystore tests

import { Page, expect } from '@playwright/test';
import { SITE_URL } from './test-data';

/**
 * Navigate to the site homepage
 */
export async function navigateToHome(page: Page) {
  await page.goto(SITE_URL);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to a specific category
 */
export async function navigateToCategory(page: Page, categoryPath: string) {
  await page.goto(`${SITE_URL}/index.php?route=product/category&language=en-gb&path=${categoryPath}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Search for a product
 */
export async function searchProduct(page: Page, searchTerm: string) {
  const searchBox = page.locator('input[placeholder="Search"]');
  await searchBox.fill(searchTerm);
  const searchButton = page.locator('button[type="submit"]').first();
  await searchButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Add product to cart
 */
export async function addProductToCart(page: Page, quantity: number = 1) {
  // Fill quantity input
  const quantityInput = page.locator('input[name="quantity"]').first();
  if (await quantityInput.isVisible()) {
    await quantityInput.fill(quantity.toString());
  }
  
  // Click add to cart button
  const addToCartBtn = page.locator('button').filter({ hasText: /Add to Cart/i }).first();
  await addToCartBtn.click();
  
  // Wait for cart to update
  await page.waitForLoadState('networkidle');
}

/**
 * View shopping cart
 */
export async function viewCart(page: Page) {
  const cartLink = page.locator('a').filter({ hasText: /Shopping Cart/i });
  await cartLink.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Get cart item count from header
 */
export async function getCartItemCount(page: Page): Promise<number> {
  const cartButton = page.locator('button').filter({ hasText: /item\(s\)/ }).first();
  const text = await cartButton.textContent();
  const match = text?.match(/(\d+)\s*item/i);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Proceed to checkout
 */
export async function proceedToCheckout(page: Page) {
  const checkoutLink = page.locator('a').filter({ hasText: /Checkout/i }).first();
  await checkoutLink.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Fill billing address form
 */
export async function fillBillingAddress(page: Page, address: any) {
  const firstName = page.locator('input[name*="firstname"]').first();
  const lastName = page.locator('input[name*="lastname"]').first();
  const addressField = page.locator('input[name*="address"]').first();
  const city = page.locator('input[name*="city"]').first();
  const postalCode = page.locator('input[name*="postcode"]').first();
  const phone = page.locator('input[name*="telephone"]').first();

  if (await firstName.isVisible()) await firstName.fill(address.firstName);
  if (await lastName.isVisible()) await lastName.fill(address.lastName);
  if (await addressField.isVisible()) await addressField.fill(address.address);
  if (await city.isVisible()) await city.fill(address.city);
  if (await postalCode.isVisible()) await postalCode.fill(address.postalCode);
  if (await phone.isVisible()) await phone.fill(address.phone);
}

/**
 * Fill contact form
 */
export async function fillContactForm(page: Page, name: string, email: string, subject: string, message: string) {
  const nameField = page.locator('input[name*="name"]').first();
  const emailField = page.locator('input[name*="email"]').first();
  const subjectField = page.locator('input[name*="subject"]').first();
  const messageField = page.locator('textarea[name*="message"]').first();

  if (await nameField.isVisible()) await nameField.fill(name);
  if (await emailField.isVisible()) await emailField.fill(email);
  if (await subjectField.isVisible()) await subjectField.fill(subject);
  if (await messageField.isVisible()) await messageField.fill(message);
}

/**
 * Login user
 */
export async function loginUser(page: Page, email: string, password: string) {
  // Navigate to account/login
  const accountLink = page.locator('a').filter({ hasText: /My Account/i }).first();
  await accountLink.click();
  await page.waitForLoadState('networkidle');

  // Find and fill login form
  const emailInput = page.locator('input[type="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  if (await emailInput.isVisible()) {
    await emailInput.fill(email);
    await passwordInput.fill(password);
    const loginBtn = page.locator('button').filter({ hasText: /Login/i }).first();
    await loginBtn.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Logout user
 */
export async function logoutUser(page: Page) {
  const accountLink = page.locator('a').filter({ hasText: /My Account|Logout/i });
  // Try to find logout link
  const logoutLink = page.locator('a').filter({ hasText: /Logout/i });
  if (await logoutLink.isVisible()) {
    await logoutLink.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Get page response time
 */
export async function getPageLoadTime(page: Page): Promise<number> {
  const navigationTiming = await page.evaluate(() => {
    const timing = window.performance.timing;
    return timing.loadEventEnd - timing.navigationStart;
  });
  return navigationTiming;
}

/**
 * Check for console errors
 */
export async function getConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Verify element is visible
 */
export async function verifyElementVisible(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector).first();
  return await element.isVisible();
}

/**
 * Get product price
 */
export async function getProductPrice(page: Page): Promise<string> {
  const priceElement = page.locator('[class*="price"]').first();
  const price = await priceElement.textContent();
  return price || '';
}

/**
 * Get cart subtotal
 */
export async function getCartSubtotal(page: Page): Promise<string> {
  const subtotalElement = page.locator('text=/Subtotal/i').first();
  const text = await subtotalElement.textContent();
  return text || '';
}

/**
 * Get cart total
 */
export async function getCartTotal(page: Page): Promise<string> {
  const totalElement = page.locator('text=/Total/i').last();
  const text = await totalElement.textContent();
  return text || '';
}

/**
 * Click category link
 */
export async function clickCategory(page: Page, categoryName: string) {
  const categoryLink = page.locator('a').filter({ hasText: categoryName }).first();
  await categoryLink.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(page: Page) {
  const wishlistBtn = page.locator('button[title*="Wish"], button[title*="wishlist"]').first();
  if (await wishlistBtn.isVisible()) {
    await wishlistBtn.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Remove product from cart
 */
export async function removeFromCart(page: Page, productIndex: number = 0) {
  const removeButtons = page.locator('button[title*="Remove"], button[aria-label*="Remove"]');
  const count = await removeButtons.count();
  if (count > productIndex) {
    await removeButtons.nth(productIndex).click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Update cart quantity
 */
export async function updateCartQuantity(page: Page, productIndex: number, newQuantity: number) {
  const quantityInputs = page.locator('input[name*="quantity"]');
  const count = await quantityInputs.count();
  if (count > productIndex) {
    await quantityInputs.nth(productIndex).fill(newQuantity.toString());
    // Find and click update button near the quantity field
    const updateBtn = page.locator('button').filter({ hasText: /Update/i }).first();
    if (await updateBtn.isVisible()) {
      await updateBtn.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

/**
 * Select currency
 */
export async function selectCurrency(page: Page, currency: string) {
  const currencySelector = page.locator('a').filter({ hasText: /\$|Currency/i }).first();
  await currencySelector.click();
  await page.waitForTimeout(300);
  
  const currencyOption = page.locator('a').filter({ hasText: currency }).first();
  if (await currencyOption.isVisible()) {
    await currencyOption.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Wait for element to load
 */
export async function waitForElement(page: Page, selector: string, timeout: number = 5000) {
  const element = page.locator(selector).first();
  await element.waitFor({ state: 'visible', timeout });
}

/**
 * Take accessible snapshot for debugging
 */
export async function takeSnapshot(page: Page, name: string) {
  try {
    const snapshot = [];
    const roles = ['button', 'link', 'heading', 'textbox', 'checkbox', 'listitem'];

    for (const role of roles) {
      const elements = await page.getByRole(role as any).all();
      for (const el of elements) {
        const ariaLabel = await el.getAttribute('aria-label');
        const textContent = await el.textContent();
        snapshot.push({
          role,
          name: ariaLabel || textContent?.trim(),
          visible: await el.isVisible()
        });
      }
    }

    console.log(`Snapshot for ${name}:`, JSON.stringify(snapshot, null, 2));
  } catch (error) {
    console.log(`Could not take snapshot: ${error}`);
  }
}
