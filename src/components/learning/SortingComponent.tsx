import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, Info, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProgressStore } from '../../stores/progressStore';
import { useToast } from '../../hooks/useToast';
import { useLearningCleanup } from '../../hooks/useLearningCleanup';
import NavigationButton from '../ui/NavigationButton';
import '../../styles/components/sorting-modal.css';
import type { LearningModule } from '../../types';

// Get category display name from module data
const getCategoryDisplayName = (categoryId: string, moduleData: any): string => {
  // Try to find the category mapping in the module's categories array
  if (moduleData?.categories && Array.isArray(moduleData.categories)) {
    const categoryMapping = moduleData.categories.find(
      (cat: any) => cat.category_id === categoryId
    );
    if (categoryMapping?.category_show) {
      return categoryMapping.category_show;
    }
  }

  // Fallback to formatted category ID if no mapping found
  return categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace(/_/g, ' ');
};

interface SortingData {
  id: string;
  words: string[];
  categories: { name: string; items: string[] }[];
}

interface SortingComponentProps {
  module: LearningModule;
}

const SortingComponent: React.FC<SortingComponentProps> = ({ module }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [sortedItems, setSortedItems] = useState<Record<string, string[]>>({});
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);

  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { addProgressEntry } = useProgressStore();
  const { showCorrectAnswer, showIncorrectAnswer, showModuleCompleted } = useToast();
  useLearningCleanup();

  const [exercise, setExercise] = useState<SortingData>({ id: '', words: [], categories: [] });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showExplanation) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          setShowExplanation(false);
        }
      } else if (e.key === 'Escape') {
        setCurrentView('menu');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showExplanation, setCurrentView]);

  useEffect(() => {
    let newExercise: SortingData = { id: '', words: [], categories: [] };

    if (module?.data && Array.isArray(module.data)) {
      const firstItem = module.data[0];
      if (firstItem && 'category' in firstItem && 'word' in firstItem) {
        const uniqueCategories = [...new Set(module.data.map((item: any) => item.category))];
        const shuffledCategories = uniqueCategories.sort(() => Math.random() - 0.5);
        const { gameSettings } = useSettingsStore.getState();
        const totalWords = gameSettings.sortingMode.wordCount;
        const categoryCount = gameSettings.sortingMode.categoryCount || 3;
        const selectedCategories = shuffledCategories.slice(0, categoryCount);
        const wordsPerCategory = Math.ceil(totalWords / categoryCount);
        const wordsForCategories: string[] = [];

        const categories = selectedCategories.map(categoryId => {
          const categoryWords = (module.data || [])
            .filter((item: any) => item.category === categoryId)
            .map((item: any) => item.word)
            .slice(0, wordsPerCategory);

          wordsForCategories.push(...categoryWords);

          return {
            name: getCategoryDisplayName(categoryId, module),
            items: categoryWords,
          };
        });

        // Limit total words to settings value
        const finalWords = wordsForCategories.slice(0, totalWords);

        // Update categories to only include words that are actually available
        const updatedCategories = categories.map(category => ({
          ...category,
          items: category.items.filter(word => finalWords.includes(word)),
        }));

        newExercise = {
          id: 'sorting-exercise',
          words: finalWords,
          categories: updatedCategories,
        };
      }
    }

    setExercise(newExercise);

    if (newExercise.words?.length > 0) {
      const shuffled = [...newExercise.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);

      const initialSorted: Record<string, string[]> = {};
      (newExercise.categories || []).forEach(cat => {
        initialSorted[cat.name] = [];
      });
      setSortedItems(initialSorted);
    }
  }, [module]);

  const handleDragStart = (e: React.DragEvent, word: string) => {
    setDraggedItem(word);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, categoryName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(categoryName);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, categoryName: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Remove from available words
    setAvailableWords(prev => prev.filter(word => word !== draggedItem));

    // Add to category
    setSortedItems(prev => ({
      ...prev,
      [categoryName]: [...(prev[categoryName] || []), draggedItem],
    }));

    setDraggedItem(null);
    setDragOverCategory(null);
  };

  const handleRemoveFromCategory = (word: string, categoryName: string) => {
    if (showResult) return;

    // Remove from category
    setSortedItems(prev => ({
      ...prev,
      [categoryName]: (prev[categoryName] || []).filter(w => w !== word),
    }));

    // Add back to available words
    setAvailableWords(prev => [...prev, word]);
  };

  const checkAnswers = () => {
    let correctCategories = 0;

    (exercise.categories || []).forEach(category => {
      const userItems = sortedItems[category.name] || [];
      const correctItems = category.items;

      // Check if all correct items are in user's category and no extra items
      const isCorrect =
        userItems.length === correctItems.length &&
        userItems.every(item => correctItems.includes(item));

      if (isCorrect) {
        correctCategories++;
      }
    });

    const isAllCorrect = correctCategories === (exercise.categories?.length || 0);
    updateSessionScore(isAllCorrect ? { correct: 1 } : { incorrect: 1 });

    // Show toast notification
    if (isAllCorrect) {
      showCorrectAnswer();
    } else {
      showIncorrectAnswer();
    }

    setShowResult(true);
  };

  const resetExercise = () => {
    const shuffled = [...exercise.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);

    const initialSorted: Record<string, string[]> = {};
    (exercise.categories || []).forEach(cat => {
      initialSorted[cat.name] = [];
    });
    setSortedItems(initialSorted);
    setShowResult(false);
  };

  const finishExercise = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const { sessionScore } = useAppStore.getState();
    const finalScore = sessionScore.correct > 0 ? 100 : 0;
    const accuracy = sessionScore.accuracy;

    // Register progress
    addProgressEntry({
      score: finalScore,
      totalQuestions: sessionScore.total,
      correctAnswers: sessionScore.correct,
      moduleId: module.id,
      learningMode: 'sorting',
      timeSpent: timeSpent,
    });

    showModuleCompleted(module.name, finalScore, accuracy);
    updateUserScore(module.id, finalScore, timeSpent);
    setCurrentView('menu');
  };

  const showSummaryModal = () => {
    setShowExplanation(false);
    setSelectedTerm(null);

    // Create a summary object with all words and their explanations
    const summaryData = {
      categories: exercise.categories,
      sortedItems: sortedItems,
      results: (exercise.categories || []).flatMap(category =>
        category.items.map(word => {
          const userCategory = Object.keys(sortedItems).find(catName =>
            (sortedItems[catName] || []).includes(word)
          );
          const isCorrect = userCategory === category.name;
          const wordData = (module.data as any[])?.find((item: any) => item.word === word);

          return {
            word,
            correctCategory: category.name,
            userCategory: userCategory || 'Not sorted',
            isCorrect,
            explanation: wordData?.explanation || `This word belongs to ${category.name}`
          };
        })
      )
    };

    setSelectedTerm(summaryData);
    setShowExplanation(true);
  };

  const allWordsSorted = availableWords.length === 0;

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      {/* Compact header with progress */}
      <div className="sorting-header">
        <div className="sorting-header__top">
          <h2 className="sorting-header__title">
            {module.name}
          </h2>
          <span className="sorting-header__progress-badge">
            {exercise.words.length - availableWords.length}/{exercise.words.length}
          </span>
        </div>
        <div className="sorting-header__progress-bar">
          <div
            className="sorting-header__progress-fill"
            style={{
              width: `${exercise.words.length > 0 ? ((exercise.words.length - availableWords.length) / exercise.words.length) * 100 : 0}%`,
            }}
          />
        </div>
        <p className="instruction-text instruction-text--small instruction-text--center mt-2">
          {allWordsSorted
            ? 'All words sorted! Check your answers'
            : 'Drag and drop words into categories'}
        </p>
      </div>

      {/* Available Words */}
      <div className="mb-4">
        <h3 className="section-header instruction-text--medium mb-2">Available Words</h3>
        <div className="available-words-area">
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word, index) => (
              <div
                key={`available-${index}-${word}`}
                draggable
                onDragStart={e => handleDragStart(e, word)}
                className="word-chip"
              >
                {word}
              </div>
            ))}
          </div>
          {availableWords.length === 0 && (
            <p className="instruction-text instruction-text--center">All words have been sorted!</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-1 sm:gap-4 lg:gap-6 mb-4">
        {(exercise.categories || []).map(category => {
          const userItems = sortedItems[category.name] || [];
          const isCorrect =
            showResult &&
            userItems.length === category.items.length &&
            userItems.every(item => category.items.includes(item));
          const hasErrors = showResult && !isCorrect;

          const isDragOver = dragOverCategory === category.name;

          let dropZoneClass = 'drop-zone';

          if (showResult) {
            if (isCorrect) {
              dropZoneClass += ' drop-zone--correct';
            } else if (hasErrors) {
              dropZoneClass += ' drop-zone--error';
            } else {
              dropZoneClass += ' drop-zone--neutral';
            }
          } else {
            dropZoneClass += ' drop-zone--interactive';
            if (isDragOver) {
              dropZoneClass += ' drop-zone--drag-over';
            }
          }

          return (
            <div
              key={category.name}
              onDragOver={e => handleDragOver(e, category.name)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, category.name)}
              className={dropZoneClass}
            >
              <h4 className="drop-zone__header">
                {category.name}
                {showResult && (
                  <span
                    className={`ml-2 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </h4>

              <div className="space-y-2">
                {userItems.map((word, index) => (
                  <div
                    key={`${category.name}-${index}-${word}`}
                    onClick={() => handleRemoveFromCategory(word, category.name)}
                    className={`px-1 py-1 sm:px-3 sm:py-2 rounded text-center cursor-pointer transition-colors text-xs sm:text-sm ${showResult
                        ? category.items.includes(word)
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      }`}
                  >
                    {word}
                  </div>
                ))}
              </div>

              {showResult && hasErrors && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded text-xs">
                  <strong className="help-text--strong">Correct items:</strong>{' '}
                  <span className="help-text">{category.items.join(', ')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unified Control Bar */}
      <div className="sorting-controls">
        {/* Navigation */}
        <NavigationButton onClick={() => setCurrentView('menu')} title="Return to main menu">
          Back to Menu
        </NavigationButton>

        {/* Separator */}
        <div className="sorting-controls__separator"></div>

        {!showResult ? (
          <>
            <button
              onClick={resetExercise}
              className="sorting-controls__button sorting-controls__button--reset"
              title="Reset Exercise"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={checkAnswers}
              disabled={!allWordsSorted}
              className="sorting-controls__button sorting-controls__button--check"
            >
              <Check className="h-4 w-4" />
              <span>Check Answers</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={showSummaryModal}
              className="sorting-controls__button sorting-controls__button--summary"
            >
              <Info className="h-4 w-4" />
              <span>View Summary</span>
            </button>
            <button
              onClick={finishExercise}
              className="sorting-controls__button sorting-controls__button--finish"
            >
              <span>Finish Exercise</span>
            </button>
          </>
        )}
      </div>

      {/* Explanation/Summary Modal */}
      {showExplanation && selectedTerm && (
        <div className="sorting-modal-overlay">
          <div className="sorting-modal-container">
            <div className="sorting-modal__content">
              <div className="sorting-modal__header">
                <h3 className="sorting-modal__title">
                  Exercise Summary - Past Tense Verbs
                </h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="sorting-modal__close-btn"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Summary View */}
              <div className="sorting-modal__summary">
                <div className="sorting-modal__results-grid">
                  {selectedTerm.results.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`sorting-result-card ${
                        result.isCorrect
                          ? 'sorting-result-card--correct'
                          : 'sorting-result-card--incorrect'
                      }`}
                    >
                      <div className="sorting-result-card__header">
                        <h4 className="sorting-result-card__word">
                          {result.word}
                        </h4>
                        <span 
                          className={`sorting-result-card__status ${
                            result.isCorrect 
                              ? 'sorting-result-card__status--correct' 
                              : 'sorting-result-card__status--incorrect'
                          }`}
                        >
                          {result.isCorrect ? '✓' : '✗'}
                        </span>
                      </div>

                      <div className="sorting-result-card__content">
                        <div className="sorting-result-card__field">
                          <span className="sorting-result-card__label">
                            Correct category:
                          </span>
                          <p className="sorting-result-card__value sorting-result-card__value--correct">
                            {result.correctCategory}
                          </p>
                        </div>

                        {!result.isCorrect && (
                          <div className="sorting-result-card__field">
                            <span className="sorting-result-card__label">
                              Your answer:
                            </span>
                            <p className="sorting-result-card__value sorting-result-card__value--incorrect">
                              {result.userCategory}
                            </p>
                          </div>
                        )}

                        {result.explanation && (
                          <div className="sorting-result-card__field">
                            <span className="sorting-result-card__label">
                              Explanation:
                            </span>
                            <p className="sorting-result-card__explanation">
                              {result.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sorting-modal__actions">
                <button
                  onClick={() => setShowExplanation(false)}
                  className="sorting-modal__close-button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortingComponent;
