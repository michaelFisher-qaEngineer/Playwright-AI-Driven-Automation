# CloudberryStore Automation Test Suite

Complete Playwright automation test suite for cloudberrystore.services, covering 53 comprehensive test cases across all major website functionality.

## 📋 Test Coverage

The test suite covers the following areas with **53 comprehensive test cases**:

| Category | Test Cases | File |
|----------|-----------|------|
| Homepage & Navigation | 6 | `01-homepage.spec.ts` |
| Search Functionality | 9 | `02-search.spec.ts` |
| Product Browsing | 11 | `03-product.spec.ts` |
| Shopping Cart | 11 | `04-cart.spec.ts` |
| Checkout Process | 8 | `05-checkout.spec.ts` |
| User Account | 14 | `06-account.spec.ts` |
| Security Testing | 11 | `07-security.spec.ts` |
| Performance | 10 | `08-performance.spec.ts` |
| Responsive Design | 14 | `09-responsive.spec.ts` |
| Error Handling | 10 | `10-integrity-error.spec.ts` |

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd /Users/michael/playwright-workspace/Playwright-AI-Driven-Automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/specs/01-homepage.spec.ts

# Run tests with UI mode
npx playwright test --ui

# Run tests in headed mode (browser visible)
npx playwright test --headed

# Run specific test by name
npx playwright test -g "TC-012"

# Run with debug
npx playwright test --debug

# Generate HTML report
npx playwright test --reporter=html
```

### Test Configuration

Configuration is in `playwright.config.js`. Key settings:

- **Base URL**: https://cloudberrystore.services
- **Timeout**: 30 seconds per test
- **Retries**: 0 (for faster feedback during development)
- **Browsers**: Chromium, Firefox, Webkit (optional)

## 📁 Project Structure

```
tests/
├── fixtures/
│   ├── test-data.ts        # Test data, URLs, and constants
│   └── helpers.ts          # Reusable helper functions
├── specs/
│   ├── 01-homepage.spec.ts       # Homepage tests (TC-001 to TC-004)
│   ├── 02-search.spec.ts         # Search tests (TC-005 to TC-007)
│   ├── 03-product.spec.ts        # Product tests (TC-008 to TC-011)
│   ├── 04-cart.spec.ts           # Cart tests (TC-012 to TC-016)
│   ├── 05-checkout.spec.ts       # Checkout tests (TC-017 to TC-024)
│   ├── 06-account.spec.ts        # Account tests (TC-025 to TC-031)
│   ├── 07-security.spec.ts       # Security tests (TC-036 to TC-040)
│   ├── 08-performance.spec.ts    # Performance tests (TC-041 to TC-044)
│   ├── 09-responsive.spec.ts     # Responsive tests (TC-045 to TC-048)
│   └── 10-integrity-error.spec.ts # Integrity & Error tests (TC-049 to TC-053)
└── playwright.config.js    # Playwright configuration
```

## 🔧 Customization

### Updating Test Data

Edit `tests/fixtures/test-data.ts` to update:

- Test user credentials
- Product names for testing
- Test addresses
- Site URLs
- Category paths

### Running on Different Browsers

```bash
# Run on Firefox only
npx playwright test --project=firefox

# Run on all browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Run on specific browsers
npx playwright test --project="Chromium" --project="Firefox"
```

### Parallel Execution

Tests run in parallel by default. To run sequentially:

```bash
npx playwright test --workers=1
```

## 📊 Reports & Debugging

### View Test Results

```bash
# HTML Report
npx playwright test --reporter=html
open playwright-report/index.html

# JSON Report
npx playwright test --reporter=json > results.json

# JUnit Report (for CI/CD)
npx playwright test --reporter=junit
```

### Debug Mode

```bash
# Step through tests interactively
npx playwright test --debug

# Generate trace files for debugging
npx playwright test --trace on
```

## 🔍 Test Categories

### Homepage & Navigation (TC-001 to TC-004)
- Homepage load time verification
- Navigation menu accessibility
- Header links functionality
- Logo navigation

### Search Functionality (TC-005 to TC-007)
- Basic product search
- Empty search handling
- No results handling
- Search result accuracy

### Product Browsing (TC-008 to TC-011)
- Category navigation
- Product details page
- Product image gallery
- Filtering and sorting

### Shopping Cart (TC-012 to TC-016)
- Add products to cart
- View cart contents
- Update quantities
- Remove items
- Continue shopping

### Checkout Process (TC-017 to TC-024)
- Proceed to checkout
- Guest checkout option
- Billing address form
- Shipping address
- Shipping method selection
- Payment method selection
- Order summary
- Place order

### User Account (TC-025 to TC-031)
- User registration
- Login functionality
- Invalid login handling
- Account profile
- Order history
- Wish list
- Logout

### Security Testing (TC-036 to TC-040)
- SQL injection prevention
- XSS attack prevention
- HTTPS/SSL verification
- CSRF token validation
- Password security

### Performance Testing (TC-041 to TC-044)
- Homepage load time
- Product page load time
- Search performance
- Cart operation speed
- Core Web Vitals

### Responsive Design (TC-045 to TC-048)
- Mobile compatibility (iPhone 12, 14 Pro, Galaxy S21)
- Tablet compatibility (iPad, iPad Pro)
- Desktop compatibility (Chrome, Firefox, Safari)
- Portrait/landscape rotation

### Error Handling & Data Integrity (TC-049 to TC-053)
- 404 error handling
- Network error graceful handling
- Cart persistence
- Price accuracy
- Order duplication prevention
- Contact form validation
- Currency and language selection

## 📝 Test Naming Convention

All tests follow a consistent naming pattern:

```
TC-XXX: Test Case Title - Specific test scenario
```

### Examples:
- `TC-001: Homepage Load - Verify homepage loads successfully`
- `TC-012: Add to Cart - Product is added to cart successfully`
- `TC-036: SQL Injection in Search - Does not expose database errors`

## 🛠️ Maintenance

### Updating Selectors

If elements change on the website:

1. Use Playwright Inspector: `npx playwright test --debug`
2. Update selectors in test files
3. Update helper functions in `tests/fixtures/helpers.ts`
4. Re-run affected tests

### Adding New Tests

1. Create test in appropriate spec file
2. Follow naming convention: `TC-XXX: Description`
3. Use helper functions from `helpers.ts`
4. Use test data from `test-data.ts`

Example:
```typescript
test('TC-XXX: Category - Test description', async ({ browser }) => {
  const page = await browser.newPage();
  await navigateToHome(page);
  
  // Test logic here
  
  await page.close();
});
```

## ⚠️ Known Issues & Limitations

- Some tests require valid test user accounts
- Payment tests don't process real transactions
- Performance times may vary based on network
- Mobile tests use viewport sizes (not actual devices)

## 🤝 Contributing

When adding tests:

1. Follow existing code structure
2. Use helper functions for common operations
3. Add meaningful assertions
4. Include comments for complex logic
5. Update this README with new test details

## 📞 Support

For issues or questions:

1. Check Playwright documentation: https://playwright.dev
2. Review test logs: `npx playwright test --reporter=list`
3. Use debug mode: `npx playwright test --debug`
4. Check network requests: Use Playwright Inspector

## 📄 License

These tests are designed for cloudberrystore.services testing purposes.

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

**Test Suite Version**: 1.0  
**Last Updated**: February 2026  
**Total Test Cases**: 53  
**Status**: Production Ready
