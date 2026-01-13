# Planning Engine — v2.0 (Operational Core)

Este proyecto implementa un motor de planificación determinista, diseñado para asignar recursos (personas) a turnos de forma predecible, explicable y extensible. El sistema se divide en dos módulos principales: **Planificación** y **Registro Diario**.

El sistema prioriza:
- **Corrección** antes que optimización.
- **Transparencia** antes que heurísticas opacas.
- **Evolución controlada** mediante reglas explícitas.

No es un optimizador mágico. Es un motor de decisiones trazable.

---

## 🧠 Principios Fundamentales

- **Separación estricta de responsabilidades**:
  - **Planificación**: Define el *deber ser*. ¿Quién *debería* trabajar y cuándo?
  - **Registro Diario**: Registra el *ser*. ¿Qué *ocurrió* realmente?
  - Validación ≠ Selección ≠ Puntuación.
- **Determinismo**: Dado el mismo estado de entrada, el resultado es siempre el mismo.
- **Inmutabilidad conceptual**: El motor no muta estado global; cada paso produce una nueva versión.

---

## 🧱 Arquitectura General

La aplicación se estructura en vistas con responsabilidades únicas, controladas por una navegación principal.

```
Navegación (Pestañas: Planificación | Registro Diario | ...)
           │
           ▼
[Vista Activa]
     │
     └───> Planificación
           │    │
           │    ▼
           │   Plan Semanal (Control de overrides y visualización de cobertura)
           │
     └───> Registro Diario
                │
                ▼
               Formulario de Incidencias (Registro de eventos reales)
```

### Componentes de Lógica

1.  **Hard Restrictions (Obsoleto)**: Este concepto ha sido reemplazado por validaciones de dominio más específicas.
2.  **Scoring Rules (Soft Rules)**: Reglas que puntúan candidatos válidos. Actualmente, favorece la asignación equitativa.
    - **`preferLeastAssignedRule`**: Promueve un balance de carga simple.
3.  **Motor de Planificación y Estado**: El hook `useAppState` centraliza el estado y la lógica, construyendo el plan semanal (`buildWeeklySchedule`) y gestionando las incidencias.

---

## 🧪 Cobertura de Tests

El sistema está cubierto en tres niveles:
1.  **Unit Tests**: Para cada componente de lógica y validación individual.
2.  **Integration Tests**: Para el comportamiento del motor con reglas reales.
3.  **System Tests**: Para escenarios completos que validan el resultado final del plan.

---

## 📦 Estado del Proyecto

**Versión: v2.0 – Operational Core**
- ✔️ Núcleo de planificación y registro diario funcional y estable.
- ✔️ Separación clara entre planificación (`overrides`) y eventos reales (`incidents`).
- ✔️ Arquitectura de vistas por pestañas para evitar conflictos de layout.
- ✔️ Reglas de negocio para `AUSENCIA`, `LICENCIA` y `VACACIONES` definidas.
- ✔️ Sin deuda técnica conocida.

---

## 🚀 Próximos Pasos (Futuros Milestones)

- `SoftRules` avanzadas (fatiga, rotación, preferencias históricas).
- Sistema de explicación (“por qué se asignó X”).
- Simulación y evaluación de escenarios.
- Persistencia de estado y versionado histórico.

---

## 🧭 Filosofía del Proyecto

> “No buscamos la asignación perfecta, sino un sistema que siempre sepa por qué eligió lo que eligió y qué ocurrió realmente.”
