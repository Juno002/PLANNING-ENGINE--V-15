import { EffectiveManagerDay } from './types'

/**
 * 🎨 MAPPER VISUAL - HORARIO GERENCIAL
 * 
 * SEMÁNTICA DE ESTADOS:
 * - DAY, NIGHT, INTER, MONITORING: Asignaciones explícitas
 * - OFF (—): No definido, celda vacía (NO es "libre")
 * - VACATION, LICENSE: Bloqueantes, prioridad máxima
 * 
 * NOTAS:
 * - Icono 📝 solo si existe note
 * - Tooltip nativo (title) al hover
 * - Sin ruido visual si no hay comentario
 */

export interface ManagerCellState {
    label: string
    variant: 'DAY' | 'NIGHT' | 'INTER' | 'MONITORING' | 'OFF' | 'VACATION' | 'LICENSE'
    tooltip?: string
    note?: string
}

export function mapManagerDayToCell(
    day: EffectiveManagerDay,
    name: string
): ManagerCellState {
    if (day.kind === 'VACATION') {
        return {
            label: 'VAC',
            variant: 'VACATION',
            note: day.note,
            tooltip: day.note 
                ? `Vacaciones\n📝 ${day.note}`
                : 'Vacaciones',
        }
    }

    if (day.kind === 'LICENSE') {
        return {
            label: 'LIC',
            variant: 'LICENSE',
            note: day.note,
            tooltip: day.note
                ? `Licencia\n📝 ${day.note}`
                : 'Licencia',
        }
    }

    if (day.kind === 'OFF') {
        return {
            label: '—',
            variant: 'OFF',
        }
    }

    // DUTY
    const labels: Record<string, string> = {
        DAY: 'Día',
        NIGHT: 'Noche',
        INTER: 'Inter',
        MONITORING: 'Mon',
    }

    return {
        label: labels[day.duty!],
        variant: day.duty!,
        note: day.note,
        tooltip: day.note ? `${labels[day.duty!]}\n📝 ${day.note}` : undefined,
    }
}
