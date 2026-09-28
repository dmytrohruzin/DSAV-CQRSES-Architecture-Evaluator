'use client'

import { type FormEvent, useCallback, useState } from 'react'
import { useLanguage } from '../../i18n/language-context'
import type { GraphNode } from '../../lib/migration/types'
import { sanitizeNumeric } from '../../lib/shared/utils'
import styles from './graph-editor.module.css'

interface NodeEditorProps {
  nodes: GraphNode[]
  onNodesChange: (nodes: GraphNode[]) => void
  /** Removal is owned by the container — it also drops connected edges. */
  onRemoveNode: (nodeId: string) => void
}

/** Section 1 of the graph editor: the variations (graph nodes) table + add form. */
export function NodeEditor({ nodes, onNodesChange, onRemoveNode }: NodeEditorProps) {
  const { t } = useLanguage()

  const [newNodeName, setNewNodeName] = useState('')
  const [newNodeSupport, setNewNodeSupport] = useState('')
  const [newNodeHosting, setNewNodeHosting] = useState('')
  const [nodeNameError, setNodeNameError] = useState('')

  const handleAddNode = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const trimmed = newNodeName.trim()

      if (!trimmed) {
        setNodeNameError(t('common.nameCannotBeEmpty'))
        return
      }

      if (nodes.some((n) => n.name === trimmed)) {
        setNodeNameError(t('tab3.variationAlreadyExists'))
        return
      }

      setNodeNameError('')
      const id = trimmed.toLowerCase().replace(/\s+/g, '-')
      const supportCost = sanitizeNumeric(newNodeSupport)
      const hostingCost = sanitizeNumeric(newNodeHosting)
      onNodesChange([...nodes, { id, name: trimmed, supportCost, hostingCost }])
      setNewNodeName('')
      setNewNodeSupport('')
      setNewNodeHosting('')
    },
    [newNodeName, newNodeSupport, newNodeHosting, nodes, onNodesChange, t]
  )

  const handleNodeCostChange = useCallback(
    (nodeId: string, field: 'supportCost' | 'hostingCost', value: string) => {
      const numeric = sanitizeNumeric(value)
      onNodesChange(nodes.map((n) => (n.id === nodeId ? { ...n, [field]: numeric } : n)))
    },
    [nodes, onNodesChange]
  )

  return (
    <section className={styles.nodesSection} aria-label={t('tab3.variationsGraphNodesTitle')}>
      <h3 className={styles.sectionHeader}>{t('tab3.variationsGraphNodesTitle')}</h3>
      <p className={styles.sectionDescription}>{t('tab3.variationsGraphNodesDescription')}</p>

      {/* Nodes table */}
      {nodes.length === 0 ? (
        <p className={styles.emptyEdges}>{t('tab3.noVariationsDefined')}</p>
      ) : (
        <>
          <div className={styles.desktopOnly}>
            <table className={styles.edgeTable}>
              <thead>
                <tr>
                  <th>{t('tab3.nodeNameColumn')}</th>
                  <th>{t('tab3.nodeSupportCostColumn')}</th>
                  <th>{t('tab3.nodeHostingCostColumn')}</th>
                  <th aria-label={t('common.actions')} />
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node.id} className={styles.edgeRow}>
                    <td>
                      <span>{node.name}</span>
                    </td>
                    <td className={styles.centeredCell}>
                      <input
                        type="number"
                        step="any"
                        className={styles.effortInput}
                        value={node.supportCost}
                        onChange={(e) => handleNodeCostChange(node.id, 'supportCost', e.target.value)}
                        aria-label={`${t('tab3.nodeSupportCostColumn')} — ${node.name}`}
                      />
                    </td>
                    <td className={styles.centeredCell}>
                      <input
                        type="number"
                        step="any"
                        className={styles.effortInput}
                        value={node.hostingCost}
                        onChange={(e) => handleNodeCostChange(node.id, 'hostingCost', e.target.value)}
                        aria-label={`${t('tab3.nodeHostingCostColumn')} — ${node.name}`}
                      />
                    </td>
                    <td className={styles.centeredCell}>
                      <button
                        type="button"
                        className={styles.removeEdgeButton}
                        onClick={() => onRemoveNode(node.id)}
                        aria-label={`Remove variation ${node.name}`}
                        title={`Remove ${node.name}`}
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileOnly}>
            <div className={styles.edgeCards}>
              {nodes.map((node) => (
                <div key={node.id} className={styles.edgeCard}>
                  <div className={styles.edgeCardHeader}>
                    <span className={styles.edgeCardLabel}>{node.name}</span>
                    <button
                      type="button"
                      className={styles.removeEdgeButton}
                      onClick={() => onRemoveNode(node.id)}
                      aria-label={`Remove variation ${node.name}`}
                      title={`Remove ${node.name}`}
                    >
                      &times;
                    </button>
                  </div>
                  <div className={styles.edgeCardField}>
                    <span className={styles.edgeCardLabel}>{t('tab3.nodeSupportCostColumn')}</span>
                    <input
                      type="number"
                      step="any"
                      className={styles.effortInput}
                      value={node.supportCost}
                      onChange={(e) => handleNodeCostChange(node.id, 'supportCost', e.target.value)}
                      aria-label={`${t('tab3.nodeSupportCostColumn')} — ${node.name}`}
                    />
                  </div>
                  <div className={styles.edgeCardField}>
                    <span className={styles.edgeCardLabel}>{t('tab3.nodeHostingCostColumn')}</span>
                    <input
                      type="number"
                      step="any"
                      className={styles.effortInput}
                      value={node.hostingCost}
                      onChange={(e) => handleNodeCostChange(node.id, 'hostingCost', e.target.value)}
                      aria-label={`${t('tab3.nodeHostingCostColumn')} — ${node.name}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add node form */}
      <form className={styles.addEdgeForm} onSubmit={handleAddNode}>
        <div className={styles.addEdgeField}>
          <label htmlFor="new-node-name" className={styles.fieldLabel}>
            {t('common.name')}
          </label>
          <input
            id="new-node-name"
            type="text"
            className={`${styles.textInput} ${nodeNameError ? styles.textInputError : ''}`}
            value={newNodeName}
            onChange={(e) => {
              setNewNodeName(e.target.value)
              if (nodeNameError) setNodeNameError('')
            }}
            placeholder={t('tab3.variationNamePlaceholder')}
            aria-invalid={!!nodeNameError}
            aria-describedby={nodeNameError ? 'node-name-error' : undefined}
          />
          {nodeNameError && (
            <span id="node-name-error" className={styles.errorMessage} role="alert">
              {nodeNameError}
            </span>
          )}
        </div>
        <div className={styles.addEdgeField}>
          <label htmlFor="new-node-support" className={styles.fieldLabel}>
            {t('tab3.nodeSupportCostColumn')}
          </label>
          <input
            id="new-node-support"
            type="number"
            step="any"
            className={styles.effortInput}
            value={newNodeSupport}
            onChange={(e) => setNewNodeSupport(e.target.value)}
            placeholder="0.0"
            aria-label={t('tab3.nodeSupportCostColumn')}
          />
        </div>
        <div className={styles.addEdgeField}>
          <label htmlFor="new-node-hosting" className={styles.fieldLabel}>
            {t('tab3.nodeHostingCostColumn')}
          </label>
          <input
            id="new-node-hosting"
            type="number"
            step="any"
            className={styles.effortInput}
            value={newNodeHosting}
            onChange={(e) => setNewNodeHosting(e.target.value)}
            placeholder="0.0"
            aria-label={t('tab3.nodeHostingCostColumn')}
          />
        </div>
        <button type="submit" className={styles.addButton}>
          {t('common.add')}
        </button>
      </form>
    </section>
  )
}
