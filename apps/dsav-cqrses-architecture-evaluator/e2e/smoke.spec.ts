import { expect, test } from '@playwright/test'

test.describe('Smoke', () => {
  test('home page loads and shows three feature cards', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/DSAV-CQRSES/i)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await expect(page.getByRole('link', { name: /Parameters Assessment/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Variation Selection/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Migration Roadmap/i }).first()).toBeVisible()
  })

  test('navigates from home to each tab', async ({ page }) => {
    await page.goto('/')

    await page
      .getByRole('link', { name: /Variation Selection/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/variation-selection$/)
    await expect(page.getByRole('heading', { name: 'Variation Selection', exact: true })).toBeVisible()

    await page.goto('/')
    await page
      .getByRole('link', { name: /Parameters Assessment/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/parameters-assessment$/)

    await page.goto('/')
    await page
      .getByRole('link', { name: /Migration Roadmap/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/migration-roadmap$/)
  })

  test('all three tab pages render without runtime errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    for (const path of ['/parameters-assessment', '/variation-selection', '/migration-roadmap']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
    }

    expect(errors).toEqual([])
  })
})
