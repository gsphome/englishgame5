#!/usr/bin/env node

/**
 * Script para normalizar las estructuras de datos de todos los módulos
 * Convierte diferentes formatos a las estructuras esperadas por la aplicación
 */

import fs from 'fs';
import path from 'path';

const MODULES_FILE = 'public/data/learningModules.json';

/**
 * Normaliza datos de flashcard
 */
function normalizeFlashcardData(data) {
  if (!Array.isArray(data)) return null;
  
  return data.map(item => {
    // Si ya tiene front/back, mantenerlo
    if (item.front && item.back) {
      return item;
    }
    
    // Convertir en/es a front/back
    if (item.en && item.es) {
      return {
        front: item.en,
        back: item.es,
        ipa: item.ipa,
        example: item.example,
        example_es: item.example_es,
        ...item
      };
    }
    
    // Convertir term/definition a front/back
    if (item.term && item.definition) {
      return {
        front: item.term,
        back: item.definition,
        ...item
      };
    }
    
    return item;
  });
}

/**
 * Normaliza datos de quiz
 */
function normalizeQuizData(data) {
  if (!Array.isArray(data)) return null;
  
  return data.map(item => {
    // Si ya tiene la estructura correcta
    if (item.question && item.options && item.correct !== undefined) {
      return item;
    }
    
    // Convertir pregunta/opciones/respuesta
    if (item.pregunta && item.opciones && item.respuesta !== undefined) {
      return {
        question: item.pregunta,
        options: item.opciones,
        correct: item.respuesta,
        explanation: item.explicacion,
        ...item
      };
    }
    
    return item;
  });
}

/**
 * Normaliza datos de sorting
 */
function normalizeSortingData(data) {
  // Si es un objeto con data array (estructura común)
  if (!Array.isArray(data) && data.data && Array.isArray(data.data)) {
    return data.data.map(item => ({
      item: item.text || item.name || item.item,
      category: item.category,
      explanation: item.explanation
    }));
  }
  
  // Si es un objeto con estructura compleja, extraer los items
  if (!Array.isArray(data) && data.categories && data.items) {
    const items = [];
    
    if (Array.isArray(data.items)) {
      data.items.forEach(item => {
        items.push({
          item: item.text || item.name || item.item,
          category: item.category,
          explanation: item.explanation
        });
      });
    }
    
    return items;
  }
  
  // Si es un objeto con categorías, crear items para cada categoría
  if (!Array.isArray(data) && data.categories) {
    const items = [];
    
    data.categories.forEach(category => {
      if (category.items && Array.isArray(category.items)) {
        category.items.forEach(item => {
          items.push({
            item: typeof item === 'string' ? item : (item.text || item.name),
            category: category.name,
            explanation: item.explanation || category.description
          });
        });
      }
    });
    
    return items;
  }
  
  if (!Array.isArray(data)) return null;
  
  return data.map(item => {
    if (item.item && item.category) {
      return item;
    }
    
    // Convertir text/category
    if (item.text && item.category) {
      return {
        item: item.text,
        category: item.category,
        explanation: item.explanation
      };
    }
    
    return item;
  });
}

/**
 * Normaliza datos de completion
 */
function normalizeCompletionData(data) {
  if (!Array.isArray(data)) return null;
  
  return data.map(item => {
    // Si ya tiene sentence/answer
    if (item.sentence && item.answer) {
      return item;
    }
    
    // Convertir text/blank/answer
    if (item.text && item.answer) {
      return {
        sentence: item.text,
        answer: item.answer,
        explanation: item.explanation,
        ...item
      };
    }
    
    // Convertir oracion/respuesta
    if (item.oracion && item.respuesta) {
      return {
        sentence: item.oracion,
        answer: item.respuesta,
        explanation: item.explicacion,
        ...item
      };
    }
    
    return item;
  });
}

/**
 * Normaliza datos según el tipo de módulo
 */
