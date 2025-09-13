# Scripts de Análisis y Optimización

Herramientas para análisis de código, detección de duplicados y limpieza.

## Scripts Disponibles

### analyze-package.js
Analizador de package.json para detectar duplicaciones

```bash
node scripts/analysis/analyze-package.js
```

### cleanup.js
Limpiador de código no utilizado y optimizador

```bash
node scripts/analysis/cleanup.js
```

## Uso General

Todos los scripts en esta carpeta siguen las convenciones estándar del proyecto:
- Soporte para `--help` para mostrar ayuda
- Códigos de salida estándar (0 = éxito, 1 = error)
- Logging consistente con colores
- Manejo robusto de errores

## Dependencias

Los scripts utilizan las utilidades compartidas en `scripts/utils/`:
- `logger.js` - Sistema de logging consistente
- `git-utils.js` - Operaciones de Git compartidas
- `ai-analyzer.js` - Análisis inteligente de cambios
