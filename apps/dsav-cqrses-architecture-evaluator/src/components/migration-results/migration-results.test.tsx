import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GraphNode, PathResult } from '../../lib/migration/types'
import { cleanup, fireEvent, render, screen } from '../../test-utils'
import { MigrationResults } from './migration-results'

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function createNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: 'node-a',
    name: 'Node A',
    supportCost: 0,
    hostingCost: 0,
    ...overrides
  }
}

function createPathResult(overrides: Partial<PathResult> = {}): PathResult {
  return {
    path: ['a', 'b', 'c'],
    totalEffort: 8,
    steps: [
      { from: 'a', to: 'b', effort: 3 },
      { from: 'b', to: 'c', effort: 5 }
    ],
    alternatives: [],
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Default props factory
// ---------------------------------------------------------------------------

function createDefaultProps(overrides: Partial<Parameters<typeof MigrationResults>[0]> = {}) {
  return {
    nodes: [] as GraphNode[],
    result: null as PathResult | null,
    source: '',
    target: '',
    onSourceChange: vi.fn(),
    onTargetChange: vi.fn(),
    onFindPath: vi.fn(),
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MigrationResults', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // Empty state (no nodes)
  // -------------------------------------------------------------------------

  describe('empty state', () => {
    it('should show "Add variations to begin" when no nodes are provided', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByText('Add variations to begin')).toBeInTheDocument()
    })

    it('should not render source/target dropdowns when no nodes', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.queryByLabelText('Source')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Target')).not.toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Source/Target dropdowns
  // -------------------------------------------------------------------------

  describe('source and target dropdowns', () => {
    it('should render source and target dropdowns populated with nodes', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Alpha' }),
        createNode({ id: 'b', name: 'Beta' }),
        createNode({ id: 'c', name: 'Gamma' })
      ]
      const props = createDefaultProps({ nodes })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      const sourceSelect = screen.getByLabelText('Source')
      const targetSelect = screen.getByLabelText('Target')
      expect(sourceSelect).toBeInTheDocument()
      expect(targetSelect).toBeInTheDocument()

      // Each dropdown has the default option + 3 node options
      const sourceOptions = sourceSelect.querySelectorAll('option')
      const targetOptions = targetSelect.querySelectorAll('option')
      expect(sourceOptions.length).toBe(4)
      expect(targetOptions.length).toBe(4)
    })

    it('should call onSourceChange when source dropdown changes', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' })]
      const props = createDefaultProps({ nodes })
      render(<MigrationResults {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'a' } })

      // Assert
      expect(props.onSourceChange).toHaveBeenCalledWith('a')
    })

    it('should call onTargetChange when target dropdown changes', () => {
      // Arrange
      const nodes = [createNode({ id: 'b', name: 'Beta' })]
      const props = createDefaultProps({ nodes })
      render(<MigrationResults {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Target'), { target: { value: 'b' } })

      // Assert
      expect(props.onTargetChange).toHaveBeenCalledWith('b')
    })
  })

  // -------------------------------------------------------------------------
  // Validation: source == target
  // -------------------------------------------------------------------------

  describe('source equals target validation', () => {
    it('should show warning when source and target are the same', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' })]
      const props = createDefaultProps({ nodes, source: 'a', target: 'a' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByText('Source and target must be different')).toBeInTheDocument()
    })

    it('should disable Find button when source equals target', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' })]
      const props = createDefaultProps({ nodes, source: 'a', target: 'a' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByRole('button', { name: 'Find Optimal Path' })).toBeDisabled()
    })

    it('should not show warning when source and target are different', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' }), createNode({ id: 'b', name: 'Beta' })]
      const props = createDefaultProps({ nodes, source: 'a', target: 'b' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.queryByText('Source and target must be different')).not.toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Find button
  // -------------------------------------------------------------------------

  describe('find button', () => {
    it('should enable Find button when source and target are selected and different', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' }), createNode({ id: 'b', name: 'Beta' })]
      const props = createDefaultProps({ nodes, source: 'a', target: 'b' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByRole('button', { name: 'Find Optimal Path' })).not.toBeDisabled()
    })

    it('should disable Find button when source is not selected', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' })]
      const props = createDefaultProps({ nodes, source: '', target: 'a' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByRole('button', { name: 'Find Optimal Path' })).toBeDisabled()
    })

    it('should disable Find button when target is not selected', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' })]
      const props = createDefaultProps({ nodes, source: 'a', target: '' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByRole('button', { name: 'Find Optimal Path' })).toBeDisabled()
    })

    it('should call onFindPath when Find button is clicked', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' }), createNode({ id: 'b', name: 'Beta' })]
      const props = createDefaultProps({ nodes, source: 'a', target: 'b' })
      render(<MigrationResults {...props} />)

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Find Optimal Path' }))

      // Assert
      expect(props.onFindPath).toHaveBeenCalledTimes(1)
    })
  })

  // -------------------------------------------------------------------------
  // No result yet
  // -------------------------------------------------------------------------

  describe('no result state', () => {
    it('should show placeholder text when result is null', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' })]
      const props = createDefaultProps({ nodes })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByText('Select source and target, then click Find Optimal Path')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // No path found
  // -------------------------------------------------------------------------

  describe('no path found', () => {
    it('should show no-path warning for unreachable target', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' }), createNode({ id: 'b', name: 'Beta' })]
      const result = createPathResult({
        path: [],
        totalEffort: 0,
        steps: [],
        alternatives: []
      })
      const props = createDefaultProps({ nodes, result, source: 'a', target: 'b' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert — text is split across elements with <strong> tags
      const alert = screen.getByRole('alert')
      expect(alert.textContent).toContain('No path exists from')
      expect(alert.textContent).toContain('Alpha')
      expect(alert.textContent).toContain('Beta')
    })
  })

  // -------------------------------------------------------------------------
  // Optimal path display
  // -------------------------------------------------------------------------

  describe('optimal path display', () => {
    it('should display optimal path steps and total effort', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Alpha' }),
        createNode({ id: 'b', name: 'Beta' }),
        createNode({ id: 'c', name: 'Gamma' })
      ]
      const result = createPathResult({
        path: ['a', 'b', 'c'],
        totalEffort: 8,
        steps: [
          { from: 'a', to: 'b', effort: 3 },
          { from: 'b', to: 'c', effort: 5 }
        ]
      })
      const props = createDefaultProps({ nodes, result, source: 'a', target: 'c' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert — optimal path heading
      expect(screen.getByText('Optimal path')).toBeInTheDocument()

      // Path display: Alpha → Beta → Gamma
      expect(screen.getByText('Alpha \u2192 Beta \u2192 Gamma')).toBeInTheDocument()

      // Total effort
      expect(screen.getByText('8.0')).toBeInTheDocument()
      expect(screen.getByText('Total effort:')).toBeInTheDocument()
    })

    it('should display individual steps with effort values', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Alpha' }),
        createNode({ id: 'b', name: 'Beta' }),
        createNode({ id: 'c', name: 'Gamma' })
      ]
      const result = createPathResult({
        path: ['a', 'b', 'c'],
        totalEffort: 8,
        steps: [
          { from: 'a', to: 'b', effort: 3 },
          { from: 'b', to: 'c', effort: 5 }
        ]
      })
      const props = createDefaultProps({ nodes, result, source: 'a', target: 'c' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert — steps section
      expect(screen.getByText('Steps')).toBeInTheDocument()
      expect(screen.getByText('Effort: 3.0')).toBeInTheDocument()
      expect(screen.getByText('Effort: 5.0')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Alternative paths
  // -------------------------------------------------------------------------

  describe('alternative paths', () => {
    it('should show alternative paths sorted by effort', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Alpha' }),
        createNode({ id: 'b', name: 'Beta' }),
        createNode({ id: 'c', name: 'Gamma' }),
        createNode({ id: 'd', name: 'Delta' })
      ]
      const result = createPathResult({
        path: ['a', 'b', 'c'],
        totalEffort: 8,
        steps: [
          { from: 'a', to: 'b', effort: 3 },
          { from: 'b', to: 'c', effort: 5 }
        ],
        alternatives: [
          {
            path: ['a', 'd', 'c'],
            totalEffort: 12,
            steps: [
              { from: 'a', to: 'd', effort: 7 },
              { from: 'd', to: 'c', effort: 5 }
            ],
            alternatives: []
          },
          {
            path: ['a', 'b', 'd', 'c'],
            totalEffort: 10,
            steps: [
              { from: 'a', to: 'b', effort: 3 },
              { from: 'b', to: 'd', effort: 2 },
              { from: 'd', to: 'c', effort: 5 }
            ],
            alternatives: []
          }
        ]
      })
      const props = createDefaultProps({ nodes, result, source: 'a', target: 'c' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByText('Alternative paths')).toBeInTheDocument()
      // Both alternatives should render
      expect(screen.getByText('Effort: 10.0')).toBeInTheDocument()
      expect(screen.getByText('Effort: 12.0')).toBeInTheDocument()
    })

    it('should show "No alternative paths available" when alternatives is empty', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' }), createNode({ id: 'b', name: 'Beta' })]
      const result = createPathResult({
        path: ['a', 'b'],
        totalEffort: 5,
        steps: [{ from: 'a', to: 'b', effort: 5 }],
        alternatives: []
      })
      const props = createDefaultProps({ nodes, result, source: 'a', target: 'b' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByText('No alternative paths available')).toBeInTheDocument()
    })

    it('should display alternative path route with node names', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Alpha' }),
        createNode({ id: 'b', name: 'Beta' }),
        createNode({ id: 'c', name: 'Gamma' })
      ]
      const result = createPathResult({
        path: ['a', 'c'],
        totalEffort: 10,
        steps: [{ from: 'a', to: 'c', effort: 10 }],
        alternatives: [
          {
            path: ['a', 'b', 'c'],
            totalEffort: 8,
            steps: [
              { from: 'a', to: 'b', effort: 3 },
              { from: 'b', to: 'c', effort: 5 }
            ],
            alternatives: []
          }
        ]
      })
      const props = createDefaultProps({ nodes, result, source: 'a', target: 'c' })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByText('Alpha \u2192 Beta \u2192 Gamma')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Results section heading
  // -------------------------------------------------------------------------

  describe('results section', () => {
    it('should render Results heading when nodes exist', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Alpha' })]
      const props = createDefaultProps({ nodes })

      // Act
      render(<MigrationResults {...props} />)

      // Assert
      expect(screen.getByText('Results')).toBeInTheDocument()
    })
  })
})
