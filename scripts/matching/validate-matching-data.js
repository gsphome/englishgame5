#!/usr/bin/env node

/**
 * Script para validar la calidad de los datos de matching
 * Verifica que no haya duplicados y que los datos sean consistentes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const DATA_DIR = 'public/src/assets/data';
const MODULES_FILE = path.join(DATA_DIR, 'learningModules.json');

/**
 * Valida la calidad de los datos de matching
 */
function validateMatchingData(filePath, moduleId) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!Array.isArray(data)) {
      return { valid: false, error: 'No es un array válido' };
    }

    const validation = {
      valid: true,
      totalItems: data.length,
      issues: [],
      stats: {
        leftValues: new Set(),
        rightValues: new Set(),
        duplicateLeft: {},
        duplicateRight: {},
        missingFields: 0,
        emptyFields: 0
      }
    };

    // Validar cada item
    data.forEach((item, index) => {
      // Verificar campos requeridos
      if (!item.left || !item.right) {
        validation.issues.push({
          type: 'missing_field',
          index,
          message: `Item ${index} tiene campos faltantes`,
          item
        });
        validation.stats.missingFields++;
        return;
      }

      // Verificar campos vacíos
      if (item.left.trim() === '' || item.right.trim() === '') {
        validation.issues.push({
          type: 'empty_field',
          index,
          message: `Item ${index} tiene campos vacíos`,
          item
        });
        validation.stats.emptyFields++;
      }

      // Contar valores únicos y duplicados
      const leftTrimmed = item.left.trim();
      const rightTrimmed = item.right.trim();

      // Left values
      if (validation.stats.leftValues.has(leftTrimmed)) {
        if (!validation.stats.duplicateLeft[leftTrimmed]) {
          validation.stats.duplicateLeft[leftTrimmed] = [];
        }
        validation.stats.duplicateLeft[leftTrimmed].push(index);
      } else {
        validation.stats.leftValues.add(leftTrimmed);
      }

      // Right values
      if (validation.stats.rightValues.has(rightTrimmed)) {
        if (!validation.stats.duplicateRight[rightTrimmed]) {
          validation.stats.duplicateRight[rightTrimmed] = [];
        }
        validation.stats.duplicateRight[rightTrimmed].push(index);
      } else {
        validation.stats.rightValues.add(rightTrimmed);
      }
    });

    // Reportar duplicados encontrados
    Object.entries(validation.stats.duplicateLeft).forEach(([value, indices]) => {
      validation.issues.push({
        type: 'duplicate_left',
        value,
        indices,
        message: `Valor left duplicado: "${value}" en posiciones ${indices.join(', ')}`
      });
    });

    Object.entries(validation.stats.duplicateRight).forEach(([value, indices]) => {
      validation.issues.push({
        type: 'duplicate_right',
        value,
        indices,
        message: `Valor right duplicado: "${value}" en posiciones ${indices.join(', ')}`
      });
    });

    // Determinar si es válido
    validation.valid = validation.issues.length === 0;

    return validation;

  } catch (error) {
    return {
      valid: false,
      error: error.message,
      issues: [{ type: 'parse_error', message: error.message }]
    };
  }
}

/**
 * Genera estadísticas de calidad
 */
function generateQualityStats(validations) {
  const stats = {
    totalModules: validations.length,
    validModules: 0,
    invalidModules: 0,
    totalItems: 0,
    totalIssues: 0,
    issuesByType: {},
    duplicateStats: {
      modulesWithLeftDuplicates: 0,
      modulesWithRightDuplicates: 0,
      totalLeftDuplicates: 0,
      totalRightDuplicates: 0
    }
  };

  validations.forEach(validation => {
    if (validation.valid) {
      stats.validModules++;
    } else {
      stats.invalidModules++;
    }

    if (validation.totalItems) {
      stats.totalItems += validation.totalItems;
    }

    if (validation.issues) {
      stats.totalIssues += validation.issues.length;

      validation.issues.forEach(issue => {
        if (!stats.issuesByType[issue.type]) {
          stats.issuesByType[issue.type] = 0;
        }
        stats.issuesByType[issue.type]++;

        if (issue.type === 'duplicate_left') {
          stats.duplicateStats.modulesWithLeftDuplicates++;
          stats.duplicateStats.totalLeftDuplicates += issue.indices.length;
        }
        if (issue.type === 'duplicate_right') {
          stats.duplicateStats.modulesWithRightDuplicates++;
          stats.duplicateStats.totalRightDuplicates += issue.indices.length;
        }
      });
    }
  });

  return stats;
}

