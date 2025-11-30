import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useMenuNavigation } from '../../hooks/useMenuNavigation';
import { useProgressStore } from '../../stores/progressStore';
import { useTranslation } from '../../utils/i18n';
import { useLearningCleanup } from '../../hooks/useLearningCleanup';
import { ContentAdapter } from '../../utils/contentAdapter';
import ContentRenderer from '../ui/ContentRenderer';
import LearningProgressHeader from '../ui/LearningProgressHeader';

import '../../styles/components/reading-component.css';
import type { ReadingData, LearningModule } from '../../types';

interface ReadingComponentProps {
  module: LearningModule;
}

const ReadingComponent: React.FC<ReadingComponentProps> = ({ module }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const { updateUserScore } = useUserStore();
  const { language } = useSettingsStore();
  const { returnToMenu } = useMenuNavigation();
  const { addProgressEntry } = useProgressStore();
  const { t } = useTranslation(language);
  useLearningCleanup();

  // Get reading data from module
  const readingData = useMemo(() => {
    if (!module?.data || !Array.isArray(module.data) || module.data.length === 0) {
      return null;
    }
    return module.data[0] as ReadingData;
  }, [module?.data]);

  const readingSections = readingData?.sections || [];
  const currentSection = readingSections[currentSectionIndex];

  const handleNext = useCallback(() => {
    if (currentSectionIndex < readingSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      // Reset interactive states when changing sections
      setExpandedItems(new Set());
      setActiveTooltip(null);
    } else {
      // End of reading
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Register progress (reading is completion-based, so 100% for finishing)
      addProgressEntry({
        score: 100,
        totalQuestions: readingSections.length,
        correctAnswers: readingSections.length,
        moduleId: module.id,
        learningMode: 'reading',
        timeSpent: timeSpent,
      });

      updateUserScore(module.id, 100, timeSpent);
      returnToMenu();
    }
  }, [
    currentSectionIndex,
    readingSections.length,
    startTime,
    addProgressEntry,
    module.id,
    updateUserScore,
    returnToMenu,
  ]);

  const handlePrev = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      // Reset interactive states when changing sections
      setExpandedItems(new Set());
      setActiveTooltip(null);
    }
  }, [currentSectionIndex]);

  const toggleExpandable = useCallback((index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleTooltipToggle = useCallback((term: string) => {
    setActiveTooltip((prev) => (prev === term ? null : term));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (readingSections.length === 0) return;

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
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          returnToMenu();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSectionIndex, readingSections.length, handleNext, handlePrev, returnToMenu]);

  // Early return if no data
  if (!readingData || !readingSections.length) {
    return (
      <div className="reading-component__no-data">
        <p className="reading-component__no-data-text">
          {t('learning.noReadingContentAvailable')}
        </p>
        <button onClick={returnToMenu} className="reading-component__no-data-btn">
          {t('navigation.mainMenu')}
        </button>
      </div>
    );
  }

  return (
    <div className="reading-component__container">
      {/* Unified progress header */}
      <LearningProgressHeader
        title={readingData.title}
        currentIndex={currentSectionIndex}
        totalItems={readingSections.length}
        mode="reading"
        helpText={t('reading.component.estimatedTime', undefined, {
          time: String(readingData.estimatedReadingTime || 5),
        })}
      />

      {/* Reading content */}
      <div className="reading-component__content">
        {/* Learning Objectives - Show at the beginning */}
        {currentSectionIndex === 0 && readingData.learningObjectives?.length > 0 && (
          <div className="reading-component__objectives">
            <h3 className="reading-component__objectives-title">
              {t('reading.component.objectives')}
            </h3>
            <ul className="reading-component__objectives-list">
              {readingData.learningObjectives.map((objective, index) => (
                <li key={index} className="reading-component__objectives-item">
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section title */}
        <h3 className="reading-component__section-title">{currentSection?.title}</h3>

        {/* Section content */}
        <div className="reading-component__section-content">
          <ContentRenderer
            content={ContentAdapter.ensureStructured(
              currentSection?.content || t('common.loading'),
              'reading'
            )}
          />
        </div>

        {/* Interactive Content - Tooltips */}
        {currentSection?.interactive?.tooltips && currentSection.interactive.tooltips.length > 0 && (
          <div className="reading-component__tooltips">
            <h4 className="reading-component__tooltips-title">{t('reading.component.keyTerm')}</h4>
            <div className="reading-component__tooltips-grid">
              {currentSection.interactive.tooltips.map((tooltip, index) => (
                <button
                  key={index}
                  className={`reading-component__tooltip-trigger ${
                    activeTooltip === tooltip.term ? 'reading-component__tooltip-trigger--active' : ''
                  }`}
                  onClick={() => handleTooltipToggle(tooltip.term)}
                  aria-expanded={activeTooltip === tooltip.term}
                >
                  <span className="reading-component__tooltip-term">{tooltip.term}</span>
                  {activeTooltip === tooltip.term && (
                    <div className="reading-component__tooltip-content">
                      {tooltip.definition}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Content - Expandable Sections */}
        {currentSection?.interactive?.expandable &&
          currentSection.interactive.expandable.length > 0 && (
            <div className="reading-component__expandables">
              {currentSection.interactive.expandable.map((expandable, index) => (
                <div key={index} className="reading-component__expandable">
                  <button
                    className="reading-component__expandable-trigger"
                    onClick={() => toggleExpandable(index)}
                    aria-expanded={expandedItems.has(index)}
                  >
                    <span className="reading-component__expandable-title">{expandable.title}</span>
                    {expandedItems.has(index) ? (
                      <ChevronUp className="reading-component__expandable-icon" />
                    ) : (
                      <ChevronDown className="reading-component__expandable-icon" />
                    )}
                  </button>
                  {expandedItems.has(index) && (
                    <div className="reading-component__expandable-content">
                      <ContentRenderer
                        content={ContentAdapter.ensureStructured(expandable.content, 'reading')}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* Interactive Content - Highlights */}
        {currentSection?.interactive?.highlights && currentSection.interactive.highlights.length > 0 && (
          <div className="reading-component__highlights">
            <h4 className="reading-component__highlights-title">
              {t('reading.component.keyTerm')}
            </h4>
            <div className="reading-component__highlights-list">
              {currentSection.interactive.highlights.map((highlight, index) => (
                <span key={index} className="reading-component__highlight-item">
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Vocabulary - Show if available for current section */}
        {readingData.keyVocabulary?.length > 0 && (
          <div className="reading-component__vocabulary">
            <h4 className="reading-component__vocabulary-title">
              {t('reading.component.keyVocabulary')}
            </h4>
            <div className="reading-component__vocabulary-grid">
              {readingData.keyVocabulary.map((term, index) => (
                <div key={index} className="reading-component__vocabulary-card">
                  <div className="reading-component__vocabulary-term">{term.term}</div>
                  {term.pronunciation && (
                    <div className="reading-component__vocabulary-pronunciation">
                      {term.pronunciation}
                    </div>
                  )}
                  <div className="reading-component__vocabulary-definition">
                    <strong>{t('reading.component.definition')}:</strong> {term.definition}
                  </div>
                  <div className="reading-component__vocabulary-example">
                    <strong>{t('reading.component.example')}:</strong> {term.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grammar Points - Show if available */}
        {readingData.grammarPoints && readingData.grammarPoints.length > 0 && (
          <div className="reading-component__grammar-points">
            <h4 className="reading-component__grammar-title">
              {t('reading.component.grammarPoints')}
            </h4>
            {readingData.grammarPoints.map((point, index) => (
              <div key={index} className="reading-component__grammar-point">
                <div className="reading-component__grammar-rule">
                  <strong>{t('reading.component.grammarRule')}:</strong> {point.rule}
                </div>
                <div className="reading-component__grammar-explanation">{point.explanation}</div>
                {point.examples && point.examples.length > 0 && (
                  <div className="reading-component__grammar-examples">
                    <strong>{t('reading.component.example')}:</strong>
                    <ul className="reading-component__grammar-examples-list">
                      {point.examples.map((example, exIndex) => (
                        <li key={exIndex} className="reading-component__grammar-example-item">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {point.commonMistakes && point.commonMistakes.length > 0 && (
                  <div className="reading-component__grammar-mistakes">
                    <strong>{t('reading.component.commonMistakes')}:</strong>
                    <ul className="reading-component__grammar-mistakes-list">
                      {point.commonMistakes.map((mistake, mIndex) => (
                        <li key={mIndex} className="reading-component__grammar-mistake-item">
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unified Control Bar */}
      <div className="game-controls">
        {/* Home Navigation */}
        <button
          onClick={returnToMenu}
          className="game-controls__home-btn"
          title={t('reading.navigation.returnToMenu')}
        >
          <Home className="game-controls__home-btn__icon" />
        </button>

        <button
          onClick={handlePrev}
          disabled={currentSectionIndex === 0}
          className="game-controls__nav-btn"
          title={t('reading.component.previousSection')}
        >
          <ChevronLeft className="game-controls__nav-btn__icon" />
        </button>

        <button
          onClick={handleNext}
          className="game-controls__primary-btn game-controls__primary-btn--blue"
        >
          <span>
            {currentSectionIndex === readingSections.length - 1
              ? t('reading.component.completeReading')
              : t('reading.component.nextSection')}
          </span>
          <ChevronRight className="game-controls__primary-btn__icon" />
        </button>
      </div>
    </div>
  );
};

export default ReadingComponent;
