import { afterEach, describe, expect, it } from 'vitest'
import type { GraphNode } from '../../lib/migration/types'
import { cleanup, fireEvent, render, screen } from '../../test-utils'
import { FeasibilityAssessment, type FeasibilityPath } from './feasibility-assessment'

function makeNode(id: string, supportCost: number, hostingCost: number): GraphNode {
  return { id, name: id, supportCost, hostingCost }
}

const source = makeNode('classical', 50, 100)
const target = makeNode('mcqrs', 120, 40)

function path(nodes: GraphNode[], times: number[] | null): FeasibilityPath {
  return { id: nodes.map((n) => n.id).join('→'), pathNodes: nodes, pathEdgeTimes: times }
}

function getToggle(): HTMLInputElement {
  return screen.getByRole('checkbox', { name: /Hardware upgrade can avoid migration/i }) as HTMLInputElement
}

describe('FeasibilityAssessment', () => {
  afterEach(cleanup)

  it('renders the toggle but hides the table by default', () => {
    render(<FeasibilityAssessment source={source} target={target} paths={[]} />)
    expect(getToggle()).not.toBeChecked()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('reveals derived "Now" / "After migration" cells when toggled', () => {
    render(<FeasibilityAssessment source={source} target={target} paths={[]} />)
    fireEvent.click(getToggle())

    // 1.1 source.supportCost = 50 mirrors into 2.1 (Hardware upgrade) — two cells with "50".
    expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
  })

  it('shows "—" placeholders when source/target are null', () => {
    render(<FeasibilityAssessment source={null} target={null} paths={[]} />)
    fireEvent.click(getToggle())

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4)
  })

  it('falls back to the instantaneous formula when pathEdgeTimes is null', () => {
    render(<FeasibilityAssessment source={source} target={target} paths={[path([source, target], null)]} />)
    fireEvent.click(getToggle())

    expect(screen.getByText(/Migration time not set/i)).toBeInTheDocument()
    expect(screen.getByText(/Migration pays off in ~5\.56 months/i)).toBeInTheDocument()
  })

  it('hides the fallback warning when pathEdgeTimes is provided', () => {
    render(<FeasibilityAssessment source={source} target={target} paths={[path([source, target], [1.5])]} />)
    fireEvent.click(getToggle())

    expect(screen.queryByText(/Migration time not set/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('1.50').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Step-by-step cost comparison/i)).toBeInTheDocument()
  })

  it('renders the summary table with the recommended badge on the first path', () => {
    const recommended = path([source, target], [1.5])
    render(<FeasibilityAssessment source={source} target={target} paths={[recommended]} />)
    fireEvent.click(getToggle())

    expect(screen.getByText(/Migration paths/i)).toBeInTheDocument()
    expect(screen.getByText(/recommended/i)).toBeInTheDocument()
  })

  it('switches the breakdown when the user selects a different path', () => {
    const recommended = path([source, target], [1.5])
    const longer = path([source, makeNode('canonical', 80, 120), target], [1, 1.5])
    render(<FeasibilityAssessment source={source} target={target} paths={[recommended, longer]} />)
    fireEvent.click(getToggle())

    // Default selected = recommended → duration 1.50 visible.
    expect(screen.getAllByText('1.50').length).toBeGreaterThanOrEqual(1)

    // Click the second radio: breakdown switches to the longer path.
    const radios = screen.getAllByRole('radio', { name: /Select path/i })
    fireEvent.click(radios[1] as HTMLElement)

    // Duration of the longer path = 1 + 1.5 = 2.50.
    expect(screen.getAllByText('2.50').length).toBeGreaterThanOrEqual(1)
  })
})
