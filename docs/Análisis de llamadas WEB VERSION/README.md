# Dashboard de Análisis para Call Center

Este proyecto es una aplicación web interactiva construida con Next.js y ShadCN UI para el monitoreo y análisis de métricas de un call center. La aplicación replica y moderniza la funcionalidad de un dashboard HTML existente, proporcionando una interfaz rica y reactiva para la visualización de datos.

## Descripción General

El dashboard permite a los usuarios cargar datos de llamadas (contestadas y abandonadas) y transacciones para generar un análisis completo del rendimiento. Calcula KPIs globales y por turno, muestra distribuciones horarias y permite comparar el rendimiento del call center con otras plataformas.

## Características Principales

- **Carga de Datos Dinámica:** Permite cargar archivos CSV, XLS o XLSX para las llamadas contestadas, abandonadas y transacciones.
- **Validación de Fechas:** Asegura la integridad de los datos forzando a que todos los archivos cargados correspondan a la misma fecha.
- **Datos de Demostración:** Incluye un botón "Demo" para cargar un conjunto de datos de ejemplo y explorar la funcionalidad sin necesidad de archivos propios.
- **KPIs Globales y por Turno:** Visualización de métricas clave como total de llamadas recibidas, contestadas, abandonadas, % de atención, % de abandono y % de conversión.
- **Análisis Detallado por Turno:** Tablas que desglosan las métricas en intervalos de 30 minutos para los turnos de Día y Noche.
- **Pestaña de Análisis Gráfico:** Una sección dedicada con múltiples gráficos para un análisis visual profundo:
    - Rendimiento por turno (% Atención vs. % Abandono).
    - Distribución de llamadas por hora (con filtro por turno).
    - Tasa de Abandono y Conversión por hora (gráficos de línea).
    - Comparativas de Ventas y Ticket Promedio (Call Center vs. Otras plataformas).
    - Top 10 sucursales con más transacciones.
- **Auditoría de Transacciones:** Una vista oculta (accesible a través del icono de la lupa) que proporciona un desglose detallado de los datos de transacciones cargados.
- **Exportación de Reportes:** Funcionalidad para exportar el análisis completo a formatos **CSV** y **Excel**.
- **Diseño Moderno y Responsivo:** Construido con componentes de ShadCN UI para una experiencia de usuario óptima en cualquier dispositivo.

## Cómo Empezar

1.  Inicia la aplicación.
2.  Usa los botones en la parte superior derecha para cargar tus archivos: **"Contestadas"**, **"Abandonadas"** y **"Transacciones"**.
    - *Nota: El primer archivo que cargues establecerá la fecha de referencia. Los archivos subsecuentes deben corresponder a la misma fecha.*
3.  Si no tienes archivos, haz clic en el botón **"Demo"** para ver el dashboard en acción.
4.  Explora la "Vista Principal" para ver los KPIs y las tablas de desglose por turno.
5.  Navega a la pestaña "Análisis Gráfico" para una inmersión visual en los datos.
6.  Para reiniciar y cargar un nuevo conjunto de datos, usa el botón **"Limpiar"**.
7.  Exporta tus resultados con los botones **"CSV"** o **"Excel"**.
