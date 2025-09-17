import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Check, Info, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useToast } from '../../hooks/useToast';
import { useLearningCleanup } from '../../hooks/useLearningCleanup';
import NavigationButton from '../ui/NavigationButton';
import '../../styles/components/matching-modal.css';
import '../../styles/components/matching-component.css';
import type { LearningModule } from '../../types';

interface MatchingComponentProps {
  module: LearningModule;
}

const MatchingComponent: React.FC<MatchingComponentProps> = ({ module }) => {
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);
  const currentModuleIdRef = useRef<string | null>(null);

  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { showCorrectAnswer, showIncorrectAnswer, showModuleCompleted } = useToast();
  useLearningCleanup();

  // Initialize component when module changes
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
    if (!module?.data || !module?.id) return;
    if (currentModuleIdRef.current === module.id) return;

    currentModuleIdRef.current = module.id;

    // Expect data to be an array of {left, right, explanation} objects
    const pairs = (module.data as any[]).map((item: any) => ({
      left: item.left || '',
      right: item.right || '',
      explanation: item.explanation || '',
    }));

    if (pairs.length > 0) {
      const terms = pairs
        .map((pair: { left: string; right: string }) => pair.left)
        .sort(() => Math.random() - 0.5);
      const definitions = pairs
        .map((pair: { left: string; right: string }) => pair.right)
        .sort(() => Math.random() - 0.5);

      setLeftItems(terms);
      setRightItems(definitions);

      setMatches({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setShowResult(false);
    }
  }, [module?.data, module?.id]);

  if (!module?.data || leftItems.length === 0) {
    return (
      <div className="matching-component">
        <div className="matching-component__loading">
          <p className="matching-component__loading-text">Loading matching exercise...</p>
        </div>
      </div>
    );
  }

  const getPairs = (): { left: string; right: string; explanation: string }[] => {
    if (!module.data) return [];
    return (module.data as any[]).map((item: any) => ({
      left: item.left || '',
      right: item.right || '',
      explanation: item.explanation || '',
    }));
  };

  const pairs = getPairs();

  const handleLeftClick = (item: string) => {
    if (showResult || matches[item]) return;

    if (selectedLeft === item) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(item);
      if (selectedRight) {
        createMatch(item, selectedRight);
      }
    }
  };

  const handleRightClick = (item: string) => {
    if (showResult || Object.values(matches).includes(item)) return;

    if (selectedRight === item) {
      setSelectedRight(null);
    } else {
      setSelectedRight(item);
      if (selectedLeft) {
        createMatch(selectedLeft, item);
      }
    }
  };

  const createMatch = (left: string, right: string) => {
    setMatches(prev => ({ ...prev, [left]: right }));
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const removeMatch = (leftItem: string) => {
    if (showResult) return;
    setMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[leftItem];
      return newMatches;
    });
  };

  const checkAnswers = () => {
    let correctMatches = 0;

    pairs.forEach((pair: { left: string; right: string }) => {
      if (matches[pair.left] === pair.right) {
        correctMatches++;
      }
    });

    const isAllCorrect = correctMatches === pairs.length;
    updateSessionScore(isAllCorrect ? { correct: 1 } : { incorrect: 1 });
    setShowResult(true);

    // Show toast feedback
    if (isAllCorrect) {
      showCorrectAnswer();
    } else {
      showIncorrectAnswer();
    }
  };

  const resetExercise = () => {
    const terms = pairs
      .map((pair: { left: string; right: string }) => pair.left)
      .sort(() => Math.random() - 0.5);
    const definitions = pairs
      .map((pair: { left: string; right: string }) => pair.right)
      .sort(() => Math.random() - 0.5);

    setLeftItems(terms);
    setRightItems(definitions);
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setShowResult(false);
  };

  const finishExercise = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = pairs.filter(
      (pair: { left: string; right: string }) => matches[pair.left] === pair.right
    ).length;
    const finalScore = Math.round((correctCount / pairs.length) * 100);
    const accuracy = (correctCount / pairs.length) * 100;

    showModuleCompleted(module.name, finalScore, accuracy);
    updateUserScore(module.id, finalScore, timeSpent);
    setCurrentView('menu');
  };

  const showSummaryModal = () => {
    setShowExplanation(false);
    setSelectedTerm(null);
    // Create a summary object with all pairs and their explanations
    const summaryData = {
      pairs: pairs,
      matches: matches,
      results: pairs.map(pair => ({
        ...pair,
        userAnswer: matches[pair.left] || 'No answer',
        isCorrect: matches[pair.left] === pair.right,
      })),
    };
    setSelectedTerm(summaryData);
    setShowExplanation(true);
  };

  const allMatched = Object.keys(matches).length === pairs.length;

  const getItemStatus = (item: string, isLeft: boolean) => {
    if (showResult) {
      if (isLeft) {
        const correctMatch = pairs.find(
          (pair: { left: string; right: string }) => pair.left === item
        )?.right;
        const userMatch = matches[item];
        return userMatch === correctMatch ? 'correct' : 'incorrect';
      } else {
        const correctPair = pairs.find(
          (pair: { left: string; right: string }) => pair.right === item
        );
        const userMatch = Object.entries(matches).find(([, right]) => right === item);
        if (correctPair && userMatch) {
          return userMatch[0] === correctPair.left ? 'correct' : 'incorrect';
        }
        return Object.values(matches).includes(item) ? 'incorrect' : 'unmatched';
      }
    }
    return 'normal';
  };

  return (
    <div className="matching-component">
      {/* Compact header */}
      <div className="matching-component__header">
        <div className="matching-component__header-info">
          <h2 className="matching-component__title">{module.name}</h2>
          <span className="matching-component__progress-badge">
            {Object.keys(matches).length}/{pairs.length} matched
          </span>
        </div>
        <div className="matching-component__progress-bar">
          <div
            className="matching-component__progress-fill"
            style={{ width: `${(Object.keys(matches).length / pairs.length) * 100}%` }}
          />
        </div>
        <p className="matching-component__instruction-text">
          {allMatched
            ? 'All matched! Check your answers'
            : 'Click items from both columns to match them'}
        </p>
      </div>

      {/* Compact Matching Grid */}
      <div className="matching-component__grid">
        <div className="matching-component__columns">
          {/* Terms Column */}
          <div className="matching-component__column">
            <h3 className="matching-component__column-header">Terms</h3>
            {leftItems.map((item, index) => {
              const isMatched = matches[item];
              const isSelected = selectedLeft === item;
              const status = getItemStatus(item, true);

              let className = 'matching-component__item ';

              if (showResult) {
                className += status === 'correct'
                  ? 'matching-component__item--correct'
                  : 'matching-component__item--incorrect';
              } else if (isMatched) {
                className += 'matching-component__item--matched';
              } else if (isSelected) {
                className += 'matching-component__item--selected';
              } else {
                className += 'matching-component__item--default';
              }

              return (
                <button
                  key={`left-${index}`}
                  onClick={() => (isMatched ? removeMatch(item) : handleLeftClick(item))}
                  className={className}
                >
                  <div className="matching-component__item-content">
                    <span className="matching-component__item-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="matching-component__item-text">{item}</span>
                    <div className="matching-component__item-actions">
                      {showResult && (
                        <div
                          onClick={e => {
                            e.stopPropagation();
                            const termData = (module.data as any[])?.find(
                              (d: any) => d.left === item
                            );
                            setSelectedTerm(termData);
                            setShowExplanation(true);
                          }}
                          className="matching-component__info-button"
                          title="Show explanation"
                        >
                          <Info className="h-3 w-3" />
                        </div>
                      )}
                      {isMatched && (
                        <span className="matching-component__match-number">
                          {rightItems.findIndex(def => matches[item] === def) + 1}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Definitions Column */}
          <div className="matching-component__column">
            <h3 className="matching-component__column-header">
              Definitions
            </h3>
            {rightItems.map((item, index) => {
              const isMatched = Object.values(matches).includes(item);
              const isSelected = selectedRight === item;
              const status = getItemStatus(item, false);

              let className = 'matching-component__item ';

              if (showResult) {
                className += status === 'correct'
                  ? 'matching-component__item--correct'
                  : status === 'incorrect'
                    ? 'matching-component__item--incorrect'
                    : 'matching-component__item--unmatched';
              } else if (isMatched) {
                className += 'matching-component__item--matched-inactive';
              } else if (isSelected) {
                className += 'matching-component__item--selected';
              } else {
                className += 'matching-component__item--default';
              }

              return (
                <button
                  key={`right-${index}`}
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched}
                  className={className}
                >
                  <div className="matching-component__item-content">
                    <span className="matching-component__item-letter" style={{ backgroundColor: '#f97316' }}>
                      {index + 1}
                    </span>
                    <span className="matching-component__item-text">{item}</span>
                    {isMatched && (
                      <span className="matching-component__item-letter">
                        {String.fromCharCode(
                          65 + leftItems.findIndex(term => matches[term] === item)
                        )}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Unified Control Bar */}
      <div className="matching-component__actions">
        {/* Navigation */}
        <NavigationButton onClick={() => setCurrentView('menu')} title="Return to main menu">
          Back to Menu
        </NavigationButton>

        {/* Separator */}
        <div className="matching-component__separator"></div>

        {!showResult ? (
          <>
            <button
              onClick={resetExercise}
              className="matching-component__button matching-component__button--secondary"
              title="Reset Exercise"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={checkAnswers}
              disabled={!allMatched}
              className="matching-component__button matching-component__button--primary flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Check Matches</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={showSummaryModal}
              className="matching-component__button matching-component__button--primary flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              <span>View Summary</span>
            </button>
            <button
              onClick={finishExercise}
              className="matching-component__button matching-component__button--success flex items-center gap-2"
            >
              <span>Finish Exercise</span>
            </button>
          </>
        )}
      </div>

      {/* Explanation/Summary Modal */}
      {showExplanation && selectedTerm && (
        <div className="matching-modal-overlay">
          <div className="matching-modal-container">
            <div className="matching-modal__content">
              <div className="matching-modal__header">
                <h3 className="matching-modal__title">
                  {selectedTerm.pairs ? 'Exercise Summary' : selectedTerm.left}
                </h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="matching-modal__close-btn"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selectedTerm.pairs ? (
                /* Summary View */
                <div className="matching-modal__summary">
                  <div className="matching-modal__results-grid">
                    {selectedTerm.results.map((result: any, index: number) => (
                      <div
                        key={index}
                        className={`matching-result-card ${result.isCorrect
                          ? 'matching-result-card--correct'
                          : 'matching-result-card--incorrect'
                          }`}
                      >
                        <div className="matching-result-card__header">
                          <h4 className="matching-result-card__term">
                            {result.left}
                          </h4>
                          <span
                            className={`matching-result-card__status ${result.isCorrect
                              ? 'matching-result-card__status--correct'
                              : 'matching-result-card__status--incorrect'
                              }`}
                          >
                            {result.isCorrect ? '✓' : '✗'}
                          </span>
                        </div>

                        <div className="matching-result-card__content">
                          <div className="matching-result-card__field">
                            <span className="matching-result-card__label">
                              Correct answer:
                            </span>
                            <p className="matching-result-card__value matching-result-card__value--correct">
                              {result.right}
                            </p>
                          </div>

                          {!result.isCorrect && (
                            <div className="matching-result-card__field">
                              <span className="matching-result-card__label">
                                Your answer:
                              </span>
                              <p className="matching-result-card__value matching-result-card__value--incorrect">
                                {result.userAnswer}
                              </p>
                            </div>
                          )}

                          {result.explanation && (
                            <div className="matching-result-card__field">
                              <span className="matching-result-card__label">
                                Explanation:
                              </span>
                              <p className="matching-result-card__explanation">
                                {result.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Individual Explanation View */
                <div className="matching-modal__individual">
                  <div className="matching-individual__field">
                    <h4 className="matching-individual__label">Match:</h4>
                    <p className="matching-individual__value">{selectedTerm.right}</p>
                  </div>

                  {selectedTerm.explanation && (
                    <div className="matching-individual__field">
                      <h4 className="matching-individual__label">Explanation:</h4>
                      <p className="matching-individual__explanation">{selectedTerm.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="matching-modal__actions">
                <button
                  onClick={() => setShowExplanation(false)}
                  className="matching-modal__close-button"
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

export default MatchingComponent;
