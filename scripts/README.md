# Scripts de Utilidades

Esta carpeta contiene herramientas y scripts organizados por funcionalidad para el mantenimiento y optimización del sistema de aprendizaje.

## Estructura Organizacional

### 📁 analysis/
Herramientas de análisis de código y optimización.
- Análisis de package.json
- Limpieza de código no utilizado
- Detección de duplicados

### 📁 deployment/
Scripts de despliegue y producción.
- Disparadores de pipeline
- Gestión de releases
- Configuración de producción

### 📁 development/
Herramientas de desarrollo y testing.
- Orquestador de flujo de desarrollo
- Ejecutor de tests unificado
- Validación de integración
- Debugging y logs

### 📁 git/
Gestión de Git y control de versiones.
- Commits inteligentes con IA
- Estado de GitHub Actions
- Automatización de Git

### 📁 matching/
Herramientas especializadas para módulos de matching.
- Corrección de duplicados
- Validación de calidad
- Optimización de componentes

### 📁 utils/
Utilidades compartidas por todos los scripts.
- Sistema de logging
- Operaciones de Git
- Análisis con IA

### 📁 config/
Configuración y documentación auxiliar.
- Comandos de referencia
- Configuraciones específicas

## Uso Rápido

### 🎛️ Herramienta Unificada (Recomendado)
```bash
# Ver todas las herramientas disponibles
node scripts/tools.js list

# Estado general del proyecto
node scripts/tools.js status

# Herramientas de matching
node scripts/tools.js matching status
node scripts/tools.js matching validate
node scripts/tools.js matching all

# Desarrollo
node scripts/tools.js development quality
node scripts/tools.js development commit

# Git y commits
node scripts/tools.js git smart-commit
node scripts/tools.js git gh-status

# Análisis
node scripts/tools.js analysis analyze-package
node scripts/tools.js analysis cleanup
```

### 📁 Acceso Directo por Carpeta
```bash
# Herramientas de Matching
node scripts/matching/matching-tools.js status
node scripts/matching/matching-tools.js all

# Desarrollo
node scripts/development/dev-tools.js
node scripts/development/test-runner.js

# Git y Commits
node scripts/git/smart-commit.js
node scripts/git/gh-status.js

# Análisis y Limpieza
node scripts/analysis/analyze-package.js
node scripts/analysis/cleanup.js

# Despliegue
node scripts/deployment/deploy.js
```

## Convenciones

### Estructura de Scripts
- Cada categoría tiene su propia carpeta
- Scripts principales incluyen ayuda integrada (`--help`)
- Utilidades compartidas en `utils/`
- Documentación específica en cada carpeta

### Nomenclatura
- `*-tools.js` - Herramientas principales unificadas
- `validate-*.js` - Scripts de validación
- `fix-*.js` - Scripts de corrección
- `analyze-*.js` - Scripts de análisis

### Salida y Reportes
- Uso de colores para mejor legibilidad
- Reportes detallados en `local/informes/`
- Backups automáticos cuando sea necesario
- Logs estructurados con timestamps

## Desarrollo

### Añadir Nuevas Herramientas
1. Identificar la categoría apropiada
2. Crear el script en la carpeta correspondiente
3. Seguir las convenciones de nomenclatura
4. Actualizar el README de la carpeta
5. Usar utilidades compartidas de `utils/`

### Estándares de Código
- ES modules (import/export)
- Manejo de errores robusto
- Validación de entrada
- Documentación inline
- Tests cuando sea apropiado

## Historial

- **v1.0** - Scripts iniciales dispersos
- **v1.1** - Organización inicial con matching/
- **v1.2** - Reorganización completa por funcionalidad
- **v1.3** - Herramientas unificadas y documentación completa
