import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, Info, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProgressStore } from '../../stores/progressStore';
import { useToast } from '../../hooks/useToast';
import { useLearningCleanup } from '../../hooks/useLearningCleanup';
import { ContentAdapter } from '../../utils/contentAdapter';
import ContentRenderer from '../ui/ContentRenderer';
import NavigationButton from '../ui/NavigationButton';
import '../../styles/components/sorting-modal.css';
import '../../styles/components/sorting-component.css';
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
        
        // Use all available categories (no artificial limit)
        const selectedCategories = shuffledCategories;
        
        // Collect all available words first
        const allAvailableWords = (module.data || []).map((item: any) => ({
          word: item.word,
          category: item.category
        }));
        
        // Shuffle and take exactly the requested number of words
        const shuffledWords = allAvailableWords.sort(() => Math.random() - 0.5);
        const selectedWords = shuffledWords.slice(0, totalWords);
        
        // Group selected words by category
        const wordsByCategory: Record<string, string[]> = {};
        selectedWords.forEach(({ word, category }) => {
          if (!wordsByCategory[category]) {
            wordsByCategory[category] = [];
          }
          wordsByCategory[category].push(word);
        });
        
        // Create categories array with actual selected words
        const categories = selectedCategories
          .filter(categoryId => wordsByCategory[categoryId]) // Only include categories that have words
          .map(categoryId => ({
            name: getCategoryDisplayName(categoryId, module),
            items: wordsByCategory[categoryId],
          }));

        const finalWords = selectedWords.map(item => item.word);

        // Categories already have the correct words, no need to filter again
        const updatedCategories = categories;

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

  if (!module?.data || exercise.words.length === 0) {
    return (
      <div className="sorting-component">
        <div className="sorting-component__loading">
          <p className="sorting-component__loading-text">Loading sorting exercise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sorting-component">
      {/* Compact header with progress */}
      <div className="sorting-component__header">
        <div className="sorting-component__header-info">
          <h2 className="sorting-component__title">{module.name}</h2>
          <span className="sorting-component__progress-badge">
            {exercise.words.length - availableWords.length}/{exercise.words.length}
          </span>
        </div>
        <div className="sorting-component__progress-bar">
          <div
            className="sorting-component__progress-fill"
            style={{
              width: `${exercise.words.length > 0 ? ((exercise.words.length - availableWords.length) / exercise.words.length) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="sorting-component__instructions">
          <p className="sorting-component__instruction-text">
            {allWordsSorted
              ? 'All words sorted! Check your answers'
              : 'Drag and drop words into categories'}
          </p>
        </div>
      </div>

      {/* Available Words */}
      <div className="sorting-component__available-section">
        <h3 className="sorting-component__section-header">Available Words</h3>
        <div className="sorting-component__available-area">
          <div className="sorting-component__words-container">
            {availableWords.map((word, index) => (
              <div
                key={`available-${index}-${word}`}
                draggable
                onDragStart={e => handleDragStart(e, word)}
                className="sorting-component__word-chip"
              >
                <ContentRenderer 
                  content={ContentAdapter.ensureStructured(word, 'quiz')}
                />
              </div>
            ))}
          </div>
          {availableWords.length === 0 && (
            <p className="sorting-component__empty-message">All words have been sorted!</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="sorting-component__categories">
        {(exercise.categories || []).map(category => {
          const userItems = sortedItems[category.name] || [];
          const isCorrect =
            showResult &&
            userItems.length === category.items.length &&
            userItems.every(item => category.items.includes(item));
          const hasErrors = showResult && !isCorrect;

          const isDragOver = dragOverCategory === category.name;

          let dropZoneClass = 'sorting-component__drop-zone ';

          if (showResult) {
            if (isCorrect) {
              dropZoneClass += 'sorting-component__drop-zone--correct';
            } else if (hasErrors) {
              dropZoneClass += 'sorting-component__drop-zone--error';
            } else {
              dropZoneClass += 'sorting-component__drop-zone--neutral';
            }
          } else {
            dropZoneClass += 'sorting-component__drop-zone--interactive';
            if (isDragOver) {
              dropZoneClass += ' sorting-component__drop-zone--drag-over';
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
              <h4 className="sorting-component__category-header">
                {category.name}
                {showResult && (
                  <span
                    className={`sorting-component__category-status ${
                      isCorrect 
                        ? 'sorting-component__category-status--correct' 
                        : 'sorting-component__category-status--incorrect'
                    }`}
                  >
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </h4>

              <div className="sorting-component__sorted-items">
                {userItems.map((word, index) => {
                  let itemClass = 'sorting-component__sorted-item ';
                  
                  if (showResult) {
                    itemClass += category.items.includes(word)
                      ? 'sorting-component__sorted-item--correct'
                      : 'sorting-component__sorted-item--incorrect';
                  } else {
                    itemClass += 'sorting-component__sorted-item--default';
                  }

                  return (
                    <div
                      key={`${category.name}-${index}-${word}`}
                      onClick={() => handleRemoveFromCategory(word, category.name)}
                      className={itemClass}
                    >
                      <ContentRenderer 
                        content={ContentAdapter.ensureStructured(word, 'quiz')}
                      />
                    </div>
                  );
                })}
              </div>

              {showResult && hasErrors && (
                <div className="sorting-component__feedback sorting-component__feedback--error">
                  <span className="sorting-component__feedback-label">Correct items:</span>{' '}
                  <span className="sorting-component__feedback-text">
                    {category.items.map((item, idx) => (
                      <span key={idx}>
                        <ContentRenderer 
                          content={ContentAdapter.ensureStructured(item, 'quiz')}
                        />
                        {idx < category.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unified Control Bar */}
      <div className="sorting-component__actions">
        {/* Navigation */}
        <NavigationButton onClick={() => setCurrentView('menu')} title="Return to main menu">
          Back to Menu
        </NavigationButton>

        {/* Separator */}
        <div className="sorting-component__separator"></div>

        {!showResult ? (
          <>
            <button
              onClick={resetExercise}
              className="sorting-component__button sorting-component__button--reset"
              title="Reset Exercise"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={checkAnswers}
              disabled={!allWordsSorted}
              className="sorting-component__button sorting-component__button--primary"
            >
              <Check className="h-4 w-4" />
              <span>Check Answers</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={showSummaryModal}
              className="sorting-component__button sorting-component__button--secondary"
            >
              <Info className="h-4 w-4" />
              <span>View Summary</span>
            </button>
            <button
              onClick={finishExercise}
              className="sorting-component__button sorting-component__button--success"
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
