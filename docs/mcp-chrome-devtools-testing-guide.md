# MCP Chrome DevTools - Guía de Testing para FluentFlow

## 📋 Resumen

Esta guía documenta los procedimientos y mejores prácticas para realizar testing automatizado de aplicaciones web usando MCP Chrome DevTools, basada en pruebas exitosas realizadas en FluentFlow.

## 🔧 Configuración Inicial

### 1. Configuración MCP

Archivo: `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--channel=stable",
        "--headless=true",
        "--isolated=true"
      ]
    }
  }
}
```

**⚠️ Importante**: Usar `--channel=stable` en lugar de `--channel=canary` para mayor compatibilidad.

### 2. Verificación de Funcionamiento

```javascript
// Test básico de conectividad
mcp_chrome_devtools_list_pages()
```

## 🚀 Procedimientos de Testing

### 1. Navegación Inicial

```javascript
// Navegar a la aplicación
mcp_chrome_devtools_new_page({
  url: "http://localhost:5173/englishgame5/"
})

// Esperar carga completa
mcp_chrome_devtools_wait_for({
  text: "FluentFlow",
  timeout: 5000
})
```

### 2. Toma de Snapshots

```javascript
// Snapshot para análisis de elementos
mcp_chrome_devtools_take_snapshot()

// Screenshot para documentación visual
mcp_chrome_devtools_take_screenshot()
```

### 3. Interacción con Elementos

#### Método Recomendado: Por UID
```javascript
// Usar UIDs del snapshot
mcp_chrome_devtools_click({
  uid: "elemento_uid"
})
```

#### Método Alternativo: JavaScript
```javascript
// Para elementos complejos o dinámicos
mcp_chrome_devtools_evaluate_script({
  function: `() => {
    const element = document.querySelector('.clase-especifica');
    if (element) {
      element.click();
      return "Clicked successfully";
    }
    return "Element not found";
  }`
})
```

## 🎯 Casos de Uso Específicos

### Testing de Modos de Aprendizaje

#### 1. Activación del Modo Desarrollador

```javascript
// Abrir menú hamburguesa
mcp_chrome_devtools_click({ uid: "menu_uid" })

// Ir a Advanced Settings
mcp_chrome_devtools_click({ uid: "settings_uid" })

// Activar Dev Mode
mcp_chrome_devtools_click({ uid: "dev_mode_checkbox_uid" })

// Hacer cambio adicional para activar botón Save
mcp_chrome_devtools_evaluate_script({
  function: `() => {
    const themeSelect = document.querySelector('select[value*="Light"]');
    if (themeSelect) {
      themeSelect.value = "Dark";
      themeSelect.dispatchEvent(new Event('change'));
      return "Theme changed to trigger save";
    }
    return "Theme select not found";
  }`
})

// Guardar cambios (el botón Close cambia a Save)
mcp_chrome_devtools_click({ uid: "save_button_uid" })
```

#### 2. Acceso a Módulos Desbloqueados

```javascript
// Buscar módulos desbloqueados
mcp_chrome_devtools_evaluate_script({
  function: `() => {
    const modules = document.querySelectorAll('.progression-dashboard__module--unlocked');
    for (let module of modules) {
      if (module.textContent.includes('Basic Grammar')) {
        module.click();
        return "Clicked Basic Grammar module";
      }
    }
    return "Module not found";
  }`
})

// Esperar carga del módulo
mcp_chrome_devtools_wait_for({
  text: "Match",
  timeout: 5000
})
```

### Medición de Tiempos de Carga

```javascript
// Marcar tiempo inicial
const startTime = Date.now();

// Realizar acción
mcp_chrome_devtools_click({ uid: "module_uid" })

// Esperar elemento específico del módulo cargado
mcp_chrome_devtools_wait_for({
  text: "elemento_cargado",
  timeout: 10000
})

// Calcular tiempo transcurrido
const loadTime = Date.now() - startTime;
console.log(`Tiempo de carga: ${loadTime}ms`);
```

## 🔍 Técnicas de Debugging

### 1. Inspección de Elementos

```javascript
// Buscar elementos por contenido
mcp_chrome_devtools_evaluate_script({
  function: `() => {
    const elements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.includes('texto_buscado')
    );
    return elements.map(el => ({
      tagName: el.tagName,
      className: el.className,
      textContent: el.textContent.substring(0, 100),
      clickable: el.onclick !== null || el.style.cursor === 'pointer'
    }));
  }`
})
```

