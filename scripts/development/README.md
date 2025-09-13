# Scripts de Desarrollo

Herramientas para el flujo de desarrollo, testing y validación.

## Scripts Disponibles

### dev-tools.js
Orquestador unificado del flujo de desarrollo

```bash
node scripts/development/dev-tools.js
```

### test-runner.js
Ejecutor de tests unificado para todos los scripts

```bash
node scripts/development/test-runner.js
```

### validate-integration.js
Validador de integración holística del sistema

```bash
node scripts/development/validate-integration.js
```

### toggle-cache-logs.js
Alternador de logs de caché para debugging

```bash
node scripts/development/toggle-cache-logs.js
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
