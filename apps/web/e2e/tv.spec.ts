import { test, expect } from '@playwright/test'

test.describe('TV Shows page', () => {
  test('loads TV shows grid', async ({ page }) => {
    await page.goto('/tv')
    await page.waitForLoadState('networkidle')

    const cards = page.locator('img[alt]')
    await expect(cards.first()).toBeVisible({ timeout: 10_000 })
  })

  test('status and type filters are available', async ({ page }) => {
    await page.goto('/tv')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /filters/i }).click()
    await expect(page.getByText('Status')).toBeVisible()
    await expect(page.getByText('Type')).toBeVisible()
  })
})

test.describe('TV detail page', () => {
  test('shows TV show details for Breaking Bad', async ({ page }) => {
    // Breaking Bad is TMDB ID 1396
    await page.goto('/tv/1396')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Breaking Bad')).toBeVisible({ timeout: 10_000 })
  })

  test('shows seasons accordion', async ({ page }) => {
    await page.goto('/tv/1396')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/Season \d/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('expanding a season shows episodes', async ({ page }) => {
    await page.goto('/tv/1396')
    await page.waitForLoadState('networkidle')

    // Click on Season 1 accordion
    const season1 = page.getByText('Season 1').first()
    await expect(season1).toBeVisible({ timeout: 10_000 })
    await season1.click()

    // Episodes should appear
    await expect(page.getByText(/E\d+/i).first()).toBeVisible({ timeout: 8_000 })
  })
})
