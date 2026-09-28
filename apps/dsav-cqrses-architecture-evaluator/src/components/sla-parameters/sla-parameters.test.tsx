import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SlaParameter } from '../../lib/variation-selection/types'
import { cleanup, fireEvent, render, screen } from '../../test-utils'
import { SlaParameters } from './sla-parameters'

function makeParam(overrides: Partial<SlaParameter> = {}): SlaParameter {
  return {
    id: 'p95',
    name: 'p95',
    unit: 'ms',
    direction: 'less-better',
    slaThreshold: 100,
    ...overrides
  }
}

describe('SlaParameters', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders every parameter row', () => {
    const parameters = [
      makeParam({ id: 'errorRate', name: 'Error rate', unit: '%' }),
      makeParam({ id: 'p95', name: 'p95 Queries' })
    ]
    render(<SlaParameters parameters={parameters} onParametersChange={vi.fn()} />)
    expect(screen.getAllByDisplayValue('Error rate').length).toBeGreaterThan(0)
    expect(screen.getAllByDisplayValue('p95 Queries').length).toBeGreaterThan(0)
  })

  it('calls onParametersChange when a name is edited', () => {
    const parameters = [makeParam({ name: 'old name' })]
    const onChange = vi.fn()
    render(<SlaParameters parameters={parameters} onParametersChange={onChange} />)

    const [input] = screen.getAllByDisplayValue('old name')
    fireEvent.change(input as HTMLElement, { target: { value: 'new name' } })

    expect(onChange).toHaveBeenCalledTimes(1)
    const updated = onChange.mock.calls[0]?.[0] as SlaParameter[]
    expect(updated[0]?.name).toBe('new name')
  })

  it('removes a parameter when its remove button is clicked', () => {
    const parameters = [makeParam({ name: 'A' }), makeParam({ id: 'b', name: 'B' })]
    const onChange = vi.fn()
    render(<SlaParameters parameters={parameters} onParametersChange={onChange} />)

    const [removeA] = screen.getAllByLabelText('Remove A')
    fireEvent.click(removeA as HTMLElement)

    const updated = onChange.mock.calls[0]?.[0] as SlaParameter[]
    expect(updated).toHaveLength(1)
    expect(updated[0]?.name).toBe('B')
  })

  it('appends a new parameter via the add form', () => {
    const onChange = vi.fn()
    render(<SlaParameters parameters={[]} onParametersChange={onChange} />)

    fireEvent.change(screen.getByLabelText(/sla name/i), { target: { value: 'Latency' } })
    fireEvent.click(screen.getByRole('button', { name: /add/i }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const added = onChange.mock.calls[0]?.[0] as SlaParameter[]
    expect(added[0]?.name).toBe('Latency')
    expect(added[0]?.direction).toBe('less-better')
  })

  it('rejects an empty add-form name', () => {
    const onChange = vi.fn()
    render(<SlaParameters parameters={[]} onParametersChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
