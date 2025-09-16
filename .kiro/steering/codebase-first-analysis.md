# Codebase-First Analysis Guidelines

## Principio Fundamental
**SIEMPRE explorar y entender el codebase existente ANTES de proponer soluciones o crear specs.**

## Proceso Obligatorio para Nuevos Specs

### 1. Exploración Inicial del Codebase
Antes de crear cualquier spec, SIEMPRE ejecutar esta secuencia:

```
1. Leer package.json → Entender stack tecnológico y dependencias
2. Explorar src/types/index.ts → Identificar interfaces y tipos existentes
3. Revisar src/styles/ → Entender patrones de diseño (BEM-like, CSS structure)
4. Analizar public/data/ → Comprender estructura de contenido y datos
5. Examinar src/components/ → Ver arquitectura de componentes
6. Revisar src/stores/ → Entender manejo de estado (Zustand patterns)
7. Verificar .gitignore → Saber qué se versiona y qué no
8. Leer steering rules existentes → Entender filosofía y preferencias del proyecto
```

### 2. Identificar Filosofía del Proyecto
Buscar evidencia de:
- **Data-driven approach** - Todo configurable desde JSON
- **Modular architecture** - Componentes reutilizables y extensibles
- **Design patterns** - BEM-like naming, separation of concerns
- **Performance considerations** - Lazy loading, bundle size awareness
- **Accessibility** - Support for light/dark mode, screen readers
- **Internationalization** - i18n support and patterns

### 3. Extender, No Reinventar
- **Usar interfaces existentes** - Extender FlashcardData, no crear EnhancedFlashcardData
- **Seguir patrones establecidos** - Mantener naming conventions y estructura
- **Respetar restricciones** - No modificar header, usar menú hamburguesa, etc.
- **Aprovechar herramientas** - Usar Recharts, Zustand, componentes existentes

## Preguntas de Validación

Antes de proponer cualquier solución, preguntarse:

1. **¿He leído el código existente relacionado?**
2. **¿Estoy extendiendo patrones existentes o creando nuevos?**
3. **¿Mi propuesta respeta la filosofía data-driven del proyecto?**
4. **¿Estoy usando las herramientas y librerías ya instaladas?**
5. **¿Mi diseño es consistente con el sistema existente?**

## Señales de Alerta

Si encuentras estas situaciones, DETENTE y explora más:

❌ **Creando nuevas interfaces** cuando podrías extender existentes
❌ **Proponiendo nuevas librerías** sin verificar las instaladas
❌ **Hardcodeando valores** en lugar de usar configuración JSON
❌ **Modificando componentes core** sin entender el impacto
❌ **Ignorando patrones de naming** establecidos

## Ejemplo de Aplicación

### ❌ Enfoque Incorrecto (Sin explorar codebase)
```typescript
// Crear nueva interface sin revisar las existentes
interface EnhancedFlashcardData {
  // Duplicar campos existentes...
}
```

### ✅ Enfoque Correcto (Después de explorar codebase)
```typescript
// Extender interface existente encontrada en src/types/index.ts
interface FlashcardData extends BaseLearningData {
  // Campos existentes...
  // Nuevos campos opcionales:
  contextualTips?: string[];
  memoryAids?: string[];
}
```

## Beneficios de Este Enfoque

1. **Eficiencia** - Menos iteraciones y correcciones
2. **Consistencia** - Soluciones alineadas con la arquitectura
3. **Calidad** - Aprovecha patrones probados y establecidos
4. **Mantenibilidad** - Código coherente y predecible
5. **Respeto** - Honra el trabajo y decisiones previas del desarrollador

## Aplicación en Diferentes Tipos de Tareas

### Specs y Features
- Explorar módulos relacionados antes de diseñar
- Identificar patrones de datos existentes
- Verificar componentes reutilizables

### Bug Fixes
- Entender el contexto completo del problema
- Verificar si hay patrones similares ya resueltos
- Mantener consistencia con soluciones existentes

### Refactoring
- Mapear todas las dependencias antes de cambiar
- Identificar oportunidades de reutilización
- Preservar funcionalidad existente

## Recordatorio Final

**El código existente es la documentación más precisa del proyecto.** 
Siempre empezar por ahí antes de proponer cambios o nuevas funcionalidades.