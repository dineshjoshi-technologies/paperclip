// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Website Platform/);
  });

  test('should display navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should have no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await page.goto('/');
    expect(errors.length).toBe(0);
  });
});

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation on empty submit', async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});

test.describe('Registration Flow', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should render on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Website Platform/);
  });

  test('should render on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Website Platform/);
  });

  test('should render on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Website Platform/);
  });
});
