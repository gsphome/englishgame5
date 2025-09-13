#!/usr/bin/env node

/**
 * Script para detectar y corregir duplicados en módulos de matching
 * Identifica opciones left y right duplicadas que causan problemas visuales y de comportamiento
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de rutas
const DATA_DIR = 'public/src/assets/data';
const MODULES_FILE = path.join(DATA_DIR, 'learningModules.json');

/**
 * Analiza un archivo de datos de matching para encontrar duplicados
 */
function analyzeMatchingData(filePath, moduleId) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!Array.isArray(data)) {
            console.log(`⚠️  ${moduleId}: No es un array válido`);
            return null;
        }

        const leftValues = {};
        const rightValues = {};
        const duplicates = {
            left: {},
            right: {},
            total: 0
        };

        // Contar ocurrencias
        data.forEach((item, index) => {
            if (!item.left || !item.right) {
                console.log(`⚠️  ${moduleId}: Item ${index} tiene valores faltantes`);
                return;
            }

            // Contar left values
            if (leftValues[item.left]) {
                leftValues[item.left].push(index);
            } else {
                leftValues[item.left] = [index];
            }

            // Contar right values
            if (rightValues[item.right]) {
                rightValues[item.right].push(index);
            } else {
                rightValues[item.right] = [index];
            }
        });

        // Identificar duplicados
        Object.entries(leftValues).forEach(([value, indices]) => {
            if (indices.length > 1) {
                duplicates.left[value] = indices;
                duplicates.total += indices.length - 1;
            }
        });

        Object.entries(rightValues).forEach(([value, indices]) => {
            if (indices.length > 1) {
                duplicates.right[value] = indices;
                duplicates.total += indices.length - 1;
            }
        });

        return {
            data,
            duplicates,
            leftValues,
            rightValues,
            totalItems: data.length
        };

    } catch (error) {
        console.error(`❌ Error analizando ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Genera versiones únicas para valores duplicados
 */
function generateUniqueVariations(originalValue, count, type = 'right') {
    const variations = [originalValue];

    if (type === 'right') {
        // Para respuestas duplicadas, agregar contexto o sinónimos
        for (let i = 1; i < count; i++) {
            switch (originalValue.toLowerCase()) {
                case 'is':
                    variations.push(`is (${['singular', 'third person', 'present tense', 'be verb'][i - 1] || `variant ${i}`})`);
                    break;
                case 'are':
                    variations.push(`are (${['plural', 'second person', 'present tense', 'be verb'][i - 1] || `variant ${i}`})`);
                    break;
                case 'a lot of':
                    variations.push(i === 1 ? 'many' : 'lots of');
                    break;
                case 'por la noche':
                    variations.push(i === 1 ? 'en la noche' : 'durante la noche');
                    break;
                default:
                    variations.push(`${originalValue} (${i + 1})`);
            }
        }
    } else {
        // Para preguntas duplicadas, agregar contexto
        for (let i = 1; i < count; i++) {
            variations.push(`${originalValue} (context ${i + 1})`);
        }
    }

    return variations;
}

/**
 * Corrige duplicados en los datos
 */
function fixDuplicates(analysisResult, moduleId) {
    if (!analysisResult || analysisResult.duplicates.total === 0) {
        return null;
    }

    const { data, duplicates } = analysisResult;
    const fixedData = [...data];
    const changes = [];

    // Corregir duplicados en right values (más críticos)
    Object.entries(duplicates.right).forEach(([value, indices]) => {
        const variations = generateUniqueVariations(value, indices.length, 'right');

        indices.forEach((index, i) => {
            if (i > 0) { // Mantener el primero, cambiar los demás
                const oldValue = fixedData[index].right;
                fixedData[index].right = variations[i];
                changes.push({
                    index,
                    field: 'right',
                    old: oldValue,
                    new: variations[i],
                    left: fixedData[index].left
                });
            }
        });
    });

    // Corregir duplicados en left values (menos críticos pero importantes)
    Object.entries(duplicates.left).forEach(([value, indices]) => {
        const variations = generateUniqueVariations(value, indices.length, 'left');

        indices.forEach((index, i) => {
            if (i > 0) { // Mantener el primero, cambiar los demás
                const oldValue = fixedData[index].left;
                fixedData[index].left = variations[i];
                changes.push({
                    index,
                    field: 'left',
                    old: oldValue,
                    new: variations[i],
                    right: fixedData[index].right
                });
            }
        });
    });

    return {
        fixedData,
        changes,
        originalTotal: data.length,
        duplicatesFixed: changes.length
    };
}

/**
 * Función principal
 */
async function main() {
    console.log('🔍 Analizando módulos de matching para detectar duplicados...\n');

    try {
        // Leer módulos
        const modules = JSON.parse(fs.readFileSync(MODULES_FILE, 'utf8'));
        const matchingModules = modules.filter(m => m.learningMode === 'matching');

        console.log(`📊 Encontrados ${matchingModules.length} módulos de matching\n`);

        const results = [];
        let totalDuplicatesFound = 0;
        let totalDuplicatesFixed = 0;

        // Analizar cada módulo
        for (const module of matchingModules) {
            const filePath = path.join('public', module.dataPath);

            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  ${module.id}: Archivo no encontrado - ${filePath}`);
                continue;
            }

            console.log(`🔍 Analizando: ${module.name} (${module.id})`);

            const analysis = analyzeMatchingData(filePath, module.id);
            if (!analysis) continue;

            const { duplicates, totalItems } = analysis;

            if (duplicates.total > 0) {
                console.log(`   ❌ Duplicados encontrados:`);

                if (Object.keys(duplicates.left).length > 0) {
                    console.log(`      Left duplicates: ${Object.keys(duplicates.left).length}`);
                    Object.entries(duplicates.left).forEach(([value, indices]) => {
                        console.log(`         "${value}" en posiciones: ${indices.join(', ')}`);
                    });
                }

                if (Object.keys(duplicates.right).length > 0) {
                    console.log(`      Right duplicates: ${Object.keys(duplicates.right).length}`);
                    Object.entries(duplicates.right).forEach(([value, indices]) => {
                        console.log(`         "${value}" en posiciones: ${indices.join(', ')}`);
                    });
                }

                totalDuplicatesFound += duplicates.total;

                // Intentar corregir
                const fix = fixDuplicates(analysis, module.id);
                if (fix) {
                    // Crear backup
                    const backupPath = filePath + '.backup';
                    fs.copyFileSync(filePath, backupPath);

                    // Escribir datos corregidos
                    fs.writeFileSync(filePath, JSON.stringify(fix.fixedData, null, 2));

                    console.log(`   ✅ Corregidos ${fix.duplicatesFixed} duplicados`);
                    console.log(`   💾 Backup creado: ${backupPath}`);

                    if (fix.changes.length > 0) {
                        console.log(`   📝 Cambios realizados:`);
                        fix.changes.forEach(change => {
                            console.log(`      [${change.index}] ${change.field}: "${change.old}" → "${change.new}"`);
                        });
                    }

                    totalDuplicatesFixed += fix.duplicatesFixed;
                }

                results.push({
                    module: module.id,
                    name: module.name,
                    filePath,
                    totalItems,
                    duplicatesFound: duplicates.total,
                    duplicatesFixed: fix ? fix.duplicatesFixed : 0,
                    changes: fix ? fix.changes : []
                });
            } else {
                console.log(`   ✅ Sin duplicados (${totalItems} items)`);
            }

            console.log('');
        }

        // Resumen final
        console.log('📋 RESUMEN FINAL:');
        console.log(`   Módulos analizados: ${matchingModules.length}`);
        console.log(`   Módulos con duplicados: ${results.length}`);
        console.log(`   Total duplicados encontrados: ${totalDuplicatesFound}`);
        console.log(`   Total duplicados corregidos: ${totalDuplicatesFixed}`);

        if (results.length > 0) {
            console.log('\n📄 Detalles por módulo:');
            results.forEach(result => {
                console.log(`   ${result.name}: ${result.duplicatesFixed}/${result.duplicatesFound} corregidos`);
            });
        }

        // Guardar reporte
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                modulesAnalyzed: matchingModules.length,
                modulesWithDuplicates: results.length,
                totalDuplicatesFound,
                totalDuplicatesFixed
            },
            details: results
        };

        const reportPath = 'local/informes/matching-duplicates-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📊 Reporte guardado en: ${reportPath}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { analyzeMatchingData, fixDuplicates, generateUniqueVariations };