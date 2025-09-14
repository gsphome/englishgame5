#!/usr/bin/env node

/**
 * Script para corregir las rutas de los módulos en learningModules.json
 * Actualiza las rutas para que apunten a las subcarpetas correctas
 */

import fs from 'fs';
import path from 'path';

const MODULES_FILE = 'public/data/learningModules.json';
const DATA_DIR = 'public/data';

/**
 * Mapeo de patrones de archivos a sus subcarpetas correctas
 */
const pathMappings = {
  // A1 files
  'a1-': 'a1/',
  
  // A2 files  
  'a2-': 'a2/',
  
  // B1 files
  'b1-': 'b1/',
  
  // B2 files
  'b2-': 'b2/',
  
  // C1 files
  'c1-': 'c1/',
  
  // C2 files
  'c2-': 'c2/'
};

/**
 * Corrige una ruta de dataPath
 */
function fixDataPath(dataPath) {
  // Extraer solo el nombre del archivo
  const fileName = path.basename(dataPath);
  
  // Encontrar el mapeo correcto
  for (const [prefix, folder] of Object.entries(pathMappings)) {
    if (fileName.startsWith(prefix)) {
      return `data/${folder}${fileName}`;
    }
  }
  
  // Si no encuentra mapeo, devolver la ruta original
  return dataPath;
}

/**
 * Verifica si un archivo existe
 */
function fileExists(filePath) {
  const fullPath = path.join('public', filePath);
  return fs.existsSync(fullPath);
}

/**
 * Función principal
 */
async function main() {
  console.log('🔧 Corrigiendo rutas de módulos en learningModules.json...\n');
  
  try {
    // Leer el archivo de módulos
    const modulesData = JSON.parse(fs.readFileSync(MODULES_FILE, 'utf8'));
    
    let fixedCount = 0;
    let errorCount = 0;
    const fixes = [];
    
    // Procesar cada módulo
    for (const module of modulesData) {
      if (module.dataPath) {
        const originalPath = module.dataPath;
        const fixedPath = fixDataPath(originalPath);
        
        if (originalPath !== fixedPath) {
          // Verificar que el archivo corregido existe
          if (fileExists(fixedPath)) {
            module.dataPath = fixedPath;
            fixes.push({
              id: module.id,
              name: module.name,
              oldPath: originalPath,
              newPath: fixedPath
            });
            fixedCount++;
            console.log(`✅ ${module.id}: ${path.basename(originalPath)} → ${fixedPath}`);
          } else {
            console.log(`❌ ${module.id}: Archivo no encontrado - ${fixedPath}`);
            errorCount++;
          }
        } else {
          // Verificar que el archivo actual existe
          if (!fileExists(originalPath)) {
            console.log(`⚠️  ${module.id}: Archivo no encontrado - ${originalPath}`);
            errorCount++;
          }
        }
      }
    }
    
    // Guardar el archivo actualizado si hay cambios
    if (fixedCount > 0) {
      // Crear backup
      const backupPath = MODULES_FILE + '.backup';
      fs.copyFileSync(MODULES_FILE, backupPath);
      console.log(`\n💾 Backup creado: ${backupPath}`);
      
      // Guardar archivo corregido
      fs.writeFileSync(MODULES_FILE, JSON.stringify(modulesData, null, 2));
      console.log(`✅ Archivo actualizado: ${MODULES_FILE}`);
    }
    
    // Resumen
    console.log('\n📊 RESUMEN:');
    console.log(`   Rutas corregidas: ${fixedCount}`);
    console.log(`   Errores encontrados: ${errorCount}`);
    console.log(`   Total módulos: ${modulesData.length}`);
    
    if (fixes.length > 0) {
      console.log('\n📝 Cambios realizados:');
      fixes.forEach(fix => {
        console.log(`   ${fix.name}: ${path.basename(fix.oldPath)} → ${fix.newPath}`);
      });
    }
    
    if (errorCount > 0) {
      console.log('\n⚠️  Algunos archivos no se encontraron. Verifica que existan en las ubicaciones correctas.');
    } else if (fixedCount > 0) {
      console.log('\n🎉 Todas las rutas han sido corregidas exitosamente!');
    } else {
      console.log('\n✅ Todas las rutas ya están correctas.');
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

export { fixDataPath, pathMappings };