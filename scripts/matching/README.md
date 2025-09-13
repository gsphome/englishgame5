# Scripts de Matching

Esta carpeta contiene herramientas especializadas para el mantenimiento y optimización de los módulos de matching del sistema de aprendizaje.

## Scripts Disponibles

### 🔧 fix-matching-duplicates.js
**Propósito**: Detecta y corrige automáticamente duplicados en las opciones left y right de los módulos de matching.

**Uso**:
```bash
node scripts/matching/fix-matching-duplicates.js
```

**Funcionalidades**:
- Detecta duplicados en opciones left y right
- Genera variaciones contextuales inteligentes
- Crea backups automáticos antes de modificar
- Genera reporte detallado de cambios realizados

### ✅ validate-matching-data.js
**Propósito**: Valida la calidad e integridad de todos los datos de matching.

**Uso**:
```bash
node scripts/matching/validate-matching-data.js
```

**Funcionalidades**:
- Verifica que no haya duplicados
- Valida estructura de datos
- Genera estadísticas de calidad
- Reporta problemas de integridad

### 🚀 optimize-matching-component.js
**Propósito**: Optimiza el componente MatchingComponent para mejor rendimiento y UX.

**Uso**:
```bash
node scripts/matching/optimize-matching-component.js
```

**Funcionalidades**:
- Mejora algoritmos de shuffle
- Añade validación de datos únicos
- Optimiza feedback visual
- Documenta mejoras aplicadas

### 🎯 matching-tools.js
**Propósito**: Script principal que permite ejecutar todas las herramientas desde un solo comando.

**Uso**:
```bash
node scripts/matching/matching-tools.js [comando]
```

**Comandos disponibles**:
- `validate` - Ejecuta validación de datos
- `fix` - Corrige duplicados encontrados
- `optimize` - Optimiza el componente
- `all` - Ejecuta todos los procesos en secuencia
- `help` - Muestra ayuda detallada

## Flujo de Trabajo Recomendado

### 1. Validación Regular
```bash
# Ejecutar semanalmente o antes de releases
node scripts/matching/validate-matching-data.js
```

### 2. Corrección de Problemas
```bash
# Si se encuentran duplicados
node scripts/matching/fix-matching-duplicates.js
```

### 3. Optimización (Opcional)
```bash
# Para mejoras de rendimiento
node scripts/matching/optimize-matching-component.js
```

### 4. Proceso Completo
```bash
# Ejecuta todo el flujo automáticamente
node scripts/matching/matching-tools.js all
```

## Archivos Generados

### Reportes
- `local/informes/matching-duplicates-report.json` - Reporte de duplicados corregidos
- `local/informes/matching-validation-report.json` - Reporte de validación de calidad

### Backups
- `*.backup` - Backups automáticos de archivos modificados

## Estructura de Datos

Los scripts trabajan con módulos de matching que tienen la siguiente estructura:

```json
[
  {
    "left": "Término o pregunta",
    "right": "Definición o respuesta",
    "explanation": "Explicación opcional del match"
  }
]
```

## Configuración

Los scripts utilizan las siguientes rutas por defecto:
- **Datos**: `public/src/assets/data/`
- **Módulos**: `public/src/assets/data/learningModules.json`
- **Reportes**: `local/informes/`
- **Componente**: `src/components/learning/MatchingComponent.tsx`

## Solución de Problemas

### Error: "Archivo no encontrado"
- Verificar que las rutas en `learningModules.json` sean correctas
- Asegurar que los archivos de datos existan en las ubicaciones especificadas

### Error: "Datos inválidos"
- Verificar que los archivos JSON tengan formato válido
- Asegurar que cada item tenga campos `left` y `right`

### Error: "Permisos de escritura"
- Verificar permisos de escritura en las carpetas de datos
- Ejecutar con permisos adecuados si es necesario

## Contribución

Para añadir nuevas funcionalidades:
1. Crear el script en esta carpeta
2. Añadir documentación en este README
3. Actualizar `matching-tools.js` si es necesario
4. Probar con datos de ejemplo

## Historial de Cambios

- **v1.0** - Scripts iniciales de detección y corrección de duplicados
- **v1.1** - Añadida validación de calidad de datos
- **v1.2** - Optimización de componente y herramientas unificadas
#
## 🔍 validate-all-modules.js
**Propósito**: Valida que todos los módulos de aprendizaje se puedan cargar correctamente.

**Uso**:
```bash
node scripts/matching/validate-all-modules.js
```

**Funcionalidades**:
- Verifica todos los tipos de módulos (flashcard, quiz, sorting, completion, matching)
- Valida estructura de datos y formato JSON
- Genera estadísticas por tipo y nivel
- Reporta módulos problemáticos con detalles específicos

### 🔧 normalize-data-structures.js
**Propósito**: Normaliza las estructuras de datos de todos los módulos a los formatos esperados.

**Uso**:
```bash
node scripts/matching/normalize-data-structures.js
```

**Funcionalidades**:
- Convierte diferentes formatos a estructuras estándar
- Normaliza flashcards (en/es → front/back)
- Normaliza sorting (objetos complejos → arrays simples)
- Crea backups automáticos antes de modificar
- Reporta cambios realizados

### 🛠️ fix-module-paths.js
**Propósito**: Corrige las rutas de los módulos para que apunten a las subcarpetas correctas.

**Uso**:
```bash
node scripts/matching/fix-module-paths.js
```

**Funcionalidades**:
- Detecta rutas incorrectas en learningModules.json
- Actualiza rutas para incluir subcarpetas (a1/, a2/, etc.)
- Verifica que los archivos existan en las nuevas rutas
- Crea backup del archivo de configuración