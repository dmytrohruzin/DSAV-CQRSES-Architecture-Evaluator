# DSAV-CQRSES Calculator — Implementation Plan

## Context

DSAV-CQRSES is an information technology for decision support when selecting the optimal architectural variation of CQRS with Event Sourcing. Existing scripts (`docs/DSAV-CQRSES/`) implement the calculation logic in plain JS but lack a user-friendly interface. The goal is to create a web application with 3 pages corresponding to the 3 processes of the technology, and port the logic to TypeScript.

## Architecture Decisions

- **Calculation logic**: local library in `apps/dsav-calculator/src/lib/`
- **Variations**: 2 pre-loaded by default (Classical CQRS, mCQRS), with the ability to add more
- **State between pages**: none — each page operates autonomously
- **Graph visualization (Tab 3)**: SVG via React components
- **Charts (Tab 2)**: Chart.js + react-chartjs-2 (bitmap/canvas)
- **UI language**: bilingual (EN/UA) — toggle in header
- **Styling**: CSS Modules

---

## Application Structure — 3 Tabs (3 Processes)

The application consists of 3 tabs, each corresponding to a separate process of the DSAV-CQRSES technology:

```
┌─────────────────────────────────────────────────────────────────────┐
│  DSAV-CQRSES Calculator                                   [EN|UA] │
│                                                                     │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐│
│  │ 1. Complexity    │ │ 2. Selection     │ │ 3. Migration Roadmap ││
│  │    Evaluation    │ │                  │ │                      ││
│  └──────────────────┘ └──────────────────┘ └──────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

| Tab | Process | Description | Route |
|-----|---------|-------------|-------|
| **1. Complexity Evaluation** | Calculate parameters of a single variation | User enters data for one architectural variation and receives its complexity assessment by quality attributes | `/parameters-assessment` |
| **2. Variation Selection** | Select the optimal variation | Compare N variations across all quality attributes considering parameter weights and complexity/performance balance. Result — % applicability of each variation + bitmap chart | `/variation-selection` |
| **3. Migration Roadmap** | Find the optimal migration path | Based on a transition graph between variations — find the shortest/optimal migration path from current to target architecture | `/migration-roadmap` |

Each tab operates autonomously — there is no shared state between tabs.

---

## Tab 1 — Complexity Evaluation: UI Mockups

Calculate parameters of a single architectural variation. Two sections: Complexity and Performance.

### Data Model

- **Components** (pre-filled): Create, Update, Eventual Consistency, Query, Projection Rebuild, Change Event Types, Data Removing
- Each component contains a list of **activities** (e.g., "Create command", "Validate command", ...)
- For each activity — two values: **design complexity** (cognitive functional) and **realization complexity** (McCabe)
- Classificator (fuzzy logic): 5 classes — very simple (4), simple (6), average (8), complex (12), very complex (16)
- Axis maximums: designMaxValue = 37, realizationMaxValue = 24
- Formula: `total = 0.5 × designTotal + 0.5 × realizationTotal`

### Layout — 2 sections

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DSAV-CQRSES Calculator                                          [EN|UA]  │
│  [● Complexity] [ Selection ] [ Migration Roadmap ]                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════  │
│  SECTION 1: Complexity Evaluation                                          │
│  ══════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  Evaluate complexity of a single architectural variation using              │
│  fuzzy logic classification (trapezoid membership functions).               │
│                                                                             │
│  Classificator settings:                                                   │
│  Design Max Value: [ 37 ]   Realization Max Value: [ 24 ]                  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPONENT: Create                                          [×]   │     │
│  │                                                                    │     │
│  │  Activity              │ Design Complexity │ Realization Complexity│     │
│  │  ──────────────────────┼───────────────────┼──────────────────────│     │
│  │  Create command        │       [ 2 ]       │       [ 3.67 ]       │     │
│  │  Validate command      │       [ 4 ]       │       [ 3.50 ]       │     │
│  │  Route command         │       [ 1 ]       │       [ 1.83 ]       │     │
│  │  Create aggregate      │       [ 3 ]       │       [ 13.67]       │     │
│  │  Save aggregate        │       [ 6 ]       │       [ 7.00 ]       │     │
│  │  Dispatch events       │       [ 2 ]       │       [ 2.17 ]       │     │
│  │  ──────────────────────┼───────────────────┼──────────────────────│     │
│  │  Class value (fuzzy)   │      12.00        │        27.68         │     │
│  │  ──────────────────────┴───────────────────┴──────────────────────│     │
│  │  Component total: 0.5 × 12.00 + 0.5 × 27.68 = 19.84             │     │
│  │                                                                    │     │
│  │  [+ Add Activity]                                                  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPONENT: Update                                          [×]   │     │
│  │  ... (same structure, 7 activities pre-filled)                     │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPONENT: Eventual Consistency                            [×]   │     │
│  │  ... (3 activities)                                                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPONENT: Query                                           [×]   │     │
│  │  ... (4 activities)                                                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPONENT: Projection Rebuild                              [×]   │     │
│  │  ... (6 activities)                                                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPONENT: Change Event Types                              [×]   │     │
│  │  ... (3 activities)                                                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPONENT: Data Removing                                   [×]   │     │
│  │  ... (4 activities)                                                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │  + Add Component                                              │          │
│  │  Name: [________________]                                     │          │
│  │                                          [Add]                │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPLEXITY RESULTS                                                │     │
│  │                                                                    │     │
│  │  Component               │ Design │ Realization │  Total           │     │
│  │  ────────────────────────┼────────┼─────────────┼────────          │     │
│  │  Create                  │  12.00 │    27.68    │  19.84           │     │
│  │  Update                  │  15.50 │    42.04    │  28.77           │     │
│  │  Eventual Consistency    │  10.00 │    20.26    │  15.13           │     │
│  │  Query                   │   8.00 │    18.00    │  13.00           │     │
│  │  Projection Rebuild      │  14.00 │    38.83    │  26.42           │     │
│  │  Change Event Types      │  15.50 │    32.00    │  28.77           │     │
│  │  Data Removing           │  12.00 │    25.14    │  18.57           │     │
│  │  ────────────────────────┼────────┼─────────────┼────────          │     │
│  │  TOTAL                   │  87.00 │   213.99    │ 150.50           │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPLEXITY CHART (trapezoid membership functions)                 │     │
│  │                                                                    │     │
│  │  μ(x)                                                              │     │
│  │  1.0 ┤  /\      /\      /\      /\      /\                        │     │
│  │      │ /  \    /  \    /  \    /  \    /  \                       │     │
│  │      │/    \  /    \  /    \  /    \  /    \                      │     │
│  │  0.0 ┤──────\/──────\/──────\/──────\/──────\──                   │     │
│  │      0   VS    S     A     C     VC   →  max                      │     │
│  │      │         │                                                   │     │
│  │      │    ● current value mapped on trapezoids                     │     │
│  │                                                                    │     │
│  │  VS=very simple(4)  S=simple(6)  A=average(8)                     │     │
│  │  C=complex(12)  VC=very complex(16)                               │     │
│  │                                                                    │     │
│  │  Chart rendered as bitmap (Canvas) via Chart.js.                   │     │
│  │  Shows trapezoid membership functions + current value position.    │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════  │
│  SECTION 2: Performance Evaluation                                         │
│  ══════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  Evaluate performance using fuzzy logic on server response time.           │
│  Based on measured read/write response times and a scoring scale.          │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  PERFORMANCE SCALE (editable by user)                              │     │
│  │                                                                    │     │
│  │  Threshold (ms)  │  < 400  │  < 350  │  < 200  │  < 100  │  < 50 │     │
│  │  ────────────────┼─────────┼─────────┼─────────┼─────────┼───────│     │
│  │  Score           │  [ 1 ]  │  [ 2 ]  │  [ 3 ]  │  [ 4 ]  │ [ 5 ]│     │
│  │                                                                    │     │
│  │  [+ Add Level]                         [Remove Last]               │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  SERVER RESPONSE TIMES                                             │     │
│  │                                                                    │     │
│  │                     │ Read (ms) │ Write (ms) │                     │     │
│  │  ───────────────────┼───────────┼────────────│                     │     │
│  │  Measured value     │  [  43 ]  │  [  132 ]  │                     │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  PERFORMANCE RESULTS                                               │     │
│  │                                                                    │     │
│  │  Read:  43 ms  → score 5.00 (falls in <50 class)                  │     │
│  │  Write: 132 ms → score 2.93 (fuzzy between <200 and <100)         │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  PERFORMANCE CHART (trapezoid membership functions)                │     │
│  │                                                                    │     │
│  │  Coefficient                                                       │     │
│  │  1.0 ┤ /\        /\        /\        /\        /\                  │     │
│  │  0.93├··\·······/··\·······/                                       │     │
│  │  0.68├····\···/····                                                │     │
│  │      │     \/                                                      │     │
│  │  0.32├                                                             │     │
│  │  0.07├                                                             │     │
│  │  0.0 ┤────────────────────────────────────────→ t, ms              │     │
│  │      50  100 132  200       350       400                          │     │
│  │                                                                    │     │
│  │  X axis: server response time (ms)                                 │     │
│  │  Y axis: membership coefficient (0..1)                             │     │
│  │  ● Current value marked on chart                                   │     │
│  │  Chart rendered as bitmap (Canvas) via Chart.js.                   │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  [Calculate]                                              [Export JSON]     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interaction Flows — Tab 1

**Flow 1: Remove a Component**
```
User clicks [×] on "Query"
  → Component card disappears
  → Results table loses "Query" row
  → Totals recalculate
