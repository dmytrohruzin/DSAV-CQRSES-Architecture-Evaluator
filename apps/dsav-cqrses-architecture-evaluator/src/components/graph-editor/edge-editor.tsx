'use client'

import { type FormEvent, useCallback, useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/language-context'
import { hasDuplicateEdge, validateGraph } from '../../lib/migration/graph-rules'
import { computeEdgeMigrationTimes } from '../../lib/migration/migration-timing'
import type { GraphEdge, GraphNode } from '../../lib/migration/types'
import { sanitizeNumeric } from '../../lib/shared/utils'
import styles from './graph-editor.module.css'

interface EdgeEditorProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onEdgesChange: (edges: GraphEdge[]) => void
}

/** Section 2 of the graph editor: the migration edges table, add form and validation summary. */
export function EdgeEditor({ nodes, edges, onEdgesChange }: EdgeEditorProps) {
  const { t } = useLanguage()

  const [newEdgeFrom, setNewEdgeFrom] = useState('')
  const [newEdgeTo, setNewEdgeTo] = useState('')
  const [newEdgeEffort, setNewEdgeEffort] = useState('')
  const [newEdgeTime, setNewEdgeTime] = useState('')
  const [edgeError, setEdgeError] = useState('')

  // --- Validation checks (rules live in lib/migration/graph-rules) ---
  const graphErrors = useMemo(() => validateGraph(nodes, edges), [nodes, edges])
  const hasDuplicateEdges = graphErrors.some((e) => e.code === 'duplicate_edge')
  const hasInvalidEffort = graphErrors.some((e) => e.code === 'not_positive')
  const hasSelfLoop = graphErrors.some((e) => e.code === 'self_loop')

  // --- Derived per-edge migration times (proportional to effort relative to the reference edge) ---
  const derivedEdgeTimes = useMemo(() => computeEdgeMigrationTimes(edges), [edges])

  /**
   * Returns the migration time to display for an edge — the explicit
   * `migrationTimeMonths` when set, otherwise the derived value. Returns null
   * when no reference time is available anywhere in the graph.
   */
  const resolveDisplayTime = useCallback(
    (edge: GraphEdge, index: number): { value: number | null; derived: boolean } => {
      if (typeof edge.migrationTimeMonths === 'number' && Number.isFinite(edge.migrationTimeMonths)) {
        return { value: edge.migrationTimeMonths, derived: false }
      }
      const derived = derivedEdgeTimes?.[index]
      if (typeof derived === 'number' && Number.isFinite(derived)) {
        return { value: derived, derived: true }
      }
      return { value: null, derived: false }
    },
    [derivedEdgeTimes]
  )

  /** Format a number for the optional Time input — keep integers tight, decimals at 2 places. */
  function formatTime(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }

  const handleAddEdge = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const effort = sanitizeNumeric(newEdgeEffort)

      if (!newEdgeFrom || !newEdgeTo) {
        setEdgeError(t('tab3.selectBothFromTo'))
        return
      }

      if (newEdgeFrom === newEdgeTo) {
        setEdgeError(t('tab3.fromToMustBeDifferent'))
        return
      }

      if (effort <= 0) {
        setEdgeError(t('tab3.effortMustBePositive'))
        return
      }

      if (hasDuplicateEdge(edges, newEdgeFrom, newEdgeTo)) {
        setEdgeError(t('tab3.edgeAlreadyExists'))
        return
      }

      setEdgeError('')
      const trimmedTime = newEdgeTime.trim()
      const time = trimmedTime === '' ? undefined : sanitizeNumeric(trimmedTime)
      const newEdge: GraphEdge =
        time !== undefined && time > 0
          ? { from: newEdgeFrom, to: newEdgeTo, effort, migrationTimeMonths: time }
          : { from: newEdgeFrom, to: newEdgeTo, effort }
      onEdgesChange([...edges, newEdge])
      setNewEdgeFrom('')
      setNewEdgeTo('')
      setNewEdgeEffort('')
      setNewEdgeTime('')
    },
    [newEdgeFrom, newEdgeTo, newEdgeEffort, newEdgeTime, edges, onEdgesChange, t]
  )

  const handleEdgeTimeChange = useCallback(
    (index: number, value: string) => {
      const trimmed = value.trim()
      onEdgesChange(
        edges.map((e, i) => {
          if (i !== index) return e
          if (trimmed === '') {
            // Remove the optional field entirely so `computeEdgeMigrationTimes`
            // sees this edge as "unset".
            const { migrationTimeMonths: _drop, ...rest } = e
            return rest
          }
          const time = sanitizeNumeric(trimmed)
          return { ...e, migrationTimeMonths: time }
        })
      )
    },
    [edges, onEdgesChange]
  )

  const handleRemoveEdge = useCallback(
    (index: number) => {
      onEdgesChange(edges.filter((_, i) => i !== index))
    },
    [edges, onEdgesChange]
  )

  const handleEdgeEffortChange = useCallback(
    (index: number, value: string) => {
      const effort = sanitizeNumeric(value)
      onEdgesChange(edges.map((e, i) => (i === index ? { ...e, effort } : e)))
    },
    [edges, onEdgesChange]
  )

  /** Resolve a node ID to its display name */
  const nodeName = useCallback(
    (id: string): string => {
      return nodes.find((n) => n.id === id)?.name ?? id
    },
    [nodes]
  )

  return (
    <section className={styles.edgesSection} aria-label={t('tab3.migrationEdgesTitle')}>
      <h3 className={styles.sectionHeader}>{t('tab3.migrationEdgesTitle')}</h3>
      <p className={styles.sectionDescription}>{t('tab3.migrationEdgesDescription')}</p>

      {/* Desktop: Table layout */}
      <div className={styles.desktopOnly}>
        {edges.length === 0 ? (
          <p className={styles.emptyEdges}>{t('tab3.noEdgesDefined')}</p>
        ) : (
          <table className={styles.edgeTable}>
            <thead>
              <tr>
                <th>{t('common.from')}</th>
                <th>{t('common.to')}</th>
                <th>{t('tab3.effortWeight')}</th>
                <th>{t('tab3.edgeMigrationTimeColumn')}</th>
                <th aria-label={t('common.actions')} />
              </tr>
            </thead>
            <tbody>
              {edges.map((edge, index) => (
                <tr
                  // biome-ignore lint/suspicious/noArrayIndexKey: edges lack stable IDs; index combined with from/to
                  key={`edge-${edge.from}-${edge.to}-${index}`}
                  className={styles.edgeRow}
                >
                  <td>
                    <span>{nodeName(edge.from)}</span>
                  </td>
                  <td>
                    <span>{nodeName(edge.to)}</span>
                  </td>
                  <td className={styles.centeredCell}>
                    <input
                      type="number"
                      step="any"
                      className={`${styles.effortInput} ${edge.effort <= 0 ? styles.effortInputError : ''}`}
                      value={edge.effort}
                      onChange={(e) => handleEdgeEffortChange(index, e.target.value)}
                      aria-label={`Effort for edge ${nodeName(edge.from)} to ${nodeName(edge.to)}`}
                      aria-invalid={edge.effort <= 0}
                    />
                  </td>
                  <td className={styles.centeredCell}>
                    {(() => {
                      const display = resolveDisplayTime(edge, index)
                      return (
                        <input
                          type="number"
                          step="any"
                          className={`${styles.effortInput} ${display.derived ? styles.derivedValue : ''}`}
                          value={display.value === null ? '' : formatTime(display.value)}
                          onChange={(e) => handleEdgeTimeChange(index, e.target.value)}
                          placeholder="—"
                          title={display.derived ? 'Derived proportionally from the reference edge' : undefined}
                          aria-label={`Migration time for edge ${nodeName(edge.from)} to ${nodeName(edge.to)}`}
                        />
                      )
                    })()}
                  </td>
                  <td className={styles.centeredCell}>
                    <button
                      type="button"
                      className={styles.removeEdgeButton}
                      onClick={() => handleRemoveEdge(index)}
                      aria-label={`Remove edge ${nodeName(edge.from)} to ${nodeName(edge.to)}`}
                      title="Remove edge"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile: Card layout */}
      <div className={styles.mobileOnly}>
        {edges.length === 0 ? (
          <p className={styles.emptyEdges}>{t('tab3.noEdgesDefined')}</p>
        ) : (
          <div className={styles.edgeCards}>
            {edges.map((edge, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: edges lack stable IDs; index combined with from/to
                key={`card-${edge.from}-${edge.to}-${index}`}
                className={styles.edgeCard}
              >
                <div className={styles.edgeCardHeader}>
                  <span className={styles.edgeCardLabel}>
                    {t('tab3.edgeLabel')} {index + 1}
                  </span>
                  <button
                    type="button"
                    className={styles.removeEdgeButton}
                    onClick={() => handleRemoveEdge(index)}
                    aria-label={`Remove edge ${nodeName(edge.from)} to ${nodeName(edge.to)}`}
                    title="Remove edge"
                  >
                    &times;
                  </button>
                </div>
                <div className={styles.edgeCardField}>
                  <span className={styles.edgeCardLabel}>{t('common.from')}</span>
                  <span>{nodeName(edge.from)}</span>
                </div>
                <div className={styles.edgeCardField}>
                  <span className={styles.edgeCardLabel}>{t('common.to')}</span>
                  <span>{nodeName(edge.to)}</span>
                </div>
                <div className={styles.edgeCardField}>
                  <span className={styles.edgeCardLabel}>{t('tab3.effortWeight')}</span>
                  <input
                    type="number"
                    step="any"
                    className={`${styles.effortInput} ${edge.effort <= 0 ? styles.effortInputError : ''}`}
                    value={edge.effort}
                    onChange={(e) => handleEdgeEffortChange(index, e.target.value)}
                    aria-label={`Effort for edge ${nodeName(edge.from)} to ${nodeName(edge.to)}`}
                    aria-invalid={edge.effort <= 0}
                  />
                </div>
                <div className={styles.edgeCardField}>
                  <span className={styles.edgeCardLabel}>{t('tab3.edgeMigrationTimeColumn')}</span>
                  {(() => {
                    const display = resolveDisplayTime(edge, index)
                    return (
                      <input
                        type="number"
                        step="any"
                        className={`${styles.effortInput} ${display.derived ? styles.derivedValue : ''}`}
                        value={display.value === null ? '' : formatTime(display.value)}
                        onChange={(e) => handleEdgeTimeChange(index, e.target.value)}
                        placeholder="—"
                        title={display.derived ? 'Derived proportionally from the reference edge' : undefined}
                        aria-label={`Migration time for edge ${nodeName(edge.from)} to ${nodeName(edge.to)}`}
                      />
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add edge form */}
      <form className={styles.addEdgeForm} onSubmit={handleAddEdge}>
        <div className={styles.addEdgeField}>
          <label htmlFor="new-edge-from" className={styles.fieldLabel}>
            {t('common.from')}
          </label>
          <select
            id="new-edge-from"
            className={styles.selectInput}
            value={newEdgeFrom}
            onChange={(e) => {
              setNewEdgeFrom(e.target.value)
              if (edgeError) setEdgeError('')
            }}
            aria-label={t('common.from')}
          >
            <option value="">{t('common.select')}</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.addEdgeField}>
          <label htmlFor="new-edge-to" className={styles.fieldLabel}>
            {t('common.to')}
          </label>
          <select
            id="new-edge-to"
            className={styles.selectInput}
            value={newEdgeTo}
            onChange={(e) => {
              setNewEdgeTo(e.target.value)
              if (edgeError) setEdgeError('')
            }}
            aria-label={t('common.to')}
          >
            <option value="">{t('common.select')}</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.addEdgeEffortField}>
          <label htmlFor="new-edge-effort" className={styles.fieldLabel}>
            {t('common.effort')}
          </label>
          <input
            id="new-edge-effort"
            type="number"
            step="any"
            className={styles.effortInput}
            value={newEdgeEffort}
            onChange={(e) => {
              setNewEdgeEffort(e.target.value)
              if (edgeError) setEdgeError('')
            }}
            placeholder="0.0"
            aria-label="Edge effort value"
          />
        </div>
        <div className={styles.addEdgeEffortField}>
          <label htmlFor="new-edge-time" className={styles.fieldLabel}>
            {t('tab3.edgeMigrationTimeColumn')}
          </label>
          <input
            id="new-edge-time"
            type="number"
            step="any"
            className={styles.effortInput}
            value={newEdgeTime}
            onChange={(e) => setNewEdgeTime(e.target.value)}
            placeholder="—"
            aria-label={t('tab3.edgeMigrationTimeColumn')}
          />
        </div>
        <button type="submit" className={styles.addButton}>
          {t('common.add')}
        </button>
      </form>
      <p className={styles.sectionDescription}>{t('tab3.edgeMigrationTimeHint')}</p>

      {edgeError && (
        <span className={styles.errorMessage} role="alert">
          {edgeError}
        </span>
      )}

      {/* Validation summary */}
      <section className={styles.validationSummary} aria-label={t('tab2.validationPassed')}>
        <div
          className={`${styles.validationItem} ${!hasDuplicateEdges ? styles.validationPass : styles.validationFail}`}
        >
          <span aria-hidden="true">{hasDuplicateEdges ? '✗' : '✓'}</span>
          <span>{t('tab3.noDuplicateEdges')}</span>
        </div>
        <div
          className={`${styles.validationItem} ${!hasInvalidEffort ? styles.validationPass : styles.validationFail}`}
        >
          <span aria-hidden="true">{hasInvalidEffort ? '✗' : '✓'}</span>
          <span>{t('tab3.allEffortPositive')}</span>
        </div>
        <div className={`${styles.validationItem} ${!hasSelfLoop ? styles.validationPass : styles.validationFail}`}>
          <span aria-hidden="true">{hasSelfLoop ? '✗' : '✓'}</span>
          <span>{t('tab3.fromNotEqualTo')}</span>
        </div>
      </section>
    </section>
  )
}
