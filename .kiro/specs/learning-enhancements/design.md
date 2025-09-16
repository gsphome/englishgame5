# Documento de Diseño

## Resumen

Este documento de diseño describe el enfoque de implementación para mejorar la aplicación de aprendizaje FluentFlow con funcionalidades mejoradas de engagement del usuario, calidad de contenido y efectividad de aprendizaje. El diseño aprovecha la arquitectura existente de React TypeScript, manejo de estado con Zustand y estructura de componentes, mientras añade nuevas capacidades de forma incremental.

## Arquitectura

### Arquitectura de Alto Nivel
```
┌─────────────────────────────────────────────────────────────┐
│                    FluentFlow App                           │
├─────────────────────────────────────────────────────────────┤
│  Capa de Funcionalidades de Aprendizaje Mejoradas          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │ Sistema de      │ │ Analytics       │ │ Sistema de    │ │
│  │ Desafío Diario  │ │ Visuales de     │ │ Gamificación  │ │
│  │                 │ │ Progreso        │ │               │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Arquitectura Core Existente                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │ Componentes de  │ │ Zustand Stores  │ │ Servicios de  │ │
│  │ Modos de        │ │ (App, Progress, │ │ Datos y       │ │
│  │ Aprendizaje     │ │ Settings, User) │ │ Validación    │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos Mejorado
```
Acción Usuario → Store Mejorado → Servicio Analytics → Componentes Visuales
      ↓               ↓                ↓                      ↓
Actualización → Gamificación → Seguimiento Progreso → Actualizaciones UI
Contenido
```

### Arquitectura Modular para Evitar Bundle Bloat

#### Principios de Modularidad
1. **Lazy Loading**: Cargar funcionalidades solo cuando se necesiten
2. **Code Splitting**: Separar cada funcionalidad en chunks independientes
3. **Servicios Independientes**: Cada servicio en su propio archivo
4. **Componentes Bajo Demanda**: UI components cargados dinámicamente

#### Estructura de Archivos Modular
```
src/
├── services/
│   ├── analytics/
│   │   ├── progressAnalyticsService.ts    # Lazy loaded
│   │   └── index.ts
│   ├── gamification/
│   │   ├── gamificationEngine.ts          # Lazy loaded
│   │   └── index.ts
│   ├── challenges/
│   │   ├── dailyChallengeService.ts       # Lazy loaded
│   │   └── index.ts
│   └── themes/
│       ├── themeService.ts                # Lazy loaded
│       └── index.ts
├── components/
│   ├── enhancements/                      # Lazy loaded components
│   │   ├── DailyChallengeModal.tsx
│   │   ├── ProgressDashboard.tsx
│   │   ├── BadgeCollection.tsx
│   │   └── index.ts
│   └── existing structure...
└── stores/
    ├── enhancementsStore.ts               # Separate store
    └── existing stores...
```

#### Lazy Loading Strategy
```typescript
// Lazy loading de servicios
const loadAnalyticsService = () => import('../services/analytics');
const loadGamificationEngine = () => import('../services/gamification');
const loadChallengeService = () => import('../services/challenges');

// Lazy loading de componentes
const DailyChallengeModal = lazy(() => import('./enhancements/DailyChallengeModal'));
const ProgressDashboard = lazy(() => import('./enhancements/ProgressDashboard'));
```

## Componentes e Interfaces

### 1. Sistema de Contenido Mejorado

#### Servicio de Mejora de Contenido
```typescript
interface EnhancedContentService {
  loadContentWithEnhancements(moduleId: string): Promise<LearningData[]>;
  validateContentStructure(data: any): boolean;
}

// Extensión DIRECTA de interfaces existentes - NO nuevas interfaces
// Los campos opcionales se añaden directamente a las interfaces existentes:

