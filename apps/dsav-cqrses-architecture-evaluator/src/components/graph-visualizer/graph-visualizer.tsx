'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/language-context'
import type { GraphEdge, GraphNode } from '../../lib/migration/types'
import { computeDistributedPorts, computeEdgePathWithPorts, hasReverseEdge, resolveLabelOverlaps } from './edge-routing'
import {
  ARROWHEAD_SIZE,
  computeDegreeBasedLayout,
  EDGE_LABEL_OFFSET,
  isEdgeHighlighted,
  isNodeHighlighted,
  NODE_HEIGHT,
  NODE_WIDTH,
  type NodePosition
} from './graph-layout'
import styles from './graph-visualizer.module.css'

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface GraphVisualizerProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  highlightedPath: string[] | null
}

// -----------------------------------------------------------------------------
// Zoom / pan
// -----------------------------------------------------------------------------

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const ZOOM_BUTTON_STEP = 0.25
const WHEEL_ZOOM_SENSITIVITY = 0.0015

interface ViewTransform {
  scale: number
  x: number
  y: number
}

const IDENTITY_TRANSFORM: ViewTransform = { scale: 1, x: 0, y: 0 }

function clampZoom(scale: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale))
}

// Re-anchor the translation so the point (cx, cy) in SVG user space stays fixed while zooming.
function zoomAtPoint(prev: ViewTransform, targetScale: number, cx: number, cy: number): ViewTransform {
  const scale = clampZoom(targetScale)
  const ratio = scale / prev.scale
  return {
    scale,
    x: cx - ratio * (cx - prev.x),
    y: cy - ratio * (cy - prev.y)
  }
}