```

**Flow 2: Add Custom Component**
```
User clicks [+ Add Component], enters "Saga Orchestration"
  → New empty component card appears
  → User adds activities via [+ Add Activity]
  → Results table gets new row (initially 0)
```

**Flow 3: Edit Performance Scale**
```
User changes threshold or score values
  → Performance results recalculate with new scale
  → Chart redraws with updated trapezoid boundaries
```

---

## Tab 2 — Variation Selection: UI Mockups

### Data Model

Quality Attributes come in 3 types:
1. **complexity** — generates 2 keys: `*Development` + `*Modification` (formula: `value`, `value * modificationOld`)
2. **derived** — generates 1 key from a formula using multiple parameters (e.g., changeEventTypes)
3. **performance** — generates 1 key (direct value)

Relationship: the set of active Quality Attributes determines:
- which parameters are needed (Section 2)
- which metric keys each variation must have (Section 3)

### Layout — 4 sections top to bottom

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DSAV-CQRSES Calculator                    [Complexity] [Selection] [Migration]  [EN|UA]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════  │
│  SECTION 1: Quality Attributes                                              │
│  ══════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  Select which quality attributes to include in the evaluation.              │
│  This determines which parameters and metrics are required.                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  COMPLEXITY ATTRIBUTES                                              │    │
│  │                                                                     │    │
│  │  [✓] Create              → createDevelopment, createModification    │    │
│  │  [✓] Update              → updateDevelopment, updateModification    │    │
│  │  [✓] Eventual Consistency → ecDevelopment, ecModification           │    │
│  │  [✓] Query               → queryDevelopment, queryModification      │    │
│  │  [✓] Projection Rebuild  → projRebuildDev, projRebuildMod           │    │
│  │                                                                     │    │
│  │  DERIVED ATTRIBUTES                                                 │    │
│  │                                                                     │    │
│  │  [✓] Change Event Types  → changeEventTypes                         │    │
│  │      Formula: (mvpDevTimeSprints + assessmentPeriodSprints)          │    │
│  │               × expectedFrequencyChangeEventTypesPerSprint          │    │
│  │  [✓] Data Removing       → dataRemoving                             │    │
│  │      Formula: assessmentPeriodSprints                                │    │
│  │               × expectedFrequencyDataRemovingPerSprint              │    │
│  │                                                                     │    │
│  │  PERFORMANCE ATTRIBUTES                                             │    │
│  │                                                                     │    │
│  │  [✓] Read Performance    → read                                     │    │
│  │  [✓] Write Performance   → write                                    │    │
│  │                                                                     │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │  + Add Custom Attribute                                      │   │    │
│  │  │  Name: [________________]  Type: [Complexity ▼]              │   │    │
│  │  │  Metric Key(s): auto-generated from name                     │   │    │
│  │  │                                          [Add]               │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  Generated metric keys (14):  createDevelopment, createModification,        │
│  updateDevelopment, updateModification, ecDevelopment, ecModification,      │
│  queryDevelopment, queryModification, projRebuildDev, projRebuildMod,       │
│  changeEventTypes, dataRemoving, read, write                                │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════  │
│  SECTION 2: Project Parameters                                              │
│  ══════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  These parameters define importance weights for quality attributes.         │
│  Pre-filled with average values. Edit freely.                              │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  COMPLEXITY PARAMETERS              Value                          │     │
│  │  ───────────────────────────────────────────────────────────────   │     │
│  │  Create                            [  8.5 ]                        │     │
│  │  Update                            [ 31.0 ]                        │     │
│  │  Eventual Consistency              [ 44.0 ]                        │     │
│  │  Queries                           [ 22.5 ]                        │     │
│  │  Projections                       [ 17.0 ]                        │     │
│  │                                                                    │     │
│  │  DERIVED PARAMETERS                                                │     │
│  │  ───────────────────────────────────────────────────────────────   │     │
│  │  Expected Freq Change Events/Sprint [  2.0 ]                       │     │
│  │  Expected Freq Data Removing/Sprint [ 0.58 ]                       │     │
│  │                                                                    │     │
│  │  PROJECT PARAMETERS                                                │     │
│  │  ───────────────────────────────────────────────────────────────   │     │
│  │  MVP Dev Time (sprints)            [  7.0 ]                        │     │
│  │  Assessment Period (sprints)       [ 12.0 ]                        │     │
│  │  Modification Old (ratio)          [ 0.62 ]                        │     │
│  │                                                                    │     │
│  │  PERFORMANCE PRIORITIES                                            │     │
│  │  ───────────────────────────────────────────────────────────────   │     │
│  │  Read Priority                     [ 0.90 ]                        │     │
│  │  Write Priority                    [ 0.10 ]                        │     │
│  │  ⚠ Read + Write must equal 1.0     Sum: 1.00  ✓                   │     │
│  │                                                                    │     │
│  │  ┌──────────────────────────────────────────────────────────────┐  │     │
│  │  │  + Add Custom Parameter                                      │  │     │
│  │  │  Name: [________________]  Value: [________]                 │  │     │
│  │  │                                          [Add]               │  │     │
│  │  └──────────────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  Parameters shown depend on active quality attributes in Section 1.         │
│  Disabling "Create" hides the "Create" parameter row.                       │
│                                                                             │
│  ⚠ VALIDATION: Parameters ↔ Metrics consistency                            │
│  Each active quality attribute must have:                                   │
│    - a corresponding parameter in Section 2                                │
│    - corresponding metric key(s) in Section 3 for every variation          │
│  Missing parameter or metric → validation error, [Calculate] disabled.     │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════  │
│  SECTION 3: Variation Metrics                                                │
│  ══════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  Enter measured complexity/performance metrics for each variation.           │
│  Columns match the generated metric keys from Section 1.                    │
│                                                                             │
│  Variations: [+ Add Variation]                                              │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                          │ Classical CQRS [×] │  mCQRS [×]  │     │     │
│  │  ────────────────────────┼────────────────────┼─────────────┤     │     │
│  │  COMPLEXITY METRICS      │                    │              │     │     │
│  │  createDevelopment       │     [ 27.68 ]      │  [ 27.35 ]  │     │     │
│  │  createModification      │     [ 26.18 ]      │  [ 25.10 ]  │     │     │
│  │  updateDevelopment       │     [ 42.04 ]      │  [ 34.00 ]  │     │     │
│  │  updateModification      │     [ 33.54 ]      │  [ 30.50 ]  │     │     │
│  │  ecDevelopment           │     [ 20.26 ]      │  [ 15.50 ]  │     │     │
│  │  ecModification          │     [ 14.50 ]      │  [ 13.50 ]  │     │     │
│  │  queryDevelopment        │     [ 18.00 ]      │  [ 17.80 ]  │     │     │
│  │  queryModification       │     [ 17.50 ]      │  [ 17.30 ]  │     │     │
│  │  projRebuildDevelopment  │     [ 38.83 ]      │  [ 28.69 ]  │     │     │
│  │  projRebuildModification │     [ 33.33 ]      │  [ 26.69 ]  │     │     │
│  │  changeEventTypes        │     [ 32.00 ]      │  [ 13.87 ]  │     │     │
│  │  dataRemoving            │     [ 25.14 ]      │  [ 16.00 ]  │     │     │
│  │  PERFORMANCE METRICS     │                    │              │     │     │
│  │  read                    │     [  5.00 ]      │  [  5.00 ]  │     │     │
│  │  write                   │     [  2.93 ]      │  [  3.68 ]  │     │     │
│  │  ────────────────────────┼────────────────────┼─────────────┤     │     │
│  │                          │                    │              │     │     │
│  │  ⚠ Validation:                                               │     │
│  │  ✓ All 14 metric keys present in all variations              │     │
│  │  ✓ All values > 0                                            │     │
│  │                                                                    │     │
│  │  ┌──────────────────────────────────────────────────────────────┐  │     │
│  │  │  + Add Variation                                             │  │     │
│  │  │  Name: [________________]                                    │  │     │
│  │  │  (all metric rows will be added empty, fill values manually) │  │     │
│  │  │                                          [Add]               │  │     │
│  │  └──────────────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════  │
│  SECTION 4: Results                                                          │
│  ══════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  Performance / Complexity Balance                                           │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Complexity ◄━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━► Performance │     │
│  │              100%              50%                        0%       │     │
│  │  Complexity Coefficient: 0.50   Performance Coefficient: 0.50     │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────┐  ┌─────────────────────────────────────┐     │
│  │  APPLICABILITY RESULTS   │  │       APPLICABILITY BITMAP CHART    │     │
│  │                          │  │                                     │     │
│  │  Classical CQRS: 47.23%  │  │  X axis: Performance Coefficient    │     │
│  │  ████████████████░░░░░░  │  │          (0.0 → 1.0, step 0.01)    │     │
│  │                          │  │  Y axis: Applicability % of each    │     │
│  │  mCQRS:          52.77%  │  │          variation (0% → 100%)      │     │
│  │  ████████████████████░░  │  │                                     │     │
│  │                          │  │  100% ┤  ·····                     │     │
│  │  Δ mCQRS advantage:      │  │       │ ··    ····                  │     │
│  │  +5.54%                  │  │       │·          ····              │     │
│  │                          │  │   50% ┤- - - - - - - -····- - -    │     │
│  │  ──────────────────────  │  │       │                    ····     │     │
│  │  Normalized Weights:     │  │       │                       ···  │     │
│  │  ┌───────────────┬─────┐ │  │    0% ┤                          · │     │
│  │  │ Metric Key    │Weight│ │  │       └────────────────────────    │     │
│  │  ├───────────────┼─────┤ │  │        0.0   Perf Coef →    1.0   │     │
│  │  │ createDev     │ 0.04│ │  │                                     │     │
│  │  │ createMod     │ 0.03│ │  │  Each variation = separate line.   │     │
│  │  │ updateDev     │ 0.08│ │  │  Chart rendered as bitmap (Canvas) │     │
│  │  │ ...           │ ... │ │  │  using Chart.js scatter/line mode.  │     │
│  │  │ read          │ 0.23│ │  │  ● Current position on slider       │     │
│  │  │ write         │ 0.03│ │  │  -- 50% threshold                   │     │
│  │  └───────────────┴─────┘ │  └─────────────────────────────────────┘     │
│  └──────────────────────────┘                                               │
│                                                                             │
│  [Calculate]                                              [Export JSON]     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interaction Flows

**Flow 1: Disable a Quality Attribute**
```
User unchecks [✓] Query → [ ] Query
  → Parameter "Queries" disappears from Section 2
  → Metric keys "queryDevelopment", "queryModification" disappear from Section 3
  → All variation columns lose these 2 rows
  → Results recalculate automatically (if all required data filled)
  → Validation updates: "12 metric keys" instead of 14
