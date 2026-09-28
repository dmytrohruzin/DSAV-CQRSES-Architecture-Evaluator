# DSAV-CQRSES Calculator — Changelog

This document records all completed tasks for comparison against the original plan (`tasks.md`).
Tasks are marked as **planned** (from tasks.md) or **unplanned** (discovered during development).

---

## Phase 1: Scaffold App

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T-01 | Scaffold Next.js app in monorepo | done | planned |
| T-02 | Create root layout with NavTabs | done | planned |
| T-03 | Create home page and stub tab pages | done | planned |
| T-03r | Code review scaffold | done | planned |
| T-04 | Verify scaffold (quality gate) | done | planned, auto-fixed Biome formatting in 6 files |

## Phase 2: Types & Quality Attributes Engine

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T-05 | Define all TypeScript types | done | planned |
| T-06 | Implement quality attributes engine | done | planned |
| T-07 | Create default quality attributes data | done | planned, abbreviated metric keys |
| T-07r | Code review types & QA engine | done | planned, fixed typo "Configuraton" |
| T-08 | Write unit tests for QA engine | done | planned, 42 tests, 100% coverage |

## Phase 3: Classificator & DSAV-CQRSES

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T-09 | Port classificator.js to TypeScript | done | planned |
| T-10 | Port DSAV-CQRSES-v1.js to TypeScript | done | planned, faithful 2-variation port |
| T-10a | Generalize DSAV-CQRSES for N variations | done | planned |
| T-11 | Port data files to TypeScript | done | planned |
| T-11r | Code review classificator & DSAV-CQRSES | done | planned, **CRITICAL fix**: metric key mismatch in computeISWeights |
| T-12 | Write unit tests for classificator | done | planned, 41 tests, 100% coverage |
| T-13 | Write unit tests for dsav-cqrses | done | planned, 19 tests, 94% coverage |

## Phase 4: Tab 1 — Parameters Assessment

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T-16a | Implement ComplexityTable card component | done | planned |
| T-16b | Integrate classificator into ComplexityTable | done | planned |
| T-17 | Implement ComplexityResults component | done | planned |
| T-18 | Implement PerformanceEvaluation component | done | planned |
| T-19 | Assemble Tab 1 page | done | planned |
| T-19r | Code review Tab 1 | done | planned, **3 MAJOR fixes**: hardcoded colors, missing Calculate button, inconsistent imports |
| T-20 | Write tests for Tab 1 | done | planned, 60 tests, ≥80% coverage |

## Phase 5: Tab 2 — Variation Selection

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T-21 | QualityAttributes component | done | planned |
| T-22 | ParameterForm component | done | planned |
| T-23 | MetricsTable component | done | planned |
| T-24 | ValidationStatus component | done | planned |
| T-25 | CoefficientSlider component | done | planned |
| T-26 | ApplicabilityResults component | done | planned |
| T-27 | ApplicabilityChart component | done | planned |
| T-28a/b | Assemble Tab 2 page (state + layout) | done | planned |
| T-28r | Code review Tab 2 | done | planned, **MAJOR fix**: 40+ hardcoded hex colors replaced, added success tokens |
| T-29 | Write tests for Tab 2 | done | planned, 87 tests, ≥80% coverage |

## Phase 6: Tab 3 — Migration Roadmap

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T-32 | GraphEditor component | done | planned |
| T-33 | GraphVisualizer SVG component | done | planned |
| T-34 | MigrationResults component | done | planned |
| T-35 | Assemble Tab 3 page | done | planned |
| T-35r | Code review Tab 3 | done | planned, **3 MAJOR fixes**: hardcoded colors, undefined CSS vars, invalid HTML |
| T-36 | Write tests for Tab 3 | done | planned, 66 tests, ≥80% coverage |

## Phase 7: Internationalization (i18n)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T-14a | Create translations file (EN + UA) | done | planned, 144 keys |
| T-14b | Language context provider | done | planned |
| T-15 | LanguageSwitcher component | done | planned |
| T-15r | Code review i18n | done | planned, **2 CRITICAL fixes**: wired t() into pages, reactive html lang |

