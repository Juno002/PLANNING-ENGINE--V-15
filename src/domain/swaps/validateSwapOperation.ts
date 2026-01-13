/**
 * 🔒 VALIDACIÓN DE OPERACIONES DE CAMBIO DE TURNO (v4 - ESTADO EFECTIVO)
 *
 * Este módulo implementa las reglas DURAS del dominio para swaps.
 * 
 * CAMBIO CRÍTICO v4:
 * La validación ahora opera sobre ESTADO EFECTIVO (base + swaps existentes),
 * no solo sobre el estado base. Esto previene bugs como doble cobertura.
 *
 * Ver SWAP_RULES.md para la especificación completa.
 */

import { SwapType, ShiftType, RepresentativeId } from '../types'

/**
 * Contexto efectivo para validación de swaps.
 * 
 * IMPORTANTE: Este contexto refleja el estado REAL después de aplicar swaps existentes.
 * - effectiveShifts: Turnos que la persona REALMENTE trabaja (después de swaps)
 * - baseShifts: Turnos del plan base (antes de swaps)
 * - isBlocked: Bloqueado por VACACIONES/LICENCIA
 */
export interface EffectiveSwapContext {
  daily: Record<
    RepresentativeId,
    {
      effectiveShifts: Set<ShiftType>
      baseShifts: Set<ShiftType>
      isBlocked: boolean
    }
  >
}

export type ValidationError = string | null

// -------------------------
// VALIDADOR PRINCIPAL
// -------------------------

/**
 * 🎯 VALIDACIÓN BLINDADA DE OPERACIONES DE SWAP (v4)
 *
 * Fuente de verdad única, basada en estado efectivo.
 * Si esta función pasa, la operación es legal en el dominio.
 * 
 * CRÍTICO: El contexto DEBE ser construido con buildDailyEffectiveContext()
 * para incluir swaps ya existentes.
 */
export function validateSwapOperation(
  type: SwapType,
  fromId: string | undefined,
  toId: string | undefined,
  shift: ShiftType,
  ctx: EffectiveSwapContext
): ValidationError {
  const get = (id?: string) => (id ? ctx.daily[id] : undefined)

  // ======================
  // Reglas generales
  // ======================
  if (type === 'COVER' || type === 'SWAP') {
    if (!fromId || !toId) return null
    if (fromId === toId) {
      return 'La operación requiere dos personas distintas.'
    }
  }

  if (type === 'DOUBLE') {
    if (!toId) return null
  }

  const from = get(fromId)
  const to = get(toId)

  // ======================
  // COVER
  // ======================
  if (type === 'COVER') {
    if (!from || !to) return 'Representante inválido.'

    // Bloqueos duros
    if (from.isBlocked) {
      return 'No se puede cubrir a alguien de vacaciones o licencia.'
    }
    if (to.isBlocked) {
      return 'No se puede cubrir con alguien de vacaciones o licencia.'
    }

    // El cubierto debe trabajar ese turno (base)
    if (!from.baseShifts.has(shift)) {
      return 'No se puede cubrir a alguien que no trabaja ese turno.'
    }

    // 🔥 REGLA CRÍTICA: El que cubre NO puede estar ocupado en ese turno (efectivo)
    // Esto previene doble cobertura del mismo turno
    if (to.effectiveShifts.has(shift)) {
      return 'Ya está cubriendo ese turno.'
    }

    return null
  }

  // ======================
  // SWAP
  // ======================
  if (type === 'SWAP') {
    if (!from || !to) return 'Representante inválido.'

    if (from.isBlocked || to.isBlocked) {
      return 'No se puede intercambiar con alguien de vacaciones o licencia.'
    }

    // Ambos deben trabajar (efectivo)
    if (from.effectiveShifts.size === 0 || to.effectiveShifts.size === 0) {
      return 'Ambos representantes deben trabajar ese día para intercambiar.'
    }

    // Detectar turnos efectivos
    const fromShifts = Array.from(from.effectiveShifts)
    const toShifts = Array.from(to.effectiveShifts)

    // Si ambos trabajan el mismo turno, el swap no tiene efecto
    if (fromShifts.length === 1 && toShifts.length === 1 && fromShifts[0] === toShifts[0]) {
      return 'El intercambio no tiene efecto: ambos trabajan el mismo turno.'
    }

    return null
  }

  // ======================
  // DOUBLE
  // ======================
  if (type === 'DOUBLE') {
    if (!to) return 'Representante inválido.'

    if (to.isBlocked) {
      return 'No se puede asignar doble turno a alguien de vacaciones o licencia.'
    }

    // Debe trabajar (efectivo)
    if (to.effectiveShifts.size === 0) {
      return 'No se puede asignar doble turno a alguien que no trabaja.'
    }

    // Ya trabaja ambos turnos (efectivo)
    if (to.effectiveShifts.size === 2) {
      return 'Este representante ya trabaja ambos turnos.'
    }

    // Ya trabaja ESE turno (efectivo)
    if (to.effectiveShifts.has(shift)) {
      return 'El representante ya trabaja ese turno.'
    }

    return null
  }

  return 'Operación no válida.'
}

// Re-exportar para compatibilidad con código existente
export type SwapValidationContext = EffectiveSwapContext
