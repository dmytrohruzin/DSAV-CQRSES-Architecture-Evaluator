# DSAV-CQRSES Calculator — Implementation Task List

## Overview

Comprehensive, ordered task list for implementing the DSAV-CQRSES Calculator application as specified in `plan.md`. Tasks are grouped by implementation phase and ordered to respect dependencies.

### Architectural Notes (apply to ALL UI tasks)

- **State between pages**: none — each page operates autonomously. No shared state between tabs.
- **State within a tab**: use React `useState`/`useReducer` lifted to the page level and passed as props. No React context needed within tabs.
- **Color scheme**: blue (#1E3A5F / #2563EB) primary, yellow (#F59E0B / #FBBF24) accents — defined as CSS custom properties in `globals.css`.
- **Styling**: CSS Modules for all components. Each component gets its own `.module.css` file.
- **`'use client'`**: only on interactive components (those with state, event handlers, or browser APIs). Layout and purely presentational server components do not need it.
- **Charts**: Chart.js + react-chartjs-2 for canvas/bitmap charts (Tab 1 trapezoids, Tab 2 applicability chart).
- **Graph visualization**: SVG via React components (Tab 3).
- **Error handling**: invalid input (negative values, empty fields, NaN) should show inline validation messages. Disable action buttons (Calculate, Find Path) when validation fails.

---

## Phase 1: Scaffold App

| ID | Title | Agent | Skill | Deps | Acceptance Criteria |
|----|-------|-------|-------|------|---------------------|
| T-01 | Scaffold Next.js app in monorepo | `devops` | `/dev` | — | `turbo run build --filter=@dbbs/dsav-calculator` succeeds. `npx syncpack lint` passes. |
| T-02 | Create root layout with NavTabs | `web-developer` | `/dev` | T-01 | Layout renders with header, 3 tab links. |
| T-03 | Create home page and stub tab pages | `web-developer` | `/dev` | T-02 | Home page shows app description, tech info, and 3 nav buttons. All tab routes render. Build succeeds. |
| T-03r | Code review: scaffold (T-02, T-03) | `refinement` | `/code-review` | T-03 | No CRITICAL/MAJOR issues. CSS custom properties defined. Conventions followed. |
| T-04 | Verify scaffold with build, lint, type-check | `quality-gate` | `/quality-check` | T-03r | Build, Biome lint, type-check all pass. |

### Task Details

**T-01: Scaffold Next.js app in monorepo**
Create `apps/dsav-calculator/` mirroring `apps/web/` structure. Set up `package.json` (name: `@dbbs/dsav-calculator`), `next.config.ts`, `tsconfig.json` extending `@dbbs/typescript-config/nextjs.json`, and `vitest.config.ts` extending `@dbbs/vitest-config/next`. Add dependencies: `next`, `react`, `react-dom`, `chart.js`, `react-chartjs-2`, `chartjs-plugin-annotation`, `@dbbs/env-config`, `@dbbs/logger`. Add devDependencies: `@dbbs/typescript-config`, `@dbbs/vitest-config`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@types/react`, `@types/react-dom`.

**T-02: Create root layout with NavTabs**
Implement `src/app/layout.tsx` with header containing app title and `NavTabs` component (3 tabs linking to `/parameters-assessment`, `/variation-selection`, `/migration-roadmap`). Create `globals.css` and `layout.module.css`. Use CSS Modules. Define CSS custom properties in `globals.css` for the color palette: `--color-primary-dark: #1E3A5F`, `--color-primary: #2563EB`, `--color-accent: #F59E0B`, `--color-accent-light: #FBBF24`, plus neutral/background/text colors. NavTabs is a server component (uses `next/link`, no state).

**T-03: Create home page and stub tab pages**
Create `src/app/page.tsx` as a landing page with: a short description of the app's capabilities (DSAV-CQRSES method for evaluating and selecting architectural variations), information about the underlying technology/methodology, and 3 prominent buttons/cards linking to each tab (`/parameters-assessment`, `/variation-selection`, `/migration-roadmap`). Create `src/app/parameters-assessment/page.tsx`, `src/app/variation-selection/page.tsx`, and `src/app/migration-roadmap/page.tsx` as minimal placeholders. Add `page.module.css` files.

---

## Phase 2: Core Library — Types & Quality Attributes Engine

| ID | Title | Agent | Skill | Deps | Acceptance Criteria |
|----|-------|-------|-------|------|---------------------|
| T-05 | Define all TypeScript types | `web-developer` | `/dev` | T-01 | All types compile. No `any`. Covers all 3 tabs data models. |
| T-06 | Implement quality attributes engine | `web-developer` | `/dev` | T-05 | 14 default metric keys generated. Toggle on/off works. Validation detects missing data. |
| T-07 | Create default quality attributes data | `web-developer` | `/dev` | T-05, T-06 | 9 predefined attributes produce 14 metric keys. |
| T-07r | Code review: types & QA engine (T-05, T-06, T-07) | `refinement` | `/code-review` | T-07 | No CRITICAL/MAJOR issues. Types use `unknown` not `any`. `import type` for type-only imports. |
| T-08 | Write unit tests for quality attributes engine | `qa` | `/write-tests` | T-07r | All tests pass. Coverage >= 80%. |

### Task Details

**T-05: Define all TypeScript types**
Create `src/lib/types.ts` with: `Activity`, `Component`, `ComplexityData`, `PerformanceScale`, `QualityAttribute` (with `type: 'complexity' | 'derived' | 'performance'`), `ProjectParams`, `VariationMetrics`, `GraphNode`, `GraphEdge`, `PathResult`, classificator types.

**T-06: Implement quality attributes engine**
Create `src/lib/quality-attributes.ts`: attribute definitions, metric key generation (complexity -> `*Development` + `*Modification`; derived -> 1 key from formula; performance -> 1 key), validation logic, add/remove custom attributes.

**T-07: Create default quality attributes data**
Create `src/data/default-quality-attributes.ts` with 9 predefined attributes (5 complexity, 2 derived, 2 performance).

---

## Phase 3: Core Library — Classificator & DSAV-CQRSES

| ID | Title | Agent | Skill | Deps | Acceptance Criteria |
|----|-------|-------|-------|------|---------------------|
| T-09 | Port classificator.js to TypeScript | `web-developer` | `/dev` | T-05 | Identical output to original JS. Configurable max values. |
| T-10 | Port DSAV-CQRSES-v1.js to TypeScript (faithful) | `web-developer` | `/dev` | T-05, T-06 | Matches original JS output exactly for 2 variations. |
| T-10a | Generalize DSAV-CQRSES for N variations | `web-developer` | `/dev` | T-10 | Works with 2+ variations. Normalization across N variations. Dynamic metric keys from active attributes. |
| T-11 | Port data files to TypeScript | `web-developer` | `/dev` | T-05, T-09 | All data compiles. Values match plan. |
| T-11r | Code review: classificator & DSAV-CQRSES (T-09, T-10, T-10a, T-11) | `refinement` | `/code-review` | T-10a, T-11 | No CRITICAL/MAJOR issues. N-variation generalization correct. No `console.log` (use `@dbbs/logger`). |
| T-12 | Write unit tests for classificator | `qa` | `/write-tests` | T-11r | Coverage >= 80%. Create component: design=12.00, realization=27.68. |
| T-13 | Write unit tests for dsav-cqrses | `qa` | `/write-tests` | T-11r | Coverage >= 80%. 2 variations: Classical CQRS ~47.23%, mCQRS ~52.77% at 0.50. 3+ variations: normalization sums to 100%. |

### Task Details

**T-09: Port classificator.js to TypeScript**
Port `docs/DSAV-CQRSES/classificator/classificator.js` -> `src/lib/classificator.ts`. Trapezoid membership functions, fuzzy logic with 5 classes (VS=4, S=6, A=8, C=12, VC=16). Configurable `designMaxValue` (default 37) and `realizationMaxValue` (default 24).

**T-10: Port DSAV-CQRSES-v1.js to TypeScript (faithful)**
Port `docs/DSAV-CQRSES/DSAV-CQRSES-experiment/DSAV-CQRSES-v1.js` -> `src/lib/dsav-cqrses.ts`. Faithful 1:1 TypeScript port keeping the original 2-variation logic (Classical CQRS + mCQRS). Preserve the same calculation flow: parameter normalization, metric normalization (1/metric pairwise), IS case weighting, and applicability scoring. Must produce identical output to the original JS for the same inputs.

**T-10a: Generalize DSAV-CQRSES for N variations**
Refactor `src/lib/dsav-cqrses.ts` to support an arbitrary number of variations (not just 2). Key changes: (1) accept an array of `VariationMetrics` instead of two named objects, (2) generalize the metric normalization formula from pairwise `1/a / (1/a + 1/b)` to N-way `(1/v_i) / sum(1/v_j)` across all variations, (3) dynamic metric keys driven by active quality attributes instead of hardcoded keys, (4) sweep function that computes applicability across the full 0-1 range of performance coefficient for all variations. Ensure backward compatibility: with 2 variations and default data, output must still match the original JS results.

**T-11: Port data files to TypeScript**
Port `data.js` -> `src/data/default-params.ts`. Port 12 classificator data files -> `src/data/default-complexity-data.ts` (consolidated).

---

## Phase 4: Tab 1 — Complexity & Performance Assessment

This tab has **two distinct sections**:
- **Section 1 — Refined Complexity**: Calculates refined complexity from design and realization complexity using fuzzy logic classificator
- **Section 2 — Performance Assessment**: Assesses performance based on server response time against a configurable performance scale

Both sections produce scores that feed into Tab 2's variation selection algorithm.

| ID | Title | Agent | Skill | Deps | Acceptance Criteria |
|----|-------|-------|-------|------|---------------------|
| T-16a | Implement ComplexityTable card component (Section 1) | `web-developer` | `/dev` | T-09, T-11 | Single component card renders with editable activities, design/realization inputs. Add/remove activity works. Pre-fills 7 default components. Totals per component correct. |
| T-16b | Integrate classificator + settings panel into ComplexityTable (Section 1) | `web-developer` | `/dev` | T-16a | Classificator settings panel (designMaxValue, realizationMaxValue) renders. Fuzzy class values compute correctly per component. Formula `0.5 * design + 0.5 * realization` applied. Changing settings recomputes all class values. |
| T-17 | Implement ComplexityResults component (Section 1) | `web-developer` | `/dev` | T-16b | Reactive results table + trapezoid Chart.js canvas. |
| T-18 | Implement PerformanceEvaluation component (Section 2) | `web-developer` | `/dev` | T-09 | Default scale works. Read=43ms->5.00, Write=132ms->~2.93. Chart renders. |
| T-19 | Assemble Tab 1 page with both sections | `web-developer` | `/dev` | T-16b, T-17, T-18 | Both sections render. Calculate + Export work. Responsive. |
| T-19r | Code review: Tab 1 (T-16a, T-16b, T-17, T-18, T-19) | `refinement` | `/code-review` | T-19 | No CRITICAL/MAJOR issues. CSS Modules used. `'use client'` only where needed. Props interfaces match spec. |
| T-20 | Write tests for Tab 1 components | `qa` | `/write-tests` | T-19r | Coverage >= 80%. Key interaction flows for both sections tested. |

### Task Details

**T-16a: Implement ComplexityTable card component (Section 1 — Refined Complexity)**

- **File**: `src/components/complexity-table/complexity-table.tsx`
- **CSS Module**: `src/components/complexity-table/complexity-table.module.css`
- **Directive**: `'use client'` (interactive — inputs, add/remove buttons)
- **Props interface**:
  ```ts
  interface ComplexityTableProps {
    components: Component[];                    // Array of component data
    onComponentsChange: (components: Component[]) => void;  // Callback when data changes
  }
  ```
- **UI elements to render**:
  - A list of component cards, each showing: component name with [x] remove button, a table of activities with columns: Activity Name, Design Complexity (number input), Realization Complexity (number input), and a [+ Add Activity] button at the bottom of each card
  - An [+ Add Component] section at the bottom with a name text input and [Add] button
  - Pre-fill 7 default components from `default-complexity-data.ts` (Create, Update, Eventual Consistency, Query, Projection Rebuild, Change Event Types, Data Removing)
- **User interactions**: Edit activity names inline. Edit numeric inputs for design/realization complexity. Add new activity to a component. Remove an activity. Add a new component (with empty activity list). Remove a component.
- **State management**: This component receives data and callbacks from the page. All state is owned by the Tab 1 page component via `useState`.
- **Error handling**: Numeric inputs must be >= 0. Empty fields default to 0. Show red border on negative values.

**T-16b: Integrate classificator + settings panel into ComplexityTable (Section 1)**

- **File**: Same as T-16a — `src/components/complexity-table/complexity-table.tsx` (extend)
- **CSS Module**: Same — `src/components/complexity-table/complexity-table.module.css`
- **Additional props**:
  ```ts
  interface ComplexityTableProps {
    // ... existing props from T-16a
    designMaxValue: number;                     // Classificator setting (default 37)
    realizationMaxValue: number;                // Classificator setting (default 24)
    onSettingsChange: (settings: { designMaxValue: number; realizationMaxValue: number }) => void;
  }
  ```
- **UI elements to add**:
  - Classificator settings panel at the top of Section 1: two labeled number inputs for `Design Max Value` (default 37) and `Realization Max Value` (default 24)
  - Inside each component card, below the activity table: a summary row showing `Class value (fuzzy)` for design and realization columns — computed by calling `classificator.ts` with the sum of activity values and the max value settings
  - A `Component total` row showing `0.5 * designClass + 0.5 * realizationClass`
- **User interactions**: Edit designMaxValue/realizationMaxValue -> all fuzzy class values and totals recompute reactively.
- **Error handling**: Max values must be > 0. If a max value is 0 or negative, show validation error and keep previous valid value.

**T-17: Implement ComplexityResults component (Section 1 — Refined Complexity)**

- **File**: `src/components/complexity-results/complexity-results.tsx`
- **CSS Module**: `src/components/complexity-results/complexity-results.module.css`
- **Directive**: `'use client'` (Chart.js canvas requires browser APIs)
- **Props interface**:
  ```ts
  interface ComplexityResultsProps {
    results: Array<{
      name: string;
      designClass: number;
      realizationClass: number;
      total: number;
    }>;
    designMaxValue: number;
    realizationMaxValue: number;
  }
  ```
- **UI elements to render**:
  - Summary table with columns: Component, Design, Realization, Total. One row per component plus a TOTAL row summing all.
  - Chart.js canvas showing trapezoid membership functions for the 5 fuzzy classes (VS=4, S=6, A=8, C=12, VC=16) with the current total value marked on the chart.
- **User interactions**: None directly — this is a display-only component. It reacts to prop changes.
- **Error handling**: If results array is empty, show a placeholder message.

**T-18: Implement PerformanceEvaluation component (Section 2 — Performance Assessment)**

- **File**: `src/components/performance-evaluation/performance-evaluation.tsx`
- **CSS Module**: `src/components/performance-evaluation/performance-evaluation.module.css`
- **Directive**: `'use client'` (interactive — inputs, Chart.js canvas)
- **Props interface**:
  ```ts
  interface PerformanceEvaluationProps {
    scale: PerformanceScale[];                  // Editable threshold/score pairs
    onScaleChange: (scale: PerformanceScale[]) => void;
    readMs: number;
    writeMs: number;
    onReadMsChange: (value: number) => void;
    onWriteMsChange: (value: number) => void;
  }
  ```
- **UI elements to render**:
  - Performance scale table (editable): rows with threshold (ms) and score columns. [+ Add Level] and [Remove Last] buttons.
  - Server response time inputs: Read (ms) and Write (ms) number fields.
  - Performance results: Read score and Write score computed using fuzzy scoring against the scale.
  - Chart.js canvas showing performance trapezoid membership functions with current value markers for read and write.
- **User interactions**: Edit scale thresholds/scores. Add/remove scale levels. Edit read/write ms values. All changes recompute results reactively.
- **State management**: State owned by Tab 1 page, passed via props.
- **Error handling**: Response times must be >= 0. Scale thresholds must be in descending order. Scores must be positive integers.

**T-19: Assemble Tab 1 page with both sections**

- **File**: `src/app/parameters-assessment/page.tsx`
- **CSS Module**: `src/app/parameters-assessment/page.module.css`
- **Directive**: `'use client'` (owns all state for Section 1 + Section 2)
- **State management**: `useState` for: `components` (array of Component), `designMaxValue`, `realizationMaxValue`, `performanceScale`, `readMs`, `writeMs`. Pass these as props to child components along with setter callbacks.
- **UI elements**: Section 1 header + ComplexityTable + ComplexityResults. Section 2 header + PerformanceEvaluation. [Calculate] button (triggers full recomputation). [Export JSON] button (downloads all data as JSON).
- **Responsive**: Sections stack vertically. Tables scroll horizontally on small screens.

---

## Phase 5: Tab 2 — Variation Selection

| ID | Title | Agent | Skill | Deps | Acceptance Criteria |
|----|-------|-------|-------|------|---------------------|
| T-21 | Implement QualityAttributes component (Section 1) | `web-developer` | `/dev` | T-06, T-07 | Checkboxes grouped by type. Toggle updates keys. Custom add works. |
| T-22 | Implement ParameterForm component (Section 2) | `web-developer` | `/dev` | T-11, T-21 | Reactive to attributes. Default values. R+W validation. |
| T-23 | Implement MetricsTable component (Section 3) | `web-developer` | `/dev` | T-11, T-21 | Dynamic NxM table. Add/remove variations. Mobile card layout. Validation. |
| T-24 | Implement ValidationStatus component | `web-developer` | `/dev` | T-06 | Green checks on pass. Specific error messages. Controls Calculate button. |
| T-25 | Implement CoefficientSlider component | `web-developer` | `/dev` | T-02 | Slider 0-1, default 0.50. Updates coefficients display. |
| T-26 | Implement ApplicabilityResults component | `web-developer` | `/dev` | T-10a | Classical ~47.23%, mCQRS ~52.77% at 0.50. Bars + weights table. |
| T-27 | Implement ApplicabilityChart component | `web-developer` | `/dev` | T-10a | Chart.js line chart, 101 points, current position marker, 50% threshold. |
| T-28a | Wire Tab 2 state management across 4 sections | `web-developer` | `/dev` | T-21–T-27 | All state lifted to page. Cascading data flow works: toggling attribute updates params, metrics, and results. |
| T-28b | Compose Tab 2 page layout with responsive design + buttons | `web-developer` | `/dev` | T-28a | 4 sections render correctly. Calculate + Export buttons work. Responsive layout (desktop 2-col results, mobile stacked). |
| T-28r | Code review: Tab 2 (T-21–T-28b) | `refinement` | `/code-review` | T-28b | No CRITICAL/MAJOR issues. Cascading state flow correct. Validation logic complete. Mobile card layout implemented. |
| T-29 | Write tests for Tab 2 components | `qa` | `/write-tests` | T-28r | Coverage >= 80%. All 4 interaction flows tested. |

### Task Details

**T-21: QualityAttributes**

- **File**: `src/components/quality-attributes/quality-attributes.tsx`
- **CSS Module**: `src/components/quality-attributes/quality-attributes.module.css`
- **Directive**: `'use client'` (checkboxes, add form)
- **Props interface**:
  ```ts
  interface QualityAttributesProps {
    attributes: QualityAttribute[];
    onAttributesChange: (attributes: QualityAttribute[]) => void;
  }
  ```
- **UI elements**: Three groups of checkboxes (Complexity Attributes: 5 items, Derived Attributes: 2 items, Performance Attributes: 2 items). Each checkbox shows the attribute name and its generated metric key(s). Below: "Generated metric keys (N)" summary line. Add Custom Attribute form: Name text input, Type dropdown (Complexity/Derived/Performance), [Add] button.
- **User interactions**: Toggle checkbox -> attribute enabled/disabled -> metric keys update -> parent notified via callback. Add custom attribute -> new checkbox appears (checked by default).
- **Error handling**: Duplicate attribute names rejected. Empty name rejected.

**T-22: Implement ParameterForm component (Section 2)**

- **File**: `src/components/parameter-form/parameter-form.tsx`
- **CSS Module**: `src/components/parameter-form/parameter-form.module.css`
- **Directive**: `'use client'` (interactive — number inputs, validation)
- **Props interface**:
  ```ts
  interface ParameterFormProps {
    activeAttributes: QualityAttribute[];       // Determines which parameter rows appear
    params: ProjectParams;                      // Current parameter values
    onParamsChange: (params: ProjectParams) => void;
  }
  ```
- **UI elements to render** (from plan.md mockup):
  - **Complexity Parameters** group: one row per active complexity attribute (e.g., Create: 8.5, Update: 31.0, Eventual Consistency: 44.0, Queries: 22.5, Projections: 17.0). Only rows for enabled complexity attributes appear.
  - **Derived Parameters** group: frequency values for active derived attributes (e.g., Expected Freq Change Events/Sprint: 2.0, Expected Freq Data Removing/Sprint: 0.58).
  - **Project Parameters** group: MVP Dev Time (sprints): 7.0, Assessment Period (sprints): 12.0, Modification Old (ratio): 0.62.
  - **Performance Priorities** group: Read Priority (0.90), Write Priority (0.10). Validation message: "Read + Write must equal 1.0" with current sum and check/warning icon.
  - **Add Custom Parameter** form: Name + Value inputs + [Add] button.
- **User interactions**: Edit any numeric value -> parent callback fires. Toggling a quality attribute in Section 1 causes rows to appear/disappear reactively. Performance priorities must sum to 1.0.
- **State management**: All values owned by Tab 2 page, passed as props.
- **Error handling**: Negative values show red border. Empty fields default to 0. R+W sum != 1.0 shows warning and disables Calculate. All fields must be >= 0.

**T-23: MetricsTable**

- **File**: `src/components/metrics-table/metrics-table.tsx`
- **CSS Module**: `src/components/metrics-table/metrics-table.module.css`
- **Directive**: `'use client'` (interactive — editable cells, add/remove variations)
- **Props interface**:
  ```ts
  interface MetricsTableProps {
    metricKeys: string[];                       // Row labels from active quality attributes
    variations: Array<{
      name: string;
      metrics: Record<string, number>;
    }>;
    onVariationsChange: (variations: MetricsTableProps['variations']) => void;
  }
  ```
- **UI elements**: Dynamic NxM table. Rows = metric keys (grouped: Complexity Metrics, Performance Metrics). Columns = variations (pre-load Classical CQRS + mCQRS with default values from `default-params.ts`). Each cell is an editable number input. [x] button to remove a variation. [+ Add Variation] form at bottom: name input + [Add] button (new column with empty metrics).
- **Responsive behavior**: Desktop: horizontal scrollable table if > 3 variations. Mobile (< 768px): card layout per variation (each card lists all metric key-value pairs vertically).
- **User interactions**: Edit metric values. Add/remove variations. Metric keys change reactively when quality attributes are toggled.
- **Error handling**: All values must be > 0. Empty cells show red border. Missing metrics for a variation trigger validation warning.

**T-24: Implement ValidationStatus component**

- **File**: `src/components/validation-status/validation-status.tsx`
- **CSS Module**: `src/components/validation-status/validation-status.module.css`
- **Directive**: `'use client'` (reactive to validation state)
- **Props interface**:
  ```ts
  interface ValidationStatusProps {
    errors: Array<{
      type: 'missing_param' | 'missing_metric' | 'invalid_value' | 'sum_mismatch';
      message: string;
    }>;
    isValid: boolean;
  }
  ```
- **UI elements to render**:
  - A compact status panel showing validation state.
  - When valid: green checkmark icons with summary messages (e.g., "All 14 metric keys present in all variations", "All values > 0", "Performance priorities sum to 1.0").
  - When invalid: red warning icons with specific error messages (e.g., "mCQRS: createDevelopment is required", "Performance priorities sum to 0.90, must equal 1.0").
  - The component does NOT own any state — it is purely presentational.
- **User interactions**: None — display only. The parent page computes validation state and passes it.
- **Error handling**: N/A — this component IS the error display.
- **Integration**: The parent page uses `isValid` to control whether the [Calculate] button is enabled.

**T-25: Implement CoefficientSlider component**

- **File**: `src/components/coefficient-slider/coefficient-slider.tsx`
- **CSS Module**: `src/components/coefficient-slider/coefficient-slider.module.css`
- **Directive**: `'use client'` (interactive — range slider input)
- **Props interface**:
  ```ts
  interface CoefficientSliderProps {
    value: number;                              // Current performance coefficient (0-1)
    onChange: (value: number) => void;
  }
  ```
- **UI elements to render**:
  - A labeled section "Performance / Complexity Balance".
  - A horizontal range slider input: min=0, max=1, step=0.01, default=0.50.
  - Labels at ends: "Complexity 100%" (left, value=0) and "Performance 0%" (left) / "Performance 100%" (right, value=1) and "Complexity 0%" (right).
  - Below slider: display current values — "Complexity Coefficient: X.XX" and "Performance Coefficient: X.XX" where performance = value and complexity = 1 - value.
- **User interactions**: Drag slider -> `onChange` fires with new value -> parent recomputes applicability results.
- **Error handling**: Clamp value to [0, 1] range.

**T-26: Implement ApplicabilityResults component**

- **File**: `src/components/applicability-results/applicability-results.tsx`
- **CSS Module**: `src/components/applicability-results/applicability-results.module.css`
- **Directive**: `'use client'` (reactive display)
- **Props interface**:
  ```ts
  interface ApplicabilityResultsProps {
    results: Array<{
      name: string;
      applicability: number;                    // Percentage (e.g. 47.23)
    }>;
    weights: Array<{
      metricKey: string;
      weight: number;
    }>;
  }
  ```
- **UI elements to render**:
  - For each variation: name, applicability percentage (formatted to 2 decimals), and a horizontal bar visualization (filled proportionally to the percentage, using primary blue color).
  - Delta display: the difference between the top two variations (e.g., "mCQRS advantage: +5.54%").
  - Normalized weights table: two columns (Metric Key, Weight) showing how each metric contributes to the final score. Weight values formatted to 2 decimals.
- **User interactions**: None — display only. Reacts to prop changes when slider moves or data changes.
- **Error handling**: If results array is empty, show placeholder "Run calculation to see results".
- **Expected values with defaults**: Classical CQRS ~47.23%, mCQRS ~52.77% at performance coefficient 0.50.

**T-27: ApplicabilityChart**

- **File**: `src/components/applicability-chart/applicability-chart.tsx`
- **CSS Module**: `src/components/applicability-chart/applicability-chart.module.css`
- **Directive**: `'use client'` (Chart.js canvas)
- **Props interface**:
  ```ts
  interface ApplicabilityChartProps {
    sweepData: Array<{
      name: string;
      points: Array<{ x: number; y: number }>; // 101 points (0.00 to 1.00)
    }>;
    currentCoefficient: number;                 // For vertical marker line
  }
  ```
- **UI elements**: Chart.js scatter/line chart. X axis: performance coefficient 0.0->1.0. Y axis: applicability % (0->100). One line per variation. `chartjs-plugin-annotation` for: 50% horizontal threshold dashed line, vertical dashed line at current coefficient position.
- **User interactions**: None — display only. Reacts to prop changes.

**T-28a: Wire Tab 2 state management across 4 sections**

- **File**: `src/app/variation-selection/page.tsx`
- **CSS Module**: `src/app/variation-selection/page.module.css`
- **Directive**: `'use client'` (owns all interactive state)
- **State to manage** (all via `useState` / `useReducer` at page level):
  - `attributes: QualityAttribute[]` — from Section 1 (QualityAttributes)
  - `params: ProjectParams` — from Section 2 (ParameterForm)
  - `variations: VariationData[]` — from Section 3 (MetricsTable)
  - `coefficient: number` — from Section 4 (CoefficientSlider)
  - `results: ApplicabilityResult[] | null` — computed after Calculate
  - `sweepData: SweepData[] | null` — computed after Calculate
  - `weights: WeightData[] | null` — computed after Calculate
  - `validationErrors: ValidationError[]` — derived from current state
- **Cascading data flow**:
  1. Toggling an attribute in Section 1 -> updates `attributes` -> recalculates `metricKeys` -> ParameterForm shows/hides rows -> MetricsTable shows/hides metric rows -> validation reruns
  2. Editing params or metrics -> validation reruns
  3. Clicking [Calculate] -> calls `dsav-cqrses.ts` with current data -> populates `results`, `sweepData`, `weights`
  4. Moving slider -> recomputes results at new coefficient from `sweepData` (no recalculation needed, just lookup)
- **Acceptance criteria**: All 4 interaction flows from plan.md work end-to-end.

**T-28b: Compose Tab 2 page layout with responsive design + buttons**

- **File**: Same as T-28a — `src/app/variation-selection/page.tsx` (extend)
- **CSS Module**: Same — `src/app/variation-selection/page.module.css`
- **UI composition**: Render all 4 sections vertically:
  1. Section 1: QualityAttributes
  2. Section 2: ParameterForm
  3. Section 3: MetricsTable + ValidationStatus
  4. Section 4: CoefficientSlider + ApplicabilityResults (left) + ApplicabilityChart (right)
  - [Calculate] button between Section 3 and Section 4 — disabled when `!isValid`
  - [Export JSON] button at the bottom — exports all inputs + results as JSON download
- **Responsive behavior**:
  - Desktop (> 1024px): Section 4 results = 2 columns (results left, chart right). Metrics table scrollable horizontally if > 3 variations.
  - Tablet (768-1024px): Section 4 results stacked (results top, chart below).
  - Mobile (< 768px): Metrics table uses card layout per variation.

---

## Phase 6: Tab 3 — Migration Roadmap

| ID | Title | Agent | Skill | Deps | Acceptance Criteria |
|----|-------|-------|-------|------|---------------------|
| T-30 | Implement graph-solver library | `web-developer` | `/dev` | T-05 | Dijkstra works. Unreachable handled. Alternatives sorted. |
| T-31 | Write unit tests for graph-solver | `qa` | `/write-tests` | T-30 | Coverage >= 80%. Direct, multi-hop, cyclic, unreachable tested. |
| T-32 | Implement GraphEditor component | `web-developer` | `/dev` | T-30 | Node chips + edge table. Add/remove. Validation. Mobile cards. |
| T-33 | Implement GraphVisualizer component (SVG) | `web-developer` | `/dev` | T-02 | SVG directed graph. Green path highlight. Responsive. |
| T-34 | Implement MigrationResults component | `web-developer` | `/dev` | T-30 | Path steps + effort. Alternatives. No-path warning. |
| T-35 | Assemble Tab 3 migration-roadmap page | `web-developer` | `/dev` | T-32, T-33, T-34 | Full Tab 3. All 4 flows work. Responsive. Export JSON. |
| T-35r | Code review: Tab 3 (T-30, T-32, T-33, T-34, T-35) | `refinement` | `/code-review` | T-35 | No CRITICAL/MAJOR issues. Dijkstra implementation correct. SVG accessible. Edge cases handled. |
| T-36 | Write tests for Tab 3 components | `qa` | `/write-tests` | T-35r | Coverage >= 80%. All 4 interaction flows tested. |

### Task Details

**T-30: graph-solver library**
`src/lib/graph-solver.ts`. Dijkstra's algorithm for directed weighted graphs. `findShortestPath()` and `findAllPaths()`. Handle unreachable targets.

**T-32: Implement GraphEditor component**

- **File**: `src/components/graph-editor/graph-editor.tsx`
- **CSS Module**: `src/components/graph-editor/graph-editor.module.css`
- **Directive**: `'use client'` (interactive — inputs, dropdowns, add/remove)
- **Props interface**:
  ```ts
  interface GraphEditorProps {
    nodes: GraphNode[];                         // Variation names
    edges: GraphEdge[];                         // Directed edges with weights
    onNodesChange: (nodes: GraphNode[]) => void;
    onEdgesChange: (edges: GraphEdge[]) => void;
  }
  ```
- **UI elements to render** (from plan.md mockup):
  - **Section 1 — Variations (Graph Nodes)**: Horizontal row of "chip" elements, each showing the variation name + [x] remove button. Pre-fill: Classical CQRS, mCQRS. Below: [+ Add Variation] form with name input and [Add] button.
  - **Section 2 — Migration Edges**: Table with columns: From (dropdown of node names), To (dropdown of node names), Effort/Weight (number input), [x] remove button. Pre-fill 2 default edges: Classical CQRS -> mCQRS (15.0), mCQRS -> Classical CQRS (22.5). Below: [+ Add Edge] form with From dropdown, To dropdown, Effort input, [Add] button.
  - Validation summary below edges: "No duplicate edges", "All effort values > 0", "From != To".
- **User interactions**: Add/remove nodes. Adding a node makes it available in edge dropdowns. Removing a node removes all edges connected to it. Add/remove edges. Edit edge effort values.
- **State management**: All state owned by Tab 3 page, passed as props.
- **Error handling**: Duplicate edges (same from->to) rejected with message. Effort must be > 0 (show red border on invalid). From == To rejected. Empty node name rejected. Removing a node that is referenced by edges: auto-remove those edges and show a brief notification.
- **Responsive behavior**: Desktop: edge table as columns. Mobile (< 768px): card layout per edge (each card shows From, To, Effort fields vertically).

**T-33: GraphVisualizer (SVG)**

- **File**: `src/components/graph-visualizer/graph-visualizer.tsx`
- **CSS Module**: `src/components/graph-visualizer/graph-visualizer.module.css`
- **Directive**: `'use client'` (SVG rendering, may need `useEffect` for layout calculation)
- **Props interface**:
  ```ts
  interface GraphVisualizerProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
    highlightedPath: string[] | null;           // Node IDs in the optimal path to highlight
  }
  ```
- **UI elements**: SVG with rounded-rect nodes, arrow edges with weight labels. Green highlight for optimal path edges and nodes. Circular/force-directed layout. Scrollable on mobile.

**T-34: Implement MigrationResults component**

- **File**: `src/components/migration-results/migration-results.tsx`
- **CSS Module**: `src/components/migration-results/migration-results.module.css`
- **Directive**: `'use client'` (reactive display)
- **Props interface**:
  ```ts
  interface MigrationResultsProps {
    nodes: GraphNode[];
    result: PathResult | null;                  // null = not yet calculated
    source: string;
    target: string;
    onSourceChange: (nodeId: string) => void;
    onTargetChange: (nodeId: string) => void;
    onFindPath: () => void;
  }
  ```
  Where `PathResult` contains: `path: string[]` (ordered node IDs), `totalEffort: number`, `steps: Array<{ from: string; to: string; effort: number }>`, `alternatives: Array<{ path: string[]; totalEffort: number }>`.
- **UI elements to render** (from plan.md mockup):
  - Source and Target dropdown selectors + [Find Optimal Path] button
  - **Optimal path heading**: e.g., "Classical CQRS -> mCQRS"
  - **Total effort**: e.g., "15.0"
  - **Steps list**: numbered steps, each showing "from -> to" with effort value
  - **Alternative paths section**: other paths sorted by total effort ascending. If no alternatives, show "No alternative paths available".
  - **No-path warning**: if `result` indicates unreachable target, show warning icon + "No path exists from X to Y".
- **User interactions**: Select source/target from dropdowns. Click [Find Optimal Path] to trigger calculation via `onFindPath` callback.
- **Error handling**: If no nodes exist, show "Add variations to begin". If source == target, show "Source and target must be different". If result is null (not yet calculated), show "Select source and target, then click Find Optimal Path".

**T-35: Assemble Tab 3 migration-roadmap page**

- **File**: `src/app/migration-roadmap/page.tsx`
- **CSS Module**: `src/app/migration-roadmap/page.module.css`
- **Directive**: `'use client'` (owns all interactive state)
- **State to manage** (all via `useState` at page level):
  - `nodes: GraphNode[]` — pre-filled with Classical CQRS, mCQRS
  - `edges: GraphEdge[]` — pre-filled with 2 default edges
  - `source: string` — selected source node ID
  - `target: string` — selected target node ID
  - `result: PathResult | null` — computed after [Find Optimal Path]
- **UI composition**: Render 3 sections vertically:
  1. GraphEditor (nodes + edges management)
  2. Path selection (Source/Target dropdowns + [Find Optimal Path] button) — can be part of MigrationResults
  3. Results area: GraphVisualizer (left) + MigrationResults (right) side by side on desktop
  - [Export JSON] button at bottom — exports graph data + result as JSON download
- **Responsive behavior**:
  - Desktop (> 1024px): Graph visualization (left) + results (right) side by side.
  - Tablet (768-1024px): Stacked — graph on top, results below.
  - Mobile (< 768px): Edges table -> card layout. Graph SVG horizontally scrollable.
- **Interaction flows** (all 4 from plan.md):
  1. Add variation -> new chip + new dropdown option + new SVG node
  2. Add edge -> new table row + new SVG arrow
  3. Find path -> Dijkstra runs -> SVG path highlighted green -> results panel shows steps
  4. Unreachable target -> warning message + source/target highlighted but no path

---

## Phase 7: Internationalization (i18n)

Implemented after all 3 tabs are complete, so all UI strings are known upfront.

| ID | Title | Agent | Skill | Deps | Acceptance Criteria |
|----|-------|-------|-------|------|---------------------|
| T-14a | Create translations file with all strings | `web-developer` | `/dev` | T-19, T-28b, T-35 | EN and UA translations for all UI strings across all 3 tabs. All keys typed. No missing translations. |
| T-14b | Implement language context provider and hook | `web-developer` | `/dev` | T-14a | Context provides locale + `t()` function. Switching updates all text. Persists in localStorage. |
| T-15 | Implement LanguageSwitcher component | `web-developer` | `/dev` | T-14b | Toggle switches EN/UA. Persists across navigation. |
| T-15r | Code review: i18n (T-14a, T-14b, T-15) | `refinement` | `/code-review` | T-15 | No CRITICAL/MAJOR issues. All strings covered. Type safety on translation keys. No hardcoded strings remain. |

### Task Details

**T-14a: Create translations file with all strings**

- **File**: `src/i18n/translations.ts`
- **Content**: A typed object with two top-level keys (`en`, `ua`), each containing a nested object with all UI strings organized by section:
  - `common`: app title, tab names (Complexity Evaluation, Variation Selection, Migration Roadmap), buttons (Calculate, Export JSON, Add, Remove), validation messages
  - `tab1`: section headers, field labels (Design Complexity, Realization Complexity, etc.), component names, classificator settings labels, performance scale labels, result labels
  - `tab2`: section headers (Quality Attributes, Project Parameters, Variation Metrics, Results), attribute names, parameter labels, performance priority labels, applicability result labels, chart labels
  - `tab3`: section headers (Variations, Migration Edges, Pathfinding & Results), field labels (From, To, Effort), result labels (Optimal path, Total effort, Steps, Alternative paths, No path exists)
- **Type safety**: Export a `Translations` type and a `TranslationKey` type for `t()` function parameter.
- **Acceptance criteria**: Every user-visible string in the app has a corresponding key. Both EN and UA are complete.

**T-14b: Implement language context provider and hook**

- **File**: `src/i18n/language-context.tsx`
- **Directive**: `'use client'` (uses `useState`, `localStorage`)
- **Exports**:
  - `LanguageProvider` — React context provider wrapping the app. Reads initial locale from `localStorage` (default: `'en'`).
  - `useLanguage()` — hook returning `{ locale, setLocale, t }` where `t(key: TranslationKey) => string` resolves the key against the current locale's translations.
- **Integration**: Wrap the root layout's `{children}` with `<LanguageProvider>`. All components that display text use `const { t } = useLanguage()` and replace hardcoded strings with `t('key')`.
- **Error handling**: If a translation key is missing, return the key itself as fallback (development aid).

**T-15: Implement LanguageSwitcher component**
Create `src/components/language-switcher/language-switcher.tsx` and its CSS module. Renders an EN/UA toggle in the header. Uses `useLanguage` context. Mark as `'use client'`.

---

## Phase 8: Polish

| ID | Title | Agent | Skill | Deps | Acceptance Criteria |
|----|-------|-------|-------|------|---------------------|
| T-37 | Responsive design review and fixes | `web-developer` | `/responsive-design` | T-19, T-28b, T-35 | All responsive behaviors from plan.md work. No overflow. Usable on mobile. |
| T-38 | Final code review: full app | `refinement` | `/code-review` | T-15r | No critical issues. Conventions followed. No `any`. Cross-cutting concerns (shared patterns, consistency). |
| T-39 | Refine code based on review findings | `web-developer` | `/refine` | T-38 | All issues resolved. No test regressions. |
| T-40 | Complete i18n coverage for all UI strings | `web-developer` | `/refine` | T-15r | No hardcoded strings. Full UA translation. |

---

## Phase 9: Quality Gate & Delivery

| ID | Title | Agent | Skill | Deps | Acceptance Criteria |
|----|-------|-------|-------|------|---------------------|
| T-41 | Coverage analysis and gap filling | `qa` | `/coverage` | T-20, T-29, T-36, T-39 | >= 80% coverage across all files. |
| T-42 | Full quality gate check | `quality-gate` | `/quality-check` | T-41 | Build, lint, types, tests all pass. syncpack OK. No regressions. |
| T-43 | Verification against plan acceptance criteria | `qa` | `/acceptance-test` | T-42 | All 7 verification criteria from plan.md pass. |
| T-44 | Update AGENTS.md with new app entry | `delivery` | `/dev` | T-42 | AGENTS.md lists new app with accurate description. |
| T-45 | Create changeset for the new app | `delivery` | `/dev` | T-42 | Changeset file created in `.changeset/`. |
| T-46 | Create pull request | `delivery` | `/create-pr` | T-43, T-44, T-45 | PR created with summary + test plan. CI passes. |

### T-43 Details
Run `/acceptance-test` against `docs/DSAV-CQRSES/plan.md` verification section (7 criteria):
1. `turbo run build --filter=@dbbs/dsav-calculator` succeeds
2. `turbo run test --filter=@dbbs/dsav-calculator` all green, coverage >= 80%
3. `turbo run check-types --filter=@dbbs/dsav-calculator` no errors
4. Tab 2: toggle quality attribute off -> params and metrics rows disappear, results recalculate (interaction flow trace)
5. Tab 2: add custom attribute -> new params row + new metric rows appear in all variations (interaction flow trace)
6. Tab 2: default data (avg params, classicalCQRS/mCQRS) -> results match `index.js` output (calculation comparison)
7. Tab 2: chart matches `chart.html` visualization (visual checklist / Playwright screenshot)

---

## Summary

| Phase | Count | Tasks |
|-------|-------|-------|
| 1. Scaffold | 5 | T-01, T-02, T-03, T-03r, T-04 |
| 2. Types & QA Engine | 5 | T-05 -> T-07, T-07r, T-08 |
| 3. Classificator & DSAV | 7 | T-09 -> T-11 (incl. T-10a), T-11r, T-12, T-13 |
| 4. Tab 1 (Complexity + Performance) | 7 | T-16a, T-16b, T-17, T-18, T-19, T-19r, T-20 |
| 5. Tab 2 (Variation Selection) | 11 | T-21 -> T-27, T-28a, T-28b, T-28r, T-29 |
| 6. Tab 3 (Migration Roadmap) | 8 | T-30 -> T-35, T-35r, T-36 |
| 7. i18n | 4 | T-14a, T-14b, T-15, T-15r |
| 8. Polish | 4 | T-37 -> T-40 |
| 9. Quality & Delivery | 6 | T-41 -> T-46 |
| **Total** | **57** | |

## Parallelism Opportunities

- **After T-01**: T-02 (layout) and T-05 (types) can run in parallel
- **After T-05**: T-06 (QA engine), T-09 (classificator), T-30 (graph-solver) can run in parallel
- **Phases 4-6**: Tab components can start as soon as their library deps are ready (no i18n blocker)
- **Phase 7**: i18n starts after all 3 tabs (T-19, T-28b, T-35) — full string inventory known
- **Phase 8**: T-37 can run in parallel with Phase 7 (no i18n dependency for responsive review)
- **Phase 9**: T-44 and T-45 can run in parallel after T-42
