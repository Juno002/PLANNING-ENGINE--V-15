'use client'

import React, { useState } from 'react'
import { StatsTabs, type StatsTab } from './StatsTabs'
import { MonthlySummaryView } from './monthly/MonthlySummaryView'
import { PointsReportView } from './reports/PointsReportView'
import { OperationalReportView } from './reports/OperationalReportView'

import Link from 'next/link' // Add import

export type ExtendedStatsTab = StatsTab | 'points' | 'executive' | 'analysis'

export function StatsView() {
  const [activeTab, setActiveTab] = useState<ExtendedStatsTab>('monthly')

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    borderBottom: isActive
      ? '2px solid hsl(0, 0%, 13%)'
      : '2px solid transparent',
    color: isActive ? '#111827' : '#4b5563',
    fontWeight: isActive ? 600 : 500,
    background: 'transparent',
    fontSize: '15px',
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{

          background: 'var(--bg-panel)',
          borderRadius: '12px 12px 0 0',
          padding: '0 16px',
          border: '1px solid var(--border-subtle)',
          borderBottom: 'none',
        }}
      >
        <button
          style={tabStyle(activeTab === 'monthly')}
          onClick={() => setActiveTab('monthly')}
        >
          Resumen Mensual
        </button>
        <button
          style={tabStyle(activeTab === 'points')}
          onClick={() => setActiveTab('points')}
        >
          Reporte de Puntos
        </button>
        <button
          style={tabStyle(activeTab === 'executive')}
          onClick={() => setActiveTab('executive')}
        >
          Reporte Operativo
        </button>
        <button
          style={tabStyle(activeTab === 'analysis')}
          onClick={() => setActiveTab('analysis')}
        >
          Análisis (Beta)
        </button>
      </div>

      <div
        style={{
          background: 'var(--bg-panel)',
          borderRadius: '0 0 12px 12px',
          border: '1px solid var(--border-subtle)',
          borderTop: 'none',
          minHeight: '80vh',
        }}
      >
        {activeTab === 'monthly' && <MonthlySummaryView />}
        {activeTab === 'points' && <PointsReportView />}
        {activeTab === 'executive' && <OperationalReportView />}
        {activeTab === 'analysis' && (
          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            <Link href="/operational" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '24px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                    Análisis de Llamadas
                  </h3>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  Explora tendencias de volumen de llamadas, tiempos de respuesta y métricas operativas detalladas.
                </p>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Abrir Dashboard <span style={{ fontSize: '16px' }}>→</span>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

