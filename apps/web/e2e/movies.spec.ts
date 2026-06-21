import { test, expect } from '@playwright/test'

test.describe('Movies page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/movies')
    await page.waitForLoadState('networkidle')
  })

  test('shows movie grid', async ({ page }) => {
    // Should render some media cards
    const cards = page.locator('img[alt]')
    await expect(cards.first()).toBeVisible({ timeout: 10_000 })
  })

  test('filter panel opens and closes', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /filters/i })
    await filterButton.click()

    const panel = page.getByText('Sort By')
    await expect(panel).toBeVisible()

    await filterButton.click()
    await expect(panel).not.toBeVisible()
  })

  test('genre filter is selectable', async ({ page }) => {
    await page.getByRole('button', { name: /filters/i }).click()
    const actionGenre = page.getByRole('button', { name: 'Action' })
    await actionGenre.click()
    await expect(actionGenre).toHaveClass(/primary/)
  })

  test('applies filters and shows results', async ({ page }) => {
    await page.getByRole('button', { name: /filters/i }).click()
    const topRated = page.getByRole('button', { name: 'Top Rated' })
    await topRated.click()
    await page.getByRole('button', { name: 'Apply Filters' }).click()

    // URL or content should update
    await page.waitForLoadState('networkidle')
    const cards = page.locator('img[alt]')
    await expect(cards.first()).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Movie detail page', () => {
  test('shows movie details for a known movie', async ({ page }) => {
    // Fight Club (ID: 550) is a reliable TMDB entry
    await page.goto('/movie/550')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Fight Club')).toBeVisible({ timeout: 10_000 })
  })

  test('shows play button linking to watch page', async ({ page }) => {
    await page.goto('/movie/550')
    await page.waitForLoadState('networkidle')

    const playButton = page.getByRole('link', { name: /play/i }).first()
    await expect(playButton).toBeVisible({ timeout: 10_000 })
    await expect(playButton).toHaveAttribute('href', /\/watch\/movie\/550/)
  })

  test('shows genres', async ({ page }) => {
    await page.goto('/movie/550')
    await page.waitForLoadState('networkidle')
    // Fight Club genres include Drama, Thriller
    await expect(page.getByText(/Drama|Thriller/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
