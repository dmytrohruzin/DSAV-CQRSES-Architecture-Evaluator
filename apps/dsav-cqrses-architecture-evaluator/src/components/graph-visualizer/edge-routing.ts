// -----------------------------------------------------------------------------
// Edge routing (presentation): SVG path computation for migration graph edges —
// rectangle border intersections, blocking-node avoidance via Bezier curves,
// distributed connection ports and label de-overlapping. Pure functions —
// unit-testable without rendering.
// -----------------------------------------------------------------------------

import type { GraphEdge } from '../../lib/migration/types'
import { ARROWHEAD_SIZE, NODE_HEIGHT, NODE_WIDTH, type NodePosition } from './graph-layout'

/** Perpendicular offset applied to each direction of a bidirectional edge pair */
const BIDIRECTIONAL_OFFSET = 12

/** Maximum vertical step between distributed connection points on a node side */
const MAX_PORT_STEP = 12

/** Minimum distance between two edge labels before they get pushed apart. */
export const LABEL_CLEARANCE = 30

/** How far overlapping labels are pushed apart (perpendicular to the edges). */
const LABEL_PUSH = 18

/** Pre-computed connection points for one edge. */
export interface EdgePort {
  startX: number
  startY: number
  endX: number
  endY: number
}

/** Computed SVG path with its label anchor and arrowhead angle. */
export interface EdgePath {
  path: string
  midX: number
  midY: number
  angle: number
}

/**
 * Compute the intersection point of a line from (cx, cy) toward (tx, ty)
 * with a rectangle centered at (cx, cy) of given width and height.
 * Returns the point on the rect edge closest to (tx, ty).
 */
export function rectEdgeIntersection(
  cx: number,
  cy: number,
  tx: number,
  ty: number,
  w: number,
  h: number
): { x: number; y: number } {
  const dx = tx - cx
  const dy = ty - cy

  if (dx === 0 && dy === 0) return { x: cx, y: cy }

  const halfW = w / 2
  const halfH = h / 2
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  let scale: number
  if (absDx * halfH > absDy * halfW) {
    // Hits left or right side
    scale = halfW / absDx
  } else {
    // Hits top or bottom side
    scale = halfH / absDy
  }

  return { x: cx + dx * scale, y: cy + dy * scale }
}

/**
 * Find nodes whose centres sit between two X coordinates (exclusive) — i.e.
 * nodes in intermediate layers that a straight edge would have to cross.
 */
export function findIntermediateNodes(
  from: NodePosition,
  to: NodePosition,
  allPositions: NodePosition[]
): NodePosition[] {
  const minX = Math.min(from.x, to.x)
  const maxX = Math.max(from.x, to.x)

  // Only consider nodes strictly between the two layers
  return allPositions.filter((p) => p.id !== from.id && p.id !== to.id && p.x > minX && p.x < maxX)
}

/**
 * Determine whether a straight line from (x1,y1) to (x2,y2) passes within
 * `clearance` pixels vertically of a node centre at (nx, ny).
 *
 * We project the node centre onto the line parametrically and check the
 * perpendicular distance only if the projection falls between the endpoints.
 */
export function lineBlockedByNode(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  node: NodePosition,
  clearance: number
): boolean {
  const ldx = x2 - x1
  const ldy = y2 - y1
  const lenSq = ldx * ldx + ldy * ldy
  if (lenSq === 0) return false

  // Parameter t of projection of node onto line
  const t = ((node.x - x1) * ldx + (node.y - y1) * ldy) / lenSq
  if (t <= 0 || t >= 1) return false

  // Y value of the line at the node's X (using parametric form)
  const lineYAtNodeX = y1 + t * ldy
  return Math.abs(lineYAtNodeX - node.y) < clearance
}

