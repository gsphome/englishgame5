#!/usr/bin/env node

/**
 * Herramienta principal unificada para acceder a todos los scripts organizados
 * Punto de entrada único para todas las funcionalidades
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

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
 * Configuración de herramientas disponibles
 */
const toolCategories = {
    matching: {
        name: 'Módulos de Matching',
        description: 'Herramientas para validación y corrección de datos de matching',
        icon: '🎯',
        script: 'scripts/matching/matching-tools.js',
        commands: ['status', 'validate', 'fix', 'all']
    },
    development: {
        name: 'Desarrollo',
        description: 'Flujo de desarrollo, testing y validación',
        icon: '🛠️',
        script: 'scripts/development/dev-tools.js',
        commands: ['quality', 'build', 'test', 'commit', 'all']
    },
    git: {
        name: 'Git y Versiones',
        description: 'Commits inteligentes y estado de repositorio',
        icon: '📝',
        mainScripts: {
            'smart-commit': 'scripts/git/smart-commit.js',
            'gh-status': 'scripts/git/gh-status.js'
        }
    },
    analysis: {
        name: 'Análisis y Optimización',
        description: 'Análisis de código y limpieza',
        icon: '🔍',
        mainScripts: {
            'analyze-package': 'scripts/analysis/analyze-package.js',
            'cleanup': 'scripts/analysis/cleanup.js'
        }
    },
    deployment: {
        name: 'Despliegue',
        description: 'Herramientas de despliegue y producción',
        icon: '🚀',
        script: 'scripts/deployment/deploy.js'
    }
};

/**
 * Muestra la ayuda principal
 */
function showHelp() {
    console.log(`
${colors.cyan}${colors.bright}🎛️  Herramientas Unificadas del Proyecto${colors.reset}

${colors.bright}Uso:${colors.reset}
  node scripts/tools.js [categoría] [comando] [opciones]

${colors.bright}Categorías disponibles:${colors.reset}
`);

    Object.entries(toolCategories).forEach(([key, category]) => {
        console.log(`  ${colors.green}${category.icon} ${key.padEnd(12)}${colors.reset} ${category.description}`);
    });

    console.log(`
${colors.bright}Ejemplos de uso:${colors.reset}
  ${colors.cyan}node scripts/tools.js matching status${colors.reset}     # Estado de módulos matching
  ${colors.cyan}node scripts/tools.js development quality${colors.reset}  # Pipeline de calidad
  ${colors.cyan}node scripts/tools.js git smart-commit${colors.reset}     # Commit inteligente
  ${colors.cyan}node scripts/tools.js analysis cleanup${colors.reset}     # Limpieza de código

${colors.bright}Comandos especiales:${colors.reset}
  ${colors.yellow}list${colors.reset}                                    # Lista todas las herramientas
  ${colors.yellow}status${colors.reset}                                  # Estado general del proyecto
  ${colors.yellow}help${colors.reset}                                    # Muestra esta ayuda

${colors.bright}Acceso directo a herramientas principales:${colors.reset}
  ${colors.magenta}node scripts/tools.js matching${colors.reset}          # Herramienta de matching
  ${colors.magenta}node scripts/tools.js development${colors.reset}       # Herramientas de desarrollo
`);
}

/**
 * Lista todas las herramientas disponibles
 */
function listTools() {
    console.log(`${colors.cyan}${colors.bright}📋 Herramientas Disponibles${colors.reset}\n`);

    Object.entries(toolCategories).forEach(([key, category]) => {
        console.log(`${colors.bright}${category.icon} ${category.name}${colors.reset}`);
        console.log(`   ${category.description}\n`);

        if (category.script) {
            console.log(`   ${colors.green}Herramienta principal:${colors.reset} ${category.script}`);
            if (category.commands) {
                console.log(`   ${colors.blue}Comandos:${colors.reset} ${category.commands.join(', ')}`);
            }
        }

        if (category.mainScripts) {
            console.log(`   ${colors.green}Scripts disponibles:${colors.reset}`);
            Object.entries(category.mainScripts).forEach(([name, script]) => {
                console.log(`     ${colors.yellow}${name}${colors.reset}: ${script}`);
            });
        }

        console.log('');
    });
}

/**
 * Muestra el estado general del proyecto
 */
