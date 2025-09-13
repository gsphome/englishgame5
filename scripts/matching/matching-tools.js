#!/usr/bin/env node

/**
 * Herramienta principal para el mantenimiento de módulos de matching
 * Permite ejecutar todas las funciones de validación, corrección y optimización
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Muestra ayuda del comando
 */
function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}🎯 Herramientas de Matching${colors.reset}

${colors.bright}Uso:${colors.reset}
  node scripts/matching/matching-tools.js [comando]

${colors.bright}Comandos disponibles:${colors.reset}
  ${colors.green}validate${colors.reset}      Valida la calidad de todos los datos de matching
  ${colors.yellow}fix${colors.reset}           Detecta y corrige duplicados automáticamente
  ${colors.blue}optimize${colors.reset}       Optimiza el componente MatchingComponent
  ${colors.magenta}all${colors.reset}           Ejecuta todos los procesos en secuencia
  ${colors.cyan}status${colors.reset}        Muestra el estado actual de los datos
  ${colors.bright}validate-all${colors.reset}  Valida todos los módulos del sistema
  ${colors.bright}normalize${colors.reset}     Normaliza estructuras de datos
  ${colors.bright}fix-paths${colors.reset}     Corrige rutas de módulos
  ${colors.bright}help${colors.reset}          Muestra esta ayuda

${colors.bright}Ejemplos:${colors.reset}
  node scripts/matching/matching-tools.js validate
  node scripts/matching/matching-tools.js fix
  node scripts/matching/matching-tools.js all

${colors.bright}Flujo recomendado:${colors.reset}
  1. ${colors.cyan}status${colors.reset}   - Verificar estado actual
  2. ${colors.green}validate${colors.reset} - Validar calidad de datos
  3. ${colors.yellow}fix${colors.reset}      - Corregir problemas encontrados
  4. ${colors.blue}optimize${colors.reset}  - Aplicar optimizaciones (opcional)
`);
}

/**
 * Ejecuta un script y maneja errores
 */
function executeScript(scriptName, description) {
  try {
    console.log(`${colors.bright}🚀 ${description}...${colors.reset}\n`);
    
    const scriptPath = path.join(__dirname, scriptName);
    const result = execSync(`node "${scriptPath}"`, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log(`${colors.green}✅ ${description} completado exitosamente${colors.reset}\n`);
    return true;
    
  } catch (error) {
    console.error(`${colors.red}❌ Error en ${description}:${colors.reset}`);
    console.error(error.message);
    return false;
  }
}

/**
 * Muestra el estado actual de los datos
 */
function showStatus() {
  console.log(`${colors.cyan}${colors.bright}📊 Estado Actual de Datos de Matching${colors.reset}\n`);
  
  try {
    // Verificar archivos principales
    const modulesPath = 'public/src/assets/data/learningModules.json';
    const componentPath = 'src/components/learning/MatchingComponent.tsx';
    
    console.log(`${colors.bright}📁 Archivos principales:${colors.reset}`);
    console.log(`   Módulos: ${fs.existsSync(modulesPath) ? colors.green + '✅' : colors.red + '❌'} ${modulesPath}${colors.reset}`);
    console.log(`   Componente: ${fs.existsSync(componentPath) ? colors.green + '✅' : colors.red + '❌'} ${componentPath}${colors.reset}`);
    
    // Contar módulos de matching
    if (fs.existsSync(modulesPath)) {
      const modules = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));
      const matchingModules = modules.filter(m => m.learningMode === 'matching');
      
      console.log(`\n${colors.bright}📈 Estadísticas:${colors.reset}`);
      console.log(`   Total módulos: ${modules.length}`);
      console.log(`   Módulos matching: ${colors.cyan}${matchingModules.length}${colors.reset}`);
      
      // Verificar archivos de datos
      let existingFiles = 0;
      let totalItems = 0;
      
      matchingModules.forEach(module => {
        const dataPath = path.join('public', module.dataPath);
        if (fs.existsSync(dataPath)) {
          existingFiles++;
          try {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            totalItems += Array.isArray(data) ? data.length : 0;
          } catch (e) {
            // Archivo corrupto
          }
        }
      });
      
      console.log(`   Archivos de datos: ${colors.green}${existingFiles}${colors.reset}/${matchingModules.length}`);
      console.log(`   Total items: ${colors.cyan}${totalItems}${colors.reset}`);
    }
    
    // Verificar reportes recientes
    console.log(`\n${colors.bright}📋 Reportes recientes:${colors.reset}`);
    const reportsDir = 'local/informes';
    const reports = [
      'matching-validation-report.json',
      'matching-duplicates-report.json'
    ];
    
    reports.forEach(report => {
      const reportPath = path.join(reportsDir, report);
      if (fs.existsSync(reportPath)) {
        const stats = fs.statSync(reportPath);
        const age = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   ${report}: ${colors.green}✅${colors.reset} (${age} días)`);
      } else {
        console.log(`   ${report}: ${colors.yellow}⚠️  No encontrado${colors.reset}`);
      }
    });
    
  } catch (error) {
    console.error(`${colors.red}❌ Error obteniendo estado:${colors.reset}`, error.message);
  }
  
  console.log(`\n${colors.bright}💡 Recomendación:${colors.reset} Ejecuta 'validate' para verificar la calidad de los datos\n`);
}

/**
 * Ejecuta todos los procesos en secuencia
 */
async function executeAll() {
  console.log(`${colors.cyan}${colors.bright}🎯 Ejecutando proceso completo de mantenimiento${colors.reset}\n`);
  
  const steps = [
    { script: 'validate-matching-data.js', description: 'Validación de datos' },
    { script: 'fix-matching-duplicates.js', description: 'Corrección de duplicados' },
    { script: 'validate-matching-data.js', description: 'Re-validación post-corrección' }
  ];
  
  let allSuccess = true;
  
  for (const step of steps) {
    const success = executeScript(step.script, step.description);
    if (!success) {
      allSuccess = false;
      console.log(`${colors.yellow}⚠️  Continuando con el siguiente paso...${colors.reset}\n`);
    }
  }
  
  if (allSuccess) {
    console.log(`${colors.green}${colors.bright}🎉 Proceso completo ejecutado exitosamente!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️  Proceso completado con algunas advertencias${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}📊 Revisa los reportes en:${colors.reset}`);
  console.log(`   local/informes/matching-validation-report.json`);
  console.log(`   local/informes/matching-duplicates-report.json`);
}

/**
 * Función principal
 */
async function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  console.log(`${colors.cyan}${colors.bright}🛠️  Herramientas de Matching${colors.reset}\n`);
  
  switch (command.toLowerCase()) {
    case 'validate':
      executeScript('validate-matching-data.js', 'Validación de datos de matching');
      break;
      
    case 'fix':
      executeScript('fix-matching-duplicates.js', 'Corrección de duplicados');
      break;
      
    case 'optimize':
      executeScript('optimize-matching-component.js', 'Optimización del componente');
      break;
      
    case 'status':
      showStatus();
      break;
      
    case 'all':
      await executeAll();
      break;
      
    default:
      console.log(`${colors.red}❌ Comando desconocido: ${command}${colors.reset}\n`);
      showHelp();
      process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`${colors.red}❌ Error fatal:${colors.reset}`, error.message);
    process.exit(1);
  });
}

export { executeScript, showStatus, executeAll };