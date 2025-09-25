import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProgressStore } from '../../stores/progressStore';
import { useTranslation } from '../../utils/i18n';
import { useLearningCleanup } from '../../hooks/useLearningCleanup';
import { shuffleArray } from '../../utils/randomUtils';
import { ContentAdapter } from '../../utils/contentAdapter';
import ContentRenderer from '../ui/ContentRenderer';
import NavigationButton from '../ui/NavigationButton';
import '../../styles/components/flashcard-component.css';
import type { FlashcardData, LearningModule } from '../../types';

interface FlashcardComponentProps {
  module: LearningModule;
}

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ module }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime] = useState(Date.now());

  const { setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { language } = useSettingsStore();
  const { addProgressEntry } = useProgressStore();
  const { t } = useTranslation(language);
  useLearningCleanup();

  // Generate new random set each time component mounts
  const randomizedFlashcards = useMemo(() => {
    if (!module?.data) return [];
    const allFlashcards = module.data as FlashcardData[];
    return shuffleArray(allFlashcards);
  }, [module?.data]);

  const currentCard = randomizedFlashcards[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < randomizedFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // End of flashcards
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Register progress (assuming all flashcards were "correct" for completion)
      addProgressEntry({
        score: 100, // Flashcards are completion-based, so 100% for finishing
        totalQuestions: randomizedFlashcards.length,
        correctAnswers: randomizedFlashcards.length,
        moduleId: module.id,
        learningMode: 'flashcard',
        timeSpent: timeSpent,
      });

      updateUserScore(module.id, 100, timeSpent); // 100% completion for finishing all flashcards
      setCurrentView('menu');
    }
  }, [
    currentIndex,
    randomizedFlashcards.length,
    startTime,
    addProgressEntry,
    module.id,
    updateUserScore,
    setCurrentView,
  ]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Keyboard navigation
  useEffect(() => {
    if (randomizedFlashcards.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isFlipped) {
            handleNext();
          } else {
            handleFlip();
          }
          break;
        case 'Escape':
          setCurrentView('menu');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    currentIndex,
    randomizedFlashcards.length,
    isFlipped,
    handleFlip,
    handleNext,
    handlePrev,
    setCurrentView,
  ]);

  // Early return if no data
  if (!randomizedFlashcards.length) {
    return (
      <div className="flashcard-component__no-data">
        <p className="flashcard-component__no-data-text">{t('noDataAvailable') || 'No flashcards available'}</p>
        <button
          onClick={() => setCurrentView('menu')}
          className="flashcard-component__no-data-btn"
        >
          {t('navigation.mainMenu')}
        </button>
      </div>
    );
  }

  return (
    <div className="flashcard-component__container">
      {/* Compact header with progress */}
      <div className="flashcard-component__header">
        <div className="flashcard-component__header-top">
          <h2 className="flashcard-component__title">
            {module.name}
          </h2>
          <span className="flashcard-component__counter">
            {currentIndex + 1}/{randomizedFlashcards.length}
          </span>
        </div>
        <div className="flashcard-component__progress-container">
          <div
            className="flashcard-component__progress-fill"
            style={{ '--progress-width': `${((currentIndex + 1) / randomizedFlashcards.length) * 100}%` } as React.CSSProperties}
          />
        </div>
        <p className="flashcard-component__help-text">
          {isFlipped
            ? t('learning.helpTextFlipped')
            : t('learning.helpTextNotFlipped')}
        </p>
      </div>

      {/* Flashcard */}
      <div
        className={`flashcard-component__card ${isFlipped ? 'flashcard-component__card--flipped' : ''
          }`}
        onClick={handleFlip}
      >
        <div className="flashcard-component__card-inner">
          {/* Front */}
          <div className="flashcard-component__card-front">
            <div className="flashcard-component__front-text">
              <ContentRenderer
                content={ContentAdapter.ensureStructured(
                  currentCard?.front || t('common.loading'),
                  'flashcard'
                )}
              />
            </div>
            {currentCard?.ipa && (
              <p className="flashcard-component__ipa">
                {currentCard.ipa}
              </p>
            )}
            {currentCard?.example && (
              <div className="flashcard-component__example">
                "
                <ContentRenderer
                  content={ContentAdapter.ensureStructured(currentCard.example, 'flashcard')}
                />
                "
              </div>
            )}
          </div>

          {/* Back */}
          <div className="flashcard-component__card-back">
            <div className="flashcard-component__back-text">
              <ContentRenderer
                content={ContentAdapter.ensureStructured(
                  currentCard?.front || t('common.loading'),
                  'flashcard'
                )}
              />
            </div>
            {currentCard?.ipa && (
              <p className="flashcard-component__ipa flashcard-component__ipa--back">
                {currentCard.ipa}
              </p>
            )}
            <div className="flashcard-component__back-answer">
              <ContentRenderer
                content={ContentAdapter.ensureStructured(
                  currentCard?.back || t('common.loading'),
                  'flashcard'
                )}
              />
            </div>
            {currentCard?.example && (
              <div className="flashcard-component__back-examples">
                <div className="flashcard-component__back-example">
                  "
                  <ContentRenderer
                    content={ContentAdapter.ensureStructured(currentCard.example, 'flashcard')}
                  />
                  "
                </div>
                {currentCard.example_es && (
                  <div className="flashcard-component__back-example flashcard-component__back-example--spanish">
                    "
                    <ContentRenderer
                      content={ContentAdapter.ensureStructured(currentCard.example_es, 'flashcard')}
                    />
                    "
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Control Bar */}
      <div className="flashcard-component__controls">
        {/* Navigation */}
        <NavigationButton onClick={() => setCurrentView('menu')} title={t('learning.returnToMainMenu')}>
          {t('learning.backToMenu')}
        </NavigationButton>

        {/* Separator */}
        <div className="flashcard-component__separator"></div>

        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flashcard-component__nav-btn flashcard-component__nav-btn--prev"
          title={t('learning.previousCard')}
        >
          <ChevronLeft className="flashcard-component__nav-btn__icon" />
        </button>

        <button
          onClick={handleFlip}
          className="flashcard-component__flip-btn"
        >
          <RotateCcw className="flashcard-component__flip-btn-icon" />
          <span>{isFlipped ? t('learning.flipBack') : t('learning.flip')}</span>
        </button>

        <button
          onClick={handleNext}
          className="flashcard-component__nav-btn flashcard-component__nav-btn--next"
          title={
            currentIndex === randomizedFlashcards.length - 1 ? t('learning.finishFlashcards') : t('learning.nextCard')
          }
        >
          <ChevronRight className="flashcard-component__nav-btn__icon" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardComponent;
