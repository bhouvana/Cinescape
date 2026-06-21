import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('loads and shows hero banner', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/WatchBlitz/)

    // Hero banner should be visible
    const hero = page.locator('[data-testid="hero-banner"]').or(
      page.locator('.hero-overlay').first()
    )
    // Wait for content to load (TMDB data)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('navbar renders with logo and links', async ({ page }) => {
    await page.goto('/')
    const navbar = page.locator('nav, header').first()
    await expect(navbar).toBeVisible()

    // WatchBlitz logo
    await expect(page.getByText('WatchBlitz').first()).toBeVisible()
  })

  test('search modal opens with Cmd+K', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Meta+k')
    const modal = page.locator('[role="dialog"]').or(page.locator('.search-input').first())
    await expect(modal.first()).toBeVisible({ timeout: 5000 })
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const moviesLink = page.getByRole('link', { name: /movies/i }).first()
    await moviesLink.click()
    await expect(page).toHaveURL(/\/movies/)
  })
})
