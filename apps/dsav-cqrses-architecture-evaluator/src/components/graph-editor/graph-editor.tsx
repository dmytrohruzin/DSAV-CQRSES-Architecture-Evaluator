'use client'

import { useCallback, useEffect, useState } from 'react'
import type { GraphEdge, GraphNode } from '../../lib/migration/types'
import { EdgeEditor } from './edge-editor'
import styles from './graph-editor.module.css'
import { NodeEditor } from './node-editor'

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface GraphEditorProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodesChange: (nodes: GraphNode[]) => void
  onEdgesChange: (edges: GraphEdge[]) => void
}

// -----------------------------------------------------------------------------
// Component — orchestrates the node and edge editor sections
// -----------------------------------------------------------------------------

export function GraphEditor({ nodes, edges, onNodesChange, onEdgesChange }: GraphEditorProps) {
  // --- Notification state ---
  const [notification, setNotification] = useState('')

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(''), 3000)
    return () => clearTimeout(timer)
  }, [notification])

  // Removing a node also drops its connected edges — this spans both
  // sections, so it lives in the container.
  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      const removedNode = nodes.find((n) => n.id === nodeId)
      const nextNodes = nodes.filter((n) => n.id !== nodeId)
      const connectedEdges = edges.filter((e) => e.from === nodeId || e.to === nodeId)
      const nextEdges = edges.filter((e) => e.from !== nodeId && e.to !== nodeId)

      onNodesChange(nextNodes)

      if (connectedEdges.length > 0) {
        onEdgesChange(nextEdges)
        setNotification(`Removed "${removedNode?.name}" and ${connectedEdges.length} connected edge(s)`)
      }
    },
    [nodes, edges, onNodesChange, onEdgesChange]
  )

  return (
    <div className={styles.container}>
      {/* Notification banner */}
      {notification && (
        <output className={styles.notification} aria-live="polite">
          {notification}
        </output>
      )}

      <NodeEditor nodes={nodes} onNodesChange={onNodesChange} onRemoveNode={handleRemoveNode} />
      <EdgeEditor nodes={nodes} edges={edges} onEdgesChange={onEdgesChange} />
    </div>
  )
}