```

**Flow 2: Add Custom Quality Attribute**
```
User clicks [+ Add Custom Attribute]
  → Enters name: "Saga Orchestration"
  → Selects type: "Complexity"
  → System auto-generates keys: sagaOrchestrationDevelopment, sagaOrchestrationModification
  → New parameter row "Saga Orchestration" appears in Section 2 (empty)
  → New metric rows appear in Section 3 for all variations (empty)
  → Validation shows ⚠: "2 metric values missing in Classical CQRS"
```

**Flow 3: Add a New Variation**
```
User clicks [+ Add Variation]
  → New column appears in Section 3 with name input: [Variation 3 ____]
  → All 14 metric rows are empty
  → Validation shows ⚠: "14 metric values missing in Variation 3"
  → New dataset line appears on chart (initially flat at 0)
```

**Flow 4: Validation Error**
```
User removes value from mCQRS.createDevelopment → empty
  → ⚠ "mCQRS: createDevelopment is required"
  → [Calculate] button disabled
  → Results section shows: "Please fill all required metrics"
```

### Responsive Behavior

```
DESKTOP (>1024px):
  Results = 2 columns: applicability results (left) + chart (right)
  Metrics table = scrollable horizontally if >3 variations

TABLET (768-1024px):
  Results = stacked: results on top, chart below
  Metrics table = same