## Phase 8: Polish

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T-37 | Responsive design review | done | planned, converted 14 CSS files to mobile-first |
| T-38 | Final code review | done | planned, fixed `any`→`unknown`, Biome fixes, test type error |
| T-39 | Refine code from review | done | planned, extracted shared util, removed unused prop, added warning tokens |
| T-40 | Wire t() into all 13 components | done | planned, zero hardcoded strings |

## Phase 9: Quality Gate & Delivery

| ID | Task | Status | Notes |
|----|------|--------|-------|
| T-41 | Coverage analysis | done | planned, 367 tests, 95.31% stmts |
| T-42 | Full quality gate | done | planned, all 6 checks pass |
| T-44 | Update AGENTS.md | done | planned |
| T-45 | Create changeset | done | planned |
| T-43 | Acceptance test verification | in progress | planned |
| T-46 | Create pull request | pending | planned |

---

## Unplanned tasks (not in tasks.md)

Tasks that arose during development and were not anticipated in the original plan.

| # | Task | Reason | Commit |
|---|------|--------|--------|
| X-01 | Fix: classify each activity individually, not the sum | **Critical bug**: the classifier was applied to the sum of activities instead of each one separately. Results were zero. | `bdecca0` |
| X-02 | Fix: header layout — tabs overflow to the right | Tabs ran off-screen, especially in the UA locale | `c157a68` |
| X-03 | Fix: hide nav tabs scrollbar | A scrollbar was visible under the tabs | `c157a68` |
| X-04 | Remove "Calculator/Калькулятор" from title | Different EN/UA text length caused jitter when switching | `c157a68` |
| X-05 | Fix: hydration mismatch (localStorage vs SSR) | LanguageSwitcher aria-pressed did not match between server and client | `d415c97` |
| X-06 | Fix: locale flicker on page reload | After the hydration fix, content flickered when switching locale from localStorage | `d415c97` |
| X-07 | Replace unicode escapes with Cyrillic in translations | UA translations were in `А` format instead of Cyrillic | `d415c97` |
| X-08 | Make title a link to home page | UX: the logo should lead to the home page | `d415c97` |
| X-09 | Update heading to official methodology name | The heading did not match the official IT name | `d415c97` |
| X-10 | Remove "Core methodology" section from home | Redundant section on the home page | `bbef244` |
| X-11 | Update subtitle text on home page | The subtitle text did not match the IT description | `bbef244` |
| X-12 | Add footer with DBBSoftware and DNU links | Information about the platform and the educational program | `bbef244` |
| X-13 | Add collapsible component cards (details/summary) | UX: allows collapsing components for convenience | `1f2f6b8` |
| X-14 | Remove TOTAL row from complexity results | Redundant row — refined complexity is shown in each component | `fe96ecf` |
| X-15 | Rename "Total" to "Refined" in results table | The column shows refined, not total, complexity | `fe96ecf` |
| X-16 | Swap designMaxValue/realizationMaxValue defaults (24/37) | The default values were swapped relative to the original JS | `fe96ecf` |
| X-17 | Show error when activity value exceeds maxValue | A red message instead of empty results | `fe96ecf` |
| X-18 | Move classification summary into activity table | Class values did not align with the activity columns | `fe96ecf` |
| X-19 | Add auto-detect max values button | Auto-detect maxValue from activity maxima | `6d9691d` |
| X-20 | Fix validation panel border (display: block on output element) | The border rendered in pieces instead of a solid rectangle | `06b6111` |
| X-21 | Restructure quality attributes: OQAC/PSQAC model | The model with 3 types (complexity/derived/performance) was replaced by 2 types with componentType | `ba5037c` |
| X-22 | Single metricKey instead of metricKeys array | Each attribute has exactly one metric key | `ba5037c` |
| X-23 | Add delete button for quality attributes | UX: ability to delete an attribute, not just disable it | `ba5037c` |
| X-24 | Remove "Generated metric keys" summary section | Redundant section on the variation-selection page | `ba5037c` |
| X-25 | Remove derived parameters section from ParameterForm | The derived category was removed from the model | `ba5037c` |
| X-26 | Grid layout for quality attributes with aligned columns | Aligning checkbox/name/badge/key/delete into columns | `ba5037c` |
| X-27 | Remove ValidationStatus from variation-selection | missing_param validation is not applicable to the new model | `5bd1490` |
| X-28 | Remove "Section X:" from headings | Redundant section numbering | `5bd1490` |
| X-29 | Rename "Project Parameters" to "System Parameters" | A more accurate name for the system parameters | `5bd1490` |
| X-30 | Fix validation panel border (display: block) | The border rendered in pieces due to inline display | `06b6111` |
| X-31 | Add weightCriterion field and column | Description of the weight criterion for each attribute | `a47e0dc` |
| X-32 | Rewrite QA component from Grid to HTML table | CSS Grid did not align columns across tables | `a47e0dc` |
| X-33 | Hide metricKey column from QA display | Metric keys are kept in the model, not needed in the UI | `a47e0dc` |
| X-34 | Show attribute names in MetricsTable | Human-readable names instead of metric keys | `a47e0dc` |
| X-35 | Remove Add Custom Parameter from ParameterForm | Redundant feature with the dynamic model | `a47e0dc` |
| X-36 | Restore and relocalize Add Custom Attribute form | The form was accidentally removed, restored with localization | `a47e0dc` |
| X-37 | Pre-compute sweep results for all coefficients | The slider shows results instantly without recomputation | `f585be5` |
| X-38 | Replace heatmap with Normalized Metrics table | A full-width table of normalized metrics across variations | `f585be5` |
| X-39 | Unify Results section styling | Removed nested cards, added dividers | `f585be5` |
| X-40 | Remove Export JSON from variation-selection | Redundant button | `f585be5` |
| X-41 | Remove Export JSON from migration-roadmap | Redundant button | `4cb5e0a` |
| X-42 | Move Graph Visualization into Pathfinding section | Full-width graph visualization in a single section | `4cb5e0a` |
| X-43 | Rename "Pathfinding & Results" to "Pathfinding" | Simplified name | `4cb5e0a` |
| X-44 | Degree-based graph layering (L-to-R direction) | Nodes laid out left-to-right by number of connections | `4cb5e0a` |
| X-45 | Edge routing around intermediate nodes | Arrows route around intermediate nodes with an arc | `4cb5e0a` |
| X-46 | Distributed connection points on node borders | Arrows don't merge when there are multiple connections | `4cb5e0a` |
| X-47 | Auto-resolve overlapping edge labels | Numbers on arrows are spread apart automatically | `4cb5e0a` |
| X-48 | Responsive SVG graph (no horizontal scroll) | The SVG scales to the container width | `4cb5e0a` |
| X-49 | Add drag-and-drop for graph nodes | UX: ability to move graph nodes | `8445c68` |
| X-50 | Increase node spacing and bidirectional offset | Arrows merged between nodes of the same rank | `8445c68` |
| X-51 | Widen same-layer threshold for stable vertical arrows | Arrows jumped on minimal displacement | `8445c68` |
| X-52 | Redesign Performance Results as single table | Merging Server Response Times and Performance Results | `90339e4` |
| X-53 | Show weighted formula in Calculation column | Fuzzy scoring formula: "3 × 0.32 + 4 × 0.68 = 3.68" | `90339e4` |
| X-54 | Remove Calculate/Export buttons from parameters-assessment | Redundant buttons | `90339e4` |
| X-55 | Center-align numeric columns in complexity results | Aligning Design/Realization/Refined to center | `7688574` |
| X-56 | Replace number inputs with DecimalInput across all tables | Localized decimal separators, no spinners | `7688574` |
| X-57 | Show activity name in negative value error | "⚠ Create command: Must be >= 0" instead of a generic error | `a7caaec` |
| X-58 | Extract chevron into separate element | Independent positioning of the arrow in the header | `a7caaec` |
| X-59 | Read-only activity names | Activity names cannot be edited | `a7caaec` |
| X-60 | Add configurable design/realization weights | Weights for computing refined complexity instead of 0.5/0.5 | `8cafef7` |
| X-61 | Validate weights sum equals 1 | Inline error when the weights sum ≠ 1 | `8cafef7` |
| X-62 | Create style-guidelines.md with 13 design rules | Documentation of design rules for consistency | `a17dda4` |
| X-63 | Apply style guidelines across all pages | Unified spacing, dividers, headings | `a17dda4` |
| X-64 | Fix input focus loss in performance-evaluation | The key depended on the value — React recreated the element | `a17dda4` |
| X-65 | Restore dark card header for Complexity Results | Restoring the dark header per request | `a17dda4` |
| X-66 | Round nav tab corners | Rounding the bottom corners of the tabs | `a17dda4` |
| X-67 | Add style guidelines reference to qa and web-developer agents | Agents now read the style guidelines before working | `a17dda4` |
| X-68 | Strip performance from complexity engine | `read`/`write` metrics, `splitMetricKeys`, `perfCoef` removed from complexity | `01dd0f5` |
| X-69 | Simplify `calculateApplicabilityFromWeights` | Complexity only, no coefficients; returns the integral score r_i | `01dd0f5` |
| X-70 | Add `computeRelativeComplexity` (rc_i = r_i / r_min) | New pure function in `variation-selection.ts` + unit tests | `01dd0f5` |
| X-71 | Add `pickCheapestConfigSatisfyingSla` | Auto-select the cheapest hardware configuration that satisfies all SLAs | `01dd0f5` |
| X-72 | Add `computeOptimalVariation` (as* = min{swp·rc_i + c_ij}) | Combines rc, hardware, SLA and swp into the final result table | `01dd0f5` |
| X-73 | Introduce SLA Parameters editor | New component, dynamic preset (5 parameters from the table 4 screenshot) | `01dd0f5` |
| X-74 | Introduce Hardware Configurations editor (per variation) | New component, default data for Classical CQRS and mCQRS (6 hw × 5 SLA) | `01dd0f5` |
| X-75 | Introduce `RelativeComplexityResults` component | Shows r_i % and rc_i, "reference" badge for r_min | `01dd0f5` |
| X-76 | Introduce `OptimalVariationResult` component | Highlights the winner and a "SLA not met" mark | `01dd0f5` |
| X-77 | Add swp input | Development cost of the simplest variation, USD field | `01dd0f5` |
| X-78 | Remove obsolete components | Removed `CoefficientSlider`, `ApplicabilityResults`, `ApplicabilityChart`, `ParameterForm` | `01dd0f5` |
| X-79 | Strip performance attributes from defaults | 12 complexity attributes instead of 14 in `default-quality-attributes` | `01dd0f5` |
| X-80 | Update i18n keys for Tab 2 | New EN+UA keys for SLA, hardware, swp, optimal result; removed obsolete ones | `01dd0f5` |
| X-81 | Drop "swp" label from UI, switch pricing to USD/month | Section heading without "(swp)"; hardware price column "Price (USD/month)"; swp unit "USD/month" | `01dd0f5` |
| X-82 | Rename field `pricePerYearUsd` → `pricePerMonthUsd` across codebase | Field consistency with the new monthly price scale | `01dd0f5` |
| X-83 | Update default SLA thresholds | Commands/queries p95 ≤ 15 ms, consistency ≤ 30 ms, error rate < 0.1 % | `01dd0f5` |
| X-84 | Fix complexity normalization: v/Σv instead of (1/v)/Σ(1/v) | Now a larger metric = larger integral complexity, as the new methodology requires | `01dd0f5` |
| X-85 | Add DEFAULT_COMPONENT_WEIGHTS for sensible default weights | Pre-computed quality attribute weights instead of empty "1"s | `01dd0f5` |
| X-86 | Add Relative Hosting Price results section | New block: p_i (cheapest SLA-valid hardware) and pc_i = p_i / p_min | `01dd0f5` |
| X-87 | Add Playwright e2e suite for Variation Selection | 39 tests across Chromium/Firefox/WebKit: defaults, SLA preset, Calculate output blocks, swp reset, language switch persistence | `fa88f36` |
| X-88 | Expand Migration Roadmap defaults to 4 variations | Classical CQRS / mCQRS / Canonical CQRS / mCQRS+ with 5 directed edges, moved into `default-migration-graph.ts` | `2c96114` |
| X-89 | Add Migration Feasibility Assessment section | Collapsible now/upgrade/after-migration table; live monthly totals and payback period = migrationCost / (upgrade − migration) | `2c96114` |
| X-90 | Cost-aware Migration Roadmap (support/hosting costs + edge times) | Graph nodes carry support/hosting USD/month; edges gain migrationTimeMonths; editable cost columns | `f369f57` |
| X-91 | Revert cost-aware pathfinding | Mixing effort with USD/month in one shortest-path weight was dimensionally incoherent; pathfinding uses plain effort again, cost analysis stays in Feasibility | `88d291c` |
| X-92 | Selectable migration path in Feasibility Assessment | Radio-selectable paths table (recommended + alternatives), per-path migration cost remembered, drives totals/payback/breakdown | `5eb30a8` |
| X-93 | Extract business logic from pages into hooks | Layered architecture: each tab + Feasibility delegates state/derived/handlers to a dedicated hook, pages render JSX only | `16d2d53` |
| X-94 | Characterization tests before refactoring | Lock hook orchestration, sanitizeNumeric, and fuzzy scoring fixtures prior to the layered-architecture refactor | `e5a9056` |
| X-95 | Move lib modules into domain folders | Pure renames to organize the domain layer | `67adfd0` |
| X-96 | Split types per domain and rewire imports | One types module per domain instead of a single shared file | `affa774` |
| X-97 | Validation module, unified error policy, named constants | Centralized input validation with consistent error handling and named constants | `ecbb30c` |
| X-98 | Consolidate complexity classification in lib | Single domain home for the classification logic | `7e3083d` |
| X-99 | Hooks become pure orchestration — domain rules move to lib | Business rules pulled out of hooks into the domain layer | `3af8168` |
| X-100 | Extract fuzzy performance scoring into lib/performance | Dedicated domain module for fuzzy scoring | `e8fd065` |
| X-101 | Extract graph geometry into pure presentation modules | Split the graph editor; geometry becomes pure presentation code | `70e790a` |
| X-102 | a11y and UI-validation consistency fixes | Accessibility and consistent UI validation across components | `99fe723` |
| X-103 | Move validateGraph into lib | Edge editor consumes structural graph rules from the domain layer | `91e5ac9` |
| X-104 | Architecture documentation with Mermaid diagrams | New `docs/DSAV-CQRSES/architecture/`: layered overview, business-logic, component, and per-tab class/sequence diagrams | `43ae672` |
| X-105 | Export architecture diagrams to SVG | 18 diagrams (13 hand-crafted class/component/use-case + 5 mermaid sequence); fix mermaid sources for GitHub rendering | `0ce25b3` |
| X-106 | Post-refactoring architecture diagrams | Refresh diagrams to match the layered-architecture code | `8c727db` |
| X-107 | Sequence diagrams for the three main use cases | Editable Ukrainian mermaid sources + dissertation-ready labels and formatting for the integral-complexity / variation / migration flows | `1f95067` |
| X-108 | Add class diagrams | Hand-edited class diagrams for the architecture docs | `48929d1` |

