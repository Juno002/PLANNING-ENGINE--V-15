import { ManagerDuty } from '@/domain/management/types'

export interface EffectiveManagerDay {
    kind: 'DUTY' | 'VACATION' | 'LICENSE' | 'OFF'
    duty?: ManagerDuty
    note?: string
}
