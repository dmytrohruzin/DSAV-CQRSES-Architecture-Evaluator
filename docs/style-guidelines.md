# DSAV-CQRSES Calculator — Style Guidelines

Rules for consistent spacing, dividers, typography, and section patterns across all pages.

---

## 1. Page Layout

| Element | Value | Token |
|---------|-------|-------|
| Page container gap (mobile) | 24px | `var(--space-6)` |
| Page container gap (768px+) | 32px | `var(--space-8)` |
| Page title font-size | clamp(1.5rem, 1rem + 2vw, 2rem) | — |
| Page title font-weight | 700 | — |
| Page title margin-bottom | 0 | — |
| Page description font-size | 1rem | — |
| Page description color | `var(--color-text-secondary)` | — |
| Page description line-height | 1.7 | — |

---

## 2. Section Cards (white containers)

All sections use the same card pattern:

| Property | Mobile | 768px+ | 1024px+ |
|----------|--------|--------|---------|
| `padding` | `var(--space-4)` (16px) | `var(--space-6)` (24px) | `var(--space-8)` (32px) |
| `background` | `var(--color-surface)` | — | — |
| `border` | `1px solid var(--color-border)` | — | — |
| `border-radius` | `var(--radius-lg)` | — | — |
| `box-shadow` | `var(--shadow-sm)` | — | — |

---

## 3. Section Title

Inside each section card:

| Property | Value |
|----------|-------|
| `font-size` | `clamp(1.1rem, 0.9rem + 1vw, 1.35rem)` |
| `font-weight` | 600 |
| `color` | `var(--color-primary-dark)` |
| `border-bottom` | `2px solid var(--color-primary)` |
| `padding-bottom` | `var(--space-2)` (8px) |
| `margin-bottom` | `var(--space-2)` (8px) |

**Rule**: Every section title MUST have a blue bottom border.

---

## 4. Section Description

Immediately after the section title:

| Property | Value |
|----------|-------|
| `font-size` | 0.9rem |
| `color` | `var(--color-text-secondary)` |
| `line-height` | 1.6 |
| `margin-bottom` | `var(--space-4)` (16px) |

**Rule**: NO additional line/divider between title and description. The blue title border is enough.

---

## 5. Sub-Section Titles (inside Results, inside components)

Used for headings like "Applicability Results", "Normalized Metrics", "Optimal Path", "Steps", "Alternative Paths", "Graph Visualization":

| Property | Value |
|----------|-------|
| `font-size` | 1rem |
| `font-weight` | 600 |
| `color` | `var(--color-text-secondary)` |
| `text-transform` | uppercase |
| `letter-spacing` | 0.05em |
| `margin` | 0 |

**Rule**: Sub-section titles do NOT have a bottom border. They are plain uppercase text.

---

## 6. Dark Card Headers (component cards inside section)

Used for collapsible component cards (Complexity components), table group headers (Complexity Attributes, Performance Attributes):

| Property | Value |
|----------|-------|
| `background` | `var(--color-primary-dark)` |
| `color` | `var(--color-text-inverse)` |
| `font-size` | 0.9375rem |
| `font-weight` | 600 |
| `text-transform` | uppercase |
| `letter-spacing` | 0.025em |
| `padding` | 0 (content controls padding via chevron/remove button size) |

**Rule**: Dark headers are ONLY for collapsible cards and table group separators. Section titles use the light pattern (rule 3).

---

## 7. Dividers

Thin horizontal lines separating sub-sections within a card:

| Property | Value |
|----------|-------|
| `border` | none |
| `border-top` | `1px solid var(--color-border)` |
| `margin` | `var(--space-4) 0` (16px top and bottom) |

**Rule**: Use `<hr>` with this style. All dividers have 16px margin. No 8px or 12px margins.

---

## 8. Component Container Gaps

Internal gap between elements inside a component:

| Context | Value | Token |
|---------|-------|-------|
| Component container gap | 24px | `var(--space-6)` |
| Sub-component gap (slider, results) | 16px | `var(--space-4)` |
| Tight list gap (steps, items) | 8px | `var(--space-2)` |

---

## 9. Tables

| Property | Value |
|----------|-------|
| Header background | `var(--color-surface)` (white) |
| Header font-size | 0.8125rem |
| Header font-weight | 700 |
| Header text-transform | uppercase |
| Header letter-spacing | 0.05em |
| Header border-bottom | `2px solid var(--color-border)` |
| Row border-bottom | `1px solid var(--color-border)` |
| Cell padding | `var(--space-2) var(--space-3)` |
| Numeric cell text-align | center |
| Numeric cell font-family | `var(--font-mono)` |
| Name cell text-align | left |

---

## 10. Buttons

### Primary (Calculate, Add)
| Property | Value |
|----------|-------|
| `background` | `var(--color-primary)` |
| `color` | white |
| `font-weight` | 600 |
| `padding` | `var(--space-2) var(--space-6)` |
| `border-radius` | `var(--radius-md)` |

### Remove/Close (x)
| Property | Value |
|----------|-------|
| `width` / `height` | 24px |
| `font-size` | 1rem |
| `font-weight` | 700 |
| `border-radius` | `var(--radius-sm)` |

---

## 11. Inputs

### DecimalInput (preferred for all numeric fields)
| Property | Value |
|----------|-------|
| `type` | text (with inputMode="decimal") |
| `text-align` | center |
| `font-family` | `var(--font-mono)` |
| `border` | `1px solid var(--color-border)` |
| `border-radius` | `var(--radius-sm)` |
| `padding` | `var(--space-1) var(--space-2)` |
| No spinners | `appearance: textfield` |

### Validation error
| Property | Value |
|----------|-------|
| `border-color` | `var(--color-error)` |

---

## 12. "Add" Sections (dashed border)

Used for "Add Component", "Add Custom Attribute", "Add Variation":

| Property | Value |
|----------|-------|
| `border` | `2px dashed var(--color-border)` |
| `border-radius` | `var(--radius-lg)` |
| `padding` | `var(--space-3) var(--space-4)` |

---

## 13. Empty States / Warnings

| Property | Value |
|----------|-------|
| `text-align` | center |
| `color` | `var(--color-text-secondary)` |
| `font-style` | italic |
| `padding` | `var(--space-6) var(--space-4)` |
