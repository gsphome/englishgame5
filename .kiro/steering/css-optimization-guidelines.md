# CSS Optimization Guidelines

## 🎯 REGLA CRÍTICA: esbuild > cssnano para este proyecto

**APRENDIZAJE CLAVE**: Para arquitectura BEM pura, esbuild supera significativamente a cssnano.

## 📊 Datos Comprobados (Oct 2025)

| Herramienta | Bundle CSS | Gzip | Build Time | Resultado |
|-------------|------------|------|------------|-----------|
| **esbuild** | 283 KB | 36.8 KB | 9s | ✅ ÓPTIMO |
| cssnano | 420 KB | 53.6 KB | 19s | ❌ PEOR |

**Mejora con esbuild**: -33% tamaño, -31% gzip, +58% velocidad

## ⚙️ Configuración Recomendada

### ✅ USAR - Vite Config:
```typescript
// config/vite.config.ts
build: {
  cssMinify: 'esbuild',  // ✅ Mejor para BEM puro
  cssCodeSplit: true,
}
```

### ✅ USAR - PostCSS Config:
```javascript
// config/postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
    // cssnano disabled - esbuild provides better optimization
  }
}
```

## 🚨 EVITAR

### ❌ NO USAR cssnano con BEM puro:
```javascript
// ❌ Configuración que empeora performance
cssnano: {
  preset: ['default', { ... }]  // Resulta en bundles más grandes
}
```

## 🔍 Por Qué esbuild Gana

1. **Mejor integración**: Nativo en Vite, optimizado para ES modules
2. **BEM-friendly**: Maneja mejor selectores largos y repetitivos
3. **Velocidad**: 2x más rápido en builds
4. **Simplicidad**: Menos configuración, mejores resultados

## 🛡️ Validación

Antes de cambiar CSS optimization:

```bash
# 1. Build actual y anotar tamaños
npm run build

# 2. Cambiar configuración
# 3. Build nuevo y comparar

# 4. Si empeora, revertir inmediatamente
```

## 💡 Regla de Oro

**"Para BEM puro: esbuild CSS minification. No experimentar con cssnano sin datos concretos."**

Prioridad: Performance comprobada > Configuraciones complejas.