/**
 * 🧪 TESTS: Validación de operaciones de cambio de turno (AXIOMA: DISPONIBILIDAD REAL)
 *
 * REGLAS CUBIERTAS (precisas):
 * 1. Mismo turno: Válido SOLO si el que cubre está OFF.
 * 2. Turnos opuestos: SIEMPRE válido si ambos trabajan.
 * 3. Mixto: Tratado como cualquier otro; válido si su asignación no solapa.
 * 4. Incidencias bloqueantes: No se puede cubrir a/con alguien de vacaciones/licencia.
 */

import {
  validateSwapOperation,
  SwapValidationContext,
} from '../../../src/domain/swaps/validateSwapOperation'
import { ShiftAssignment } from '../../../src/domain/types'

describe('validateSwapOperation - COVER (Axioma: Disponibilidad Real)', () => {
  it('permite DAY -> cubrir NIGHT aunque el que cubre esté trabajando', () => {
    const ctx: SwapValidationContext = {
      daily: {
        A: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'NIGHT' },
        },
        B: { shouldWork: true, assignment: { type: 'SINGLE', shift: 'DAY' } },
      },
    }

    const res = validateSwapOperation('COVER', 'A', 'B', 'NIGHT', ctx)
    expect(res).toBeNull()
  })

  it('permite que un representante OFF cubra cualquier turno', () => {
    const ctx: SwapValidationContext = {
      daily: {
        juan: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
        luis: { shouldWork: false, assignment: null }, // Está OFF
      },
    }

    // Luis (OFF) puede cubrir a Juan (DAY)
    const res = validateSwapOperation('COVER', 'juan', 'luis', 'DAY', ctx)
    expect(res).toBeNull()
  })

  it('permite que un perfil MIXTO cubra un turno en el que tiene disponibilidad', () => {
    const ctx: SwapValidationContext = {
      daily: {
        ana: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'NIGHT' },
        },
        mixto: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        }, // Trabaja solo Día
      },
    }
    // El mixto (trabajando Día) puede cubrir a Ana (Noche) porque el turno Noche está libre.
    const res = validateSwapOperation('COVER', 'ana', 'mixto', 'NIGHT', ctx)
    expect(res).toBeNull()
  })

  it('rechaza COVER si el que cubre ya trabaja ESE MISMO turno', () => {
    const ctx: SwapValidationContext = {
      daily: {
        juan: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
        pedro: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
      },
    }

    const res = validateSwapOperation('COVER', 'juan', 'pedro', 'DAY', ctx)
    expect(res).toContain('no está disponible en ese horario')
  })

  it('rechaza COVER si el perfil MIXTO ya trabaja AMBOS turnos', () => {
    const ctx: SwapValidationContext = {
      daily: {
        carlos: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
        mixto: { shouldWork: true, assignment: { type: 'BOTH' } }, // Trabaja ambos
      },
    }

    const res = validateSwapOperation('COVER', 'carlos', 'mixto', 'DAY', ctx)
    expect(res).toContain('no está disponible en ese horario')
  })

  it('rechaza COVER a alguien de VACACIONES', () => {
    const ctx: SwapValidationContext = {
      daily: {
        juan: {
          shouldWork: false,
          assignment: null,
          incidentType: 'VACATION',
        },
        maria: { shouldWork: false, assignment: null },
      },
    }

    const res = validateSwapOperation('COVER', 'juan', 'maria', 'DAY', ctx)
    expect(res).toContain('vacaciones')
  })

  it('rechaza COVER con alguien de LICENCIA', () => {
    const ctx: SwapValidationContext = {
      daily: {
        pedro: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
        carlos: {
          shouldWork: false,
          assignment: null,
          incidentType: 'LEAVE',
        },
      },
    }

    const res = validateSwapOperation('COVER', 'pedro', 'carlos', 'DAY', ctx)
    expect(res).toContain('licencia')
  })

  it('rechaza COVER si el cubierto NO trabaja ese día', () => {
    const ctx: SwapValidationContext = {
      daily: {
        juan: { shouldWork: false, assignment: null },
        maria: { shouldWork: false, assignment: null },
      },
    }

    const res = validateSwapOperation('COVER', 'juan', 'maria', 'DAY', ctx)
    expect(res).toContain('no trabaja ese día')
  })
})

describe('validateSwapOperation - SWAP', () => {
  it('permite SWAP cuando trabajan turnos OPUESTOS', () => {
    const ctx: SwapValidationContext = {
      daily: {
        carlos: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
        diana: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'NIGHT' },
        },
      },
    }

    const res = validateSwapOperation('SWAP', 'carlos', 'diana', 'DAY', ctx)
    expect(res).toBeNull()
  })

  it('rechaza SWAP cuando ambos trabajan el MISMO turno', () => {
    const ctx: SwapValidationContext = {
      daily: {
        juan: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
        pedro: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
      },
    }

    const res = validateSwapOperation('SWAP', 'juan', 'pedro', 'DAY', ctx)
    expect(res).toContain('no tiene efecto')
  })
})

describe('validateSwapOperation - DOUBLE', () => {
  it('permite DOUBLE si se tiene disponibilidad en el turno', () => {
    const ctx: SwapValidationContext = {
      daily: {
        elena: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
      },
    }
    // Elena hace DOUBLE en Noche (ya trabaja Día)
    const res = validateSwapOperation('DOUBLE', undefined, 'elena', 'NIGHT', ctx)
    expect(res).toBeNull()
  })

  it('rechaza DOUBLE si ya se trabaja ese turno', () => {
    const ctx: SwapValidationContext = {
      daily: {
        juan: {
          shouldWork: true,
          assignment: { type: 'SINGLE', shift: 'DAY' },
        },
      },
    }
    const res = validateSwapOperation('DOUBLE', undefined, 'juan', 'DAY', ctx)
    expect(res).toContain('ya trabaja ese turno')
  })

  it('rechaza DOUBLE si ya trabaja AMBOS turnos', () => {
    const ctx: SwapValidationContext = {
      daily: {
        juan: {
          shouldWork: true,
          assignment: { type: 'BOTH' },
        },
      },
    }
    const res = validateSwapOperation('DOUBLE', undefined, 'juan', 'DAY', ctx)
    expect(res).toContain('ya trabaja ambos turnos')
  })
})
