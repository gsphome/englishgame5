# Scripts de Despliegue

> **Nota**: Los scripts de deploy manual han sido consolidados en el flujo de desarrollo principal.

## Flujo de Despliegue Actual

El despliegue ahora se maneja automáticamente a través del flujo de desarrollo:

```bash
# Flujo completo con despliegue automático
npm run build:full

# Flujo rápido sin tests (también despliega)
npm run build:light
```

## Cómo Funciona

1. **`build:full`** ejecuta todos los pipelines (quality, security, build)
2. **Commit automático** con AI y push
3. **GitHub Actions** se dispara automáticamente con el push
4. **CD Deploy** se ejecuta automáticamente si todos los pipelines pasan

## Ventajas del Nuevo Flujo

- ✅ **Simplificado**: Un solo comando para todo
- ✅ **Automático**: No requiere intervención manual
- ✅ **Seguro**: Solo despliega si pasan todas las validaciones
- ✅ **Monitoreo**: Incluye seguimiento de GitHub Actions

## Comandos Disponibles

```bash
# Desarrollo completo (recomendado)
npm run build:full

# Desarrollo rápido (sin tests)
npm run build:light

# Solo build local
npm run build

# Monitoreo de GitHub Actions
npm run gh:status
npm run gh:current
npm run gh:watch
```