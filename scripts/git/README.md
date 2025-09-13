# Scripts de Git y Control de Versiones

Herramientas para gestión de Git, commits inteligentes y estado de repositorio.

## Scripts Disponibles

### smart-commit.js
Generador de mensajes de commit con IA

```bash
node scripts/git/smart-commit.js
```

### gh-status.js
Verificador de estado de GitHub Actions

```bash
node scripts/git/gh-status.js
```

### commit.sh
Script de commit automatizado

```bash
node scripts/git/commit.sh
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