MOBILE (<768px):
  Metrics table = card layout per variation instead of columns
  ┌─────────────────────┐
  │ Classical CQRS  [×] │
  │ createDev:  [27.68] │
  │ createMod:  [26.18] │
  │ ...                 │
  └─────────────────────┘
  ┌─────────────────────┐
  │ mCQRS           [×] │
  │ createDev:  [27.35] │
  │ ...                 │
  └─────────────────────┘
```

---

## Tab 3 — Migration Roadmap: UI Mockups

Finding the optimal migration path between architectural variations.
The user builds a directed weighted graph where nodes are variations and edges are possible transitions with weight (effort). Dijkstra's algorithm finds the path with minimum total effort.

### Data Model

- **Nodes** — architectural variations (pre-filled: Classical CQRS, mCQRS; more can be added)
- **Edges** — directed transitions between variations with weight (effort)
- **Weight (effort)** — numeric value, estimation of migration complexity/cost
- **Algorithm** — Dijkstra (shortest path by sum of weights)

### Layout — 3 sections

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DSAV-CQRSES Calculator                                          [EN|UA]  │
│  [ Complexity ] [ Selection ] [● Migration Roadmap ]                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════  │
│  SECTION 1: Variations (Graph Nodes)                                       │
│  ══════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  Define architectural variations that form the graph nodes.                │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  ┌──────────────────┐ ┌──────────────────┐                        │     │
│  │  │ Classical CQRS [×]│ │ mCQRS        [×] │                       │     │
│  │  └──────────────────┘ └──────────────────┘                        │     │
│  │                                                                    │     │
│  │  [+ Add Variation]  Name: [________________]  [Add]               │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════  │
│  SECTION 2: Migration Edges                                                │
│  ══════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  Define possible migration paths between variations and their effort.      │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  From              │  To                │  Effort (weight) │  [×] │     │
│  │  ──────────────────┼────────────────────┼──────────────────┼──────│     │
│  │  [Classical CQRS ▼]│  [mCQRS         ▼] │     [ 15.0 ]     │  [×] │     │
│  │  [mCQRS         ▼] │  [Classical CQRS ▼]│     [ 22.5 ]     │  [×] │     │
│  │                                                                    │     │
│  │  [+ Add Edge]                                                      │     │
│  │  From: [__________ ▼]  To: [__________ ▼]  Effort: [____]  [Add] │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ⚠ Validation:                                                             │
│  ✓ No duplicate edges (same from→to)                                       │
│  ✓ All effort values > 0                                                   │
│  ✓ From ≠ To for each edge                                                 │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════  │
│  SECTION 3: Pathfinding & Results                                          │
│  ══════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Source: [Classical CQRS ▼]     Target: [mCQRS ▼]                 │     │
│  │                                                                    │     │
│  │                          [Find Optimal Path]                       │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────────┐  ┌────────────────────────────────┐      │
│  │  GRAPH VISUALIZATION         │  │  PATH RESULT                   │      │
│  │                              │  │                                 │      │
│  │       ┌──────────┐           │  │  Optimal path:                  │      │
│  │       │Classical │           │  │  Classical CQRS → mCQRS         │      │
│  │       │  CQRS    │           │  │                                 │      │
│  │       └────┬─────┘           │  │  Total effort: 15.0             │      │
│  │            │                 │  │                                 │      │
│  │        15.0│  ▲ 22.5        │  │  Steps:                         │      │
│  │            ▼  │             │  │  1. Classical CQRS → mCQRS      │      │
│  │       ┌────┴─────┐          │  │     effort: 15.0                │      │
│  │       │  mCQRS   │          │  │                                 │      │
│  │       └──────────┘          │  │  ────────────────────────────── │      │
│  │                              │  │  Alternative paths:             │      │
│  │  Nodes = circles/boxes      │  │  (none — direct path is the     │      │
│  │  Edges = arrows with weight │  │   only option)                  │      │
│  │  Optimal path highlighted   │  │                                 │      │
│  │  in green                   │  │                                 │      │
│  │                              │  │                                 │      │
│  │  Rendered as SVG with        │  │                                 │      │
│  │  interactive layout.         │  │                                 │      │
│  └──────────────────────────────┘  └────────────────────────────────┘      │
│                                                                             │
│  [Export JSON]                                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interaction Flows — Tab 3

**Flow 1: Add a Variation (Node)**
```
User adds "CQRS-Lite"
  → New chip appears in Section 1
  → New node appears in graph visualization
  → Dropdowns in Section 2 and Section 3 get new option
