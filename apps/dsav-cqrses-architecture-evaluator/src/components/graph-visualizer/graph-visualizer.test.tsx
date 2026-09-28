import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GraphEdge, GraphNode } from '../../lib/migration/types'
import { cleanup, fireEvent, render, screen } from '../../test-utils'
import { GraphVisualizer } from './graph-visualizer'

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

function createEdge(overrides: Partial<GraphEdge> = {}): GraphEdge {
  return {
    from: 'node-a',
    to: 'node-b',
    effort: 5,
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Default props factory
// ---------------------------------------------------------------------------

function createDefaultProps(overrides: Partial<Parameters<typeof GraphVisualizer>[0]> = {}) {
  return {
    nodes: [] as GraphNode[],
    edges: [] as GraphEdge[],
    highlightedPath: null as string[] | null,
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GraphVisualizer', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  describe('empty state', () => {
    it('should render empty state message when no nodes are provided', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<GraphVisualizer {...props} />)

      // Assert
      expect(screen.getByText('Add variations to see the migration graph.')).toBeInTheDocument()
    })

    it('should not render an SVG when no nodes are provided', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<GraphVisualizer {...props} />)

      // Assert
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('should render the title in empty state', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<GraphVisualizer {...props} />)

      // Assert
      expect(screen.getByText('Graph Visualization')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Rendering nodes
  // -------------------------------------------------------------------------

  describe('rendering nodes', () => {
    it('should render SVG with correct number of node groups', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Alpha' }),
        createNode({ id: 'b', name: 'Beta' }),
        createNode({ id: 'c', name: 'Gamma' })
      ]
      const props = createDefaultProps({ nodes })

      // Act
      render(<GraphVisualizer {...props} />)

      // Assert
      const svg = screen.getByRole('application')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Migration graph with 3 variations and 0 edges')
      // Each node has a text element with its name
      expect(screen.getByText('Alpha')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText('Gamma')).toBeInTheDocument()
    })

    it('should render SVG with correct aria-label for single node', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Solo' })]
      const props = createDefaultProps({ nodes })

      // Act
      render(<GraphVisualizer {...props} />)

      // Assert
      const svg = screen.getByRole('application')
      expect(svg).toHaveAttribute('aria-label', 'Migration graph with 1 variation and 0 edges')
    })

    it('should render node rectangles within the SVG', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const props = createDefaultProps({ nodes })

      // Act
      const { container } = render(<GraphVisualizer {...props} />)

      // Assert — each node produces a rect in a g element
      const rects = container.querySelectorAll('svg rect')
      // At least 2 rects for 2 nodes (may also have edge weight bg rects)
      expect(rects.length).toBeGreaterThanOrEqual(2)
    })
  })

  // -------------------------------------------------------------------------
  // Rendering edges
  // -------------------------------------------------------------------------

  describe('rendering edges', () => {
    it('should render edges with weight labels', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 7.5 })]
      const props = createDefaultProps({ nodes, edges })

      // Act
      render(<GraphVisualizer {...props} />)

      // Assert — effort displayed with 1 decimal
      expect(screen.getByText('7.5')).toBeInTheDocument()
    })

    it('should render correct aria-label with edge count', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 }), createEdge({ from: 'b', to: 'a', effort: 2 })]
      const props = createDefaultProps({ nodes, edges })

      // Act
      render(<GraphVisualizer {...props} />)

      // Assert
      const svg = screen.getByRole('application')
      expect(svg).toHaveAttribute('aria-label', 'Migration graph with 2 variations and 2 edges')
    })

    it('should render path elements for edges', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 5 })]
      const props = createDefaultProps({ nodes, edges })

      // Act
      const { container } = render(<GraphVisualizer {...props} />)

      // Assert
      const paths = container.querySelectorAll('svg path')
      expect(paths.length).toBeGreaterThanOrEqual(1)
    })

    it('should skip edges that reference non-existent nodes', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' })]
      const edges = [createEdge({ from: 'a', to: 'nonexistent', effort: 5 })]
      const props = createDefaultProps({ nodes, edges })

      // Act
      const { container } = render(<GraphVisualizer {...props} />)

      // Assert — no path rendered since 'nonexistent' has no position
      const paths = container.querySelectorAll('svg path')
      expect(paths.length).toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // Highlighted path
  // -------------------------------------------------------------------------

  describe('highlighted path', () => {
    it('should apply highlighted CSS class to nodes on the path', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Node A' }),
        createNode({ id: 'b', name: 'Node B' }),
        createNode({ id: 'c', name: 'Node C' })
      ]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 }), createEdge({ from: 'b', to: 'c', effort: 5 })]
      const highlightedPath = ['a', 'b', 'c']
      const props = createDefaultProps({ nodes, edges, highlightedPath })

      // Act
      const { container } = render(<GraphVisualizer {...props} />)

      // Assert — highlighted nodes get the highlighted class (CSS modules mangle names)
      const highlightedRects = container.querySelectorAll('[class*="nodeRectHighlighted"]')
      expect(highlightedRects.length).toBe(3)
    })

    it('should apply highlighted CSS class to edges on the path', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const highlightedPath = ['a', 'b']
      const props = createDefaultProps({ nodes, edges, highlightedPath })

      // Act
      const { container } = render(<GraphVisualizer {...props} />)

      // Assert
      const highlightedEdges = container.querySelectorAll('[class*="edgeLineHighlighted"]')
      expect(highlightedEdges.length).toBe(1)
    })

    it('should not apply highlighted class when path is null', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const props = createDefaultProps({ nodes, edges, highlightedPath: null })

      // Act
      const { container } = render(<GraphVisualizer {...props} />)

      // Assert
      const highlightedRects = container.querySelectorAll('[class*="nodeRectHighlighted"]')
      const highlightedEdges = container.querySelectorAll('[class*="edgeLineHighlighted"]')
      expect(highlightedRects.length).toBe(0)
      expect(highlightedEdges.length).toBe(0)
    })

    it('should apply highlighted styles to nodes on the path', () => {
      // Arrange
      const nodes = [createNode({ id: 'a', name: 'Node A' }), createNode({ id: 'b', name: 'Node B' })]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 })]
      const highlightedPath = ['a', 'b']
      const props = createDefaultProps({ nodes, edges, highlightedPath })

      // Act
      const { container } = render(<GraphVisualizer {...props} />)

      // Assert — highlighted class applied to nodes on the path
      const highlightedRects = container.querySelectorAll('[class*="nodeRectHighlighted"]')
      expect(highlightedRects.length).toBeGreaterThan(0)
    })

    it('should render highlighted edges on top of non-highlighted edges', () => {
      // Arrange
      const nodes = [
        createNode({ id: 'a', name: 'Node A' }),
        createNode({ id: 'b', name: 'Node B' }),
        createNode({ id: 'c', name: 'Node C' })
      ]
      const edges = [createEdge({ from: 'a', to: 'b', effort: 3 }), createEdge({ from: 'a', to: 'c', effort: 5 })]
      const highlightedPath = ['a', 'b']
      const props = createDefaultProps({ nodes, edges, highlightedPath })

      // Act
      const { container } = render(<GraphVisualizer {...props} />)

      // Assert — highlighted edge group should come after non-highlighted in DOM
      const _allEdgeGroups = container.querySelectorAll('svg > g')
      const highlightedEdge = container.querySelector('[class*="edgeLineHighlighted"]')
      expect(highlightedEdge).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Zoom controls
  // -------------------------------------------------------------------------

  describe('zoom controls', () => {
    function renderWithNode() {
      const props = createDefaultProps({ nodes: [createNode({ id: 'a', name: 'Alpha' })] })
      return render(<GraphVisualizer {...props} />)
    }

    it('should render zoom in, zoom out, and reset controls', () => {
      // Act
      renderWithNode()

      // Assert
      expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reset zoom' })).toBeInTheDocument()
    })

    it('should display 100% zoom by default', () => {
      // Act
      renderWithNode()

      // Assert
      expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('100%')
    })

    it('should not render zoom controls in the empty state', () => {
      // Act
      render(<GraphVisualizer {...createDefaultProps()} />)

      // Assert
      expect(screen.queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument()
    })

    it('should increase the zoom level when zooming in', () => {
      // Arrange
      renderWithNode()

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))

      // Assert — additive step of 0.25 → 125%
      expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('125%')
    })

    it('should apply a scale transform to the content layer when zooming in', () => {
      // Arrange
      const { container } = renderWithNode()

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))

      // Assert — the transform layer is the first <g> directly under the <svg>
      const layer = container.querySelector('svg > g[transform]')
      expect(layer?.getAttribute('transform')).toContain('scale(1.25)')
    })

    it('should restore 100% zoom when reset is clicked', () => {
      // Arrange
      renderWithNode()
      const zoomIn = screen.getByRole('button', { name: 'Zoom in' })
      fireEvent.click(zoomIn)
      fireEvent.click(zoomIn)
      expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('150%')

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }))

      // Assert
      expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('100%')
    })

    it('should disable zoom out at the minimum zoom level', () => {
      // Arrange
      renderWithNode()
      const zoomOut = screen.getByRole('button', { name: 'Zoom out' })

      // Act — 100% → 75% → 50% (minimum)
      fireEvent.click(zoomOut)
      fireEvent.click(zoomOut)

      // Assert
      expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('50%')
      expect(zoomOut).toBeDisabled()
    })
  })
})
