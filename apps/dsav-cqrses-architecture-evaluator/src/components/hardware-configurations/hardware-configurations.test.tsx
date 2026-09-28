import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SlaParameter, VariationHardwareData } from '../../lib/variation-selection/types'
import { cleanup, fireEvent, render, screen } from '../../test-utils'
import { HardwareConfigurations } from './hardware-configurations'

const SLA: SlaParameter[] = [{ id: 'p95', name: 'p95', unit: 'ms', direction: 'less-better', slaThreshold: 100 }]

function block(name: string, configs: VariationHardwareData['configs']): VariationHardwareData {
  return { variationName: name, configs }
}

describe('HardwareConfigurations', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders one block per variation', () => {
    const data = [
      block('Classical CQRS', [{ id: 'a', name: 'a', pricePerMonthUsd: 100, slaValues: { p95: 50 } }]),
      block('mCQRS', [])
    ]
    render(
      <HardwareConfigurations
        variationNames={['Classical CQRS', 'mCQRS']}
        slaParameters={SLA}
        data={data}
        onDataChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Classical CQRS')).toBeInTheDocument()
    expect(screen.getByLabelText('mCQRS')).toBeInTheDocument()
  })

  it('shows an empty hint when no variations are passed', () => {
    render(<HardwareConfigurations variationNames={[]} slaParameters={SLA} data={[]} onDataChange={vi.fn()} />)
    expect(screen.getByText(/no variations/i)).toBeInTheDocument()
  })

  it('appends a new config to the matching variation block', () => {
    const data = [block('Classical CQRS', [])]
    const onChange = vi.fn()
    render(
      <HardwareConfigurations
        variationNames={['Classical CQRS']}
        slaParameters={SLA}
        data={data}
        onDataChange={onChange}
      />
    )

    fireEvent.change(screen.getByLabelText(/add hardware/i), { target: { value: 'm7i' } })
    fireEvent.click(screen.getByRole('button', { name: /add hardware/i }))

    const updated = onChange.mock.calls[0]?.[0] as VariationHardwareData[]
    expect(updated[0]?.configs).toHaveLength(1)
    expect(updated[0]?.configs[0]?.name).toBe('m7i')
  })

  it('removes a config when its remove button is clicked', () => {
    const data = [
      block('A', [
        { id: 'x', name: 'x', pricePerMonthUsd: 100, slaValues: { p95: 50 } },
        { id: 'y', name: 'y', pricePerMonthUsd: 200, slaValues: { p95: 80 } }
      ])
    ]
    const onChange = vi.fn()
    render(<HardwareConfigurations variationNames={['A']} slaParameters={SLA} data={data} onDataChange={onChange} />)

    const [removeX] = screen.getAllByLabelText('Remove x')
    fireEvent.click(removeX as HTMLElement)

    const updated = onChange.mock.calls[0]?.[0] as VariationHardwareData[]
    expect(updated[0]?.configs).toHaveLength(1)
    expect(updated[0]?.configs[0]?.id).toBe('y')
  })
})
