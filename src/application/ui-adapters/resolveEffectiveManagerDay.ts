import { ISODate, Incident, Representative } from '@/domain/types'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import { DayInfo } from '@/domain/calendar/types'
import { ManagerWeeklyPlan } from '@/domain/management/types'
import { EffectiveManagerDay } from './types'

/**
 * 🎯 RESOLVER EFECTIVO GERENCIAL
 *
 * PRECEDENCIA (NO TOCAR):
 * 1. VACACIONES / LICENCIA (bloquean visualización, NO borran horario)
 * 2. Override gerencial (plan explícito con duty)
 * 3. Estado no definido (null → guión "—")
 * 
 * CASOS LÍMITE:
 * - VAC/LIC: El horario gerencial se conserva pero no se muestra
 * - Celda vacía: No es OFF, es "no definido" (—)
 * - INTER/MONITOR: Roles funcionales, no turnos operativos
 * - Comentarios: Se conservan aunque haya VAC/LIC
 */
export function resolveEffectiveManagerDay(
    managerPlan: ManagerWeeklyPlan | null,
    incidents: Incident[],
    date: ISODate,
    allCalendarDays: DayInfo[],
    representative: Representative
): EffectiveManagerDay {
    // ===============================================
    // 1. VACACIONES / LICENCIA (BLOQUEAN TODO)
    // ===============================================
    const blockingIncident = incidents.find(i => {
        if (i.representativeId !== representative.id) return false
        if (!['VACACIONES', 'LICENCIA'].includes(i.type)) return false

        const resolved = resolveIncidentDates(
            i,
            allCalendarDays,
            representative
        )

        return resolved.dates.includes(date)
    })

    if (blockingIncident) {
        return {
            kind: blockingIncident.type === 'VACACIONES'
                ? 'VACATION'
                : 'LICENSE',
            note: blockingIncident.note,
        }
    }

    // ===============================================
    // 2. OVERRIDE / PLAN GERENCIAL
    // ===============================================
    const plannedDay = managerPlan?.days[date]

    if (plannedDay && plannedDay.duty) {
        return {
            kind: 'DUTY',
            duty: plannedDay.duty,
            note: plannedDay.note,
        }
    }

    // ===============================================
    // 3. OFF IMPLÍCITO
    // ===============================================
    return {
        kind: 'OFF',
    }
}
