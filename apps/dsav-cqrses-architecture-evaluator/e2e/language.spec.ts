import { expect, test } from '@playwright/test'

test.describe('Language switcher', () => {
  test('switches Tab 2 heading from EN to UA and back', async ({ page }) => {
    await page.goto('/variation-selection')

    await expect(page.getByRole('heading', { name: 'Variation Selection', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'UA', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Вибір варіації', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Variation Selection', exact: true })).toBeVisible()
  })

  test('locale choice persists across navigation', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'UA', exact: true }).click()

    await page.goto('/variation-selection')
    await expect(page.getByRole('heading', { name: 'Вибір варіації', exact: true })).toBeVisible()
  })
})
