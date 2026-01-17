'use client'

import React from 'react'

export interface ManagerCellProps {
    label: string
    variant: 'DAY' | 'NIGHT' | 'INTER' | 'MONITORING' | 'OFF' | 'VACATION' | 'LICENSE'
    tooltip?: string
    onClick?: () => void
}

export function ManagerPlannerCell({ label, variant, tooltip, onClick }: ManagerCellProps) {
    const styles: Record<string, React.CSSProperties> = {
        DAY: { background: '#ecfeff', color: '#0369a1' },
        NIGHT: { background: '#eef2ff', color: '#3730a3' },
        INTER: { background: '#fef9c3', color: '#854d0e' },
        MONITORING: { background: '#f0fdf4', color: '#166534' },
        OFF: { background: '#f3f4f6', color: '#6b7280' },
        VACATION: { background: '#fce7f3', color: '#be185d', fontWeight: 700 }, // Pink
        LICENSE: { background: '#e0f2fe', color: '#0369a1', fontStyle: 'italic' }, // Light Blue
    }

    // Fallback for unexpected variant
    const style = styles[variant] || { background: '#fff', color: '#000' }

    return (
        <div
            onClick={onClick}
            title={tooltip}
            style={{
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'center',
                cursor: onClick ? 'pointer' : 'default',
                border: '1px solid #e5e7eb',
                ...style,
            }}
        >
            {label || '\u00A0'}
        </div>
    )
}
