import { ManagerDuty } from '@/domain/management/types'

export interface ManagerDutyUI {
    label: string
    variant:
    | 'DAY'
    | 'NIGHT'
    | 'INTER'
    | 'MONITORING'
    | 'OFF'
    | 'UNAVAILABLE'
    tooltip: string
}

export function presentManagerDuty(
    duty: ManagerDuty | null,
    note?: string
): ManagerDutyUI {
    const withNote = (base: string) =>
        note ? `${base}\n📝 ${note}` : base

    if (!duty) {
        return { label: '—', variant: 'UNAVAILABLE', tooltip: 'No asignado' }
    }

    switch (duty) {
        case 'DAY':
            return { label: 'Día', variant: 'DAY', tooltip: withNote('Turno Día') }

        case 'NIGHT':
            return { label: 'Noche', variant: 'NIGHT', tooltip: withNote('Turno Noche') }

        case 'INTER':
            return { label: 'Inter', variant: 'INTER', tooltip: withNote('Turno Intermedio') }

        case 'MONITORING':
            return { label: 'Mon', variant: 'MONITORING', tooltip: withNote('Monitoreo') }

        default:
            return { label: '—', variant: 'UNAVAILABLE', tooltip: 'No disponible' }
    }
}
