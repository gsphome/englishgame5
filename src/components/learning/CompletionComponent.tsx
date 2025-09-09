import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProgressStore } from '../../stores/progressStore';
import { useTranslation } from '../../utils/i18n';
import { useToast } from '../../hooks/useToast';
import { useLearningCleanup } from '../../hooks/useLearningCleanup';
import { shuffleArray } from '../../utils/randomUtils';
import NavigationButton from '../ui/NavigationButton';
import type { LearningModule } from '../../types';

interface CompletionData {
  sentence: string;
  correct: string;
  explanation?: string;
  tip?: string;
}

interface CompletionComponentProps {
  module: LearningModule;
}

const CompletionComponent: React.FC<CompletionComponentProps> = ({ module }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());

  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { language } = useSettingsStore();
  const { addProgressEntry } = useProgressStore();
  const { t } = useTranslation(language);
  const { showCorrectAnswer, showIncorrectAnswer, showModuleCompleted } = useToast();
  useLearningCleanup();

  // Randomize exercises once per component mount
  const randomizedExercises = useMemo(() => {
    if (!module?.data) return [];
    return shuffleArray(module.data as CompletionData[]);
  }, [module?.data]);

  const currentExercise = randomizedExercises[currentIndex];

  // Auto-focus input when exercise changes or component mounts
  useEffect(() => {
    if (!showResult && randomizedExercises.length > 0) {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement) {
        setTimeout(() => inputElement.focus(), 100);
      }
    }
  }, [currentIndex, showResult, randomizedExercises.length]);

  const checkAnswer = useCallback(() => {
    if (showResult) return;

    const userAnswer = answer.toLowerCase().trim();
    const correctAnswer = currentExercise?.correct?.toLowerCase().trim() || '';
    const isCorrect = userAnswer === correctAnswer;

    updateSessionScore(isCorrect ? { correct: 1 } : { incorrect: 1 });
    setShowResult(true);

    // Show toast feedback
    if (isCorrect) {
      showCorrectAnswer();
    } else {
      showIncorrectAnswer();
    }
  }, [showResult, answer, currentExercise?.correct, updateSessionScore, showCorrectAnswer, showIncorrectAnswer]);

  const handleNext = useCallback(() => {
    if (currentIndex < randomizedExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer('');
      setShowResult(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const { sessionScore } = useAppStore.getState();
      const finalScore = Math.round((sessionScore.correct / sessionScore.total) * 100);

      // Register progress
      addProgressEntry({
        score: finalScore,
        totalQuestions: sessionScore.total,
        correctAnswers: sessionScore.correct,
        moduleId: module.id,
        learningMode: 'completion',
        timeSpent: timeSpent,
      });

      const accuracy = sessionScore.accuracy;
      showModuleCompleted(module.name, finalScore, accuracy);
      updateUserScore(module.id, finalScore, timeSpent);
      setCurrentView('menu');
    }
  }, [currentIndex, randomizedExercises.length, startTime, addProgressEntry, module.id, module.name, showModuleCompleted, updateUserScore, setCurrentView]);

  useEffect(() => {
    if (randomizedExercises.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showResult) {
        if (answer.trim()) {
          checkAnswer();
        }
      } else if (e.key === 'Enter' && showResult) {
        handleNext();
      } else if (e.key === 'Escape') {
        setCurrentView('menu');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [answer, showResult, randomizedExercises.length, checkAnswer, handleNext, setCurrentView]);

  // Early return if no data
  if (!randomizedExercises.length) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6 text-center">
        <p className="text-gray-600 mb-4">{t('noDataAvailable') || 'No completion exercises available'}</p>
        <button
          onClick={() => setCurrentView('menu')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('navigation.mainMenu')}
        </button>
      </div>
    );
  }

  const renderSentence = () => {
    if (!currentExercise?.sentence) return null;

    // Split sentence by blank marker (______)
    const parts = currentExercise.sentence.split('______');
    const elements: React.ReactElement[] = [];

    parts.forEach((part, index) => {
      // Add text part
      if (part) {
        elements.push(
          <span key={`text-${index}`} className="text-gray-900 dark:text-white">
            {part}
          </span>
        );
      }

      // Add input after each part except the last
      if (index < parts.length - 1) {
        const isCorrect = showResult && answer.toLowerCase().trim() === currentExercise.correct?.toLowerCase().trim();
        const isIncorrect = showResult && answer && !isCorrect;

        elements.push(
          <input
            key={`input-${index}`}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={showResult}
            placeholder="..."
            autoComplete="off"
            className={`inline-block mx-2 px-3 py-1.5 min-w-[120px] text-center rounded-lg border-2 focus:outline-none transition-all duration-200 font-medium ${showResult
              ? isCorrect
                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200'
                : isIncorrect
                  ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200'
                  : 'border-gray-300 bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              : 'border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:bg-gray-600'
              }`}
            style={{
              width: `${Math.max(120, (answer?.length || 3) * 12 + 60)}px`
            }}
          />
        );
      }
    });

    return <>{elements}</>;
  };

  const hasAnswer = answer.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      {/* Compact header with progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{module.name}</h2>
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full" style={{ minWidth: '60px', textAlign: 'center' }}>
            {randomizedExercises.length > 0 ? `${currentIndex + 1}/${randomizedExercises.length}` : '...'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / randomizedExercises.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {showResult ? 'Press Enter for next exercise' : 'Fill the blank and press Enter'}
        </p>
      </div>

      {/* Exercise */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Complete the sentence:
        </h3>

        {currentExercise?.tip && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 rounded-r-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> {currentExercise.tip}
            </p>
          </div>
        )}

        <div className="text-lg leading-relaxed mb-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-inner">
          <div className="text-gray-900 dark:text-white font-medium">
            {renderSentence()}
          </div>
        </div>

        {/* Result and Explanation - Compact unified section */}
        <div className={`mt-3 overflow-hidden transition-all duration-300 ease-in-out ${showResult ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            {/* Ultra-compact result feedback */}
            <div className="flex items-center space-x-1.5 flex-wrap">
              {answer.toLowerCase().trim() === currentExercise?.correct?.toLowerCase().trim() ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-600" />
              )}
              <span className="font-medium text-xs text-gray-900 dark:text-white">
                {answer.toLowerCase().trim() === currentExercise?.correct?.toLowerCase().trim()
                  ? 'Correct!'
                  : 'Incorrect'}
              </span>

              {/* Correct answer flows naturally after incorrect */}
              {answer.toLowerCase().trim() !== currentExercise?.correct?.toLowerCase().trim() && (
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  - Answer: <strong>{currentExercise?.correct}</strong>
                </span>
              )}
            </div>

            {/* Compact explanation */}
            {currentExercise?.explanation && (
              <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <span className="font-medium">Explanation:</span> {currentExercise.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Control Bar */}
      <div className="flex justify-center items-center gap-3 flex-wrap mt-6">
        {/* Navigation */}
        <NavigationButton
          onClick={() => setCurrentView('menu')}
          title="Return to main menu"
        >
          Back to Menu
        </NavigationButton>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={!hasAnswer}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <Check className="h-4 w-4" />
            <span>Check Answer</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <span>{currentIndex === randomizedExercises.length - 1 ? 'Finish Exercise' : 'Next Exercise'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CompletionComponent;