// FlashcardData (extendida)
interface FlashcardData extends BaseLearningData {
  en: string;
  es: string;
  ipa?: string;
  example?: string;
  example_es?: string;
  // Campos mejorados opcionales desde JSON:
  contextualTips?: string[];     
  memoryAids?: string[];         
  culturalNotes?: string;        
  commonMistakes?: string[];     
}

// CompletionData (extendida)
interface CompletionData extends BaseLearningData {
  sentence: string;
  correct: string;
  missing?: string;
  options?: string[];
  hint?: string;
  tip?: string;
  explanation?: string;
  // Campos mejorados opcionales desde JSON:
  detailedExplanation?: string;  
  grammarRule?: string;          
  patternTips?: string[];        
  relatedConcepts?: string[];    
}
```

### 2. Sistema de Desafío Diario

#### Componentes de Desafío Diario (Modular)
```typescript
// src/services/challenges/dailyChallengeService.ts - Lazy loaded
interface DailyChallengeService {
  loadChallengeConfig(): Promise<ChallengeConfiguration>;
  generateDailyChallenge(userId: string, date: Date): Promise<DailyChallenge>;
  getAvailableModules(userId: string): LearningModule[];
  checkChallengeAvailability(userId: string): boolean;
  completeDailyChallenge(userId: string, results: ChallengeResults): void;
}

// Hook para lazy loading del servicio
const useDailyChallengeService = () => {
  const loadService = useCallback(async () => {
    const { DailyChallengeService } = await import('../services/challenges');
    return new DailyChallengeService();
  }, []);
  
  return { loadService };
};
```

// Configuración desde JSON - NO hardcoded
interface ChallengeConfiguration {
  rules: {
    modulesPerChallenge: number;
    bonusPointsMultiplier: number;
    streakBonusRules: StreakRule[];
    difficultyBalancing: boolean;
  };
  themes: ThemeConfig[];
  pointsSystem: PointsConfiguration;
}

interface DailyChallenge {
  id: string;
  date: Date;
  modules: LearningModule[];  // Seleccionados dinámicamente
  estimatedTime: number;      // Calculado desde módulos
  bonusPoints: number;        // Desde configuración JSON
  theme?: string;             // Desde configuración JSON
}

interface ChallengeResults {
  accuracy: number;
  timeSpent: number;
  modulesCompleted: string[];
  streakMaintained: boolean;
}
```

#### Componentes UI de Desafío Diario

**Integración No Invasiva con Menú Existente:**
- `DailyChallengeNotification`: Badge/indicador en header existente
- `DailyChallengeModal`: Modal overlay que se abre desde la notificación
- `DailyChallengeCard`: Presentación principal del desafío dentro del modal
- `ChallengeProgress`: Progreso en tiempo real durante el desafío
- `ChallengeResults`: Resultados e información de racha
- `ChallengeHistory`: Desafíos pasados y rendimiento (sección separada)

**Flujo de UI:**
```
Header Existente → Notification Badge → Modal Overlay → Desafío
     ↓                    ↓                ↓            ↓
Sin cambios        Indicador visual    No recarga    Experiencia
al menú           (nuevo disponible)   menú principal  completa
```

**Ubicación Visual:**
- Badge de notificación en el header existente (junto a otros elementos)
- Modal que se superpone sin afectar el estado del menú principal
- Sistema de notificaciones toast para completaciones y logros

### 3. Sistema de Progreso Visual

#### Servicio de Analytics de Progreso
```typescript
interface ProgressAnalyticsService {
  calculateLevelProgress(userId: string): LevelProgress[];
  generateAccuracyTrends(userId: string, timeframe: TimeFrame): TrendData[];
  getModuleCompletionStats(userId: string): ModuleStats[];
  calculateLearningVelocity(userId: string): VelocityMetrics;
}

interface LevelProgress {
  level: DifficultyLevel;
  completedModules: number;
  totalModules: number;
  averageAccuracy: number;
  timeSpent: number;
}

interface TrendData {
  date: Date;
  accuracy: number;
  sessionsCompleted: number;
  timeSpent: number;
}
```

