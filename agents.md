# 🤖 Instrucciones para Agentes y Registro de Proyecto

Este archivo sirve como puente de conocimiento para cualquier modelo de IA o agente que trabaje en este proyecto. Asegura la continuidad y coherencia de las actividades.

## 📋 Descripción del Proyecto
**Dashboard de Informe Anual Unicon**: Una aplicación web moderna construida para visualizar y reportar métricas de seguridad (Vulnerabilidades, Parches, Endpoints) a partir de fuentes de datos CSV. El proyecto incluye una funcionalidad de generación de reportes PDF de alta calidad con diseño ejecutivo.

## 🎯 REGLAS DE ORO (MANDATORIAS)
1. **Registro de Cambios**: Cualquier cambio, por pequeño que sea (código, configuración, diseño), **DEBE ser registrado en la sección de [Historial de Cambios](#-historial-de-cambios-log)** al final de este archivo.
2. **Sincronización con GitHub**: Todo cambio debe ser actualizado inmediatamente en el repositorio oficial:

   - *Nota: Asegurarse de realizar `git push` después de cada sesión de cambios relevante.*

## 🛠️ Stack Tecnológico
- **Framework**: Next.js 15+ (App Router)
- **Lenguaje**: TypeScript
- **Frontend**: React 19
- **Estilos**: Tailwind CSS v4 (Moderno, sin placeholders)
- **Gráficos**: Recharts
- **Animaciones**: Framer Motion
- **Parsing**: Papaparse (CSV)
- **Reportes**: Lógica personalizada para generación de PDF en formato A4 con paginación optimizada.

## 🚀 Estado de la Misión (Contexto para retomar)
1. **Generación de PDF**: Se ha trabajado en la corrección del layout A4. Se implementó paginación para las tablas de "Top 50" y se ajustaron los gráficos de distribución para que no se corten entre páginas.
2. **Diseño**: Se prioriza una estética premium con espaciado consistente y tipografía clara.
3. **Datos**: La fuente de verdad son los archivos `.csv` en la raíz del proyecto. El parsing se gestiona centralizadamente en `dashboard/lib/`.

## 📌 Guía de Operación
- **Servidor Dev**: `npm run dev` (usualmente en puerto `2020`).
- **Arquitectura**: 
  - `app/`: Rutas y páginas principales.
  - `components/`: Componentes modulares (Providers, DateRangePicker, Gráficos).
  - `lib/`: Utilidades de parsing (`csvUtils.ts`) y tipos (`types.ts`).
- **Consideraciones PDF**: Mantener siempre el membrete (letterhead) sin distorsión y respetar las dimensiones A4 fijas.

## 📝 Historial de Cambios (Log)

| Fecha | Agente | Descripción del Cambio |
| :--- | :--- | :--- |
| 2026-02-16 | Antigravity | Implementación de Versión Demo: Se añadió el botón "Usar Versión Demo" y lógica de datos estáticos para visualización rápida sin carga de archivos. |
| 2026-02-10 | Antigravity | Optimización de Espacio en Reporte: Integración de métricas de licencia en texto descriptivo y compactación de gráficos en la Hoja 2 para incluir S.O. sin desbordamiento. |
| 2026-02-10 | Antigravity | Optimización de Leyendas: Se unificaron las leyendas en Dashboard y Reporte para mostrar "Nombre (Valor)", evitando redundancias y mejorando la legibilidad en PDF. |
| 2026-02-10 | Antigravity | Rediseño de Reporte PDF: Título actualizado, adición de línea de estilo, desglose de severidad detectada/mitigada y métricas de licencias (consumidas/libres). |
| 2026-02-10 | Antigravity | Mejora de Dashboard: Tabla de tendencias, división de gráficos de severidad (Detectadas vs Mitigadas), totalizadores centrales en gráfos de dona y gestión de licencias editable. |
| 2026-02-10 | Antigravity | Actualización de instrucciones: Se añadió la obligación de sincronizar con GitHub y se incluyeron las credenciales provisionales. |
| 2026-02-10 | Antigravity | Creación del archivo `agents.md` con el System Prompt detallado y la instrucción de registro mandatorio. |
| [Previo] | AI | Implementación de paginación en tablas Top 50 y corrección de márgenes en Executive Summary. |
| [Previo] | AI | División de gráficos de distribución en páginas independientes para el reporte PDF. |
