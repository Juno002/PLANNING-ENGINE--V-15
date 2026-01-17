import { StateCreator } from 'zustand'
import { ISODate } from '@/domain/types'
import {
    ManagerDuty,
    ManagerPlanDay,
    ManagerWeeklyPlan,
} from '@/domain/management/types'
import { validateManagerNote } from '@/domain/management/validation'

export interface ManagementScheduleSlice {
    managementSchedules: Record<string, ManagerWeeklyPlan>

    ensureManagerSchedule: (managerId: string) => void

    setManagerDuty: (
        managerId: string,
        date: ISODate,
        duty: ManagerDuty | null, // null = OFF
        note?: string
    ) => void

    clearManagerDuty: (
        managerId: string,
        date: ISODate
    ) => void

    getManagerAssignment: (
        managerId: string,
        date: ISODate
    ) => ManagerPlanDay | null
}

// Adapted for Immer middleware usage in useAppStore
export const createManagementScheduleSlice: StateCreator<
    ManagementScheduleSlice,
    [['zustand/immer', never]],
    [],
    ManagementScheduleSlice
> = (set, get) => ({
    managementSchedules: {},

    ensureManagerSchedule: (managerId) => {
        set((state: any) => {
            if (!state.managementSchedules[managerId]) {
                state.managementSchedules[managerId] = {
                    managerId,
                    days: {},
                }
            }
        })
    },

    setManagerDuty: (managerId, date, duty, note) => {
        get().ensureManagerSchedule(managerId)
        
        const validatedNote = validateManagerNote(note)
        
        set((state: any) => {

            const schedule = state.managementSchedules[managerId]

            // Set assignment (reemplazo completo, no merge)
            schedule.days[date] = {
                duty,
                note: validatedNote,
            }
        })
    },

    clearManagerDuty: (managerId, date) => {
        set((state: any) => {
            const schedule = state.managementSchedules[managerId]
            if (!schedule) return

            delete schedule.days[date]
        })
    },

    getManagerAssignment: (managerId, date) => {
        const schedule = get().managementSchedules[managerId]
        
        if (!schedule || !schedule.days) {
            return null
        }
        
        return schedule.days[date] ?? null
    },
})
