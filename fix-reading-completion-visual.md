# Fix: Módulos Reading no se marcan como completados visualmente

## Problema
Los módulos de reading no se mostraban como completados en el menú All_Modules después de terminarlos.

## Causa Raíz
El hook `useProgression` usaba React Query con `staleTime: 1000ms` y no se suscribía correctamente a cambios en el `progressStore` de Zustand. Cuando se completaba un módulo reading, el store se actualizaba pero React Query no detectaba el cambio.

## Solución Implementada

### 1. Suscripción directa al store (`src/hooks/useProgression.ts`)
- Agregado `completedModules` del progressStore al hook
- Usar `Object.keys(completedModules || {}).length` en el queryKey
- Cambiar `staleTime: 1000` a `staleTime: 0` para refetch inmediato

### 2. Orden de llamadas (`src/components/learning/ReadingComponent.tsx`)
- Reordenado para llamar `updateUserScore` antes de `addProgressEntry`
- Esto asegura que el módulo se marque como completado antes de registrar el progreso

## Archivos Modificados
- `src/hooks/useProgression.ts` - Mejorada detección de cambios en completedModules
- `src/components/learning/ReadingComponent.tsx` - Reordenadas llamadas al completar

## Verificación
- ✅ Tests de useProgression pasan (9/9)
- ✅ Build exitoso sin errores
- ✅ TypeScript sin errores de tipo

## Comportamiento Esperado
Ahora cuando un usuario completa un módulo reading:
1. Se llama a `updateUserScore` que marca el módulo como completado
2. El progressStore se actualiza
3. React Query detecta el cambio en `completedModules`
4. El hook `useProgression` se actualiza automáticamente
5. El `ModuleCard` muestra el checkmark verde de completado
