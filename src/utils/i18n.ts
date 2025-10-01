import type { Language } from '../types';

// Enhanced translations with nested structure
export const translations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'Reset',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      completed: 'Completed',
      available: 'Available',
      locked: 'Locked',
      exercise: 'Exercise',
      continue: 'Continue Learning',
    },
    navigation: {
      mainMenu: 'Main Menu',
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
      about: 'About',
      configuration: 'Configuration',
    },
    modals: {
      progressDashboard: 'Progress Dashboard',
      progressDashboardDesc: 'Compact view of learning progress',
      learningPath: 'Learning Path',
      learningPathDesc: 'Progress by levels and available modules',
      advancedSettings: 'Advanced Settings',
      advancedSettingsDesc: 'Theme, language and game settings',
      aboutApp: 'About',
      aboutAppDesc: 'Application and developer information',
      userProfile: 'User Profile',
      userProfileDesc: 'Personal configuration and preferences',
      aboutFluentFlow: 'About FluentFlow',
      editProfile: 'Edit Profile',
    },
    settings: {
      settings: 'Settings',
      generalSettings: 'General Settings',
      itemSettings: 'Game Settings',
      categorySettings: 'Category Settings',
      theme: 'Theme',
      language: 'Language',
      level: 'Level',
      light: 'Light',
      dark: 'Dark',
      english: 'English',
      spanish: 'Spanish',
      all: 'All Levels',
      a1: 'Beginner (A1)',
      a2: 'Elementary (A2)',
      b1: 'Intermediate (B1)',
      b2: 'Upper Intermediate (B2)',
      c1: 'Advanced (C1)',
      c2: 'Proficient (C2)',
      flashcardMode: 'Flashcard Mode',
      quizMode: 'Quiz Mode',
      completionMode: 'Completion Mode',
      sortingMode: 'Sorting Mode',
      sortingCategories: 'Sorting Categories',
      matchingMode: 'Matching Mode',
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
      phrasalVerbs: 'Phrasal Verbs',
      idioms: 'Idioms',
      edit: 'Edit',
      cancel: 'Cancel',
      save: 'Save',
      developmentMode: 'Development Mode',
      enabled: 'Enabled',
      disabled: 'Disabled',
      developmentModeDescription: 'Unlock all modes for testing',
    },
    about: {
      title: 'About FluentFlow',
      subtitle: 'Advanced English Learning Platform',
      version: 'Version',
      platform: 'Platform',
      build: 'Build',
      developer: 'Developer',
      description: 'Description',
      descriptionText:
        'FluentFlow is an advanced English learning platform designed to help you improve your vocabulary and comprehension through interactive exercises.',
      features: 'Key Features',
      feature1: 'Interactive flashcards and quizzes',
      feature2: 'Adaptive difficulty levels (A1-C2)',
      feature3: 'Progress tracking and analytics',
      feature4: 'Multilingual interface (English/Spanish)',
      feature5: 'Multiple learning modes and games',
      developerTitle: 'Cloud Expert passionate about GenAI',
      acknowledgments: 'Acknowledgments',
      acknowledgementsText:
        'Built with passion for language learning and education. Special thanks to the open-source community for the amazing tools and libraries that made this project possible.',
    },
    learning: {
      flashcards: 'Flashcards',
      quiz: 'Quiz',
      completion: 'Completion',
      sorting: 'Sorting',
      matching: 'Matching',
      // Learning mode labels
      flashcardMode: 'Flashcards',
      quizMode: 'Quiz',
      completionMode: 'Complete',
      sortingMode: 'Sort',
      matchingMode: 'Match',
      startLearning: 'Start Learning',
      continueSession: 'Continue Session',
      newSession: 'New Session',
      flip: 'Flip',
      flipBack: 'Flip Back',
      helpTextFlipped: 'Press Enter/Space for next card',
      helpTextNotFlipped: 'Click card or press Enter/Space to flip',
      backToMenu: 'Back to Menu',
      returnToMainMenu: 'Return to main menu',
      previousCard: 'Previous Card (←)',
      nextCard: 'Next Card (→)',
      finishFlashcards: 'Finish Flashcards',
      // Matching mode
      matched: 'matched',
      allMatched: 'All matched! Check your answers',
      clickToMatch: 'Click items from both columns to match them',
      terms: 'Terms',
      definitions: 'Definitions',
      resetExercise: 'Reset Exercise',
      checkMatches: 'Check Matches',
      viewSummary: 'View Summary',
      finishExercise: 'Finish Exercise',
      exerciseSummary: 'Exercise Summary',
      correctAnswer: 'Correct answer:',
      yourAnswer: 'Your answer:',
      explanation: 'Explanation:',
      match: 'Match:',
      showExplanation: 'Show explanation',
      loadingMatching: 'Loading matching exercise...',
      // Completion mode
      completeSentence: 'Complete the sentence:',
      fillBlank: 'Fill the blank and press Enter',
      pressEnterNext: 'Press Enter for next exercise',
      checkAnswer: 'Check Answer',
      nextExercise: 'Next Exercise',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      answer: 'Answer:',
      tip: 'Tip:',
      // Quiz mode
      pressSelectOption: 'Press 1-4 to select or click an option',
      nextQuestion: 'Next Question',
      finishQuiz: 'Finish Quiz',
      loadingQuestion: 'Loading question...',
      noQuizQuestions: 'No quiz questions available',
      // Sorting mode
      availableWords: 'Available Words',
      allWordsSorted: 'All words have been sorted!',
      allSorted: 'All words sorted! Check your answers',
      dragDropWords: 'Drag and drop words into categories',
      checkAnswers: 'Check Answers',
      finishSorting: 'Finish Sorting',
      loadingSorting: 'Loading sorting exercise...',
      // Status messages
      requiresPrerequisites: 'Requires {{count}} prerequisite{{plural}}',
      startExercise: 'Start {{mode}}: {{name}} (Level: {{level}})',
      exerciseIsLocked: '{{name}} is locked. {{status}}',
      // No data messages
      noFlashcardsAvailable: 'No flashcards available',
      noCompletionExercisesAvailable: 'No completion exercises available',
      noQuizQuestionsAvailable: 'No quiz questions available',
      noSortingExercisesAvailable: 'No sorting exercises available',
      noMatchingExercisesAvailable: 'No matching exercises available',
      // Additional UI messages
      noAnswer: 'No answer',
      notSorted: 'Not sorted',
      belongsToCategory: 'This word belongs to {{category}}',
    },
    scores: {
      correct: 'Correct',
      incorrect: 'Incorrect',
      total: 'Total',
      accuracy: 'Accuracy',
      sessionScore: 'Session Score',
      globalScore: 'Global Score',
      bestScore: 'Best Score',
      attempts: 'Attempts',
      timeSpent: 'Time Spent',
    },
    dashboard: {
      learningDashboard: 'Learning Dashboard',
      totalScore: 'Points earned',
      avgScore: 'Avg accuracy',
      totalSessions: 'Sessions done',
      timeSpent: 'Time practiced',
      weeklyProgress: 'Weekly Progress',
      modulePerformance: 'Module Performance',
      learningAccuracy: 'Accuracy',
      studySessions: 'Sessions',
      noProgressData: 'No data yet',
      noModuleData: 'No modules completed',
      completeModulesMessage: 'Complete modules to see progress!',
      helpButton: 'Help',
      helpTitle: 'How Metrics Work',
      helpPointsTitle: 'Points System',
      helpPointsDesc:
        'Earn points by completing quizzes and exercises. Higher accuracy = more points per question.',
      helpAccuracyTitle: 'Accuracy Score',
      helpAccuracyDesc:
        'Percentage of correct answers in your recent sessions. Calculated from your last 7 days of activity.',
      helpSessionsTitle: 'Study Sessions',
      helpSessionsDesc:
        'Each time you complete a learning module counts as one session. More sessions = more practice!',
      helpTimeTitle: 'Practice Time',
      helpTimeDesc:
        "Total minutes spent actively learning. Time is tracked while you're engaged with exercises.",
      helpProgressTitle: 'Progress Tracking',
      helpProgressDesc:
        'Charts show your daily performance trends. Blue bars = accuracy, green line = session count.',
      helpModuleTitle: 'Module Performance',
      helpModuleDesc:
        'Your best score in each completed module. Focus on modules with lower scores to improve.',
      closeHelp: 'Got it!',
    },
    categories: {
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
      phrasalverbs: 'Phrasal Verbs',
      idioms: 'Idioms',
      all: 'All Categories',
    },
    levels: {
      all: 'All Levels',
      a1: 'Beginner (A1)',
      a2: 'Elementary (A2)',
      b1: 'Intermediate (B1)',
      b2: 'Upper Intermediate (B2)',
      c1: 'Advanced (C1)',
      c2: 'Proficient (C2)',
    },
    messages: {
      noDataAvailable: 'No data available',
      moduleNotFound: 'Module not found',
      loadingFailed: 'Failed to load content',
      sessionComplete: 'Session completed!',
      wellDone: 'Well done!',
      tryAgain: 'Try again',
      correctAnswer: 'Correct answer!',
      incorrectAnswer: 'Incorrect answer',
      gameComplete: 'Game completed!',
      newRecord: 'New record!',
    },
    profile: {
      userProfile: 'User Profile',
      personalInfo: 'Personal Information',
      basicInfo: 'Basic Information',
      learningPreferences: 'Learning Preferences',
      preferences: 'Preferences',
      name: 'Name',
      enterName: 'Enter your name',
      englishLevel: 'English Level',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      interfaceLanguage: 'Interface Language',
      language: 'Language',
      dailyGoal: 'Daily Goal',
      difficulty: 'Difficulty',
      difficultyLevel: 'Difficulty Level',
      veryEasy: 'Very Easy',
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
      veryHard: 'Very Hard',
      interestedCategories: 'Categories of Interest',
      enableNotifications: 'Enable Notifications',
      notificationDescription: 'Get reminders to maintain your study streak',
      saveProfile: 'Save Profile',
      profileSubtitle: 'Customize your learning experience',
      nameRequired: 'Name must be at least 2 characters',
      categoriesRequired: 'Select at least one category',
    },
    learningPath: {
      complete: 'Complete',
      completed: 'Completed',
      available: 'Available',
      locked: 'Locked',
      nextRecommended: 'Next Recommended',
      recommended: 'Recommended',
      unitProgress: 'Progress by Level',
    },
    errors: {
      somethingWentWrong: 'Something went wrong',
      networkError: 'Network error',
      serverError: 'Server error',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
      timeout: 'Request timeout',
      unknownError: 'Unknown error',
    },
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      retry: 'Reintentar',
      cancel: 'Cancelar',
      save: 'Guardar',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      finish: 'Finalizar',
      start: 'Comenzar',
      pause: 'Pausar',
      resume: 'Continuar',
      reset: 'Reiniciar',
      correct: '¡Correcto!',
      incorrect: 'Incorrecto',
      completed: 'Completado',
      available: 'Disponible',
      locked: 'Bloqueado',
      exercise: 'Ejercicio',
      continue: 'Continuar Aprendiendo',
    },
    navigation: {
      mainMenu: 'Menú Principal',
      dashboard: 'Panel',
      settings: 'Configuración',
      profile: 'Perfil',
      help: 'Ayuda',
      about: 'Acerca de',
      configuration: 'Configuración',
    },
    modals: {
      progressDashboard: 'Dashboard de Progreso',
      progressDashboardDesc: 'Vista compacta del progreso de aprendizaje',
      learningPath: 'Ruta de Aprendizaje',
      learningPathDesc: 'Progreso por niveles y módulos disponibles',
      advancedSettings: 'Configuración Avanzada',
      advancedSettingsDesc: 'Ajustes de tema, idioma y juegos',
      aboutApp: 'Acerca de',
      aboutAppDesc: 'Información de la aplicación y desarrollador',
      userProfile: 'Perfil de Usuario',
      userProfileDesc: 'Configuración personal y preferencias',
      aboutFluentFlow: 'Acerca de FluentFlow',
      editProfile: 'Editar Perfil',
    },
    settings: {
      settings: 'Configuración',
      generalSettings: 'Configuración General',
      itemSettings: 'Configuración de Juego',
      categorySettings: 'Configuración de Categorías',
      theme: 'Tema',
      language: 'Idioma',
      level: 'Nivel',
      light: 'Claro',
      dark: 'Oscuro',
      english: 'Inglés',
      spanish: 'Español',
      all: 'Todos los Niveles',
      a1: 'Principiante (A1)',
      a2: 'Elemental (A2)',
      b1: 'Intermedio (B1)',
      b2: 'Intermedio Alto (B2)',
      c1: 'Avanzado (C1)',
      c2: 'Competente (C2)',
      flashcardMode: 'Modo Tarjetas',
      quizMode: 'Modo Cuestionario',
      completionMode: 'Modo Completar',
      sortingMode: 'Modo Clasificar',
      sortingCategories: 'Categorías de Clasificación',
      matchingMode: 'Modo Emparejar',
      vocabulary: 'Vocabulario',
      grammar: 'Gramática',
      phrasalVerbs: 'Verbos Frasales',
      idioms: 'Modismos',
      edit: 'Editar',
      cancel: 'Cancelar',
      save: 'Guardar',
      developmentMode: 'Modo Desarrollo',
      enabled: 'Habilitado',
      disabled: 'Deshabilitado',
      developmentModeDescription: 'Desbloquea todos los modos para pruebas',
    },
    about: {
      title: 'Acerca de FluentFlow',
      subtitle: 'Plataforma Avanzada de Aprendizaje de Inglés',
      version: 'Versión',
      platform: 'Plataforma',
      build: 'Build',
      developer: 'Desarrollador',
      description: 'Descripción',
      descriptionText:
        'FluentFlow es una plataforma avanzada de aprendizaje de inglés diseñada para ayudarte a mejorar tu vocabulario y comprensión a través de ejercicios interactivos.',
      features: 'Características Principales',
      feature1: 'Tarjetas interactivas y cuestionarios',
      feature2: 'Niveles de dificultad adaptativos (A1-C2)',
      feature3: 'Seguimiento de progreso y análisis',
      feature4: 'Interfaz multiidioma (Inglés/Español)',
      feature5: 'Múltiples modos de aprendizaje y juegos',
      developerTitle: 'Experto Cloud apasionado por la GenAI',
      acknowledgments: 'Agradecimientos',
      acknowledgementsText:
        'Construido con pasión por el aprendizaje de idiomas y la educación. Agradecimientos especiales a la comunidad de código abierto por las increíbles herramientas y librerías que hicieron posible este proyecto.',
    },
    learning: {
      flashcards: 'Tarjetas',
      quiz: 'Cuestionario',
      completion: 'Completar',
      sorting: 'Clasificar',
      matching: 'Emparejar',
      // Learning mode labels
      flashcardMode: 'Tarjetas',
      quizMode: 'Cuestionario',
      completionMode: 'Completar',
      sortingMode: 'Clasificar',
      matchingMode: 'Emparejar',
      startLearning: 'Comenzar Aprendizaje',
      continueSession: 'Continuar Sesión',
      newSession: 'Nueva Sesión',
      flip: 'Voltear',
      flipBack: 'Volver',
      helpTextFlipped: 'Presiona Enter/Espacio para siguiente tarjeta',
      helpTextNotFlipped: 'Haz clic en la tarjeta o presiona Enter/Espacio para voltear',
      backToMenu: 'Volver al Menú',
      returnToMainMenu: 'Volver al menú principal',
      previousCard: 'Tarjeta Anterior (←)',
      nextCard: 'Siguiente Tarjeta (→)',
      finishFlashcards: 'Finalizar Tarjetas',
      // Matching mode
      matched: 'emparejados',
      allMatched: '¡Todos emparejados! Verifica tus respuestas',
      clickToMatch: 'Haz clic en elementos de ambas columnas para emparejarlos',
      terms: 'Términos',
      definitions: 'Definiciones',
      resetExercise: 'Reiniciar Ejercicio',
      checkMatches: 'Verificar Emparejamientos',
      viewSummary: 'Ver Resumen',
      finishExercise: 'Finalizar Ejercicio',
      exerciseSummary: 'Resumen del Ejercicio',
      correctAnswer: 'Respuesta correcta:',
      yourAnswer: 'Tu respuesta:',
      explanation: 'Explicación:',
      match: 'Emparejamiento:',
      showExplanation: 'Mostrar explicación',
      loadingMatching: 'Cargando ejercicio de emparejamiento...',
      // Completion mode
      completeSentence: 'Completa la oración:',
      fillBlank: 'Llena el espacio en blanco y presiona Enter',
      pressEnterNext: 'Presiona Enter para el siguiente ejercicio',
      checkAnswer: 'Verificar Respuesta',
      nextExercise: 'Siguiente Ejercicio',
      correct: '¡Correcto!',
      incorrect: 'Incorrecto',
      answer: 'Respuesta:',
      tip: 'Consejo:',
      // Quiz mode
      pressSelectOption: 'Presiona 1-4 para seleccionar o haz clic en una opción',
      nextQuestion: 'Siguiente Pregunta',
      finishQuiz: 'Finalizar Cuestionario',
      loadingQuestion: 'Cargando pregunta...',
      noQuizQuestions: 'No hay preguntas de cuestionario disponibles',
      // Sorting mode
      availableWords: 'Palabras Disponibles',
      allWordsSorted: '¡Todas las palabras han sido clasificadas!',
      allSorted: '¡Todas las palabras clasificadas! Verifica tus respuestas',
      dragDropWords: 'Arrastra y suelta palabras en las categorías',
      checkAnswers: 'Verificar Respuestas',
      finishSorting: 'Finalizar Clasificación',
      loadingSorting: 'Cargando ejercicio de clasificación...',
      // Status messages
      requiresPrerequisites: 'Requiere {{count}} prerrequisito{{plural}}',
      startExercise: 'Iniciar {{mode}}: {{name}} (Nivel: {{level}})',
      exerciseIsLocked: '{{name}} está bloqueado. {{status}}',
      // No data messages
      noFlashcardsAvailable: 'No hay tarjetas disponibles',
      noCompletionExercisesAvailable: 'No hay ejercicios de completar disponibles',
      noQuizQuestionsAvailable: 'No hay preguntas de cuestionario disponibles',
      noSortingExercisesAvailable: 'No hay ejercicios de clasificación disponibles',
      noMatchingExercisesAvailable: 'No hay ejercicios de emparejamiento disponibles',
      // Additional UI messages
      noAnswer: 'Sin respuesta',
      notSorted: 'Sin clasificar',
      belongsToCategory: 'Esta palabra pertenece a {{category}}',
    },
    scores: {
      correct: 'Correctas',
      incorrect: 'Incorrectas',
      total: 'Total',
      accuracy: 'Precisión',
      sessionScore: 'Puntuación de Sesión',
      globalScore: 'Puntuación Global',
      bestScore: 'Mejor Puntuación',
      attempts: 'Intentos',
      timeSpent: 'Tiempo Empleado',
    },
    dashboard: {
      learningDashboard: 'Panel de Aprendizaje',
      totalScore: 'Puntos obtenidos',
      avgScore: 'Precisión promedio',
      totalSessions: 'Sesiones hechas',
      timeSpent: 'Tiempo practicado',
      weeklyProgress: 'Progreso Semanal',
      modulePerformance: 'Rendimiento por Módulo',
      learningAccuracy: 'Precisión',
      studySessions: 'Sesiones',
      noProgressData: 'Sin datos aún',
      noModuleData: 'Sin módulos completados',
      completeModulesMessage: '¡Completa módulos para ver progreso!',
      helpButton: 'Ayuda',
      helpTitle: 'Cómo Funcionan las Métricas',
      helpPointsTitle: 'Sistema de Puntos',
      helpPointsDesc:
        'Gana puntos completando cuestionarios y ejercicios. Mayor precisión = más puntos por pregunta.',
      helpAccuracyTitle: 'Puntuación de Precisión',
      helpAccuracyDesc:
        'Porcentaje de respuestas correctas en tus sesiones recientes. Calculado de tus últimos 7 días de actividad.',
      helpSessionsTitle: 'Sesiones de Estudio',
      helpSessionsDesc:
        'Cada vez que completas un módulo de aprendizaje cuenta como una sesión. ¡Más sesiones = más práctica!',
      helpTimeTitle: 'Tiempo de Práctica',
      helpTimeDesc:
        'Minutos totales dedicados al aprendizaje activo. El tiempo se registra mientras participas en ejercicios.',
      helpProgressTitle: 'Seguimiento de Progreso',
      helpProgressDesc:
        'Los gráficos muestran tus tendencias de rendimiento diario. Barras azules = precisión, línea verde = número de sesiones.',
      helpModuleTitle: 'Rendimiento por Módulo',
      helpModuleDesc:
        'Tu mejor puntuación en cada módulo completado. Enfócate en módulos con puntuaciones más bajas para mejorar.',
      closeHelp: '¡Entendido!',
    },
    categories: {
      vocabulary: 'Vocabulario',
      grammar: 'Gramática',
      phrasalverbs: 'Verbos Frasales',
      idioms: 'Modismos',
      all: 'Todas las Categorías',
    },
    levels: {
      all: 'Todos los Niveles',
      a1: 'Principiante (A1)',
      a2: 'Elemental (A2)',
      b1: 'Intermedio (B1)',
      b2: 'Intermedio Alto (B2)',
      c1: 'Avanzado (C1)',
      c2: 'Competente (C2)',
    },
    messages: {
      noDataAvailable: 'No hay datos disponibles',
      moduleNotFound: 'Módulo no encontrado',
      loadingFailed: 'Error al cargar contenido',
      sessionComplete: '¡Sesión completada!',
      wellDone: '¡Bien hecho!',
      tryAgain: 'Inténtalo de nuevo',
      correctAnswer: '¡Respuesta correcta!',
      incorrectAnswer: 'Respuesta incorrecta',
      gameComplete: '¡Juego completado!',
      newRecord: '¡Nuevo récord!',
    },
    profile: {
      userProfile: 'Perfil de Usuario',
      personalInfo: 'Información Personal',
      basicInfo: 'Información Básica',
      learningPreferences: 'Preferencias de Aprendizaje',
      preferences: 'Preferencias',
      name: 'Nombre',
      enterName: 'Ingresa tu nombre completo',
      englishLevel: 'Nivel de Inglés',
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      interfaceLanguage: 'Idioma de la Interfaz',
      language: 'Idioma',
      dailyGoal: 'Meta Diaria',
      difficulty: 'Dificultad',
      difficultyLevel: 'Nivel de Dificultad',
      veryEasy: 'Muy Fácil',
      easy: 'Fácil',
      normal: 'Normal',
      hard: 'Difícil',
      veryHard: 'Muy Difícil',
      interestedCategories: 'Categorías de Interés',
      enableNotifications: 'Habilitar Notificaciones',
      notificationDescription: 'Recibe recordatorios para mantener tu racha de estudio',
      saveProfile: 'Guardar Perfil',
      profileSubtitle: 'Personaliza tu experiencia de aprendizaje',
      nameRequired: 'El nombre debe tener al menos 2 caracteres',
      categoriesRequired: 'Selecciona al menos una categoría',
    },
    learningPath: {
      complete: 'Completo',
      completed: 'Completados',
      available: 'Disponibles',
      locked: 'Bloqueados',
      nextRecommended: 'Siguiente Recomendado',
      recommended: 'Recomendado',
      unitProgress: 'Progreso por Nivel',
    },
    errors: {
      somethingWentWrong: 'Algo salió mal',
      networkError: 'Error de red',
      serverError: 'Error del servidor',
      notFound: 'No encontrado',
      unauthorized: 'No autorizado',
      forbidden: 'Prohibido',
      timeout: 'Tiempo de espera agotado',
      unknownError: 'Error desconocido',
    },
  },
} as const;