/**
 * Compute an edge path between two nodes.
 *
 * The line starts at the source node's rectangle border and ends at the
 * target node's rectangle border (shortened by `ARROWHEAD_SIZE` so the
 * marker tip lands exactly on the border).
 *
 * For bidirectional edges, each direction is offset ~8 px perpendicular to
 * the line so both arrows remain visible without overlapping.
 *
 * For same-layer edges (nodes in the same column), a cubic Bezier curve is
 * used that arcs out to the right of the column, preventing the edge from
 * crossing through intermediate nodes.
 *
 * For edges that skip layers, the path is checked against intermediate nodes.
 * If a straight line would pass too close to an intermediate node the edge is
 * drawn as a quadratic Bezier curve that arcs above or below the blocking
 * nodes to avoid visual overlap.
 */
export function computeEdgePath(
  from: NodePosition,
  to: NodePosition,
  isBidirectional: boolean,
  allPositions: NodePosition[]
): EdgePath {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)

  // --- Same-layer edges: straight vertical line from bottom/top border ------
  const isSameLayer = Math.abs(dx) < NODE_WIDTH / 3
  if (isSameLayer && len > 0) {
    const goingDown = from.y < to.y
    const biDirOffset = isBidirectional ? (goingDown ? 12 : -12) : 0

    const startX = from.x + biDirOffset
    const startY = goingDown ? from.y + NODE_HEIGHT / 2 : from.y - NODE_HEIGHT / 2
    const endX = to.x + biDirOffset
    const endY = goingDown ? to.y - NODE_HEIGHT / 2 - ARROWHEAD_SIZE : to.y + NODE_HEIGHT / 2 + ARROWHEAD_SIZE

    const midX = (startX + endX) / 2 + (isBidirectional ? biDirOffset : 10)
    const midY = (startY + endY) / 2
    const angle = Math.atan2(endY - startY, endX - startX)

    const path = `M ${startX} ${startY} L ${endX} ${endY}`

    return { path, midX, midY, angle }
  }

  // --- Detect blocking intermediate nodes -----------------------------------
  const intermediateNodes = findIntermediateNodes(from, to, allPositions)
  const clearance = NODE_HEIGHT / 2 + 10
  const blockingNodes = intermediateNodes.filter((n) => lineBlockedByNode(from.x, from.y, to.x, to.y, n, clearance))

  // --- Cross-layer edges that need to curve around blocking nodes -----------
  if (blockingNodes.length > 0) {
    // Decide whether to curve above or below the blocking nodes.
    // If the average Y of source+target is above the blocking centroid, go up;
    // otherwise go down.
    const avgEdgeY = (from.y + to.y) / 2
    const avgBlockY = blockingNodes.reduce((sum, n) => sum + n.y, 0) / blockingNodes.length

    // Find the extreme blocking node Y in the chosen direction
    const goUp = avgEdgeY <= avgBlockY
    const extremeBlockY = goUp ? Math.min(...blockingNodes.map((n) => n.y)) : Math.max(...blockingNodes.map((n) => n.y))

    // Control point Y: clear the blocking node by NODE_HEIGHT/2 + 20px
    const controlY = goUp ? extremeBlockY - NODE_HEIGHT / 2 - 30 : extremeBlockY + NODE_HEIGHT / 2 + 30

    const controlX = (from.x + to.x) / 2

    // Perpendicular offset for bidirectional edges
    const offset = isBidirectional ? BIDIRECTIONAL_OFFSET : 0
    const perpDx = len > 0 ? -dy / len : 0
    const perpDy = len > 0 ? dx / len : 0
    const fromX = from.x + perpDx * offset
    const fromY = from.y + perpDy * offset
    const toX = to.x + perpDx * offset
    const toY = to.y + perpDy * offset

    // Compute border intersections toward the control point direction
    const startPt = rectEdgeIntersection(fromX, fromY, controlX, controlY, NODE_WIDTH, NODE_HEIGHT)
    const borderPt = rectEdgeIntersection(toX, toY, controlX, controlY, NODE_WIDTH, NODE_HEIGHT)

    // Shorten endpoint for arrowhead: pull back along tangent at t=1
    // For quadratic Bezier, tangent at t=1 is from control to end
    const tDx = borderPt.x - controlX
    const tDy = borderPt.y - controlY
    const tLen = Math.sqrt(tDx * tDx + tDy * tDy)
    let endPt = borderPt
    if (tLen > ARROWHEAD_SIZE) {
      const pullBack = ARROWHEAD_SIZE / tLen
      endPt = {
        x: borderPt.x - tDx * pullBack,
        y: borderPt.y - tDy * pullBack
      }
    }

    // Angle for arrowhead: direction of tangent at t=1 (control → end)
    const angle = Math.atan2(tDy, tDx)

    // Label position: evaluate the quadratic Bezier at t=0.5
    const midX = 0.25 * startPt.x + 0.5 * controlX + 0.25 * endPt.x
    const midY = 0.25 * startPt.y + 0.5 * controlY + 0.25 * endPt.y

    const path = `M ${startPt.x} ${startPt.y} Q ${controlX} ${controlY}, ${endPt.x} ${endPt.y}`

    return { path, midX, midY, angle }
  }

  // --- Standard cross-layer edges (no blocking nodes) -----------------------

  // Perpendicular unit vector (rotated 90° counter-clockwise)
  const px = len > 0 ? -dy / len : 0
  const py = len > 0 ? dx / len : 0

  // For bidirectional edges, shift both endpoints perpendicular to the line
  const offset = isBidirectional ? BIDIRECTIONAL_OFFSET : 0
  const fromX = from.x + px * offset
  const fromY = from.y + py * offset
  const toX = to.x + px * offset
  const toY = to.y + py * offset

  // Intersection of the line with the source rectangle border (exit point)
  const startPt = rectEdgeIntersection(fromX, fromY, toX, toY, NODE_WIDTH, NODE_HEIGHT)
  // Intersection of the line with the target rectangle border (entry point)
  const borderPt = rectEdgeIntersection(toX, toY, fromX, fromY, NODE_WIDTH, NODE_HEIGHT)

  // Shorten the endpoint by ARROWHEAD_SIZE so the marker tip sits exactly on
  // the target rectangle border rather than inside it
  const edgeDx = borderPt.x - startPt.x
  const edgeDy = borderPt.y - startPt.y
  const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy)
  let endPt = borderPt
  if (edgeLen > ARROWHEAD_SIZE) {
    const pullBack = ARROWHEAD_SIZE / edgeLen
    endPt = {
      x: borderPt.x - edgeDx * pullBack,
      y: borderPt.y - edgeDy * pullBack
    }
  }

  // Angle for arrowhead rotation
  const angle = Math.atan2(edgeDy, edgeDx)

  // Label position: midpoint of the visible line
  const midX = (startPt.x + endPt.x) / 2
  const midY = (startPt.y + endPt.y) / 2

  const path = `M ${startPt.x} ${startPt.y} L ${endPt.x} ${endPt.y}`

  return { path, midX, midY, angle }
}

