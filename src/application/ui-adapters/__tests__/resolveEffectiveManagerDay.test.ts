import { resolveEffectiveManagerDay } from '../resolveEffectiveManagerDay'
import { ManagerWeeklyPlan } from '@/domain/management/types'
import { Incident, Representative } from '@/domain/types'
import { DayInfo } from '@/domain/calendar/types'

describe('resolveEffectiveManagerDay', () => {
  const mockRep: Representative = {
    id: 'manager-1',
    name: 'Angela Directora',
    isActive: true,
    baseShift: 'DAY',
    baseSchedule: { 0: 'OFF', 1: 'WORKING', 2: 'WORKING', 3: 'WORKING', 4: 'WORKING', 5: 'OFF', 6: 'OFF' },
    role: 'SUPERVISOR',
  }

  const mockCalendarDays: DayInfo[] = [
    { date: '2026-01-15', dayOfWeek: 4, isHoliday: false, holidayName: null, isSpecialDay: false },
    { date: '2026-01-16', dayOfWeek: 5, isHoliday: false, holidayName: null, isSpecialDay: false },
    { date: '2026-01-17', dayOfWeek: 6, isHoliday: false, holidayName: null, isSpecialDay: false },
  ]

  it('retorna VACATION cuando hay vacaciones', () => {
    const incidents: Incident[] = [
      {
        id: 'inc-1',
        type: 'VACACIONES',
        representativeId: 'manager-1',
        startDate: '2026-01-15',
        endDate: '2026-01-17',
        createdAt: Date.now(),
      },
    ]

    const result = resolveEffectiveManagerDay(
      null,
      incidents,
      '2026-01-15',
      mockCalendarDays,
      mockRep
    )

    expect(result.kind).toBe('VACATION')
  })

  it('retorna LICENSE cuando hay licencia', () => {
    const incidents: Incident[] = [
      {
        id: 'inc-1',
        type: 'LICENCIA',
        representativeId: 'manager-1',
        startDate: '2026-01-15',
        endDate: '2026-01-17',
        createdAt: Date.now(),
      },
    ]

    const result = resolveEffectiveManagerDay(
      null,
      incidents,
      '2026-01-15',
      mockCalendarDays,
      mockRep
    )

    expect(result.kind).toBe('LICENSE')
  })

  it('retorna DUTY cuando hay plan gerencial', () => {
    const plan: ManagerWeeklyPlan = {
      managerId: 'manager-1',
      days: {
        '2026-01-15': { duty: 'DAY', note: 'Supervisión de turno diurno' },
      },
    }

    const result = resolveEffectiveManagerDay(
      plan,
      [],
      '2026-01-15',
      mockCalendarDays,
      mockRep
    )

    expect(result.kind).toBe('DUTY')
    expect(result.duty).toBe('DAY')
    expect(result.note).toBe('Supervisión de turno diurno')
  })

  it('retorna OFF cuando no hay plan ni incidencias', () => {
    const result = resolveEffectiveManagerDay(
      null,
      [],
      '2026-01-15',
      mockCalendarDays,
      mockRep
    )

    expect(result.kind).toBe('OFF')
  })

  it('VACACIONES tienen precedencia sobre plan gerencial', () => {
    const plan: ManagerWeeklyPlan = {
      managerId: 'manager-1',
      days: {
        '2026-01-15': { duty: 'NIGHT' },
      },
    }

    const incidents: Incident[] = [
      {
        id: 'inc-1',
        type: 'VACACIONES',
        representativeId: 'manager-1',
        startDate: '2026-01-15',
        endDate: '2026-01-17',
        createdAt: Date.now(),
      },
    ]

    const result = resolveEffectiveManagerDay(
      plan,
      incidents,
      '2026-01-15',
      mockCalendarDays,
      mockRep
    )

    expect(result.kind).toBe('VACATION')
  })

  it('soporta INTER y MONITORING', () => {
    const planInter: ManagerWeeklyPlan = {
      managerId: 'manager-1',
      days: {
        '2026-01-15': { duty: 'INTER' },
      },
    }

    const resultInter = resolveEffectiveManagerDay(
      planInter,
      [],
      '2026-01-15',
      mockCalendarDays,
      mockRep
    )

    expect(resultInter.duty).toBe('INTER')

    const planMonitoring: ManagerWeeklyPlan = {
      managerId: 'manager-1',
      days: {
        '2026-01-16': { duty: 'MONITORING' },
      },
    }

    const resultMonitoring = resolveEffectiveManagerDay(
      planMonitoring,
      [],
      '2026-01-16',
      mockCalendarDays,
      mockRep
    )

    expect(resultMonitoring.duty).toBe('MONITORING')
  })

  it('maneja duty: null correctamente (OFF explícito)', () => {
    const plan: ManagerWeeklyPlan = {
      managerId: 'manager-1',
      days: {
        '2026-01-15': { duty: null },
      },
    }

    const result = resolveEffectiveManagerDay(
      plan,
      [],
      '2026-01-15',
      mockCalendarDays,
      mockRep
    )

    expect(result.kind).toBe('OFF')
  })
})
