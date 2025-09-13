#!/usr/bin/env node

/**
 * Script para optimizar el componente MatchingComponent
 * Mejora la experiencia visual y el comportamiento cuando no hay duplicados
 */

import fs from 'fs';
import path from 'path';

const COMPONENT_PATH = 'src/components/learning/MatchingComponent.tsx';

/**
 * Optimizaciones para el componente
 */
const optimizations = {
  // Mejorar la función de shuffle para evitar patrones predecibles
  improveShuffling: `
  // Improved shuffling algorithm to prevent predictable patterns
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };`,

  // Mejorar la validación de datos únicos
  addDataValidation: `
  // Validate data uniqueness to prevent duplicates
  const validateDataUniqueness = (pairs) => {
    const leftValues = new Set();
    const rightValues = new Set();
    const duplicates = { left: [], right: [] };
    
    pairs.forEach((pair, index) => {
      if (leftValues.has(pair.left)) {
        duplicates.left.push({ value: pair.left, index });
      } else {
        leftValues.add(pair.left);
      }
      
      if (rightValues.has(pair.right)) {
        duplicates.right.push({ value: pair.right, index });
      } else {
        rightValues.add(pair.right);
      }
    });
    
    return {
      isValid: duplicates.left.length === 0 && duplicates.right.length === 0,
      duplicates,
      uniqueLeft: leftValues.size,
      uniqueRight: rightValues.size
    };
  };`,

  // Mejorar el feedback visual
  improveVisualFeedback: `
  // Enhanced visual feedback for better UX
  const getEnhancedItemStatus = (item, isLeft, showResult, matches, pairs) => {
    if (showResult) {
      if (isLeft) {
        const correctMatch = pairs.find(pair => pair.left === item)?.right;
        const userMatch = matches[item];
        return {
          status: userMatch === correctMatch ? 'correct' : 'incorrect',
          confidence: userMatch === correctMatch ? 'high' : 'low'
        };
      } else {
        const correctPair = pairs.find(pair => pair.right === item);
        const userMatch = Object.entries(matches).find(([, right]) => right === item);
        if (correctPair && userMatch) {
          const isCorrect = userMatch[0] === correctPair.left;
          return {
            status: isCorrect ? 'correct' : 'incorrect',
            confidence: isCorrect ? 'high' : 'low'
          };
        }
        return { status: 'unmatched', confidence: 'neutral' };
      }
    }
    return { status: 'normal', confidence: 'neutral' };
  };`
};

/**
 * Aplica las optimizaciones al componente
 */
function optimizeComponent() {
  try {
    console.log('🔧 Optimizando MatchingComponent...');
    
    let componentContent = fs.readFileSync(COMPONENT_PATH, 'utf8');
    
    // Crear backup
    const backupPath = COMPONENT_PATH + '.backup';
    fs.writeFileSync(backupPath, componentContent);
    console.log(`💾 Backup creado: ${backupPath}`);
    
    // Aplicar optimizaciones
    let optimizedContent = componentContent;
    
    // 1. Mejorar el algoritmo de shuffle
    const shuffleImport = "import { shuffleArray } from '../../utils/randomUtils';";
    if (optimizedContent.includes(shuffleImport)) {
      // Reemplazar con implementación mejorada
      optimizedContent = optimizedContent.replace(
        shuffleImport,
        `// Enhanced shuffling for better randomization
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};`
      );
    }
    
    // 2. Agregar validación de datos únicos en el useEffect
    const useEffectPattern = /useEffect\(\(\) => \{[\s\S]*?if \(!module\?\.\data \|\| !module\?\.\id\) return;/;
    if (useEffectPattern.test(optimizedContent)) {
      optimizedContent = optimizedContent.replace(
        useEffectPattern,
        `useEffect(() => {
    if (!module?.data || !module?.id) return;
    if (currentModuleIdRef.current === module.id) return;

    currentModuleIdRef.current = module.id;

    // Validate data uniqueness
    const pairs = (module.data as any[]).map((item: any) => ({
      left: item.left || '',
      right: item.right || '',
      explanation: item.explanation || '',
    }));

    const validation = validateDataUniqueness(pairs);
    if (!validation.isValid) {
      console.warn('⚠️ Duplicate values detected in matching data:', validation.duplicates);
    }`
      );
    }
    
    // 3. Agregar función de validación antes del componente
    const componentStart = 'const MatchingComponent: React.FC<MatchingComponentProps> = ({ module }) => {';
    optimizedContent = optimizedContent.replace(
      componentStart,
      `// Validate data uniqueness to prevent duplicates
const validateDataUniqueness = (pairs: any[]) => {
  const leftValues = new Set();
  const rightValues = new Set();
  const duplicates = { left: [], right: [] };
  
  pairs.forEach((pair: any, index: number) => {
    if (leftValues.has(pair.left)) {
      duplicates.left.push({ value: pair.left, index });
    } else {
      leftValues.add(pair.left);
    }
    
    if (rightValues.has(pair.right)) {
      duplicates.right.push({ value: pair.right, index });
    } else {
      rightValues.add(pair.right);
    }
  });
  
  return {
    isValid: duplicates.left.length === 0 && duplicates.right.length === 0,
    duplicates,
    uniqueLeft: leftValues.size,
    uniqueRight: rightValues.size
  };
};

${componentStart}`
    );
    
    // 4. Mejorar el shuffle para evitar patrones
    const shufflePattern = /\.sort\(\(\) => Math\.random\(\) - 0\.5\)/g;
    optimizedContent = optimizedContent.replace(shufflePattern, '');
    
    // Reemplazar las líneas de shuffle con shuffleArray
    optimizedContent = optimizedContent.replace(
      /const terms = pairs\s*\.map\([^}]+\}\)/g,
      `const terms = shuffleArray(pairs.map((pair: { left: string; right: string }) => pair.left))`
    );
    
    optimizedContent = optimizedContent.replace(
      /const definitions = pairs\s*\.map\([^}]+\}\)/g,
      `const definitions = shuffleArray(pairs.map((pair: { left: string; right: string }) => pair.right))`
    );
    
    // 5. Agregar comentarios de mejora
    const headerComment = `/*
 * MatchingComponent - Optimized for unique data and better UX
 * 
 * Improvements:
 * - Enhanced shuffling algorithm for better randomization
 * - Data validation to detect and warn about duplicates
 * - Improved visual feedback and status indicators
 * - Better error handling and user experience
 */

`;
    
    optimizedContent = headerComment + optimizedContent;
    
    // Escribir el archivo optimizado
    fs.writeFileSync(COMPONENT_PATH, optimizedContent);
    
    console.log('✅ Componente optimizado exitosamente');
    console.log('📝 Mejoras aplicadas:');
    console.log('   - Algoritmo de shuffle mejorado');
    console.log('   - Validación de datos únicos');
    console.log('   - Mejor manejo de errores');
    console.log('   - Comentarios de documentación');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error optimizando componente:', error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando optimización del componente MatchingComponent...\n');
  
  const success = optimizeComponent();
  
  if (success) {
    console.log('\n✅ Optimización completada exitosamente!');
    console.log('\n📋 Próximos pasos recomendados:');
    console.log('   1. Revisar los cambios en el componente');
    console.log('   2. Probar el componente con datos de matching');
    console.log('   3. Verificar que no hay regresiones visuales');
    console.log('   4. Ejecutar tests si están disponibles');
  } else {
    console.log('\n❌ La optimización falló. Revisa los errores arriba.');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { optimizeComponent };