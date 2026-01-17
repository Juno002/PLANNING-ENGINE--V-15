'use client'

import React, { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useWeekNavigator } from '@/hooks/useWeekNavigator'
import { resolveEffectiveManagerDay } from '@/application/ui-adapters/resolveEffectiveManagerDay'
import { mapManagerDayToCell } from '@/application/ui-adapters/mapManagerDayToCell'
import { format } from 'date-fns'
import { ManagerRow } from './ManagerRow'

export function ManagementPlanner() {
  const {
    managers,
    managementSchedules,
    incidents,
    allCalendarDaysForRelevantMonths,
    planningAnchorDate,
    setPlanningAnchorDate,
  } = useAppStore(s => ({
    managers: s.representatives.filter(r => r.role === 'SUPERVISOR' || r.role === 'MANAGER'),
    managementSchedules: s.managementSchedules,
    incidents: s.incidents,
    allCalendarDaysForRelevantMonths: s.allCalendarDaysForRelevantMonths,
    planningAnchorDate: s.planningAnchorDate,
    setPlanningAnchorDate: s.setPlanningAnchorDate,
  }))

  const { weekDays, label } = useWeekNavigator(
    planningAnchorDate,
    setPlanningAnchorDate
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Horario Gerencial</h2>
        <span>{label}</span>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '180px repeat(7, 1fr)' }}>
        <div />
        {weekDays.map(d => (
          <div key={d.date} style={{ textAlign: 'center', fontSize: '12px' }}>
            {format(new Date(d.date + 'T12:00:00'), 'EEE dd')}
          </div>
        ))}

        {managers.map(manager => {
          const plan = managementSchedules[manager.id] ?? null

          const cells = weekDays.map(day => {
            const effective = resolveEffectiveManagerDay(
              plan,
              incidents,
              day.date,
              allCalendarDaysForRelevantMonths,
              manager
            )

            return mapManagerDayToCell(effective, manager.name)
          })

          const handleDutyChange = (date: string, duty: any) => {
            useAppStore.getState().setManagerDuty(manager.id, date, duty)
          }

          return (
            <ManagerRow
              key={manager.id}
              name={manager.name}
              cells={cells}
              dates={weekDays.map(d => d.date)}
              onDutyChange={handleDutyChange}
            />
          )
        })}
      </div>
    </div>
  )
}