function showProjectStatus() {
    console.log(`${colors.cyan}${colors.bright}📊 Estado General del Proyecto${colors.reset}\n`);

    try {
        // Verificar estructura de scripts
        console.log(`${colors.bright}📁 Estructura de Scripts:${colors.reset}`);
        const scriptDirs = ['analysis', 'config', 'deployment', 'development', 'git', 'matching', 'utils'];
        scriptDirs.forEach(dir => {
            const dirPath = path.join('scripts', dir);
            const exists = fs.existsSync(dirPath);
            console.log(`   ${exists ? colors.green + '✅' : colors.red + '❌'} ${dir}/${colors.reset}`);
        });

        // Estado de matching (más importante)
        console.log(`\n${colors.bright}🎯 Estado de Matching:${colors.reset}`);
        try {
            const result = execSync('node scripts/matching/matching-tools.js status', {
                encoding: 'utf8',
                stdio: 'pipe'
            });
            console.log('   ✅ Herramientas de matching funcionando correctamente');
        } catch (error) {
            console.log('   ⚠️  Problema con herramientas de matching');
        }

        // Verificar package.json
        console.log(`\n${colors.bright}📦 Configuración:${colors.reset}`);
        const packageExists = fs.existsSync('package.json');
        console.log(`   ${packageExists ? colors.green + '✅' : colors.red + '❌'} package.json${colors.reset}`);

        if (packageExists) {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            console.log(`   Proyecto: ${pkg.name || 'Sin nombre'}`);
            console.log(`   Versión: ${pkg.version || 'Sin versión'}`);
        }

    } catch (error) {
        console.error(`${colors.red}❌ Error obteniendo estado:${colors.reset}`, error.message);
    }

    console.log(`\n${colors.bright}💡 Recomendaciones:${colors.reset}`);
    console.log('   • Ejecuta herramientas de matching regularmente');
    console.log('   • Usa el flujo de desarrollo para commits');
    console.log('   • Revisa análisis de código periódicamente');
}

/**
 * Ejecuta una herramienta específica
 */
function executeTool(category, command, args = []) {
    const categoryConfig = toolCategories[category];

    if (!categoryConfig) {
        console.error(`${colors.red}❌ Categoría desconocida: ${category}${colors.reset}`);
        console.log(`${colors.yellow}💡 Usa 'list' para ver categorías disponibles${colors.reset}`);
        return false;
    }

    try {
        let scriptPath;

        // Determinar qué script ejecutar
        if (categoryConfig.script) {
            scriptPath = categoryConfig.script;
        } else if (categoryConfig.mainScripts && command) {
            scriptPath = categoryConfig.mainScripts[command];
            if (!scriptPath) {
                console.error(`${colors.red}❌ Comando desconocido: ${command}${colors.reset}`);
                console.log(`${colors.yellow}💡 Comandos disponibles: ${Object.keys(categoryConfig.mainScripts).join(', ')}${colors.reset}`);
                return false;
            }
        } else {
            console.error(`${colors.red}❌ No se pudo determinar qué script ejecutar${colors.reset}`);
            return false;
        }

        // Construir comando completo
        const fullArgs = command && categoryConfig.script ? [command, ...args] : args;
        const commandStr = `node ${scriptPath} ${fullArgs.join(' ')}`.trim();

        console.log(`${colors.blue}🚀 Ejecutando: ${commandStr}${colors.reset}\n`);

        // Ejecutar el script
        execSync(commandStr, { stdio: 'inherit' });

        return true;

    } catch (error) {
        console.error(`${colors.red}❌ Error ejecutando herramienta:${colors.reset}`, error.message);
        return false;
    }
}

/**
 * Función principal
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === 'help') {
        showHelp();
        return;
    }

    const [category, command, ...extraArgs] = args;

    // Comandos especiales
    switch (category) {
        case 'list':
            listTools();
            return;

        case 'status':
            showProjectStatus();
            return;

        case 'help':
            showHelp();
            return;
    }

    // Ejecutar herramienta específica
    const success = executeTool(category, command, extraArgs);

    if (!success) {
        console.log(`\n${colors.yellow}💡 Usa 'node scripts/tools.js help' para ver la ayuda completa${colors.reset}`);
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

export { toolCategories, executeTool };