#### Progress Visualization Components
- `ProgressDashboard`: Main progress overview
- `LevelProgressChart`: Progress bars by CEFR level
- `AccuracyTrendChart`: Line chart using Recharts
- `ModuleCompletionGrid`: Visual grid of module status
- `AchievementTimeline`: Milestone visualization

### 4. Gamification System

#### Gamification Engine
```typescript
interface GamificationEngine {
  loadGamificationConfig(): Promise<GamificationConfiguration>;
  calculatePoints(action: UserAction, context: ActionContext): number;
  checkBadgeEligibility(userId: string): Badge[];
  updateStreak(userId: string, studyDate: Date): StreakInfo;
}

// Configuración desde JSON - NO hardcoded
interface GamificationConfiguration {
  pointsRules: {
    correctAnswer: number;
    moduleCompletion: number;
    streakMultiplier: number;
    difficultyMultipliers: Record<DifficultyLevel, number>;
  };
  badges: BadgeDefinition[];
  streakRules: {
    resetOnMissedDay: boolean;
    bonusPointsPerDay: number;
    milestones: number[];
  };
}

interface BadgeDefinition {
  id: string;
  name: string;                    // Desde JSON config
  description: string;             // Desde JSON config
  icon: string;                    // Desde JSON config
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {                      // Criterios configurables
    pointsRequired?: number;
    streakRequired?: number;
    modulesCompleted?: number;
    accuracyRequired?: number;
  };
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
  streakMultiplier: number;
}
```

#### Componentes UI de Gamificación

**Integración Sutil en UI Existente:**
- `PointsDisplay`: Contador en tiempo real en header (no invasivo)
- `StreakIndicator`: Indicador de racha junto a puntos
- `BadgeNotification`: Toast cuando se desbloquea nuevo badge
- `AchievementModal`: Modal para ver colección completa de badges
- `ProgressToast`: Notificaciones de logros y hitos

**Sistema de Notificaciones:**
```
Acción Usuario → Cálculo Puntos → Toast Notification → Update Header
     ↓               ↓                ↓                    ↓
Sin interrumpir  Background      Feedback visual    Estado persistente
flujo actual    processing      no invasivo        en header
```

### 5. Thematic Learning Paths

#### Theme Organization Service
```typescript
interface ThemeService {
  loadThematicPathsConfig(): Promise<ThematicPathsConfiguration>;
  getThematicPaths(userId: string): ThematicPath[];
  getAvailableModulesForTheme(userId: string, theme: string): LearningModule[];
  calculateThemeProgress(userId: string, theme: string): ThemeProgress;
  recommendNextModule(userId: string, theme: string): LearningModule | null;
}

// Configuración desde JSON - NO hardcoded
interface ThematicPathsConfiguration {
  paths: ThematicPath[];
  pathRules: {
    minimumModulesPerPath: number;
    balanceAcrossLevels: boolean;
    respectPrerequisites: boolean;
  };
}

interface ThematicPath {
  id: string;
  name: string;                    // Desde JSON config
  description: string;             // Desde JSON config
  moduleFilters: {                 // Filtros dinámicos, NO lista fija
    categories: Category[];
    levels: DifficultyLevel[];
    tags?: string[];
  };
  estimatedTime: number;           // Calculado dinámicamente
  difficulty: number;              // Calculado desde módulos
  icon?: string;                   // Desde JSON config
}

interface ThemeProgress {
  theme: string;
  completedModules: number;
  totalModules: number;
  currentModule?: string;
  estimatedTimeRemaining: number;
}
```

### 6. Micro-Learning System