---

## Statistics

- **Planned tasks**: 46 (from tasks.md)
- **Unplanned tasks**: 108 (X-01 … X-108)
- **Critical bugs found during review**: 5 (T-11r, T-15r ×2, T-28r, X-01)
- **Unit tests**: 367 statements at 95.31% (87.90% branches) — pre-refactor baseline, plus characterization tests added before the layered-architecture refactor (X-94)
- **E2E tests**: 39 Playwright tests across Chromium/Firefox/WebKit (X-87)
- **CSS files with hardcoded colors fixed**: ~20

## Conclusions for improving the plan

1. **Not anticipated**: SSR + localStorage hydration — a task for SSR-safe i18n is needed
2. **Not anticipated**: the classifier works on individual activities, not on the sum — a deeper analysis of the original JS is needed
3. **Underestimated**: the number of hardcoded colors that agents generate — a "design tokens enforcement" task is needed
4. **Not anticipated**: UX polish (scrollbars, layout shifts, title links) — a separate UI review phase is needed
5. **Not anticipated**: unicode escapes in translations — a "readable characters only" requirement is needed
6. **Not anticipated**: the Variation Selection model needed a full redesign (SLA + hosting-cost optimization) and the Migration Roadmap a cost/feasibility layer — the original plan modeled neither, suggesting a methodology-validation phase before UI work
7. **Not anticipated**: a layered-architecture refactor (pages → hooks → domain lib) plus characterization tests — extracting business logic should be a planned phase, not a late cleanup
8. **Not anticipated**: architecture, sequence, and class diagrams for the dissertation — a documentation phase with editable Ukrainian diagram sources is needed
