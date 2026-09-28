import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GraphEdge, GraphNode } from '../../lib/migration/types'
import { cleanup, fireEvent, render, screen, within } from '../../test-utils'
import { GraphEditor } from './graph-editor'

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function createNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: 'classical-cqrs',
    name: 'Classical CQRS',
    supportCost: 0,
    hostingCost: 0,
    ...overrides
  }
}

function createEdge(overrides: Partial<GraphEdge> = {}): GraphEdge {
  return {
    from: 'classical-cqrs',
    to: 'mcqrs',
    effort: 5,
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Default props factory
// ---------------------------------------------------------------------------

function createDefaultProps(overrides: Partial<Parameters<typeof GraphEditor>[0]> = {}) {
  return {
    nodes: [] as GraphNode[],
    edges: [] as GraphEdge[],
    onNodesChange: vi.fn(),
    onEdgesChange: vi.fn(),
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GraphEditor', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe('rendering', () => {
    it('should render section headers for Variations and Migration Edges', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<GraphEditor {...props} />)

      // Assert
      expect(screen.getByText('Variations (Graph Nodes)')).toBeInTheDocument()
      expect(screen.getByText('Migration Edges')).toBeInTheDocument()
    })

    it('should render variation rows when nodes are provided', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'classical-cqrs', name: 'Classical CQRS' }),
        createNode({ id: 'mcqrs', name: 'mCQRS' })
      ]
      const props = createDefaultProps({ nodes })

      // Act
      render(<GraphEditor {...props} />)

      // Assert — names appear in both desktop table and mobile cards.
      expect(screen.getAllByText('Classical CQRS').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('mCQRS').length).toBeGreaterThanOrEqual(1)
    })

    it('should render empty state when no nodes are provided', () => {
      // Arrange
      const props = createDefaultProps({ nodes: [] })

      // Act
      render(<GraphEditor {...props} />)

      // Assert
      expect(screen.getByText('No variations defined yet.')).toBeInTheDocument()
    })

    it('should render the edges table when edges are provided', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const props = createDefaultProps({ nodes, edges })

      // Act
      render(<GraphEditor {...props} />)

      // Assert — the edges section contains table headers (desktop + mobile both render)
      const edgesSection = screen.getByLabelText('Migration Edges')
      expect(within(edgesSection).getAllByText('Effort (weight)').length).toBeGreaterThanOrEqual(1)
    })

    it('should render empty edges state when no edges are provided', () => {
      // Arrange
      const props = createDefaultProps({ nodes: [], edges: [] })

      // Act
      render(<GraphEditor {...props} />)

      // Assert
      expect(screen.getAllByText('No edges defined yet. Add variations first.').length).toBeGreaterThanOrEqual(1)
    })
  })

  // -------------------------------------------------------------------------
  // Adding a node
  // -------------------------------------------------------------------------

  describe('adding a node', () => {
    it('should call onNodesChange with new node when name is entered and Add is clicked', () => {
      // Arrange — start with no nodes so only one Add button exists (the node form)
      const props = createDefaultProps()
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Variation name'), {
        target: { value: 'mCQRS' }
      })
      // With no nodes, the edge form Add button still exists; target the node form
      const nodeSection = screen.getByLabelText('Variations (Graph Nodes)')
      fireEvent.click(within(nodeSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onNodesChange).toHaveBeenCalledWith([{ id: 'mcqrs', name: 'mCQRS', supportCost: 0, hostingCost: 0 }])
    })

    it('should reject empty node name and show error', () => {
      // Arrange
      const props = createDefaultProps()
      render(<GraphEditor {...props} />)

      // Act
      const nodeSection = screen.getByLabelText('Variations (Graph Nodes)')
      fireEvent.click(within(nodeSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onNodesChange).not.toHaveBeenCalled()
      expect(screen.getByText('Name cannot be empty')).toBeInTheDocument()
    })

    it('should reject whitespace-only node name', () => {
      // Arrange
      const props = createDefaultProps()
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Variation name'), {
        target: { value: '   ' }
      })
      const nodeSection = screen.getByLabelText('Variations (Graph Nodes)')
      fireEvent.click(within(nodeSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onNodesChange).not.toHaveBeenCalled()
      expect(screen.getByText('Name cannot be empty')).toBeInTheDocument()
    })

    it('should reject duplicate node name and show error', () => {
      // Arrange
      const nodes = [createNode({ id: 'classical-cqrs', name: 'Classical CQRS' })]
      const props = createDefaultProps({ nodes })
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Variation name'), {
        target: { value: 'Classical CQRS' }
      })
      const nodeSection = screen.getByLabelText('Variations (Graph Nodes)')
      fireEvent.click(within(nodeSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onNodesChange).not.toHaveBeenCalled()
      expect(screen.getByText('A variation with this name already exists')).toBeInTheDocument()
    })

    it('should clear input after successful add', () => {
      // Arrange
      const props = createDefaultProps()
      render(<GraphEditor {...props} />)
      const input = screen.getByPlaceholderText('Variation name')

      // Act
      fireEvent.change(input, { target: { value: 'New Node' } })
      const nodeSection = screen.getByLabelText('Variations (Graph Nodes)')
      fireEvent.click(within(nodeSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(input).toHaveValue('')
    })

    it('should clear error when user types in the input', () => {
      // Arrange
      const props = createDefaultProps()
      render(<GraphEditor {...props} />)

      // Trigger the error first
      const nodeSection = screen.getByLabelText('Variations (Graph Nodes)')
      fireEvent.click(within(nodeSection).getByRole('button', { name: 'Add' }))
      expect(screen.getByText('Name cannot be empty')).toBeInTheDocument()

      // Act — type in input
      fireEvent.change(screen.getByPlaceholderText('Variation name'), {
        target: { value: 'S' }
      })

      // Assert
      expect(screen.queryByText('Name cannot be empty')).not.toBeInTheDocument()
    })

    it('should submit via form submission', () => {
      // Arrange
      const props = createDefaultProps()
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Variation name'), {
        target: { value: 'Form Submit' }
      })
      fireEvent.submit(screen.getByPlaceholderText('Variation name').closest('form') as HTMLFormElement)

      // Assert
      expect(props.onNodesChange).toHaveBeenCalledWith([
        { id: 'form-submit', name: 'Form Submit', supportCost: 0, hostingCost: 0 }
      ])
    })
  })

  // -------------------------------------------------------------------------
  // Removing a node
  // -------------------------------------------------------------------------

  describe('removing a node', () => {
    it('should call onNodesChange without the removed node', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const props = createDefaultProps({ nodes })
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.click(screen.getAllByLabelText('Remove variation Node A')[0]!)

      // Assert
      expect(props.onNodesChange).toHaveBeenCalledWith([nodes[1]])
    })

    it('should call onEdgesChange to remove connected edges when removing a node', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Node A' }),
        createNode({ id: 'b', name: 'Node B' }),
        createNode({ id: 'c', name: 'Node C' })
      ]
      const edges = [
        createEdge({ from: 'a', to: 'b', effort: 3 }),
        createEdge({ from: 'b', to: 'c', effort: 5 }),
        createEdge({ from: 'c', to: 'a', effort: 2 })
      ]
      const props = createDefaultProps({ nodes, edges })
      render(<GraphEditor {...props} />)

      // Act — remove Node A (connected to edges 0 and 2)
      fireEvent.click(screen.getAllByLabelText('Remove variation Node A')[0]!)

      // Assert
      expect(props.onNodesChange).toHaveBeenCalledWith([nodes[1], nodes[2]])
      expect(props.onEdgesChange).toHaveBeenCalledWith([edges[1]])
    })

    it('should call onEdgesChange when removed node has connected edges', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const props = createDefaultProps({ nodes, edges })
      render(<GraphEditor {...props} />)

      // Act — remove Node B; edge a→b references b
      fireEvent.click(screen.getAllByLabelText('Remove variation Node B')[0]!)

      // Assert
      expect(props.onNodesChange).toHaveBeenCalledWith([nodes[0]])
      expect(props.onEdgesChange).toHaveBeenCalledWith([])
    })

    it('should not call onEdgesChange when removed node has no connected edges', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Node A' }),
        createNode({ id: 'b', name: 'Node B' }),
        createNode({ id: 'c', name: 'Node C' })
      ]
      // Only edge between a and b; c is isolated
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const props = createDefaultProps({ nodes, edges })
      render(<GraphEditor {...props} />)

      // Act — remove Node C (no edges reference it)
      fireEvent.click(screen.getAllByLabelText('Remove variation Node C')[0]!)

      // Assert
      expect(props.onNodesChange).toHaveBeenCalledWith([nodes[0], nodes[1]])
      expect(props.onEdgesChange).not.toHaveBeenCalled()
    })

    it('should show notification when removing node with connected edges', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const props = createDefaultProps({ nodes, edges })
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.click(screen.getAllByLabelText('Remove variation Node A')[0]!)

      // Assert
      expect(screen.getByText('Removed "Node A" and 1 connected edge(s)')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Adding an edge
  // -------------------------------------------------------------------------

  describe('adding an edge', () => {
    it('should call onEdgesChange with new edge when valid inputs are provided', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const props = createDefaultProps({ nodes })
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('From'), { target: { value: 'a' } })
      fireEvent.change(screen.getByLabelText('To'), { target: { value: 'b' } })
      fireEvent.change(screen.getByLabelText('Edge effort value'), { target: { value: '5' } })
      const edgesSection = screen.getByLabelText('Migration Edges')
      fireEvent.click(within(edgesSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onEdgesChange).toHaveBeenCalledWith([{ from: 'a', to: 'b', effort: 5 }])
    })

    it('should show error when from and to are not selected', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' })]
      const props = createDefaultProps({ nodes })
      render(<GraphEditor {...props} />)

      // Act — submit without selecting from/to
      const edgesSection = screen.getByLabelText('Migration Edges')
      fireEvent.click(within(edgesSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onEdgesChange).not.toHaveBeenCalled()
      expect(screen.getByText('Select both From and To variations')).toBeInTheDocument()
    })

    it('should reject edge where from equals to', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' })]
      const props = createDefaultProps({ nodes })
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('From'), { target: { value: 'a' } })
      fireEvent.change(screen.getByLabelText('To'), { target: { value: 'a' } })
      fireEvent.change(screen.getByLabelText('Edge effort value'), { target: { value: '5' } })
      const edgesSection = screen.getByLabelText('Migration Edges')
      fireEvent.click(within(edgesSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onEdgesChange).not.toHaveBeenCalled()
      expect(screen.getByText('From and To must be different')).toBeInTheDocument()
    })

    it('should reject duplicate edge with same from and to', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const props = createDefaultProps({ nodes, edges })
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('From'), { target: { value: 'a' } })
      fireEvent.change(screen.getByLabelText('To'), { target: { value: 'b' } })
      fireEvent.change(screen.getByLabelText('Edge effort value'), { target: { value: '5' } })
      const edgesSection = screen.getByLabelText('Migration Edges')
      fireEvent.click(within(edgesSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onEdgesChange).not.toHaveBeenCalled()
      expect(screen.getByText('This edge already exists')).toBeInTheDocument()
    })

    it('should reject edge with effort of 0', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const props = createDefaultProps({ nodes })
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('From'), { target: { value: 'a' } })
      fireEvent.change(screen.getByLabelText('To'), { target: { value: 'b' } })
      fireEvent.change(screen.getByLabelText('Edge effort value'), { target: { value: '0' } })
      const edgesSection = screen.getByLabelText('Migration Edges')
      fireEvent.click(within(edgesSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onEdgesChange).not.toHaveBeenCalled()
      expect(screen.getByText('Effort must be greater than 0')).toBeInTheDocument()
    })

    it('should clear form fields after successful add', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const props = createDefaultProps({ nodes })
      render(<GraphEditor {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('From'), { target: { value: 'a' } })
      fireEvent.change(screen.getByLabelText('To'), { target: { value: 'b' } })
      fireEvent.change(screen.getByLabelText('Edge effort value'), { target: { value: '5' } })
      const edgesSection = screen.getByLabelText('Migration Edges')
      fireEvent.click(within(edgesSection).getByRole('button', { name: 'Add' }))

      // Assert
      expect(screen.getByLabelText('From')).toHaveValue('')
      expect(screen.getByLabelText('To')).toHaveValue('')
      expect(screen.getByLabelText('Edge effort value')).toHaveValue(null)
    })

    it('should clear error when user changes a select', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' })]
      const props = createDefaultProps({ nodes })
      render(<GraphEditor {...props} />)

      // Trigger error
      const edgesSection = screen.getByLabelText('Migration Edges')
      fireEvent.click(within(edgesSection).getByRole('button', { name: 'Add' }))
      expect(screen.getByText('Select both From and To variations')).toBeInTheDocument()

      // Act
      fireEvent.change(screen.getByLabelText('From'), { target: { value: 'a' } })

      // Assert
      expect(screen.queryByText('Select both From and To variations')).not.toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Removing an edge
  // -------------------------------------------------------------------------

  describe('removing an edge', () => {
    it('should call onEdgesChange without the removed edge', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Node A' }),
        createNode({ id: 'b', name: 'Node B' }),
        createNode({ id: 'c', name: 'Node C' })
      ]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 }), createEdge({ from: 'b', to: 'c', effort: 5 })]
      const props = createDefaultProps({ nodes, edges })
      render(<GraphEditor {...props} />)

      // Act — remove first edge (both desktop + mobile render the button; use getAllBy)
      const [removeButton] = screen.getAllByLabelText('Remove edge Node A to Node B')
      fireEvent.click(removeButton as HTMLElement)

      // Assert
      expect(props.onEdgesChange).toHaveBeenCalledWith([edges[1]])
    })
  })

  // -------------------------------------------------------------------------
  // Editing edge effort inline
  // -------------------------------------------------------------------------

  describe('editing edge effort', () => {
    it('should call onEdgesChange with updated effort when effort input changes', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const props = createDefaultProps({ nodes, edges })
      render(<GraphEditor {...props} />)

      // Act — both desktop and mobile render the effort input; use getAllBy
      const [effortInput] = screen.getAllByLabelText('Effort for edge Node A to Node B')
      fireEvent.change(effortInput as HTMLElement, {
        target: { value: '10' }
      })

      // Assert
      expect(props.onEdgesChange).toHaveBeenCalledWith([{ from: 'a', to: 'b', effort: 10 }])
    })

    it('should default to 0 when non-numeric value is entered for effort', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const props = createDefaultProps({ nodes, edges })
      render(<GraphEditor {...props} />)

      // Act
      const [effortInput] = screen.getAllByLabelText('Effort for edge Node A to Node B')
      fireEvent.change(effortInput as HTMLElement, {
        target: { value: '' }
      })

      // Assert
      expect(props.onEdgesChange).toHaveBeenCalledWith([{ from: 'a', to: 'b', effort: 0 }])
    })
  })

  // -------------------------------------------------------------------------
  // Validation summary
  // -------------------------------------------------------------------------

  describe('validation summary', () => {
    it('should show passing validation when edges are valid', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const props = createDefaultProps({ nodes, edges })

      // Act
      render(<GraphEditor {...props} />)

      // Assert
      expect(screen.getByLabelText('Validation Passed')).toBeInTheDocument()
    })

    it('should show failing validation for duplicate edges', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 }), createEdge({ from: 'a', to: 'b', effort: 5 })]
      const props = createDefaultProps({ nodes, edges })

      // Act
      render(<GraphEditor {...props} />)

      // Assert — duplicate edges check mark should be X
      const validationSection = screen.getByLabelText('Validation Passed')
      expect(validationSection).toBeInTheDocument()
      expect(validationSection.textContent).toContain('\u2717')
    })

    it('should show failing validation for effort <= 0', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 0 })]
      const props = createDefaultProps({ nodes, edges })

      // Act
      render(<GraphEditor {...props} />)

      // Assert
      const validationSection = screen.getByLabelText('Validation Passed')
      expect(validationSection.textContent).toContain('\u2717')
    })

    it('should show failing validation for self-loop edges', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' })]
      const edges = [createEdge({ from: 'a', to: 'a', effort: 3 })]
      const props = createDefaultProps({ nodes, edges })

      // Act
      render(<GraphEditor {...props} />)

      // Assert
      const validationSection = screen.getByLabelText('Validation Passed')
      expect(validationSection.textContent).toContain('\u2717')
    })
  })
})