#### Micro-Session Generator
```typescript
interface MicroLearningService {
  generateMicroSession(
    userId: string, 
    timeLimit: number, 
    preferences: SessionPreferences
  ): MicroSession;
  optimizeContentSelection(
    availableModules: LearningModule[], 
    timeLimit: number
  ): LearningModule[];
}

interface MicroSession {
  id: string;
  modules: LearningModule[];
  estimatedTime: number;
  focusAreas: Category[];
  difficulty: DifficultyLevel;
}

interface SessionPreferences {
  preferredModes: LearningMode[];
  focusAreas: Category[];
  avoidRecentContent: boolean;
}
```

### 7. Enhanced Spaced Repetition

#### Spaced Repetition Engine
```typescript
interface SpacedRepetitionEngine {
  calculateNextReview(
    itemId: string, 
    performance: PerformanceData
  ): ReviewSchedule;
  getItemsDueForReview(userId: string): ReviewItem[];
  updateItemDifficulty(itemId: string, performance: PerformanceData): void;
  generateReviewSession(userId: string): ReviewSession;
}

interface ReviewSchedule {
  itemId: string;
  nextReviewDate: Date;
  interval: number; // days
  easeFactor: number;
  repetitionCount: number;
}

interface ReviewItem {
  itemId: string;
  content: LearningData;
  lastReviewed: Date;
  difficulty: number;
  successRate: number;
}
```

## Data Models

### Enhanced Store Structure
```typescript
// Extension to existing stores
interface EnhancedProgressStore extends ProgressStore {
  dailyChallenges: DailyChallenge[];
  streakInfo: StreakInfo;
  badges: Badge[];
  totalPoints: number;
  themeProgress: Record<string, ThemeProgress>;
  reviewSchedule: ReviewSchedule[];
}

interface AnalyticsStore {
  sessionHistory: SessionData[];
  accuracyTrends: TrendData[];
  learningVelocity: VelocityMetrics;
  timeSpentByCategory: Record<Category, number>;
}
```

## Error Handling

### Enhanced Error Management
- **Content Enhancement Errors**: Graceful fallback to original content
- **Challenge Generation Failures**: Default to manual module selection
- **Analytics Calculation Errors**: Show basic progress without advanced metrics
- **Gamification Service Errors**: Continue learning without points/badges
- **Review Schedule Conflicts**: Prioritize user-selected content

### Error Recovery Strategies
- Offline capability for core learning functions
- Local storage backup for progress data
- Retry mechanisms for analytics calculations
- User notification for non-critical feature failures

## Testing Strategy

### Unit Testing
- **Content Enhancement**: Test enrichment algorithms and fallbacks
- **Challenge Generation**: Verify appropriate difficulty and variety
- **Progress Calculations**: Ensure accurate metrics and trends
- **Gamification Logic**: Test point calculations and badge eligibility
- **Spaced Repetition**: Validate scheduling algorithms

### Integration Testing
- **Store Integration**: Test enhanced store interactions
- **Component Communication**: Verify data flow between new components
- **Service Layer**: Test service interactions and error handling
- **Analytics Pipeline**: End-to-end analytics data flow

### User Experience Testing
- **Performance Impact**: Ensure new features don't slow existing functionality
- **Visual Consistency**: Maintain design system compliance
- **Accessibility**: Test new components with screen readers
- **Mobile Responsiveness**: Verify all new UI components work on mobile

## Enfoque Data-Driven y Extensibilidad Universal

### Principio Fundamental
**TODO configurable desde la capa de datos** - Ninguna lógica de negocio hardcodeada en el código.

### Extensibilidad Universal
La aplicación está diseñada para ser **dominio-agnóstica**:
- **Modos de aprendizaje universales**: flashcard, quiz, completion, sorting, matching funcionan para cualquier dominio
- **Sistema modular**: Puede adaptarse a matemáticas, historia, ciencias, idiomas, etc.
- **Configuración completa**: Desde terminología hasta reglas de negocio, todo configurable
- **Sin dependencias de dominio**: No hay referencias hardcodeadas a "inglés", "idiomas" o conceptos específicos