### 2. Verificación de Estados

```javascript
// Verificar si modo dev está activo
mcp_chrome_devtools_evaluate_script({
  function: `() => {
    const devIndicator = document.querySelector('*:contains("🔧 DEV")');
    return devIndicator ? "Dev mode active" : "Dev mode inactive";
  }`
})
```

### 3. Búsqueda de Botones Dinámicos

```javascript
// Buscar botones que cambian de texto
mcp_chrome_devtools_evaluate_script({
  function: `() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.map(btn => ({
      text: btn.textContent.trim(),
      visible: btn.offsetParent !== null,
      disabled: btn.disabled,
      className: btn.className
    })).filter(btn => 
      btn.text.includes('Save') || 
      btn.text.includes('Close') || 
      btn.text.includes('Continue')
    );
  }`
})
```

## 📊 Patrones de Testing Exitosos

### 1. Flujo de Testing Completo

```javascript
// 1. Navegación inicial
mcp_chrome_devtools_new_page({ url: "app_url" })

// 2. Verificación de carga
mcp_chrome_devtools_wait_for({ text: "app_title" })

// 3. Configuración (si es necesaria)
// - Activar modo dev
// - Configurar preferencias

// 4. Testing de funcionalidades
// - Navegar por menús
// - Probar cada modo/módulo
// - Medir tiempos de respuesta

// 5. Documentación
// - Screenshots de estados importantes
// - Snapshots para análisis posterior
```

### 2. Manejo de Errores

```javascript
// Timeout personalizado para elementos lentos
try {
  await mcp_chrome_devtools_wait_for({
    text: "elemento_lento",
    timeout: 10000
  });
} catch (error) {
  console.log("Elemento no encontrado, continuando con alternativa...");
  // Estrategia alternativa
}
```

### 3. Navegación Entre Vistas

```javascript
// Cambiar entre vistas de la aplicación
mcp_chrome_devtools_click({ uid: "progression_view_uid" })
mcp_chrome_devtools_click({ uid: "list_view_uid" })

// Verificar cambio de vista
mcp_chrome_devtools_take_snapshot()
```

## ⚠️ Limitaciones y Consideraciones

### 1. Diferencias de Vista

- El MCP puede ver una vista diferente a la del usuario
- Siempre verificar con screenshots cuando sea necesario
- Usar múltiples métodos de localización de elementos

### 2. Elementos Dinámicos

- Los UIDs pueden cambiar entre snapshots
- Usar selectores CSS como respaldo
- Implementar esperas explícitas para contenido dinámico

### 3. Estado de la Aplicación

- El modo desarrollador puede requerir recarga de página
- Verificar persistencia de configuraciones
- Documentar secuencia exacta de activación

## 🎯 Casos de Uso Recomendados

### Testing de Performance
- Medición de tiempos de carga de módulos
- Análisis de responsividad de la interfaz
- Verificación de transiciones suaves

### Testing de Funcionalidad
- Navegación completa por menús
- Verificación de todos los modos de aprendizaje
- Testing de formularios y controles

### Testing de Configuración
- Activación/desactivación de funciones
- Cambios de tema y preferencias
- Persistencia de configuraciones

## 📝 Plantilla de Reporte

```markdown
## Reporte de Testing - [Fecha]

### Configuración
- URL: http://localhost:5173/englishgame5/
- Modo Dev: ✅ Activado
- Browser: Chrome Stable (Headless)

### Resultados
| Funcionalidad | Tiempo de Carga | Estado | Observaciones |
|---------------|-----------------|--------|---------------|
| Módulo 1      | ~2-3s          | ✅     | Carga correcta |
| Módulo 2      | ~3-4s          | ✅     | Sin problemas |

### Problemas Encontrados
- Ninguno

### Recomendaciones
- Continuar con testing regular
```

## 🔄 Mantenimiento

### Actualización de Configuración
- Revisar periódicamente la configuración MCP
- Actualizar selectores si cambia la UI
- Documentar cambios en procedimientos

### Validación de Procedimientos
- Ejecutar tests de smoke regularmente
- Verificar compatibilidad con nuevas versiones
- Mantener documentación actualizada

---

**Nota**: Esta guía se basa en testing exitoso realizado en octubre 2024. Actualizar según evolución de la aplicación y herramientas MCP.