```

**Flow 2: Add an Edge**
```
User selects From: "Classical CQRS", To: "CQRS-Lite", Effort: 10.0
  → New row in edges table
  → Arrow appears in graph: Classical CQRS —10.0→ CQRS-Lite
  → Validation updates
```

**Flow 3: Find Optimal Path**
```
User selects Source: "Classical CQRS", Target: "CQRS-Lite", clicks [Find Optimal Path]
  → Dijkstra runs on graph
  → Optimal path highlighted in green on graph SVG
  → Result panel shows: path steps, effort per step, total effort
  → Alternative paths listed with their total effort (sorted ascending)
```

**Flow 4: Unreachable Target**
```
User selects target with no path from source
  → Result: "⚠ No path exists from Classical CQRS to TargetX"
  → Graph shows source and target highlighted but no path
```

### Responsive Behavior

```
DESKTOP (>1024px):
  Section 3: graph (left) + results (right) side by side

TABLET (768-1024px):
  Section 3: stacked — graph on top, results below

MOBILE (<768px):
  Edges table → card layout per edge
  Graph → simplified smaller SVG, horizontally scrollable
```

---

## File Structure (full)

```
apps/dsav-calculator/
  package.json
  next.config.ts
  tsconfig.json
  vitest.config.ts
  src/
    app/
      globals.css
      layout.tsx
      layout.module.css
      page.tsx
      parameters-assessment/
        page.tsx
        page.module.css
      variation-selection/
        page.tsx
        page.module.css
      migration-roadmap/
        page.tsx
        page.module.css
    components/
      nav-tabs/
        nav-tabs.tsx
        nav-tabs.module.css
      quality-attributes/
        quality-attributes.tsx          # Section 1: checkboxes + add custom
        quality-attributes.module.css
      parameter-form/
        parameter-form.tsx              # Section 2: dynamic param inputs
        parameter-form.module.css
      metrics-table/
        metrics-table.tsx               # Section 3: dynamic N×M table
        metrics-table.module.css
      coefficient-slider/
        coefficient-slider.tsx
        coefficient-slider.module.css
      applicability-chart/
        applicability-chart.tsx
        applicability-chart.module.css
      applicability-results/
        applicability-results.tsx
        applicability-results.module.css
      validation-status/
        validation-status.tsx           # Shared validation display
        validation-status.module.css
      complexity-table/
        complexity-table.tsx
        complexity-table.module.css
      complexity-results/
        complexity-results.tsx
        complexity-results.module.css
      graph-editor/
        graph-editor.tsx
        graph-editor.module.css
      graph-visualizer/
        graph-visualizer.tsx
        graph-visualizer.module.css
      migration-results/
        migration-results.tsx
        migration-results.module.css
      language-switcher/
        language-switcher.tsx
        language-switcher.module.css
    lib/
      classificator.ts
      classificator.test.ts
      dsav-cqrses.ts
      dsav-cqrses.test.ts
      graph-solver.ts
      graph-solver.test.ts
      quality-attributes.ts            # Quality attribute definitions + key generation
      quality-attributes.test.ts
      types.ts
    data/
      default-complexity-data.ts
      default-params.ts
      default-quality-attributes.ts    # Pre-built quality attribute list
    i18n/
      translations.ts
      language-context.tsx
