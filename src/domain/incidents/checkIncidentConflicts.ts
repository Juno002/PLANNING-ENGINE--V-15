import { Representative, Incident, ISODate, IncidentType } from '@/domain/types'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import { DayInfo } from '@/domain/calendar/types'

interface ConflictCheck {
  hasConflict: boolean
  message?: string
  conflictType?: 'VACATION' | 'LICENSE' | 'OVERLAP'
}

/**
 * Verifica si hay conflictos con incidencias existentes ANTES de registrar.
 * Solo para mostrar advertencias visuales, no bloquea el registro.
 */
export function checkIncidentConflicts(
  representativeId: string,
  startDate: ISODate,
  incidentType: IncidentType,
  duration: number,
  existingIncidents: Incident[],
  allCalendarDays: DayInfo[],
  representative?: Representative
): ConflictCheck {
  // Filtrar incidencias del mismo representante
  const repIncidents = existingIncidents.filter(
    i => i.representativeId === representativeId
  )

  // Verificar vacaciones activas
  const activeVacations = repIncidents.filter(i => i.type === 'VACACIONES')
  for (const vacation of activeVacations) {
    const resolved = resolveIncidentDates(vacation, allCalendarDays, representative)
    
    if (resolved.dates.includes(startDate)) {
      return {
        hasConflict: true,
        message: `Ya tiene vacaciones activas desde ${resolved.start} hasta ${resolved.end}`,
        conflictType: 'VACATION',
      }
    }
  }

  // Verificar licencias activas
  const activeLicenses = repIncidents.filter(i => i.type === 'LICENCIA')
  for (const license of activeLicenses) {
    const resolved = resolveIncidentDates(license, allCalendarDays, representative)
    if (resolved.dates.includes(startDate)) {
      return {
        hasConflict: true,
        message: `Ya tiene licencia activa desde ${resolved.start} hasta ${resolved.end}`,
        conflictType: 'LICENSE',
      }
    }
  }

  // Verificar solapamiento SOLO si estamos creando vacaciones/licencias
  // y solo si la fecha de inicio NO está en un período existente (ya verificado arriba)
  if (incidentType === 'VACACIONES' || incidentType === 'LICENCIA') {
    const newIncidentDummy: Incident = {
      id: 'temp',
      representativeId,
      type: incidentType,
      startDate,
      duration,
      createdAt: new Date().toISOString(),
    }
    
    const newResolved = resolveIncidentDates(newIncidentDummy, allCalendarDays, representative)
    
    // Solo verificar solapamiento con incidentes del mismo tipo o compatibles
    for (const existing of repIncidents) {
      if (existing.type === 'VACACIONES' || existing.type === 'LICENCIA') {
        const existingResolved = resolveIncidentDates(existing, allCalendarDays, representative)
        
        // Verificar si hay fechas en común (pero excluir el caso ya detectado arriba)
        const overlap = newResolved.dates.some(date => existingResolved.dates.includes(date))
        if (overlap) {
          return {
            hasConflict: true,
            message: `Se solapa con ${existing.type === 'VACACIONES' ? 'vacaciones' : 'licencia'} del ${existingResolved.start} al ${existingResolved.end}`,
            conflictType: 'OVERLAP',
          }
        }
      }
    }
  }

  return { hasConflict: false }
}