/** Check if an edge has a reverse counterpart */
export function hasReverseEdge(edge: GraphEdge, edges: GraphEdge[]): boolean {
  return edges.some((e) => e.from === edge.to && e.to === edge.from)
}

/**
 * For each node, collect all edges that connect to its left or right side, then
 * distribute connection points evenly along the vertical extent of the node.
 *
 * Returns a map: `edgeKey ("from:to") -> { startX, startY, endX, endY }` with
 * the pre-computed connection points for each edge endpoint.
 */
export function computeDistributedPorts(
  edges: GraphEdge[],
  positionMap: Map<string, NodePosition>
): Map<string, EdgePort> {
  // Collect edges per node per side.
  // "left" side = an edge arriving from (or departing to) a node with smaller X.
  // "right" side = an edge arriving from (or departing to) a node with larger X.
  // For each entry we store the edge key, whether this node is the source or
  // target, and the Y coordinate of the *other* endpoint (for sorting).
  interface PortEntry {
    edgeKey: string
    role: 'source' | 'target'
    otherY: number
  }

  const nodeSides = new Map<string, { left: PortEntry[]; right: PortEntry[] }>()

  const ensureNode = (id: string) => {
    if (!nodeSides.has(id)) {
      nodeSides.set(id, { left: [], right: [] })
    }
    return nodeSides.get(id) as { left: PortEntry[]; right: PortEntry[] }
  }

  for (const edge of edges) {
    const fromPos = positionMap.get(edge.from)
    const toPos = positionMap.get(edge.to)
    if (!fromPos || !toPos) continue

    const edgeKey = `${edge.from}:${edge.to}`
    const dx = toPos.x - fromPos.x

    if (Math.abs(dx) < 1) {
      // Same-layer edge: handled separately by computeEdgePath (Bezier curve)
      continue
    }

    const fromSides = ensureNode(edge.from)
    const toSides = ensureNode(edge.to)

    if (dx > 0) {
      // Edge goes left-to-right: exits from right side of source, enters left side of target
      fromSides.right.push({ edgeKey, role: 'source', otherY: toPos.y })
      toSides.left.push({ edgeKey, role: 'target', otherY: fromPos.y })
    } else {
      // Edge goes right-to-left: exits from left side of source, enters right side of target
      fromSides.left.push({ edgeKey, role: 'source', otherY: toPos.y })
      toSides.right.push({ edgeKey, role: 'target', otherY: fromPos.y })
    }
  }

  // For each node+side, sort entries by the Y of the other endpoint (so
  // connections from higher nodes get higher entry points, reducing crossings),
  // then distribute points evenly along the vertical extent of the node.
  const portMap = new Map<string, EdgePort>()

  const ensurePort = (key: string) => {
    if (!portMap.has(key)) {
      portMap.set(key, { startX: 0, startY: 0, endX: 0, endY: 0 })
    }
    return portMap.get(key) as EdgePort
  }

  for (const [nodeId, sides] of nodeSides.entries()) {
    const pos = positionMap.get(nodeId)
    if (!pos) continue

    for (const side of ['left', 'right'] as const) {
      const entries = sides[side]
      if (entries.length === 0) continue

      // Sort by other-endpoint Y so that connections are visually ordered
      entries.sort((a, b) => a.otherY - b.otherY)

      const n = entries.length
      const step = Math.min(NODE_HEIGHT / (n + 1), MAX_PORT_STEP)
      const totalSpread = (n - 1) * step
      const baseY = pos.y - totalSpread / 2
      const borderX = side === 'right' ? pos.x + NODE_WIDTH / 2 : pos.x - NODE_WIDTH / 2

      for (let i = 0; i < n; i++) {
        const entry = entries[i] as PortEntry
        const portY = baseY + i * step
        const port = ensurePort(entry.edgeKey)

        if (entry.role === 'source') {
          port.startX = borderX
          port.startY = portY
        } else {
          port.endX = borderX
          port.endY = portY
        }
      }
    }
  }

  return portMap
}