// Type-safe translation keys based on the JSON structure
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKeys = NestedKeyOf<typeof translations.en>;

export const useTranslation = (language: Language) => {
  const t = (
    key: TranslationKeys | string,
    defaultValue?: string,
    interpolation?: Record<string, string | number>
  ): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    // If value is still an object, it means we didn't find the right key
    // Return the defaultValue or the key itself as a string
    let result: string;
    if (typeof value === 'string') {
      result = value;
    } else if (defaultValue) {
      result = defaultValue;
    } else {
      result = key; // Return the key as fallback
    }

    // Simple interpolation support
    if (interpolation && typeof result === 'string') {
      Object.entries(interpolation).forEach(([placeholder, replacement]) => {
        result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacement));
      });
    }

    return result;
  };

  // Helper functions for common translation patterns
  const tn = (namespace: string, key: string, defaultValue?: string) => {
    return t(`${namespace}.${key}` as TranslationKeys, defaultValue);
  };

  const tc = (key: string, count: number, defaultValue?: string) => {
    const pluralKey = count === 1 ? key : `${key}_plural`;
    return t(pluralKey as TranslationKeys, defaultValue, { count });
  };

  return {
    t,
    tn, // namespace translation
    tc, // count-based translation
    language,
    // Check if translation exists
    exists: (key: string) => {
      const keys = key.split('.');
      let value: any = translations[language];
      for (const k of keys) {
        value = value?.[k];
      }
      return value !== undefined;
    },
  };
};

// Translation key builders (use these with useTranslation hook in components)
export const getCommonKey = (key: string) => `common.${key}` as TranslationKeys;
export const getErrorKey = (key: string) => `errors.${key}` as TranslationKeys;
export const getCategoryKey = (category: string) => {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '');
  return `categories.${categoryKey}` as TranslationKeys;
};
export const getLevelKey = (level: string) => `levels.${level.toLowerCase()}` as TranslationKeys;
