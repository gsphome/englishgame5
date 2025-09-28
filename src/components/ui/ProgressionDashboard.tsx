import React from 'react';
import { useProgression } from '../../hooks/useProgression';
import { useAppStore } from '../../stores/appStore';
import { useProgressStore } from '../../stores/progressStore';
import { toast } from '../../stores/toastStore';
import { CheckCircle, Lock, Play, ChevronDown, ChevronRight } from 'lucide-react';
import type { LearningModule } from '../../types';
import '../../styles/components/progression-dashboard.css';

interface ProgressionDashboardProps {
  onModuleSelect: (module: LearningModule) => void;
}

export const ProgressionDashboard: React.FC<ProgressionDashboardProps> = ({
  onModuleSelect: _onModuleSelect,
}) => {
  const { setCurrentModule, setCurrentView } = useAppStore();
  const { isModuleCompleted } = useProgressStore();
  const progression = useProgression();
  const [expandedUnits, setExpandedUnits] = React.useState<Set<number>>(new Set());

  const nextRecommended = progression.getNextRecommendedModule();

  // Auto-expand unit with next recommended module
  React.useEffect(() => {
    if (nextRecommended && !expandedUnits.has(nextRecommended.unit)) {
      setExpandedUnits(prev => new Set([...prev, nextRecommended.unit]));
    }
  }, [nextRecommended, expandedUnits]);

  const toggleUnit = (unit: number) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unit)) {
      newExpanded.delete(unit);
    } else {
      newExpanded.add(unit);
    }
    setExpandedUnits(newExpanded);
  };

  const handleContinueLearning = () => {
    if (nextRecommended) {
      // Show toast when continuing a module (same as MainMenu)
      const modeLabels: Record<string, string> = {
        flashcard: 'Flashcards',
        quiz: 'Quiz',
        completion: 'Completar oraciones',
        sorting: 'Ejercicio de clasificación',
        matching: 'Ejercicio de emparejamiento',
      };

      toast.info(
        'Continuando módulo',
        `${nextRecommended.name} - ${modeLabels[nextRecommended.learningMode] || 'Ejercicio'}`,
        { duration: 1500 }
      );

      setCurrentModule(nextRecommended);
      setCurrentView(nextRecommended.learningMode);
    }
  };

  const handleModuleClick = (module: LearningModule) => {
    // Check if module is accessible (same logic as MainMenu)
    if (!progression.canAccessModule(module.id)) {
      const missingPrereqs = progression.getMissingPrerequisites(module.id);
      const prereqNames = missingPrereqs.map(p => p.name).join(', ');

      toast.warning('Módulo bloqueado', `Completa primero: ${prereqNames}`, { duration: 3000 });
      return;
    }

    // Show toast when starting a module (same as MainMenu)
    const modeLabels: Record<string, string> = {
      flashcard: 'Flashcards',
      quiz: 'Quiz',
      completion: 'Completar oraciones',
      sorting: 'Ejercicio de clasificación',
      matching: 'Ejercicio de emparejamiento',
    };

    toast.info(
      'Iniciando módulo',
      `${module.name} - ${modeLabels[module.learningMode] || 'Ejercicio'}`,
      { duration: 1500 }
    );

    // Navigate directly to the module
    setCurrentModule(module);
    setCurrentView(module.learningMode);
  };

  const getUnitTitle = (unit: number): string => {
    const titles = {
      1: 'Foundation',
      2: 'Elementary',
      3: 'Intermediate',
      4: 'Upper-Intermediate',
      5: 'Advanced',
      6: 'Mastery',
    };
    return titles[unit as keyof typeof titles] || `Unit ${unit}`;
  };

  const getLevelColor = (level: string): string => {
    const colors = {
      a1: '#10b981', // green
      a2: '#3b82f6', // blue
      b1: '#f59e0b', // amber
      b2: '#ef4444', // red
      c1: '#8b5cf6', // violet
      c2: '#ec4899', // pink
    };
    return colors[level as keyof typeof colors] || '#6b7280';
  };

  // Group modules by unit for better organization
  const modulesByUnit = React.useMemo(() => {
    const units: Record<number, LearningModule[]> = {};
    progression.unlockedModules.concat(progression.lockedModules).forEach(module => {
      if (!units[module.unit]) {
        units[module.unit] = [];
      }
      units[module.unit].push(module);
    });
    return units;
  }, [progression.unlockedModules, progression.lockedModules]);

  return (
    <div className="progression-dashboard">
      {/* Continue Learning Section */}
      {nextRecommended && (
        <div className="progression-dashboard__hero">
          <div className="progression-dashboard__continue">
            <div className="progression-dashboard__next-module">
              <div className="progression-dashboard__next-info">
                <h3 className="progression-dashboard__next-name">{nextRecommended.name}</h3>
                <p className="progression-dashboard__next-desc">{nextRecommended.description}</p>
                <div className="progression-dashboard__next-meta">
                  <span
                    className="progression-dashboard__level-badge"
                    style={{
                      backgroundColor: getLevelColor(
                        Array.isArray(nextRecommended.level)
                          ? nextRecommended.level[0]
                          : nextRecommended.level
                      ),
                    }}
                  >
                    {Array.isArray(nextRecommended.level)
                      ? nextRecommended.level[0].toUpperCase()
                      : nextRecommended.level.toUpperCase()}
                  </span>
                  <span className="progression-dashboard__time">
                    ~{nextRecommended.estimatedTime}min
                  </span>
                </div>
              </div>
              <button
                className="progression-dashboard__continue-btn"
                onClick={handleContinueLearning}
              >
                <Play className="progression-dashboard__continue-icon" />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Units Progress */}
      <div className="progression-dashboard__units">
        <h2 className="progression-dashboard__section-title">Your Progress</h2>
        {Object.entries(modulesByUnit)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([unitStr, modules]) => {
            const unit = Number(unitStr);
            const unitStatus = progression.getUnitCompletionStatus(unit);

            const isExpanded = expandedUnits.has(unit);
            const hasNextModule = modules.some(m => nextRecommended?.id === m.id);

            return (
              <div key={unit} className="progression-dashboard__unit">
                <div
                  className={`progression-dashboard__unit-header progression-dashboard__unit-header--clickable ${unitStatus.percentage === 100 ? 'progression-dashboard__unit-header--completed' : ''}`}
                  onClick={() => toggleUnit(unit)}
                >
                  <div className="progression-dashboard__unit-info">
                    <div
                      className={`progression-dashboard__unit-expand ${unitStatus.percentage === 100 ? 'progression-dashboard__unit-expand--completed' : ''}`}
                    >
                      {unitStatus.percentage === 100 ? (
                        <CheckCircle className="progression-dashboard__expand-icon progression-dashboard__expand-icon--completed" />
                      ) : isExpanded ? (
                        <ChevronDown className="progression-dashboard__expand-icon" />
                      ) : (
                        <ChevronRight className="progression-dashboard__expand-icon" />
                      )}
                    </div>
                    <h3 className="progression-dashboard__unit-title">{getUnitTitle(unit)}</h3>
                    {hasNextModule && !isExpanded && (
                      <div className="progression-dashboard__unit-next-indicator">
                        <span className="progression-dashboard__unit-next-label">Next</span>
                      </div>
                    )}
                  </div>
                  <div className="progression-dashboard__unit-progress">
                    <span className="progression-dashboard__unit-stats">
                      {unitStatus.completed}/{unitStatus.total}
                    </span>
                    <div className="progression-dashboard__progress-bar">
                      <div
                        className="progression-dashboard__progress-fill"
                        style={{ width: `${unitStatus.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="progression-dashboard__modules">
                    {modules.map(module => {
                      const status = progression.getModuleStatus(module.id);
                      const isCompleted = isModuleCompleted(module.id);
                      const isNext = nextRecommended?.id === module.id;

                      return (
                        <div
                          key={module.id}
                          className={`progression-dashboard__module progression-dashboard__module--${status} ${isNext ? 'progression-dashboard__module--next' : ''}`}
                          onClick={() => handleModuleClick(module)}
                        >
                          <div className="progression-dashboard__module-icon">
                            {isCompleted ? (
                              <CheckCircle className="progression-dashboard__icon progression-dashboard__icon--completed" />
                            ) : status === 'locked' ? (
                              <Lock className="progression-dashboard__icon progression-dashboard__icon--locked" />
                            ) : (
                              <Play className="progression-dashboard__icon progression-dashboard__icon--available" />
                            )}
                          </div>

                          <div className="progression-dashboard__module-content">
                            <h4 className="progression-dashboard__module-name">{module.name}</h4>
                            <p className="progression-dashboard__module-desc">
                              {module.description}
                            </p>
                            <div className="progression-dashboard__module-meta">
                              <span
                                className="progression-dashboard__level-badge"
                                style={{
                                  backgroundColor: getLevelColor(
                                    Array.isArray(module.level) ? module.level[0] : module.level
                                  ),
                                }}
                              >
                                {Array.isArray(module.level)
                                  ? module.level[0].toUpperCase()
                                  : module.level.toUpperCase()}
                              </span>
                              <span className="progression-dashboard__module-type">
                                {module.learningMode}
                              </span>
                              <span className="progression-dashboard__module-time">
                                ~{module.estimatedTime}min
                              </span>
                            </div>
                          </div>

                          {isNext && (
                            <div className="progression-dashboard__next-indicator">
                              <span className="progression-dashboard__next-label">Next</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