### Ejemplos de Extensibilidad
```json
// Para matemáticas
{
  "domain": "mathematics",
  "levels": ["basic", "intermediate", "advanced"],
  "categories": ["algebra", "geometry", "calculus"]
}

// Para historia  
{
  "domain": "history",
  "levels": ["ancient", "medieval", "modern"],
  "categories": ["events", "figures", "dates"]
}
```

### Estructura de Configuración JSON
```
public/data/
├── existing module files (extended with optional enhancement fields)
│   ├── a1/a1-flashcard-basic-vocabulary.json  # Campos opcionales añadidos
│   ├── a1/a1-completion-basic-sentences.json  # Campos opcionales añadidos
│   └── ... (todos los archivos existentes)
├── config/
│   ├── daily-challenges-config.json    # Configuración de desafíos
│   ├── gamification-config.json        # Puntos, badges, reglas
│   ├── thematic-paths-config.json      # Definición de rutas temáticas
│   └── spaced-repetition-config.json   # Algoritmos y parámetros
└── existing structure...
```

### Ejemplo de Extensión Directa de Datos
```json
// a1-flashcard-basic-vocabulary.json (extendido)
[
  {
    "front": "Hello",
    "back": "Hola", 
    "ipa": "/həˈloʊ/",
    "example": "Hello, how are you?",
    "example_es": "Hola, ¿cómo estás?",
    "en": "Hello",
    "es": "Hola",
    // Campos opcionales mejorados:
    "contextualTips": ["Used in formal and informal situations"],
    "memoryAids": ["Think 'hola' sounds like 'hello'"],
    "culturalNotes": "Standard greeting in most English-speaking countries"
  }
]
```

```json
// config/thematic-paths-config.json
{
  "paths": [
    {
      "id": "business-path",
      "name": "Business English", 
      "moduleFilters": {
        "categories": ["Vocabulary", "Grammar"],
        "tags": ["business", "professional"]
      }
    }
  ]
}
```

### Servicios de Configuración
```typescript
interface ConfigurationService {
  loadConfig<T>(configFile: string): Promise<T>;
  validateConfig(config: any, schema: any): boolean;
  reloadConfigurations(): Promise<void>;
}
```

## Integración No Invasiva con UI Existente

### Principios de Diseño UI
1. **No Modificar Menú Principal**: Todas las nuevas funcionalidades se integran sin cambiar la estructura del menú existente
2. **Sistema de Notificaciones**: Usar badges, toasts y modals para nuevas funcionalidades
3. **Header Enhancement**: Añadir elementos sutiles al header existente (puntos, racha, notificaciones)
4. **Modal Overlays**: Usar modals para experiencias completas sin navegar fuera del contexto actual

### Implementación Visual

#### Header Existente + Mejoras
```
[Logo] [Navigation] [Points: 1250] [Streak: 🔥7] [🔔 Daily Challenge] [Settings]
                    ↑ Nuevo      ↑ Nuevo      ↑ Nuevo badge
```

#### Sistema de Modals
- **Daily Challenge Modal**: Se abre desde badge de notificación
- **Progress Analytics Modal**: Se abre desde puntos/racha
- **Badge Collection Modal**: Se abre desde notificaciones de logros
- **Thematic Paths Modal**: Se abre desde nuevo botón en header

#### Toast Notifications
- Logros desbloqueados
- Puntos ganados
- Racha mantenida/perdida
- Desafío diario completado

## Performance Considerations y Bundle Size

### Estrategias Anti-Bundle Bloat
- **Code Splitting Agresivo**: Cada funcionalidad en chunk separado
- **Lazy Loading Obligatorio**: NO cargar nada hasta que se use
- **Tree Shaking**: Importaciones específicas, no imports completos
- **Dynamic Imports**: Servicios cargados solo cuando se necesiten