function normalizeModuleData(data, learningMode) {
  switch (learningMode) {
    case 'flashcard':
      return normalizeFlashcardData(data);
    case 'quiz':
      return normalizeQuizData(data);
    case 'sorting':
      return normalizeSortingData(data);
    case 'completion':
      return normalizeCompletionData(data);
    case 'matching':
      // Los matching ya están bien estructurados
      return Array.isArray(data) ? data : null;
    default:
      return Array.isArray(data) ? data : null;
  }
}

/**
 * Procesa un archivo de datos
 */
function processDataFile(filePath, learningMode) {
  try {
    const fullPath = path.join('public', filePath);
    
    if (!fs.existsSync(fullPath)) {
      return { success: false, error: 'File not found' };
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const originalData = JSON.parse(content);
    
    const normalizedData = normalizeModuleData(originalData, learningMode);
    
    if (!normalizedData || !Array.isArray(normalizedData) || normalizedData.length === 0) {
      return { success: false, error: 'Could not normalize data' };
    }
    
    // Crear backup
    const backupPath = fullPath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(fullPath, backupPath);
    }
    
    // Escribir datos normalizados
    fs.writeFileSync(fullPath, JSON.stringify(normalizedData, null, 2));
    
    return { 
      success: true, 
      itemCount: normalizedData.length,
      changes: JSON.stringify(originalData) !== JSON.stringify(normalizedData)
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🔧 Normalizando estructuras de datos de todos los módulos...\n');
  
  try {
    // Leer módulos
    const modules = JSON.parse(fs.readFileSync(MODULES_FILE, 'utf8'));
    
    let processedCount = 0;
    let fixedCount = 0;
    let errorCount = 0;
    const results = [];
    
    console.log(`📊 Procesando ${modules.length} módulos...\n`);
    
    // Procesar cada módulo
    for (const module of modules) {
      const { id, name, learningMode, dataPath } = module;
      
      if (!dataPath) {
        console.log(`⚠️  ${id}: Sin dataPath definido`);
        continue;
      }
      
      const result = processDataFile(dataPath, learningMode);
      processedCount++;
      
      if (result.success) {
        const status = result.changes ? '🔧' : '✅';
        console.log(`${status} ${id}: ${name} (${result.itemCount} items)${result.changes ? ' - Normalizado' : ''}`);
        
        if (result.changes) {
          fixedCount++;
        }
        
        results.push({
          id,
          name,
          learningMode,
          success: true,
          itemCount: result.itemCount,
          normalized: result.changes
        });
        
      } else {
        console.log(`❌ ${id}: ${name} - ${result.error}`);
        errorCount++;
        
        results.push({
          id,
          name,
          learningMode,
          success: false,
          error: result.error
        });
      }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE NORMALIZACIÓN');
    console.log('='.repeat(60));
    console.log(`📊 Módulos procesados: ${processedCount}`);
    console.log(`🔧 Módulos normalizados: ${fixedCount}`);
    console.log(`✅ Módulos exitosos: ${processedCount - errorCount}`);
    console.log(`❌ Módulos con errores: ${errorCount}`);
    
    if (fixedCount > 0) {
      console.log('\n🔧 MÓDULOS NORMALIZADOS:');
      results.filter(r => r.normalized).forEach(result => {
        console.log(`   ${result.id}: ${result.name} (${result.learningMode})`);
      });
    }
    
    if (errorCount > 0) {
      console.log('\n❌ ERRORES PERSISTENTES:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   ${result.id}: ${result.error}`);
      });
    } else {
      console.log('\n🎉 ¡Todos los módulos se normalizaron exitosamente!');
      console.log('   Ejecuta el validador para confirmar que todo funciona.');
    }
    
    // Guardar reporte
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        processed: processedCount,
        normalized: fixedCount,
        successful: processedCount - errorCount,
        errors: errorCount
      },
      results: results
    };
    
    const reportPath = 'local/informes/data-normalization-report.json';
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

export { normalizeModuleData };