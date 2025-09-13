#!/usr/bin/env node

/**
 * Script para reorganizar todos los scripts en carpetas temáticas
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Definir la nueva estructura organizacional
const scriptOrganization = {
  // Scripts de desarrollo y flujo de trabajo
  'development': [
    'dev-tools.js',
    'test-runner.js',
    'validate-integration.js',
    'toggle-cache-logs.js'
  ],
  
  // Scripts de Git y control de versiones
  'git': [
    'smart-commit.js',
    'gh-status.js',
    'commit.sh'
  ],
  
  // Scripts de análisis y optimización
  'analysis': [
    'analyze-package.js',
    'cleanup.js'
  ],
  
  // Scripts de despliegue y producción
  'deployment': [
    'deploy.js'
  ],
  
  // Archivos de configuración y documentación
  'config': [
    'cmd.txt'
  ]
};

/**
 * Crear las carpetas necesarias
 */
function createDirectories() {
  console.log('📁 Creando estructura de carpetas...\n');
  
  Object.keys(scriptOrganization).forEach(folder => {
    const folderPath = path.join('scripts', folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`✅ Creada carpeta: ${folderPath}`);
    }
  });
  
  console.log('');
}

/**
 * Mover scripts a sus carpetas correspondientes
 */
function moveScripts() {
  console.log('📦 Moviendo scripts a sus carpetas temáticas...\n');
  
  Object.entries(scriptOrganization).forEach(([folder, scripts]) => {
    scripts.forEach(script => {
      const sourcePath = path.join('scripts', script);
      const targetPath = path.join('scripts', folder, script);
      
      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, targetPath);
        console.log(`✅ Movido: ${script} → ${folder}/`);
      } else {
        console.log(`⚠️  No encontrado: ${script}`);
      }
    });
  });
  
  console.log('');
}

/**
 * Crear READMEs para cada carpeta
 */
function createReadmes() {
  console.log('📝 Creando documentación para cada carpeta...\n');
  
  const readmeContent = {
    'development': {
      title: 'Scripts de Desarrollo',
      description: 'Herramientas para el flujo de desarrollo, testing y validación.',
      scripts: {
        'dev-tools.js': 'Orquestador unificado del flujo de desarrollo',
        'test-runner.js': 'Ejecutor de tests unificado para todos los scripts',
        'validate-integration.js': 'Validador de integración holística del sistema',
        'toggle-cache-logs.js': 'Alternador de logs de caché para debugging'
      }
    },
    
    'git': {
      title: 'Scripts de Git y Control de Versiones',
      description: 'Herramientas para gestión de Git, commits inteligentes y estado de repositorio.',
      scripts: {
        'smart-commit.js': 'Generador de mensajes de commit con IA',
        'gh-status.js': 'Verificador de estado de GitHub Actions',
        'commit.sh': 'Script de commit automatizado'
      }
    },
    
    'analysis': {
      title: 'Scripts de Análisis y Optimización',
      description: 'Herramientas para análisis de código, detección de duplicados y limpieza.',
      scripts: {
        'analyze-package.js': 'Analizador de package.json para detectar duplicaciones',
        'cleanup.js': 'Limpiador de código no utilizado y optimizador'
      }
    },
    
    'deployment': {
      title: 'Scripts de Despliegue',
      description: 'Herramientas para despliegue y gestión de producción.',
      scripts: {
        'deploy.js': 'Disparador manual del pipeline de despliegue'
      }
    },
    
    'config': {
      title: 'Configuración y Documentación',
      description: 'Archivos de configuración y documentación auxiliar.',
      scripts: {
        'cmd.txt': 'Comandos de referencia y configuración'
      }
    }
  };
  
  Object.entries(readmeContent).forEach(([folder, content]) => {
    const readmePath = path.join('scripts', folder, 'README.md');
    
    const readmeText = `# ${content.title}

${content.description}

## Scripts Disponibles

${Object.entries(content.scripts).map(([script, desc]) => 
  `### ${script}
${desc}

\`\`\`bash
node scripts/${folder}/${script}
\`\`\``
).join('\n\n')}

## Uso General

Todos los scripts en esta carpeta siguen las convenciones estándar del proyecto:
- Soporte para \`--help\` para mostrar ayuda
- Códigos de salida estándar (0 = éxito, 1 = error)
- Logging consistente con colores
- Manejo robusto de errores

## Dependencias

Los scripts utilizan las utilidades compartidas en \`scripts/utils/\`:
- \`logger.js\` - Sistema de logging consistente
- \`git-utils.js\` - Operaciones de Git compartidas
- \`ai-analyzer.js\` - Análisis inteligente de cambios
`;
    
    fs.writeFileSync(readmePath, readmeText);
    console.log(`✅ Creado README: ${folder}/README.md`);
  });
  
  console.log('');
}

/**
 * Actualizar el README principal
 */
function updateMainReadme() {
  console.log('📚 Actualizando README principal...\n');
  
  const mainReadmeContent = `# Scripts de Utilidades

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

### Herramientas de Matching
\`\`\`bash
node scripts/matching/matching-tools.js status
node scripts/matching/matching-tools.js all
\`\`\`

### Desarrollo
\`\`\`bash
node scripts/development/dev-tools.js
node scripts/development/test-runner.js
\`\`\`

### Git y Commits
\`\`\`bash
node scripts/git/smart-commit.js
node scripts/git/gh-status.js
\`\`\`

### Análisis y Limpieza
\`\`\`bash
node scripts/analysis/analyze-package.js
node scripts/analysis/cleanup.js
\`\`\`

### Despliegue
\`\`\`bash
node scripts/deployment/deploy.js
\`\`\`

## Convenciones

### Estructura de Scripts
- Cada categoría tiene su propia carpeta
- Scripts principales incluyen ayuda integrada (\`--help\`)
- Utilidades compartidas en \`utils/\`
- Documentación específica en cada carpeta

### Nomenclatura
- \`*-tools.js\` - Herramientas principales unificadas
- \`validate-*.js\` - Scripts de validación
- \`fix-*.js\` - Scripts de corrección
- \`analyze-*.js\` - Scripts de análisis

### Salida y Reportes
- Uso de colores para mejor legibilidad
- Reportes detallados en \`local/informes/\`
- Backups automáticos cuando sea necesario
- Logs estructurados con timestamps

## Desarrollo

### Añadir Nuevas Herramientas
1. Identificar la categoría apropiada
2. Crear el script en la carpeta correspondiente
3. Seguir las convenciones de nomenclatura
4. Actualizar el README de la carpeta
5. Usar utilidades compartidas de \`utils/\`

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
`;
  
  fs.writeFileSync('scripts/README.md', mainReadmeContent);
  console.log('✅ README principal actualizado');
  console.log('');
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Reorganizando estructura de scripts...\n');
  
  try {
    createDirectories();
    moveScripts();
    createReadmes();
    updateMainReadme();
    
    console.log('🎉 Reorganización completada exitosamente!\n');
    console.log('📋 Nueva estructura:');
    console.log('   scripts/');
    console.log('   ├── analysis/     - Análisis y optimización');
    console.log('   ├── config/       - Configuración');
    console.log('   ├── deployment/   - Despliegue');
    console.log('   ├── development/  - Desarrollo y testing');
    console.log('   ├── git/          - Control de versiones');
    console.log('   ├── matching/     - Módulos de matching');
    console.log('   └── utils/        - Utilidades compartidas');
    console.log('');
    console.log('💡 Cada carpeta incluye su propio README con documentación específica.');
    
  } catch (error) {
    console.error('❌ Error durante la reorganización:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scriptOrganization };