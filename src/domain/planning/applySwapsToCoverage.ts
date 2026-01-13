import { SwapEvent, ShiftType, ISODate } from '../types'

type CoverageMap = Record<ShiftType, { actual: number }>

/**
 * Adjusts coverage counts based on swaps.
 * Pure arithmetic operations.
 * 
 * Logic:
 * - COVER: Coverer works (+1), Covered stops (-1). Net 0.
 * - DOUBLE: Extra worker (+1). Net +1.
 * - SWAP: Exchange of shifts. Net 0 for both shifts involved.
 */
export function applySwapsToCoverage(
  baseCoverage: CoverageMap,
  swaps: SwapEvent[],
  date: ISODate
): CoverageMap {
  // Deep clone to ensure immutability
  const result: CoverageMap = {
    DAY: { ...baseCoverage.DAY },
    NIGHT: { ...baseCoverage.NIGHT },
  }

  const relevantSwaps = swaps.filter(s => s.date === date)

  for (const s of relevantSwaps) {
    if (s.type === 'COVER') {
      // 'from' stops working the shift
      result[s.shift].actual -= 1
      // 'to' starts working the shift
      result[s.shift].actual += 1
    } else if (s.type === 'DOUBLE') {
      // Extra shift
      result[s.shift].actual += 1
    } else if (s.type === 'SWAP') {
      // From moves from fromShift -> toShift
      result[s.fromShift].actual -= 1
      result[s.toShift].actual += 1

      // To moves from toShift -> fromShift
      result[s.toShift].actual -= 1
      result[s.fromShift].actual += 1
    }
  }

  return result
}
