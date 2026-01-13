'use client'

import React from 'react'
import type { CoverageRule } from '../../domain/types'
import { CoverageRuleRow } from './CoverageRuleRow'

interface Props {
  rules: CoverageRule[]
  onAdd: () => void
  onEdit: (rule: CoverageRule) => void
  onDelete: (id: string) => void
}

export function CoverageRulesPanel({ rules, onAdd, onEdit, onDelete }: Props) {
  const sortedRules = [...rules].sort((a, b) => {
    // A simple sort to keep rules grouped by scope type
    const order = { DATE: 1, SHIFT: 2, GLOBAL: 3 }
    const aType = a.scope.type
    const bType = b.scope.type
    return (order[aType] || 99) - (order[bType] || 99)
  })

  return (
    <div
      style={{
        background: '#FFFFFF',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '15px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <h3 style={{ margin: 0, color: '#111827' }}>Reglas de Cobertura</h3>
        <button
          onClick={onAdd}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            background: '#1F2937',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Nueva regla
        </button>
      </header>

      {rules.length === 0 ? (
        <p
          style={{
            opacity: 0.6,
            textAlign: 'center',
            padding: '20px 0',
            color: '#6b7280',
          }}
        >
          No hay reglas personalizadas.
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '15px 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {sortedRules.map(rule => (
            <li key={rule.id}>
              <CoverageRuleRow
                rule={rule}
                onEdit={() => onEdit(rule)}
                onDelete={() => onDelete(rule.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
