import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProgressStore } from '../../stores/progressStore';
import { useToast } from '../../hooks/useToast';
import { useLearningCleanup } from '../../hooks/useLearningCleanup';
import { shuffleArray } from '../../utils/randomUtils';
import { createSanitizedHTML } from '../../utils/htmlSanitizer';
import NavigationButton from '../ui/NavigationButton';

import type { LearningModule, QuizData } from '../../types';

interface QuizComponentProps {
  module: LearningModule;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ module }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());

  // Randomize questions and options once per component mount
  const randomizedQuestions = useMemo(() => {
    if (!module?.data) return [];

    const questions = module.data as QuizData[];
    const shuffledQuestions = shuffleArray(questions);

    // Randomize options for each question
    return shuffledQuestions.map(question => {
      if (!question.options || !question.correct) return question;

      const shuffledOptions = shuffleArray([...question.options]);

      return {
        ...question,
        options: shuffledOptions,
      };
    });
  }, [module?.data]);

  const { updateSessionScore, setCurrentView } = useAppStore();
  const { updateUserScore } = useUserStore();
  const { theme } = useSettingsStore();
  const { addProgressEntry } = useProgressStore();
  const { showCorrectAnswer, showIncorrectAnswer, showModuleCompleted } = useToast();
  useLearningCleanup();

  const isDark = theme === 'dark';
  const textColor = isDark ? 'white' : '#111827';

  const currentQuestion = randomizedQuestions[currentIndex];

  const handleAnswerSelect = useCallback(
    (optionIndex: number) => {
      if (showResult || !currentQuestion) return;

      const selectedAnswerText = currentQuestion.options?.[optionIndex];
      const isCorrect = selectedAnswerText === currentQuestion.correct;

      setSelectedAnswer(optionIndex);
      setShowResult(true);

      updateSessionScore(isCorrect ? { correct: 1 } : { incorrect: 1 });

      if (isCorrect) {
        showCorrectAnswer();
      } else {
        showIncorrectAnswer();
      }
    },
    [showResult, currentQuestion, updateSessionScore, showCorrectAnswer, showIncorrectAnswer]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < randomizedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const { sessionScore } = useAppStore.getState();
      const finalScore = Math.round((sessionScore.correct / sessionScore.total) * 100);
      const accuracy = sessionScore.accuracy;

      // Register progress
      addProgressEntry({
        score: finalScore,
        totalQuestions: sessionScore.total,
        correctAnswers: sessionScore.correct,
        moduleId: module.id,
        learningMode: 'quiz',
        timeSpent: timeSpent,
      });

      showModuleCompleted(module.name, finalScore, accuracy);
      updateUserScore(module.id, finalScore, timeSpent);
      setCurrentView('menu');
    }
  }, [
    currentIndex,
    randomizedQuestions.length,
    startTime,
    addProgressEntry,
    module.id,
    module.name,
    showModuleCompleted,
    updateUserScore,
    setCurrentView,
  ]);

  useEffect(() => {
    if (randomizedQuestions.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4' && !showResult && currentQuestion) {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < (currentQuestion.options?.length || 0)) {
          handleAnswerSelect(optionIndex);
        }
      } else if (e.key === 'Enter' && showResult) {
        handleNext();
      } else if (e.key === 'Escape') {
        setCurrentView('menu');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    showResult,
    currentQuestion,
    randomizedQuestions.length,
    handleAnswerSelect,
    handleNext,
    setCurrentView,
  ]);

  // Early return if no data
  if (!randomizedQuestions.length) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6 text-center">
        <p className="text-gray-600 mb-4">No quiz questions available</p>
        <button
          onClick={() => setCurrentView('menu')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      {/* Compact header with progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{module.name}</h2>
          <span
            className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
            style={{ minWidth: '60px', textAlign: 'center' }}
          >
            {randomizedQuestions.length > 0
              ? `${currentIndex + 1}/${randomizedQuestions.length}`
              : '...'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / randomizedQuestions.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {showResult ? 'Press Enter for next question' : 'Press 1-4 to select or click an option'}
        </p>
      </div>

      {/* Question */}
      <div className="quiz-question bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6" style={{ color: textColor }}>
          <div
            dangerouslySetInnerHTML={createSanitizedHTML(
              currentQuestion?.question || currentQuestion?.sentence || 'Loading question...'
            )}
          />
        </h3>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {(currentQuestion?.options || []).map((option, index) => {
            let buttonClass =
              'quiz-option w-full p-3 text-left border-2 rounded-lg transition-all duration-200 ';

            if (!showResult) {
              buttonClass +=
                'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:!text-white';
            } else {
              if (currentQuestion?.options[index] === currentQuestion?.correct) {
                buttonClass +=
                  'quiz-option--correct border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900 text-green-800 dark:!text-white';
              } else if (
                index === selectedAnswer &&
                currentQuestion?.options[index] !== currentQuestion?.correct
              ) {
                buttonClass +=
                  'quiz-option--incorrect border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900 text-red-800 dark:!text-white';
              } else {
                buttonClass +=
                  'quiz-option--disabled border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:!text-white';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm" style={{ color: textColor }}>
                      {option}
                    </span>
                  </div>

                  {showResult && (
                    <div>
                      {currentQuestion?.options[index] === currentQuestion?.correct && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                      {index === selectedAnswer &&
                        currentQuestion?.options[index] !== currentQuestion?.correct && (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation - Always present with smooth transition */}
        <div
          className={`mt-6 overflow-hidden transition-all duration-300 ease-in-out ${
            showResult && currentQuestion?.explanation
              ? 'max-h-40 opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="quiz-explanation p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h4 className="font-medium mb-2" style={{ color: textColor }}>
              Explanation:
            </h4>
            <p style={{ color: textColor }}>{currentQuestion?.explanation || ''}</p>
          </div>
        </div>
      </div>

      {/* Unified Control Bar */}
      <div className="flex justify-center items-center gap-3 flex-wrap mt-6">
        {/* Navigation */}
        <NavigationButton onClick={() => setCurrentView('menu')} title="Return to main menu">
          Back to Menu
        </NavigationButton>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <button
          onClick={handleNext}
          disabled={!showResult}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <span>
            {currentIndex === randomizedQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default QuizComponent;
