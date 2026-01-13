import type { CoverageRule, ISODate, ShiftType } from '../types'

/**
 * Define el resultado de la resolución de cobertura, indicando el valor
 * requerido, la fuente de la decisión (una regla o el valor por defecto) y
 * el ID de la regla que aplicó, junto con una razón legible.
 */
export interface ResolvedCoverage {
  required: number
  source: 'RULE' | 'DEFAULT'
  ruleId?: string
  reason: string
}

/**
 * Resuelve la cobertura mínima requerida para una fecha y turno específicos,
 * aplicando una jerarquía de reglas de la más específica a la más general.
 *
 * @param date La fecha en formato ISO (YYYY-MM-DD).
 * @param shift El turno ('DAY' o 'NIGHT').
 * @param rules El array de todas las reglas de cobertura disponibles.
 * @returns Un objeto ResolvedCoverage con el requisito y la fuente de la decisión.
 */
export function resolveCoverage(
  date: ISODate,
  shift: ShiftType,
  rules: CoverageRule[]
): ResolvedCoverage {
  // Orden de precedencia: DATE > SHIFT > GLOBAL

  // 1. Regla por fecha
  const dateMatch = rules.find(
    r => r.scope.type === 'DATE' && r.scope.date === date
  )
  if (dateMatch) {
    return {
      required: dateMatch.required,
      source: 'RULE',
      ruleId: dateMatch.id,
      reason: `Regla específica para fecha: ${dateMatch.label || dateMatch.id}`,
    }
  }

  // 2. Regla por turno
  const shiftMatch = rules.find(
    r => r.scope.type === 'SHIFT' && r.scope.shift === shift
  )
  if (shiftMatch) {
    return {
      required: shiftMatch.required,
      source: 'RULE',
      ruleId: shiftMatch.id,
      reason: `Regla general de turno ${shift}: ${
        shiftMatch.label || shiftMatch.id
      }`,
    }
  }

  // 3. Fallback a regla global
  const globalMatch = rules.find(r => r.scope.type === 'GLOBAL')
  if (globalMatch) {
    return {
      required: globalMatch.required,
      source: 'RULE',
      ruleId: globalMatch.id,
      reason: `Regla global: ${globalMatch.label || globalMatch.id}`,
    }
  }

  // 4. Fallback de seguridad si no hay ninguna regla aplicable.
  return {
    required: 0,
    source: 'DEFAULT',
    reason: 'Valor por defecto (ninguna regla aplicable)',
  }
}
