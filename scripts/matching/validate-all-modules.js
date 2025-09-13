#!/usr/bin/env node

/**
 * Script para validar que todos los módulos se puedan cargar correctamente
 * Verifica que todos los archivos de datos existan y sean válidos
 */

import fs from 'fs';
import path from 'path';

const MODULES_FILE = 'public/src/assets/data/learningModules.json';

/**
 * Valida que un archivo de datos sea válido JSON
 */
function validateDataFile(filePath) {
  try {
    const fullPath = path.join('public', filePath);
    
    if (!fs.existsSync(fullPath)) {
      return { valid: false, error: 'File not found' };
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      return { valid: false, error: 'Data is not an array' };
    }
    
    if (data.length === 0) {
      return { valid: false, error: 'Data array is empty' };
    }
    
    // Validar estructura básica según el tipo de módulo
    const firstItem = data[0];
    const hasRequiredFields = firstItem && (
      // Flashcard: front/back
      (firstItem.front && firstItem.back) ||
      // Quiz: question/options/correct
      (firstItem.question && firstItem.options && firstItem.correct !== undefined) ||
      // Matching: left/right
      (firstItem.left && firstItem.right) ||
      // Completion: sentence/answer
      (firstItem.sentence && firstItem.answer) ||
      // Sorting: item/category
      (firstItem.item && firstItem.category)
    );
    
    if (!hasRequiredFields) {
      return { valid: false, error: 'Invalid data structure' };
    }
    
    return { 
      valid: true, 
      itemCount: data.length,
      structure: Object.keys(firstItem).join(', ')
    };
    
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🔍 Validando todos los módulos de aprendizaje...\n');
  
  try {
    // Leer módulos
    const modules = JSON.parse(fs.readFileSync(MODULES_FILE, 'utf8'));
    
    let validCount = 0;
    let errorCount = 0;
    const errors = [];
    const summary = {
      byLearningMode: {},
      byLevel: {}
    };
    
    console.log(`📊 Validando ${modules.length} módulos...\n`);
    
    // Validar cada módulo
    for (const module of modules) {
      const { id, name, learningMode, level, dataPath } = module;
      
      if (!dataPath) {
        console.log(`⚠️  ${id}: Sin dataPath definido`);
        continue;
      }
      
      const validation = validateDataFile(dataPath);
      
      if (validation.valid) {
        console.log(`✅ ${id}: ${name} (${validation.itemCount} items)`);
        validCount++;
        
        // Estadísticas
        if (!summary.byLearningMode[learningMode]) {
          summary.byLearningMode[learningMode] = 0;
        }
        summary.byLearningMode[learningMode]++;
        
        const levelStr = Array.isArray(level) ? level[0] : level;
        if (!summary.byLevel[levelStr]) {
          summary.byLevel[levelStr] = 0;
        }
        summary.byLevel[levelStr]++;
        
      } else {
        console.log(`❌ ${id}: ${name} - ${validation.error}`);
        errorCount++;
        errors.push({
          id,
          name,
          learningMode,
          level,
          dataPath,
          error: validation.error
        });
      }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE VALIDACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Módulos válidos: ${validCount}`);
    console.log(`❌ Módulos con errores: ${errorCount}`);
    console.log(`📊 Total módulos: ${modules.length}`);
    
    if (validCount > 0) {
      console.log('\n📊 Por tipo de aprendizaje:');
      Object.entries(summary.byLearningMode).forEach(([mode, count]) => {
        console.log(`   ${mode}: ${count} módulos`);
      });
      
      console.log('\n📊 Por nivel:');
      Object.entries(summary.byLevel).forEach(([level, count]) => {
        console.log(`   ${level.toUpperCase()}: ${count} módulos`);
      });
    }
    
    if (errorCount > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      errors.forEach(error => {
        console.log(`   ${error.id}: ${error.error}`);
        console.log(`      Archivo: ${error.dataPath}`);
      });
      
      console.log('\n💡 RECOMENDACIONES:');
      console.log('   • Verifica que todos los archivos existan en las rutas correctas');
      console.log('   • Asegúrate de que los archivos JSON tengan formato válido');
      console.log('   • Revisa que los datos tengan la estructura correcta para cada tipo');
    } else {
      console.log('\n🎉 ¡Todos los módulos se validaron exitosamente!');
      console.log('   La aplicación debería cargar todos los módulos sin errores.');
    }
    
    // Guardar reporte
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: modules.length,
        valid: validCount,
        errors: errorCount,
        byLearningMode: summary.byLearningMode,
        byLevel: summary.byLevel
      },
      errors: errors
    };
    
    const reportPath = 'local/informes/all-modules-validation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Reporte guardado en: ${reportPath}`);
    
    // Código de salida
    process.exit(errorCount > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateDataFile };