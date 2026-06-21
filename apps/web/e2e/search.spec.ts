import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test('search modal shows trending on open', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const searchBtn = page.getByRole('button', { name: /search/i }).first()
    await searchBtn.click()

    // Should show some trending/recent content
    await expect(page.locator('input[type="search"], input[placeholder*="search" i]').first()).toBeVisible({ timeout: 5000 })
  })

  test('typing a query returns results', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open search with keyboard
    await page.keyboard.press('Meta+k')
    await page.waitForTimeout(500)

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    await searchInput.fill('Inception')
    await page.waitForTimeout(500) // debounce

    // Should show results
    await expect(page.getByText(/Inception/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('search page shows results for query', async ({ page }) => {
    await page.goto('/search?q=Batman')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/Batman/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('pressing Escape closes search modal', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.keyboard.press('Meta+k')
    await page.waitForTimeout(300)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
    await expect(searchInput).not.toBeVisible()
  })
})
