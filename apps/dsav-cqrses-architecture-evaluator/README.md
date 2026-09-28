# dsav-cqrses-architecture-evaluator

**DSAV-CQRSES Architecture Evaluator** — information technology for determining the optimal CQRS-with-Event-Sourcing architectural variation for a given system, and the optimal migration path between variations.

Next.js 16 (App Router) · React 19 · Chart.js · CSS Modules. All calculations run client-side — there is no backend and no API keys.

## Running the app

From this directory:

```bash
npm install
```

No `.env` is required — the app reads no environment variables at runtime (only `playwright.config.ts` checks `CI`).

### Development

From this directory:

```bash
npm run dev
```

Then open <http://localhost:3000>.

### Production build

```bash
npm run build     # next build
npm run start     # next start → http://localhost:3000
```

`npm run start` serves the output of `npm run build`, so build first.

## Screens

| Route | Screen | What it does |
| --- | --- | --- |
| `/` | Home | Overview of the methodology (fuzzy logic, MCDA, graph planning) |
| `/parameters-assessment` | Parameters Assessment | Rates component complexity and node performance from expert input via fuzzy linguistic variables |
| `/variation-selection` | Variation Selection | Compares architectural variations by AHP, picks the cheapest SLA-satisfying hardware, and reports the lowest total cost of ownership |
| `/migration-roadmap` | Migration Roadmap | Builds an optimal step-by-step migration path over a directed graph of variations and estimates its payback period |

The UI ships in English and Ukrainian; the switcher is in the header and the choice persists in `localStorage`.

## Testing

```bash
npm run test          # Vitest — unit + component (jsdom)
npm run test:cov      # with coverage (80% gate)
npm run e2e           # Playwright — Chromium, WebKit
npm run e2e:ui        # Playwright UI mode
```

`npm run e2e` starts its own server with `npm run start` on port 3000, so run `npm run build` first

## Layout

```text
src/
  app/          Next.js App Router pages — one per screen above
  components/   UI components, each with its own .module.css and .test.tsx
  hooks/        Per-screen state orchestration (use-variation-selection, …)
  lib/          Pure calculation core — no React, fully unit-tested
    classification/      fuzzy complexity classifier
    performance/         fuzzy performance scoring, membership functions
    variation-selection/ AHP comparison, SLA/hardware selection, TCO
    migration/           migration graph, path solving, timing
    feasibility/         payback analysis
    validation/          shared validators
  data/         Default parameter sets and reference metrics
  i18n/         Translations (en / ua) and the language context
e2e/            Playwright specs
```
