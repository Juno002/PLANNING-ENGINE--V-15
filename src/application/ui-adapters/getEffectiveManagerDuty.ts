import { ISODate } from '@/domain/types'
import { ManagerDuty } from '@/domain/management/types'
import { useAppStore } from '@/store/useAppStore'

export interface EffectiveManagerDuty {
    duty: ManagerDuty | null
    note?: string
    source: 'EXPLICIT' | 'DEFAULT'
}

export function getEffectiveManagerDuty(
    managerId: string,
    date: ISODate
): EffectiveManagerDuty {
    const store = useAppStore.getState()
    store.ensureManagerSchedule(managerId)
    
    const assignment = store.getManagerAssignment(managerId, date)

    if (assignment && assignment.duty) {
        return {
            duty: assignment.duty,
            note: assignment.note,
            source: 'EXPLICIT',
        }
    }

    return {
        duty: null,
        source: 'DEFAULT',
    }
}