```

## Critical Source Files to Port

| Source (docs/DSAV-CQRSES/) | Target (apps/dsav-calculator/src/) |
|---|---|
| `classificator/classificator.js` | `lib/classificator.ts` |
| `DSAV-CQRSES-experiment/DSAV-CQRSES-v1.js` | `lib/dsav-cqrses.ts` |
| `DSAV-CQRSES-experiment/data.js` | `data/default-params.ts` |
| `classificator/data/*.js` (12 files) | `data/default-complexity-data.ts` |
| `DSAV-CQRSES-experiment/chart.html` | `components/applicability-chart/` |

## Implementation Phases

### Phase 1: Scaffold app
- Create `apps/dsav-calculator/` (mirror `apps/web` structure)
- Dependencies: next, react, chart.js, react-chartjs-2, chartjs-plugin-annotation, @dbbs/*
- Layout with NavTabs + LanguageSwitcher, stub pages
- Verify: `turbo run build --filter=@dbbs/dsav-calculator`

### Phase 2: Core library — types + quality attributes engine
- `src/lib/types.ts`: all type definitions
- `src/lib/quality-attributes.ts`: attribute definitions, metric key generation, validation logic
- `src/data/default-quality-attributes.ts`: 9 predefined attributes
- Unit tests

### Phase 3: Core library — classificator + DSAV-CQRSES
- Port `classificator.js` → TypeScript
- Port `DSAV-CQRSES-v1.js` → TypeScript (generalized for N variations, dynamic metric keys)
- Port data files
- Unit tests matching original JS output


### Phase 4: i18n
- Translations (EN/UA), language context, switcher component

### Phase 5: Tab 1 — Complexity Evaluation
- ComplexityTable, ComplexityResults components

### Phase 6: Tab 2 — Variation Selection
- Section 1: QualityAttributes component
- Section 2: ParameterForm component (reactive to Section 1)
- Section 3: MetricsTable component (reactive to Section 1)
- Section 4: CoefficientSlider + ApplicabilityResults + ApplicabilityChart
- ValidationStatus component

### Phase 7: Tab 3 — Migration Roadmap
- graph-solver.ts, GraphEditor, GraphVisualizer, MigrationResults

### Phase 8-9: Polish + Quality gate

## Verification

1. `turbo run build --filter=@dbbs/dsav-calculator` → success
2. `turbo run test --filter=@dbbs/dsav-calculator` → all green, coverage >= 80%
3. `turbo run check-types --filter=@dbbs/dsav-calculator` → no errors
4. Tab 2: toggle quality attribute off → params and metrics rows disappear, results recalculate
5. Tab 2: add custom attribute → new params row + new metric rows appear in all variations
6. Tab 2: default data (avg params, classicalCQRS/mCQRS) → results match `index.js` output
7. Tab 2: chart matches `chart.html` visualization
