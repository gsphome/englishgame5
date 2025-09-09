import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Check, Info, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useToast } from '../../hooks/useToast';
import { useLearningCleanup } from '../../hooks/useLearningCleanup';
import NavigationButton from '../ui/NavigationButton';
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

    let pairs: { left: string; right: string }[] = [];
    
    // Check if data has pairs property (legacy format)
    const firstItem = module.data[0] as any;
    if (firstItem?.pairs) {
      pairs = firstItem.pairs;
    } else if (Array.isArray(module.data)) {
      pairs = module.data.map((item: any) => ({
        left: item.en || item.term || item.left || '',
        right: item.es || item.definition || item.right || ''
      }));
    }

    if (pairs.length > 0) {
      const terms = pairs.map((pair: { left: string; right: string }) => pair.left).sort(() => Math.random() - 0.5);
      const definitions = pairs.map((pair: { left: string; right: string }) => pair.right).sort(() => Math.random() - 0.5);
      
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
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">Loading matching exercise...</p>
      </div>
    );
  }

  const getPairs = (): { left: string; right: string }[] => {
    if (!module.data) return [];
    const firstItem = module.data[0] as any;
    if (firstItem?.pairs) {
      return firstItem.pairs;
    }
    return (module.data as any[]).map((item: any) => ({
      left: item.term || '',
      right: item.definition || ''
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
    const terms = pairs.map((pair: { left: string; right: string }) => pair.left).sort(() => Math.random() - 0.5);
    const definitions = pairs.map((pair: { left: string; right: string }) => pair.right).sort(() => Math.random() - 0.5);
    
    setLeftItems(terms);
    setRightItems(definitions);
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setShowResult(false);
  };

  const finishExercise = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = pairs.filter((pair: { left: string; right: string }) => matches[pair.left] === pair.right).length;
    const finalScore = Math.round((correctCount / pairs.length) * 100);
    const accuracy = (correctCount / pairs.length) * 100;
    
    showModuleCompleted(module.name, finalScore, accuracy);
    updateUserScore(module.id, finalScore, timeSpent);
    setCurrentView('menu');
  };

  const allMatched = Object.keys(matches).length === pairs.length;

  const getItemStatus = (item: string, isLeft: boolean) => {
    if (showResult) {
      if (isLeft) {
        const correctMatch = pairs.find((pair: { left: string; right: string }) => pair.left === item)?.right;
        const userMatch = matches[item];
        return userMatch === correctMatch ? 'correct' : 'incorrect';
      } else {
        const correctPair = pairs.find((pair: { left: string; right: string }) => pair.right === item);
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
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      {/* Compact header */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{module.name}</h2>
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {Object.keys(matches).length}/{pairs.length} matched
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-pink-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(matches).length / pairs.length) * 100}%` }}
          />
        </div>
        <p className="instruction-text instruction-text--small instruction-text--center mt-2">
          {allMatched ? 'All matched! Check your answers' : 'Click items from both columns to match them'}
        </p>
      </div>

      {/* Compact Matching Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Terms Column */}
          <div className="space-y-2">
            <h3 className="section-header instruction-text--medium mb-3 text-center">Terms</h3>
            {leftItems.map((item, index) => {
              const isMatched = matches[item];
              const isSelected = selectedLeft === item;
              const status = getItemStatus(item, true);
              
              let className = "w-full p-3 text-sm text-left border-2 rounded-xl transition-all duration-200 font-medium ";
              
              if (showResult) {
                className += status === 'correct' 
                  ? 'border-green-400 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'border-red-400 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
              } else if (isMatched) {
                className += 'border-pink-400 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 cursor-pointer';
              } else if (isSelected) {
                className += 'border-pink-500 bg-pink-200 dark:bg-pink-800 text-pink-900 dark:text-pink-100 shadow-md scale-105';
              } else {
                className += 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900 cursor-pointer hover:shadow-md hover:scale-102';
              }

              return (
                <button
                  key={`left-${index}`}
                  onClick={() => isMatched ? removeMatch(item) : handleLeftClick(item)}
                  className={className}
                >
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="truncate flex-1">{item}</span>
                    <div className="flex items-center space-x-1">
                      {showResult && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            const termData = (module.data as any[])?.find((d: any) => d.term === item);
                            setSelectedTerm(termData);
                            setShowExplanation(true);
                          }}
                          className="flex-shrink-0 w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                          title="Show explanation"
                        >
                          <Info className="h-3 w-3" />
                        </div>
                      )}
                      {isMatched && (
                        <span className="flex-shrink-0 w-6 h-6 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
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
          <div className="space-y-2">
            <h3 className="section-header instruction-text--medium mb-3 text-center">Definitions</h3>
            {rightItems.map((item, index) => {
              const isMatched = Object.values(matches).includes(item);
              const isSelected = selectedRight === item;
              const status = getItemStatus(item, false);
              
              let className = "w-full p-3 text-sm text-left border-2 rounded-xl transition-all duration-200 ";
              
              if (showResult) {
                className += status === 'correct' 
                  ? 'border-green-400 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : status === 'incorrect'
                  ? 'border-red-400 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200';
              } else if (isMatched) {
                className += 'border-pink-400 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 opacity-60';
              } else if (isSelected) {
                className += 'border-pink-500 bg-pink-200 dark:bg-pink-800 text-pink-900 dark:text-pink-100 shadow-md scale-105';
              } else {
                className += 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900 cursor-pointer hover:shadow-md hover:scale-102';
              }

              return (
                <button
                  key={`right-${index}`}
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched}
                  className={className}
                >
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="truncate flex-1">{item}</span>
                    {isMatched && (
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {String.fromCharCode(65 + leftItems.findIndex(term => matches[term] === item))}
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
          <>
            <button
              onClick={resetExercise}
              className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-sm"
              title="Reset Exercise"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <button
              onClick={checkAnswers}
              disabled={!allMatched}
              className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Check Matches</span>
            </button>
          </>
        ) : (
          <button
            onClick={finishExercise}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <span>Finish Exercise</span>
          </button>
        )}
      </div>

      {/* Explanation Modal */}
      {showExplanation && selectedTerm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:!bg-slate-800 border-0 dark:border dark:!border-slate-600 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 
                  className="text-lg font-semibold text-gray-900"
                  style={{ color: document.documentElement.classList.contains('dark') ? '#ffffff' : undefined }}
                >
                  {selectedTerm.term}
                </h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
                  style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : undefined }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 
                    className="text-sm font-medium text-gray-700 mb-1"
                    style={{ color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : undefined }}
                  >
                    Definition:
                  </h4>
                  <p 
                    className="text-gray-900"
                    style={{ color: document.documentElement.classList.contains('dark') ? '#ffffff' : undefined }}
                  >
                    {selectedTerm.definition}
                  </p>
                </div>
                
                {selectedTerm.explanation && (
                  <div>
                    <h4 
                      className="text-sm font-medium text-gray-700 mb-1"
                      style={{ color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : undefined }}
                    >
                      Explanation:
                    </h4>
                    <p 
                      className="text-gray-600 text-sm"
                      style={{ color: document.documentElement.classList.contains('dark') ? '#ffffff' : undefined }}
                    >
                      {selectedTerm.explanation}
                    </p>
                  </div>
                )}
                
                {selectedTerm.term_es && (
                  <div>
                    <h4 
                      className="text-sm font-medium text-gray-700 mb-1"
                      style={{ color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : undefined }}
                    >
                      Spanish:
                    </h4>
                    <p 
                      className="text-gray-900 font-medium"
                      style={{ color: document.documentElement.classList.contains('dark') ? '#ffffff' : undefined }}
                    >
                      {selectedTerm.term_es}
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowExplanation(false)}
                className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:!bg-blue-600 dark:hover:!bg-blue-500 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default MatchingComponent;