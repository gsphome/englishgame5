# Configuración y Documentación

Archivos de configuración y documentación auxiliar.

## Scripts Disponibles

### cmd.txt
Comandos de referencia y configuración

```bash
node scripts/config/cmd.txt
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
