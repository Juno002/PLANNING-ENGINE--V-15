import { ISODate } from '@/domain/types'

export type ManagerDuty =
    | 'DAY'
    | 'NIGHT'
    | 'INTER'
    | 'MONITORING'

export interface Manager {
    id: string
    name: string
    initials?: string
    role?: 'SUPERVISOR' | 'MANAGER'
}

export const DEFAULT_MANAGER_DUTY: ManagerDuty | null = null

export interface ManagerPlanDay {
    duty: ManagerDuty | null // null = explícitamente vacío
    note?: string
}

export interface ManagerWeeklyPlan {
    managerId: string
    days: Record<ISODate, ManagerPlanDay>
}

// Alias for backward compatibility with Store Slice if needed, or update Slice
export type ManagerSchedule = ManagerWeeklyPlan
export type ManagerAssignment = ManagerPlanDay & { date?: ISODate }
