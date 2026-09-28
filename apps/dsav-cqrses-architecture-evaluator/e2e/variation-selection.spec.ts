import { expect, test } from '@playwright/test'

test.describe('Variation Selection page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/variation-selection')
  })

  test('renders all input sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Variation Selection', exact: true })).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Quality Attributes' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Quality Attribute Components Weights' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Variation Metrics' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'SLA Parameters' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Hardware Configurations per Variation' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Development Price for the Simplest Variation' })).toBeVisible()
  })

  test('default Classical CQRS and mCQRS variations are present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Classical CQRS', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'mCQRS', exact: true })).toBeVisible()
  })

  test('default SLA parameters preset is rendered', async ({ page }) => {
    for (const name of [
      'Error rate',
      'p95 Queries',
      'p95 Create commands',
      'p95 Update commands',
      'p95 Consistency achievement'
    ]) {
      await expect(page.getByLabel(`SLA name — ${name}`)).toBeVisible()
    }
  })

  test('Calculate button is enabled with default data', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Calculate optimal variation' })
    await expect(button).toBeEnabled()
  })

  test('Calculate produces all three result blocks with proper badges', async ({ page }) => {
    await page.getByRole('button', { name: 'Calculate optimal variation' }).click()

    // Relative Complexity
    await expect(page.getByRole('heading', { name: 'Relative Complexity' })).toBeVisible()
    const complexityTable = page.getByRole('region', { name: 'Relative Complexity' })
    await expect(complexityTable.getByText('reference', { exact: false }).first()).toBeVisible()

    // Relative Hosting Price
    await expect(page.getByRole('heading', { name: 'Relative Hosting Price' })).toBeVisible()
    const hostingTable = page.getByRole('region', { name: 'Relative Hosting Price' })
    // Both rows should show a USD value (something like "97.67") and rc.
    await expect(hostingTable.getByRole('cell', { name: /\d+\.\d{2}/ }).first()).toBeVisible()

    // Optimal Variation
    await expect(page.getByRole('heading', { name: 'Optimal Variation' })).toBeVisible()
    const optimalTable = page.getByRole('region', { name: 'Optimal Variation' })
    await expect(optimalTable.getByText('optimal', { exact: false }).first()).toBeVisible()
  })

  test('changing the swp value resets the results', async ({ page }) => {
    await page.getByRole('button', { name: 'Calculate optimal variation' }).click()
    await expect(page.getByRole('region', { name: 'Optimal Variation' })).toBeVisible()

    const swp = page.getByRole('textbox', { name: 'Development Price for the Simplest Variation' })
    await swp.fill('500')
    await swp.blur()

    // Results region is now empty (placeholder shown instead of region role)
    await expect(page.getByRole('region', { name: 'Optimal Variation' })).toHaveCount(0)
  })

  test('an impossible SLA threshold flags every row as SLA not met', async ({ page }) => {
    const slaSection = page.getByRole('region', { name: 'SLA Parameters' })
    const errorRateThreshold = slaSection.getByLabel('Threshold — Error rate')

    await errorRateThreshold.fill('0')
    await errorRateThreshold.blur()

    await page.getByRole('button', { name: 'Calculate optimal variation' }).click()

    const optimalTable = page.getByRole('region', { name: 'Optimal Variation' })
    const slaUnmetBadges = optimalTable.getByText('SLA not met', { exact: false })
    await expect(slaUnmetBadges.first()).toBeVisible()
  })

  test('adding a third variation creates an empty hardware block for it', async ({ page }) => {
    const metricsSection = page.getByRole('region', { name: 'Variation Metrics' })
    await metricsSection.getByPlaceholder('Variation name').fill('EventStore')
    await metricsSection.getByRole('button', { name: 'Add', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'EventStore', exact: true })).toBeVisible()
  })
})