### Implementación de Lazy Loading
```typescript
// ❌ MAL - Carga todo en el bundle principal
import { AnalyticsService } from '../services/analytics';
import { GamificationEngine } from '../services/gamification';

// ✅ BIEN - Carga bajo demanda
const useAnalytics = () => {
  const [service, setService] = useState(null);
  
  const loadService = useCallback(async () => {
    if (!service) {
      const { AnalyticsService } = await import('../services/analytics');
      setService(new AnalyticsService());
    }
    return service;
  }, [service]);
  
  return { loadService };
};
```

### Bundle Size Monitoring
- **Límite por chunk**: Máximo 50KB por funcionalidad nueva
- **Análisis de dependencias**: Evitar librerías pesadas innecesarias
- **Webpack Bundle Analyzer**: Monitoreo continuo del tamaño
- **Core bundle protection**: Mantener index.js bajo 500KB

### Optimization Strategies
- **Lazy Loading**: Load analytics and gamification data on demand
- **Caching**: Cache challenge generation and theme calculations  
- **Debouncing**: Debounce progress updates and analytics calculations
- **Memory Management**: Efficient cleanup of chart data and analytics

### Estrategia de Completar Contenido

### Análisis de Gaps Actuales para Inglés A1-C2
```
Distribución Actual de Módulos:
- A1: 5 módulos (insuficiente para rutas temáticas)
- A2: 8 módulos 
- B1: 8 módulos
- B2: 9 módulos  
- C1: 8 módulos
- C2: 8 módulos

Categorías A1 Actuales:
- Vocabulary: 2 módulos
- Grammar: 2 módulos  
- Review: 1 módulo
- Faltantes: Business, Travel, Daily Life content

Objetivo: Completar A1-C2 con contenido temático específico
```

### Configuración de Contenido Inglés
```json
{
  "contentRequirements": {
    "levels": ["a1", "a2", "b1", "b2", "c1", "c2"],
    "themes": ["business", "travel", "daily-life"],
    "minimumModulesPerLevel": 8,
    "minimumModulesPerTheme": 3,
    "requiredCategories": ["Vocabulary", "Grammar", "PhrasalVerbs", "Idioms"],
    "learningModes": ["flashcard", "quiz", "completion", "sorting", "matching"]
  }
}
```

### Servicio de Análisis de Contenido
```typescript
interface ContentGapAnalysisService {
  analyzeContentGaps(): ContentGapReport;
  generateMissingModules(level: DifficultyLevel, theme: string): LearningModule[];
  prioritizeContentCreation(): ContentCreationPlan;
  validateThematicPathCompleteness(theme: string): boolean;
}

interface ContentGapReport {
  levelGaps: Record<DifficultyLevel, number>;
  thematicGaps: Record<string, DifficultyLevel[]>;
  categoryGaps: Record<Category, DifficultyLevel[]>;
  priorityList: ContentCreationTask[];
}

interface ContentCreationTask {
  level: DifficultyLevel;
  category: Category;
  theme: string;
  learningMode: LearningMode;
  priority: 'high' | 'medium' | 'low';
  estimatedEffort: number;
}
```

### Plan de Creación de Contenido Inglés A1-C2
```json
// english-content-creation-plan.json
{
  "phases": [
    {
      "id": "phase-1",
      "name": "Completar A1 con contenido temático",
      "targets": ["a1-business", "a1-travel", "a1-daily-life"],
      "priority": "high"
    },
    {
      "id": "phase-2", 
      "name": "Balancear Business/Travel/Daily Life en A2-C2",
      "targets": ["business-modules", "travel-modules", "daily-life-modules"]
    },
    {
      "id": "phase-3",
      "name": "Completar representación en todos los modos",
      "targets": ["flashcard", "quiz", "completion", "sorting", "matching"]
    }
  ]
}
```

## Monitoring
- Track performance impact of new features
- Monitor bundle size increases
- Measure user engagement with new features
- Analytics on feature adoption rates
- Monitor content gap resolution progress