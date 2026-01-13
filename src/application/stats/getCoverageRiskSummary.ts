/**
 * @file Computes an aggregated summary of coverage risk for a given period.
 * @version 1.1.0 - Canonical, with daily deficit details.
 *
 * @contract
 * - This adapter is a pure function.
 * - It consumes pre-calculated weekly plans and other domain data.
 * - `totalDays` represents all calendar days in the month.
 * - Deficit calculations (`daysWithDeficit`, `totalDeficit`, etc.) only consider
 *   days for which a `WeeklyPlan` is provided. This is a known, explicit limitation.
 * - The `findPlanForDate` heuristic assumes non-overlapping weekly plans.
 */

import {
  WeeklyPlan,
  SwapEvent,
  CoverageRule,
  DayInfo,
  Incident,
  ShiftType,
  ISODate,
} from '@/domain/types'
import { getEffectiveDailyCoverage } from '@/application/ui-adapters/getEffectiveDailyCoverage'

export interface DailyDeficitDetail {
  date: ISODate
  shift: ShiftType
  deficit: number
  actual: number
  required: number
}

export interface CoverageRiskResult {
  totalDays: number
  daysWithDeficit: number
  criticalDeficitDays: number // Days with deficit > 2
  totalDeficit: number // Sum of all deficits across all days and shifts
  worstShift: {
    shift: 'DAY' | 'NIGHT' | null
    deficit: number
  }
  dailyDeficits: DailyDeficitDetail[] // Detailed list of each deficit event
}

export function getCoverageRiskSummary(
  input: CoverageRiskInput
): CoverageRiskResult {
  const { monthDays, weeklyPlans, swaps, coverageRules } = input

  if (!weeklyPlans.length || !monthDays.length) {
    return {
      totalDays: monthDays.length,
      daysWithDeficit: 0,
      criticalDeficitDays: 0,
      totalDeficit: 0,
      worstShift: { shift: null, deficit: 0 },
      dailyDeficits: [],
    }
  }

  const dailyDeficitDetails: DailyDeficitDetail[] = []
  const shiftDeficits = { DAY: 0, NIGHT: 0 }
  const daysWithDeficitSet = new Set<ISODate>()
  const criticalDeficitDaysSet = new Set<ISODate>()

  // A simple way to associate a day with its weekly plan.
  // This is a known limitation that assumes non-overlapping plans.
  const findPlanForDate = (date: string) => {
    return weeklyPlans.find(p => {
      const planStart = new Date(p.weekStart + 'T00:00:00')
      const planEnd = new Date(planStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      const targetDate = new Date(date + 'T00:00:00')
      return targetDate >= planStart && targetDate < planEnd
    })
  }

  for (const day of monthDays) {
    const plan = findPlanForDate(day.date)
    if (!plan) continue

    const dailyCoverage = getEffectiveDailyCoverage(
      plan,
      swaps,
      coverageRules,
      day.date,
      input.incidents,
      monthDays,
      input.representatives
    )

    let dailyTotalDeficit = 0

    for (const shift of ['DAY', 'NIGHT'] as ShiftType[]) {
      const { required, actual } = dailyCoverage[shift]
      const deficit = Math.max(0, required - actual)

      if (deficit > 0) {
        shiftDeficits[shift] += deficit
        daysWithDeficitSet.add(day.date)
        dailyTotalDeficit += deficit
        dailyDeficitDetails.push({
          date: day.date,
          shift,
          deficit,
          actual,
          required,
        })
      }
    }

    if (dailyTotalDeficit > 2) {
      // "Critical" deficit threshold
      criticalDeficitDaysSet.add(day.date)
    }
  }

  const worstShift =
    shiftDeficits.DAY > shiftDeficits.NIGHT
      ? { shift: 'DAY' as const, deficit: shiftDeficits.DAY }
      : shiftDeficits.NIGHT > 0
        ? { shift: 'NIGHT' as const, deficit: shiftDeficits.NIGHT }
        : { shift: null, deficit: 0 }

  return {
    totalDays: monthDays.length,
    daysWithDeficit: daysWithDeficitSet.size,
    criticalDeficitDays: criticalDeficitDaysSet.size,
    totalDeficit: shiftDeficits.DAY + shiftDeficits.NIGHT,
    worstShift,
    dailyDeficits: dailyDeficitDetails.sort((a, b) => a.date.localeCompare(b.date) || a.shift.localeCompare(b.shift)),
  }
}

// Re-exporting the input type as it's defined in the original file
export interface CoverageRiskInput {
  monthDays: DayInfo[]
  weeklyPlans: WeeklyPlan[]
  swaps: SwapEvent[]
  coverageRules: CoverageRule[]
  incidents: Incident[]
  representatives: any[] // Added for vacation blocking
}