/**
 * Función principal
 */
async function main() {
  console.log('🔍 Validando calidad de datos de matching...\n');

  try {
    // Leer módulos
    const modules = JSON.parse(fs.readFileSync(MODULES_FILE, 'utf8'));
    const matchingModules = modules.filter(m => m.learningMode === 'matching');

    console.log(`📊 Validando ${matchingModules.length} módulos de matching\n`);

    const validations = [];

    // Validar cada módulo
    for (const module of matchingModules) {
      const filePath = path.join('public', module.dataPath);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${module.id}: Archivo no encontrado - ${filePath}`);
        validations.push({
          module: module.id,
          name: module.name,
          valid: false,
          error: 'Archivo no encontrado',
          issues: [{ type: 'file_not_found', message: 'Archivo no encontrado' }]
        });
        continue;
      }

      console.log(`🔍 Validando: ${module.name} (${module.id})`);
      
      const validation = validateMatchingData(filePath, module.id);
      validation.module = module.id;
      validation.name = module.name;
      validation.filePath = filePath;

      if (validation.valid) {
        console.log(`   ✅ Válido (${validation.totalItems} items, ${validation.stats.leftValues.size} left únicos, ${validation.stats.rightValues.size} right únicos)`);
      } else {
        console.log(`   ❌ Problemas encontrados:`);
        validation.issues.forEach(issue => {
          console.log(`      - ${issue.message}`);
        });
      }

      validations.push(validation);
      console.log('');
    }

    // Generar estadísticas
    const qualityStats = generateQualityStats(validations);

    // Mostrar resumen
    console.log('📋 RESUMEN DE CALIDAD:');
    console.log(`   Módulos válidos: ${qualityStats.validModules}/${qualityStats.totalModules}`);
    console.log(`   Total items: ${qualityStats.totalItems}`);
    console.log(`   Total problemas: ${qualityStats.totalIssues}`);
    
    if (qualityStats.totalIssues > 0) {
      console.log('\n📊 Problemas por tipo:');
      Object.entries(qualityStats.issuesByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    }

    console.log('\n🔄 Estado de duplicados:');
    console.log(`   Módulos con duplicados left: ${qualityStats.duplicateStats.modulesWithLeftDuplicates}`);
    console.log(`   Módulos con duplicados right: ${qualityStats.duplicateStats.modulesWithRightDuplicates}`);
    console.log(`   Total duplicados left: ${qualityStats.duplicateStats.totalLeftDuplicates}`);
    console.log(`   Total duplicados right: ${qualityStats.duplicateStats.totalRightDuplicates}`);

    // Guardar reporte detallado
    const report = {
      timestamp: new Date().toISOString(),
      summary: qualityStats,
      validations: validations.map(v => ({
        module: v.module,
        name: v.name,
        valid: v.valid,
        totalItems: v.totalItems,
        issuesCount: v.issues ? v.issues.length : 0,
        issues: v.issues || []
      }))
    };

    const reportPath = 'local/informes/matching-validation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Reporte detallado guardado en: ${reportPath}`);

    // Determinar código de salida
    if (qualityStats.duplicateStats.totalLeftDuplicates > 0 || qualityStats.duplicateStats.totalRightDuplicates > 0) {
      console.log('\n⚠️  Se encontraron duplicados. Ejecuta fix-matching-duplicates.js para corregirlos.');
      process.exit(1);
    } else {
      console.log('\n✅ Todos los datos están libres de duplicados!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateMatchingData, generateQualityStats };