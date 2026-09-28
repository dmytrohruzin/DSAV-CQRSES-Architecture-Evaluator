import { expect, test } from '@playwright/test'

test.describe('Migration Roadmap page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/migration-roadmap')
  })

  test('renders the 4 default graph nodes with support/hosting costs', async ({ page }) => {
    for (const name of ['Classical CQRS', 'mCQRS', 'Canonical CQRS', 'mCQRS+']) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
    }
    // Defaults: Classical CQRS support=50, hosting=100.
    await expect(page.getByLabel('Support cost (USD/mo) — Classical CQRS').first()).toHaveValue('50')
    await expect(page.getByLabel('Hosting cost (USD/mo) — Classical CQRS').first()).toHaveValue('100')
  })

  test('renders the 5 default migration edges', async ({ page }) => {
    const pairs = [
      ['Classical CQRS', 'mCQRS'],
      ['mCQRS', 'Classical CQRS'],
      ['Canonical CQRS', 'Classical CQRS'],
      ['Canonical CQRS', 'mCQRS'],
      ['mCQRS', 'mCQRS+']
    ]
    for (const [from, to] of pairs) {
      await expect(page.getByLabel(`Remove edge ${from} to ${to}`).first()).toBeVisible()
    }
    // Reference edge has migrationTime = 1.
    await expect(page.getByLabel('Migration time for edge Canonical CQRS to Classical CQRS').first()).toHaveValue('1')
  })

  test('Find Optimal Path returns a totalEffort line', async ({ page }) => {
    await page.getByRole('button', { name: /Find Optimal Path/i }).click()
    await expect(page.getByText(/Total effort/i)).toBeVisible()
  })

  test('Migration Feasibility section is collapsed by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Migration Feasibility Assessment' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: /Hardware upgrade can avoid migration/i })).not.toBeChecked()
    await expect(page.getByRole('table', { name: 'Migration Feasibility Assessment' })).toHaveCount(0)
  })

  test('Toggling the checkbox shows derived costs from source/target nodes and the migration duration', async ({
    page
  }) => {
    await page.getByRole('checkbox', { name: /Hardware upgrade can avoid migration/i }).check()

    await expect(page.getByRole('table', { name: 'Migration Feasibility Assessment' })).toBeVisible()
    // Run pathfinding so a path exists and step-by-step computation kicks in.
    await page.getByRole('button', { name: /Find Optimal Path/i }).click()

    // Migration Canonical → mCQRS uses the reference edge (effort 791.94 → 1 month)
    // to derive 1.05 months for this 829.44-effort edge.
    await expect(page.getByText('1.05').first()).toBeVisible()
    // Step-by-step breakdown is rendered.
    await expect(page.getByText(/Step-by-step cost comparison/i)).toBeVisible()
    // Fallback warning is not shown when migration timing is available.
    await expect(page.getByText(/Migration time not set/i)).toHaveCount(0)
  })

  test('Clearing the reference migration time switches Feasibility to the instantaneous fallback', async ({ page }) => {
    // Clear the only edge that carries a reference time.
    const timeInput = page.getByLabel('Migration time for edge Canonical CQRS to Classical CQRS').first()
    await timeInput.fill('')
    await timeInput.blur()

    await page.getByRole('checkbox', { name: /Hardware upgrade can avoid migration/i }).check()
    await page.getByRole('button', { name: /Find Optimal Path/i }).click()

    // Feasibility shows the instantaneous-fallback warning.
    await expect(page.getByText(/Migration time not set/i)).toBeVisible()
  })
})
