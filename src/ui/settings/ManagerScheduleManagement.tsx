'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useWeekNavigator } from '@/hooks/useWeekNavigator'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ManagerDuty } from '@/domain/management/types'
import { Plus, Trash2, User } from 'lucide-react'
import { ManagerPlannerCell } from '@/ui/management/ManagerPlannerCell'
import { getEffectiveManagerDuty } from '@/application/ui-adapters/getEffectiveManagerDuty'

const DUTY_CYCLE: Record<ManagerDuty, ManagerDuty> = {
    OFF: 'DAY',
    DAY: 'NIGHT',
    NIGHT: 'MID',
    MID: 'MONITOR',
    MONITOR: 'OFF', // Cycle back to OFF
    UNAVAILABLE: 'OFF', // Default start
}

export function ManagerScheduleManagement() {
    const {
        managers,
        addManager,
        removeManager,
        setManagerDuty,
        planningAnchorDate,
        setPlanningAnchorDate,
    } = useAppStore(s => ({
        managers: s.managers,
        addManager: s.addManager,
        removeManager: s.removeManager,
        setManagerDuty: s.setManagerDuty,
        planningAnchorDate: s.planningAnchorDate,
        setPlanningAnchorDate: s.setPlanningAnchorDate,
    }))

    const { weekDays, label: weekLabel, handlePrevWeek, handleNextWeek } = useWeekNavigator(
        planningAnchorDate,
        setPlanningAnchorDate
    )

    const [newManagerName, setNewManagerName] = useState('')

    const handleCreateManager = () => {
        if (!newManagerName.trim()) return
        addManager({ name: newManagerName.trim() })
        setNewManagerName('')
    }

    const handleCellClick = (managerId: string, date: string) => {
        // Get effective duty using adapter
        const effective = getEffectiveManagerDuty(managerId, date)
        const currentDuty = effective.duty

        // Cycle to next
        const nextDuty = DUTY_CYCLE[currentDuty] || 'OFF'

        // Note is optional, passing undefined
        setManagerDuty(managerId, date, nextDuty)
    }

    return (
        <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827' }}>
                        Horarios de Gerencia
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        Planificación semanal de supervisores y gerentes.
                    </p>
                </div>

                {/* Time Sovereign */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <button onClick={handlePrevWeek} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px' }}>&lt;</button>
                    <span style={{ fontSize: '13px', fontWeight: 500, width: '180px', textAlign: 'center' }}>{weekLabel}</span>
                    <button onClick={handleNextWeek} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px' }}>&gt;</button>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ textAlign: 'left', padding: '12px 16px', color: '#374151', fontWeight: 600, width: '200px' }}>Supervisor</th>
                            {weekDays.map(day => (
                                <th key={day.date} style={{ textAlign: 'center', padding: '12px 8px', color: '#374151', fontWeight: 600 }}>
                                    <div>{format(parseISO(day.date), 'EEE', { locale: es })}</div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400 }}>{format(parseISO(day.date), 'd')}</div>
                                </th>
                            ))}
                            <th style={{ width: '40px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {managers.map(manager => {
                            return (
                                <tr key={manager.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '8px 16px', color: '#111827', fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                                <User size={14} />
                                            </div>
                                            {manager.name}
                                        </div>
                                    </td>
                                    {weekDays.map(day => {
                                        const effective = getEffectiveManagerDuty(manager.id, day.date)

                                        return (
                                            <td key={day.date} style={{ padding: '6px' }}>
                                                <ManagerPlannerCell
                                                    duty={effective.duty}
                                                    note={effective.note}
                                                    onClick={() => handleCellClick(manager.id, day.date)}
                                                />
                                            </td>
                                        )
                                    })}
                                    <td style={{ padding: '0 8px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => removeManager(manager.id)}
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#fee2e2' }}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} color="#ef4444" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        {managers.length === 0 && (
                            <tr>
                                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                                    No hay supervisores registrados. Añade uno abajo.
                                </td>
                            </tr>
                        )}

                        {/* Add Row */}
                        <tr style={{ background: '#fefce8' }}>
                            <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        placeholder="Nuevo Supervisor..."
                                        value={newManagerName}
                                        onChange={(e) => setNewManagerName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateManager()}
                                        style={{
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            padding: '4px 8px',
                                            fontSize: '14px',
                                            flex: 1,
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleCreateManager}
                                        disabled={!newManagerName.trim()}
                                        style={{
                                            background: '#16a34a',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            opacity: !newManagerName.trim() ? 0.5 : 1
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </td>
                            <td colSpan={8}></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