/**
 * Compute an edge path using pre-computed distributed ports.
 *
 * For edges with distributed ports (cross-layer, non-same-layer edges), the
 * start and end points come from the port map rather than from center-to-center
 * rectangle intersection. This prevents multiple arrows from overlapping when
 * they connect to the same side of a node.
 */
export function computeEdgePathWithPorts(
  from: NodePosition,
  to: NodePosition,
  isBidirectional: boolean,
  allPositions: NodePosition[],
  port: EdgePort | undefined
): EdgePath {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)

  // --- Same-layer edges: use a Bezier curve arcing out to the side ----------
  const isSameLayer = Math.abs(dx) < NODE_WIDTH / 3
  if (isSameLayer && len > 0) {
    return computeEdgePath(from, to, isBidirectional, allPositions)
  }

  // --- Use distributed ports if available -----------------------------------
  if (port && (port.startX !== 0 || port.startY !== 0) && (port.endX !== 0 || port.endY !== 0)) {
    const startPt = { x: port.startX, y: port.startY }

    // For bidirectional edges, apply a small perpendicular offset
    const edgeDx = port.endX - port.startX
    const edgeDy = port.endY - port.startY
    const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy)

    let borderPt = { x: port.endX, y: port.endY }

    if (isBidirectional) {
      const perpScale = BIDIRECTIONAL_OFFSET / (edgeLen > 0 ? edgeLen : 1)
      const perpX = -edgeDy * perpScale
      const perpY = edgeDx * perpScale

      startPt.x += perpX
      startPt.y += perpY
      borderPt = { x: borderPt.x + perpX, y: borderPt.y + perpY }
    }

    // Check for blocking intermediate nodes and curve if needed
    const intermediateNodes = findIntermediateNodes(from, to, allPositions)
    const clearance = NODE_HEIGHT / 2 + 10
    const blockingNodes = intermediateNodes.filter((n) =>
      lineBlockedByNode(startPt.x, startPt.y, borderPt.x, borderPt.y, n, clearance)
    )

    if (blockingNodes.length > 0) {
      const avgEdgeY = (startPt.y + borderPt.y) / 2
      const avgBlockY = blockingNodes.reduce((sum, n) => sum + n.y, 0) / blockingNodes.length

      const goUp = avgEdgeY <= avgBlockY
      const extremeBlockY = goUp
        ? Math.min(...blockingNodes.map((n) => n.y))
        : Math.max(...blockingNodes.map((n) => n.y))

      const controlY = goUp ? extremeBlockY - NODE_HEIGHT / 2 - 30 : extremeBlockY + NODE_HEIGHT / 2 + 30

      const controlX = (startPt.x + borderPt.x) / 2

      const tDx = borderPt.x - controlX
      const tDy = borderPt.y - controlY
      const tLen = Math.sqrt(tDx * tDx + tDy * tDy)
      let endPt = borderPt
      if (tLen > ARROWHEAD_SIZE) {
        const pullBack = ARROWHEAD_SIZE / tLen
        endPt = {
          x: borderPt.x - tDx * pullBack,
          y: borderPt.y - tDy * pullBack
        }
      }

      const angle = Math.atan2(tDy, tDx)
      const midX = 0.25 * startPt.x + 0.5 * controlX + 0.25 * endPt.x
      const midY = 0.25 * startPt.y + 0.5 * controlY + 0.25 * endPt.y
      const path = `M ${startPt.x} ${startPt.y} Q ${controlX} ${controlY}, ${endPt.x} ${endPt.y}`

      return { path, midX, midY, angle }
    }

    // Shorten the endpoint by ARROWHEAD_SIZE
    const finalDx = borderPt.x - startPt.x
    const finalDy = borderPt.y - startPt.y
    const finalLen = Math.sqrt(finalDx * finalDx + finalDy * finalDy)
    let endPt = borderPt
    if (finalLen > ARROWHEAD_SIZE) {
      const pullBack = ARROWHEAD_SIZE / finalLen
      endPt = {
        x: borderPt.x - finalDx * pullBack,
        y: borderPt.y - finalDy * pullBack
      }
    }

    const angle = Math.atan2(finalDy, finalDx)
    const midX = (startPt.x + endPt.x) / 2
    const midY = (startPt.y + endPt.y) / 2
    const path = `M ${startPt.x} ${startPt.y} L ${endPt.x} ${endPt.y}`

    return { path, midX, midY, angle }
  }

  // --- Fallback: no distributed port available, use original logic ----------
  return computeEdgePath(from, to, isBidirectional, allPositions)
}

/**
 * Detect and resolve overlapping edge labels in place. When two labels are
 * closer than `clearance` pixels, push them apart perpendicular to the
 * average edge angle so they no longer overlap.
 */
export function resolveLabelOverlaps(
  labels: Array<{ midX: number; midY: number; angle: number }>,
  clearance: number = LABEL_CLEARANCE
): void {
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const a = labels[i] as (typeof labels)[number]
      const b = labels[j] as (typeof labels)[number]
      const dx = a.midX - b.midX
      const dy = a.midY - b.midY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < clearance) {
        const avgAngle = (a.angle + b.angle) / 2
        const perpX = -Math.sin(avgAngle) * LABEL_PUSH
        const perpY = Math.cos(avgAngle) * LABEL_PUSH
        a.midX += perpX
        a.midY += perpY
        b.midX -= perpX
        b.midY -= perpY
      }
    }
  }
}
