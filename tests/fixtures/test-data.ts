// Test data and constants for cloudberrystore test suite

export const TEST_USERS = {
  existingUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890',
  },
  newUser: {
    email: `test-${Date.now()}@example.com`,
    password: 'NewPassword123!',
    firstName: 'New',
    lastName: 'Customer',
    phone: '9876543210',
  },
};

export const TEST_PRODUCTS = {
  iphone6: {
    name: 'iPhone 6',
    category: 'Phones & PDAs',
    price: 25.00, // Estimated, should verify
  },
};

export const TEST_ADDRESS = {
  billing: {
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main Street',
    city: 'New York',
    postalCode: '10001',
    country: 'United States',
    state: 'NY',
    phone: '2125551234',
  },
  shipping: {
    firstName: 'Jane',
    lastName: 'Smith',
    address: '456 Oak Avenue',
    city: 'Los Angeles',
    postalCode: '90001',
    country: 'United States',
    state: 'CA',
    phone: '3105551234',
  },
};

export const SITE_URL = 'https://cloudberrystore.services';

export const CATEGORIES = [
  { name: 'Desktops', path: '20' },
  { name: 'Laptops & Notebooks', path: '18' },
  { name: 'Components', path: '25' },
  { name: 'Tablets', path: '57' },
  { name: 'Software', path: '17' },
  { name: 'Phones & PDAs', path: '24' },
  { name: 'Cameras', path: '33' },
  { name: 'MP3 Players', path: '34' },
];

export const SECURITY_TEST_INPUTS = {
  sqlInjection: `' OR '1'='1`,
  xssScript: `<script>alert('XSS')</script>`,
  xssImage: `<img src=x onerror="alert('XSS')">`,
};

export const TIMEOUTS = {
  pageLoad: 3000,
  productLoad: 2000,
  searchResult: 1000,
  cartOperation: 500,
};
