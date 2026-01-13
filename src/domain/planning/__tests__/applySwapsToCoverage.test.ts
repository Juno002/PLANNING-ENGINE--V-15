import { applySwapsToCoverage } from '../applySwapsToCoverage'
import { SwapEvent, ShiftType } from '@/domain/types'

type CoverageMap = Record<ShiftType, { actual: number }>

describe('applySwapsToCoverage', () => {
    const base: CoverageMap = {
        DAY: { actual: 3 },
        NIGHT: { actual: 2 }
    }
    const date = '2026-01-10'

    it('COVER: net change is 0 (1 leaves, 1 enters)', () => {
        const swap: SwapEvent = {
            id: 's1', type: 'COVER', date, shift: 'DAY',
            fromRepresentativeId: 'A', toRepresentativeId: 'B',
            createdAt: ''
        }
        const res = applySwapsToCoverage(base, [swap], date)
        expect(res.DAY.actual).toBe(3)
        // Ensure Night is untouched
        expect(res.NIGHT.actual).toBe(2)
    })

    it('DOUBLE: increases coverage by 1', () => {
        const swap: SwapEvent = {
            id: 'd1', type: 'DOUBLE', date, shift: 'NIGHT',
            representativeId: 'A',
            createdAt: ''
        }
        const res = applySwapsToCoverage(base, [swap], date)
        expect(res.NIGHT.actual).toBe(3) // 2 + 1
        expect(res.DAY.actual).toBe(3)
    })

    it('SWAP: net change is 0 for both shifts', () => {
        const swap: SwapEvent = {
            id: 'x1', type: 'SWAP', date,
            fromRepresentativeId: 'A', fromShift: 'DAY',
            toRepresentativeId: 'B', toShift: 'NIGHT',
            createdAt: ''
        }
        const res = applySwapsToCoverage(base, [swap], date)
        expect(res.DAY.actual).toBe(3) // (3 - 1 + 1)
        expect(res.NIGHT.actual).toBe(2) // (2 - 1 + 1)
    })

    it('ignores swaps on other dates', () => {
        const swap: SwapEvent = {
            id: 'd1', type: 'DOUBLE', date: '2026-01-11', shift: 'DAY',
            representativeId: 'A',
            createdAt: ''
        }
        const res = applySwapsToCoverage(base, [swap], date)
        expect(res.DAY.actual).toBe(3)
    })
})
