# Scripts de Despliegue

Herramientas para despliegue y gestión de producción.

## Scripts Disponibles

### deploy.js
Disparador manual del pipeline de despliegue

```bash
node scripts/deployment/deploy.js
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