export function GraphVisualizer({ nodes, edges, highlightedPath }: GraphVisualizerProps) {
  const { t } = useLanguage()

  const svgRef = useRef<SVGSVGElement>(null)

  const {
    positions: computedPositions,
    width: svgWidth,
    height: svgHeight
  } = useMemo(() => computeDegreeBasedLayout(nodes, edges), [nodes, edges])

  // ---- Drag-and-drop state --------------------------------------------------

  const [dragPositions, setDragPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)

  // ---- Zoom / pan state -----------------------------------------------------

  const [view, setView] = useState<ViewTransform>(IDENTITY_TRANSFORM)
  const [panning, setPanning] = useState<{ x: number; y: number } | null>(null)

  // Reset drag overrides when the computed layout changes
  const prevComputedRef = useRef(computedPositions)
  if (prevComputedRef.current !== computedPositions) {
    prevComputedRef.current = computedPositions
    if (Object.keys(dragPositions).length > 0) {
      setDragPositions({})
    }
  }

  // Merge computed positions with drag overrides
  const positions = useMemo(
    () =>
      computedPositions.map((pos) => ({
        ...pos,
        ...(dragPositions[pos.id] ?? {})
      })),
    [computedPositions, dragPositions]
  )

  // ---- SVG coordinate conversion helper -------------------------------------

  const clientToSvg = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const svgEl = svgRef.current
      if (!svgEl) return { x: 0, y: 0 }
      const rect = svgEl.getBoundingClientRect()
      const x = (clientX - rect.left) * (svgWidth / rect.width)
      const y = (clientY - rect.top) * (svgHeight / rect.height)
      return { x, y }
    },
    [svgWidth, svgHeight]
  )

  // Convert a client point into graph (pre-transform) coordinates, undoing the current zoom/pan.
  const clientToGraph = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const { x, y } = clientToSvg(clientX, clientY)
      return { x: (x - view.x) / view.scale, y: (y - view.y) / view.scale }
    },
    [clientToSvg, view]
  )

  // ---- Drag handlers --------------------------------------------------------

  const handleDragStart = useCallback(
    (id: string, clientX: number, clientY: number) => {
      const graph = clientToGraph(clientX, clientY)
      const pos = positions.find((p) => p.id === id)
      if (!pos) return
      setDragging({ id, offsetX: graph.x - pos.x, offsetY: graph.y - pos.y })
    },
    [clientToGraph, positions]
  )

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging) return
      const graph = clientToGraph(clientX, clientY)
      setDragPositions((prev) => ({
        ...prev,
        [dragging.id]: { x: graph.x - dragging.offsetX, y: graph.y - dragging.offsetY }
      }))
    },
    [dragging, clientToGraph]
  )

  // ---- Zoom / pan handlers --------------------------------------------------

  const zoomByStep = useCallback(
    (delta: number) => {
      setView((prev) => zoomAtPoint(prev, prev.scale + delta, svgWidth / 2, svgHeight / 2))
    },
    [svgWidth, svgHeight]
  )

  const resetView = useCallback(() => setView(IDENTITY_TRANSFORM), [])

  const handlePanStart = useCallback((clientX: number, clientY: number) => {
    setPanning({ x: clientX, y: clientY })
  }, [])

  const handlePanMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!panning) return
      const cur = clientToSvg(clientX, clientY)
      const last = clientToSvg(panning.x, panning.y)
      setView((prev) => ({ ...prev, x: prev.x + (cur.x - last.x), y: prev.y + (cur.y - last.y) }))
      setPanning({ x: clientX, y: clientY })
    },
    [panning, clientToSvg]
  )

  const handlePointerEnd = useCallback(() => {
    setDragging(null)
    setPanning(null)
  }, [])

  // Wheel-to-zoom centered on the cursor. Attached as a non-passive native listener
  // because React's synthetic onWheel is passive and cannot preventDefault page scroll.
  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const point = clientToSvg(e.clientX, e.clientY)
      setView((prev) => zoomAtPoint(prev, prev.scale * (1 - e.deltaY * WHEEL_ZOOM_SENSITIVITY), point.x, point.y))
    }
    svgEl.addEventListener('wheel', onWheel, { passive: false })
    return () => svgEl.removeEventListener('wheel', onWheel)
  }, [clientToSvg])

  // ---- Keyboard handlers (a11y alternative to dragging) ----------------------

  const KEYBOARD_MOVE_STEP = 10

  const handleNodeKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setDragPositions({})
        return
      }

      const pos = positions.find((p) => p.id === id)
      if (!pos) return

      let dx = 0
      let dy = 0
      if (e.key === 'ArrowLeft') dx = -KEYBOARD_MOVE_STEP
      else if (e.key === 'ArrowRight') dx = KEYBOARD_MOVE_STEP
      else if (e.key === 'ArrowUp') dy = -KEYBOARD_MOVE_STEP
      else if (e.key === 'ArrowDown') dy = KEYBOARD_MOVE_STEP
      else return

      e.preventDefault()
      setDragPositions((prev) => ({ ...prev, [id]: { x: pos.x + dx, y: pos.y + dy } }))
    },
    [positions]
  )

  // ---- Mouse event handlers -------------------------------------------------

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleDragMove(e.clientX, e.clientY)
      handlePanMove(e.clientX, e.clientY)
    },
    [handleDragMove, handlePanMove]
  )

  // ---- Touch event handlers -------------------------------------------------

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      if (dragging || panning) e.preventDefault()
      handleDragMove(touch.clientX, touch.clientY)
      handlePanMove(touch.clientX, touch.clientY)
    },
    [handleDragMove, handlePanMove, dragging, panning]
  )

  // ---- Derived data using effective positions --------------------------------

  const positionMap = useMemo(() => {
    const map = new Map<string, NodePosition>()
    for (const pos of positions) {
      map.set(pos.id, pos)
    }
    return map
  }, [positions])

  const portMap = useMemo(() => computeDistributedPorts(edges, positionMap), [edges, positionMap])

  const edgeData = useMemo(() => {
    const result = edges
      .map((edge) => {
        const fromPos = positionMap.get(edge.from)
        const toPos = positionMap.get(edge.to)
        if (!fromPos || !toPos) return null

        const isBidirectional = hasReverseEdge(edge, edges)
        const edgeKey = `${edge.from}:${edge.to}`
        const port = portMap.get(edgeKey)
        const { path, midX, midY, angle } = computeEdgePathWithPorts(fromPos, toPos, isBidirectional, positions, port)
        const highlighted = isEdgeHighlighted(edge, highlightedPath)

        return { edge, path, midX, midY, angle, highlighted }
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)

    resolveLabelOverlaps(result)

    return result
  }, [edges, positionMap, positions, portMap, highlightedPath])

  if (nodes.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.title}>{t('tab3.graphVisualizationTitle')}</span>
        </div>
        <div className={styles.emptyState}>{t('tab3.addVariationsToSeeGraph')}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{t('tab3.graphVisualizationTitle')}</span>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.zoomButton}
            onClick={() => zoomByStep(-ZOOM_BUTTON_STEP)}
            disabled={view.scale <= MIN_ZOOM}
            aria-label={t('tab3.zoomOut')}
          >
            −
          </button>
          <button type="button" className={styles.zoomLevel} onClick={resetView} aria-label={t('tab3.zoomReset')}>
            {Math.round(view.scale * 100)}%
          </button>
          <button
            type="button"
            className={styles.zoomButton}
            onClick={() => zoomByStep(ZOOM_BUTTON_STEP)}
            disabled={view.scale >= MAX_ZOOM}
            aria-label={t('tab3.zoomIn')}
          >
            +
          </button>
        </div>
      </div>
      <div className={styles.svgWrapper}>
        <svg
          ref={svgRef}
          className={styles.svg}
          style={{ width: '100%', height: 'auto', maxHeight: `${svgHeight}px` }}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          role="application"
          aria-label={`Migration graph with ${nodes.length} variation${nodes.length !== 1 ? 's' : ''} and ${edges.length} edge${edges.length !== 1 ? 's' : ''}`}
          onMouseMove={onMouseMove}
          onMouseUp={handlePointerEnd}
          onMouseLeave={handlePointerEnd}
          onTouchMove={onTouchMove}
          onTouchEnd={handlePointerEnd}
          onTouchCancel={handlePointerEnd}
        >
          {/* Arrowhead marker definitions */}
          <defs>
            <marker
              id="arrowhead-default"
              markerWidth={ARROWHEAD_SIZE}
              markerHeight={ARROWHEAD_SIZE}
              refX={0}
              refY={ARROWHEAD_SIZE / 2}
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon
                points={`0 0, ${ARROWHEAD_SIZE} ${ARROWHEAD_SIZE / 2}, 0 ${ARROWHEAD_SIZE}`}
                className={styles.edgeArrowhead}
              />
            </marker>
            <marker
              id="arrowhead-highlighted"
              markerWidth={ARROWHEAD_SIZE}
              markerHeight={ARROWHEAD_SIZE}
              refX={0}
              refY={ARROWHEAD_SIZE / 2}
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon
                points={`0 0, ${ARROWHEAD_SIZE} ${ARROWHEAD_SIZE / 2}, 0 ${ARROWHEAD_SIZE}`}
                className={styles.edgeArrowheadHighlighted}
              />
            </marker>
          </defs>

          {/* Transparent background surface — drag empty space to pan the canvas */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: SVG pan surface; zoom/pan also available via toolbar buttons */}
          <rect
            className={styles.panSurface}
            x={0}
            y={0}
            width={svgWidth}
            height={svgHeight}
            style={{ cursor: panning ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              const touch = e.touches[0]
              if (touch) handlePanStart(touch.clientX, touch.clientY)
            }}
          />

          {/* Zoom / pan layer — all graph content transforms together */}
          <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
            {/* Render edges (non-highlighted first, highlighted on top) */}
            {edgeData
              .filter((d) => !d.highlighted)
              .map((d) => (
                <g key={`edge-${d.edge.from}-${d.edge.to}`}>
                  <path d={d.path} className={styles.edgeLine} markerEnd="url(#arrowhead-default)" />
                  <rect
                    x={d.midX - 18}
                    y={d.midY - EDGE_LABEL_OFFSET / 2 - 4}
                    width={36}
                    height={EDGE_LABEL_OFFSET + 4}
                    rx={3}
                    className={styles.edgeWeightBg}
                  />
                  <text x={d.midX} y={d.midY} className={styles.edgeWeight}>
                    {d.edge.effort.toFixed(1)}
                  </text>
                </g>
              ))}
            {edgeData
              .filter((d) => d.highlighted)
              .map((d) => (
                <g key={`edge-hl-${d.edge.from}-${d.edge.to}`}>
                  <path
                    d={d.path}
                    className={`${styles.edgeLine} ${styles.edgeLineHighlighted}`}
                    markerEnd="url(#arrowhead-highlighted)"
                  />
                  <rect
                    x={d.midX - 18}
                    y={d.midY - EDGE_LABEL_OFFSET / 2 - 4}
                    width={36}
                    height={EDGE_LABEL_OFFSET + 4}
                    rx={3}
                    className={styles.edgeWeightBg}
                  />
                  <text x={d.midX} y={d.midY} className={`${styles.edgeWeight} ${styles.edgeWeightHighlighted}`}>
                    {d.edge.effort.toFixed(1)}
                  </text>
                </g>
              ))}

            {/* Render nodes */}
            {positions.map((pos) => {
              const highlighted = isNodeHighlighted(pos.id, highlightedPath)
              return (
                // biome-ignore lint/a11y/useSemanticElements: a native <button> cannot live inside <svg>; role="button" + keyboard handlers emulate it
                <g
                  key={`node-${pos.id}`}
                  className={styles.nodeGroup}
                  style={{ cursor: dragging?.id === pos.id ? 'grabbing' : 'grab' }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${pos.name} — move with arrow keys, Escape resets the layout`}
                  onMouseDown={(e) => handleDragStart(pos.id, e.clientX, e.clientY)}
                  onTouchStart={(e) => {
                    const touch = e.touches[0]
                    if (touch) handleDragStart(pos.id, touch.clientX, touch.clientY)
                  }}
                  onKeyDown={(e) => handleNodeKeyDown(e, pos.id)}
                >
                  <rect
                    x={pos.x - NODE_WIDTH / 2}
                    y={pos.y - NODE_HEIGHT / 2}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    className={`${styles.nodeRect} ${highlighted ? styles.nodeRectHighlighted : ''}`}
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    className={`${styles.nodeLabel} ${highlighted ? styles.nodeLabelHighlighted : ''}`}
                  >
                    {pos.name}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  )
}
