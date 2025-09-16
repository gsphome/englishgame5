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

## Componentes e Interfaces

### 1. Sistema de Contenido Mejorado

#### Servicio de Mejora de Contenido
```typescript
interface EnhancedContentService {
  enrichFlashcard(data: FlashcardData): EnhancedFlashcardData;
  enrichCompletion(data: CompletionData): EnhancedCompletionData;
  generateContextualTips(content: string, level: DifficultyLevel): string[];
  generateGrammarExplanation(rule: string): DetailedExplanation;
}

interface EnhancedFlashcardData extends FlashcardData {
  contextualTips: string[];
  memoryAids: string[];
  culturalNotes?: string;
  commonMistakes?: string[];
}

interface DetailedExplanation {
  rule: string;
  examples: string[];
  commonMistakes: string[];
  tips: string[];
  relatedConcepts: string[];
}
```

### 2. Sistema de Desafío Diario

#### Componentes de Desafío Diario
```typescript
interface DailyChallengeService {
  generateDailyChallenge(userLevel: DifficultyLevel, date: Date): DailyChallenge;
  checkChallengeAvailability(userId: string): boolean;
  completeDailyChallenge(userId: string, results: ChallengeResults): void;
}

interface DailyChallenge {
  id: string;
  date: Date;
  modules: LearningModule[];
  estimatedTime: number;
  bonusPoints: number;
  theme?: string;
}

interface ChallengeResults {
  accuracy: number;
  timeSpent: number;
  modulesCompleted: string[];
  streakMaintained: boolean;
}
```

#### Componentes UI de Desafío Diario
- `DailyChallengeCard`: Presentación principal del desafío
- `ChallengeProgress`: Progreso en tiempo real durante el desafío
- `ChallengeResults`: Resultados e información de racha
- `ChallengeHistory`: Desafíos pasados y rendimiento

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
  calculatePoints(action: UserAction, context: ActionContext): number;
  checkBadgeEligibility(userId: string): Badge[];
  updateStreak(userId: string, studyDate: Date): StreakInfo;
  generateLeaderboard(scope: LeaderboardScope): LeaderboardEntry[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
  streakMultiplier: number;
}
```

#### Gamification UI Components
- `PointsDisplay`: Real-time points counter
- `BadgeCollection`: User's earned badges
- `StreakIndicator`: Current streak status
- `AchievementNotification`: Toast-style achievement alerts

### 5. Thematic Learning Paths

#### Theme Organization Service
```typescript
interface ThemeService {
  getThematicPaths(): ThematicPath[];
  getModulesForTheme(theme: string): LearningModule[];
  calculateThemeProgress(userId: string, theme: string): ThemeProgress;
  recommendNextModule(userId: string, theme: string): LearningModule | null;
}

interface ThematicPath {
  id: string;
  name: string;
  description: string;
  modules: string[]; // module IDs
  estimatedTime: number;
  difficulty: number;
  prerequisites: string[];
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

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Load analytics and gamification data on demand
- **Caching**: Cache challenge generation and theme calculations
- **Debouncing**: Debounce progress updates and analytics calculations
- **Memory Management**: Efficient cleanup of chart data and analytics

### Monitoring
- Track performance impact of new features
- Monitor bundle size increases
- Measure user engagement with new features
- Analytics on feature adoption rates