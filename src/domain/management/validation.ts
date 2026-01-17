/**
 * 📐 VALIDACIÓN DE HORARIO GERENCIAL
 * 
 * Reglas minimalistas, sin ruido:
 * - Comentarios opcionales, nunca bloqueantes
 * - Sin regex, sin palabras prohibidas
 * - Sin historial, sin confirmaciones modales
 */

const MAX_NOTE_LENGTH = 300

export function validateManagerNote(note: string | undefined): string | undefined {
    if (!note) return undefined
    
    const trimmed = note.trim()
    
    if (trimmed.length === 0) return undefined
    
    if (trimmed.length > MAX_NOTE_LENGTH) {
        throw new Error(`Comentario demasiado largo (máximo ${MAX_NOTE_LENGTH} caracteres)`)
    }
    
    return trimmed
}

/**
 * 🔒 INVARIANTES DEL SISTEMA (NO TOCAR)
 * 
 * 1. VACACIONES / LICENCIA > horario gerencial
 *    - El horario NO se borra cuando hay VAC/LIC
 *    - El horario NO se puede editar ese día (UI bloqueada)
 *    - Se muestra visualmente bloqueado
 * 
 * 2. Celda vacía ≠ OFF
 *    - null → estado "—" (no definido)
 *    - OFF → estado "Libre" (definido explícitamente)
 * 
 * 3. INTER / MONITOR no son turnos operativos
 *    - No cuentan como DAY
 *    - No cuentan como NIGHT
 *    - No suman cobertura
 *    - Son roles funcionales
 * 
 * 4. Un duty por día
 *    - Reemplazo, no merge
 *    - Mantener comentario si existe
 *    - Sin estados híbridos
 * 
 * 5. Contexto histórico no se borra
 *    - Comentarios se conservan aunque haya VAC/LIC
 *    - Visible cuando termina la incidencia
 * 
 * 6. Persistencia por fecha exacta
 *    - No es semanal (no hay patterns)
 *    - No se copia a otras semanas
 *    - Cada fecha es independiente
 */
