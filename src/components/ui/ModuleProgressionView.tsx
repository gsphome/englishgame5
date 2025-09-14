import React from 'react';
import { X, Trophy, Target, Lock, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { useProgression } from '../../hooks/useProgression';
import { useProgressStore } from '../../stores/progressStore';

interface ModuleProgressionViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModuleProgressionView: React.FC<ModuleProgressionViewProps> = ({
  isOpen,
  onClose,
}) => {
  const progression = useProgression();
  const { isModuleCompleted } = useProgressStore();

  const { stats, unlockedModules, lockedModules } = progression;
  const nextRecommended = progression.getNextRecommendedModule();

  // Group modules by unit for better organization
  const modulesByUnit = React.useMemo(() => {
    const units: { [key: number]: { unlocked: any[]; locked: any[]; completed: any[] } } = {};

    // Initialize units
    for (let i = 1; i <= 6; i++) {
      units[i] = { unlocked: [], locked: [], completed: [] };
    }

    // Categorize unlocked modules
    unlockedModules.forEach(module => {
      if (isModuleCompleted(module.id)) {
        units[module.unit]?.completed.push(module);
      } else {
        units[module.unit]?.unlocked.push(module);
      }
    });

    // Categorize locked modules
    lockedModules.forEach(module => {
      units[module.unit]?.locked.push(module);
    });

    return units;
  }, [unlockedModules, lockedModules, isModuleCompleted]);

  if (!isOpen) return null;

  const unitInfo = {
    1: {
      name: 'Foundation',
      code: 'A1',
      color: 'emerald',
      description: 'Basic vocabulary and grammar',
    },
    2: {
      name: 'Elementary',
      code: 'A2',
      color: 'blue',
      description: 'Everyday conversations and past tense',
    },
    3: {
      name: 'Intermediate',
      code: 'B1',
      color: 'purple',
      description: 'Travel, modal verbs, and phrasal verbs',
    },
    4: {
      name: 'Upper-Intermediate',
      code: 'B2',
      color: 'orange',
      description: 'Advanced vocabulary and idioms',
    },
    5: {
      name: 'Advanced',
      code: 'C1',
      color: 'red',
      description: 'Complex grammar and business English',
    },
    6: {
      name: 'Mastery',
      code: 'C2',
      color: 'indigo',
      description: 'Academic vocabulary and nuanced expressions',
    },
  };

  return (
    <div className="module-progression-overlay" onClick={onClose}>
      <div className="module-progression-container" onClick={e => e.stopPropagation()}>
        <div className="module-progression-header">
          <div>
            <h2 className="module-progression-title">Learning Path</h2>
            <p className="module-progression-subtitle">Your journey from A1 to C2</p>
          </div>
          <button
            onClick={onClose}
            className="module-progression-close"
            aria-label="Close module progression view"
          >
            <X size={24} />
          </button>
        </div>

        <div className="module-progression-content">
          {/* Compact Header with Progress and Next */}
          <div className="progression-header-compact">
            <div className="progression-stats-compact">
              <div className="progression-stat-compact">
                <Trophy className="text-yellow-500" size={16} />
                <span className="progression-stat-value-compact">{stats.completedModules}</span>
              </div>
              <div className="progression-stat-compact">
                <Target className="text-blue-500" size={16} />
                <span className="progression-stat-value-compact">{stats.unlockedModules}</span>
              </div>
              <div className="progression-stat-compact">
                <Lock className="text-gray-400" size={16} />
                <span className="progression-stat-value-compact">{stats.lockedModules}</span>
              </div>
            </div>

            <div className="progression-bar-compact">
              <div className="progression-bar-track-compact">
                <div
                  className="progression-bar-fill-compact"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
              <span className="progression-bar-text-compact">{stats.completionPercentage}%</span>
            </div>

            {/* Next Recommended - Inline */}
            {nextRecommended && (
              <div className="next-recommendation-compact">
                <ArrowRight className="text-green-500" size={14} />
                <span className="next-recommendation-text">
                  Next: <strong>{nextRecommended.name}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Units Progress */}
          <div className="units-progression">
            {Object.entries(unitInfo).map(([unitNum, info]) => {
              const unitNumber = parseInt(unitNum);
              const unitModules = modulesByUnit[unitNumber];
              const unitStats = stats.unitStats.find(u => u.unit === unitNumber);

              if (!unitModules || !unitStats) return null;

              const totalModules = unitStats.total;
              const completedCount = unitModules.completed.length;

              return (
                <div key={unitNumber} className={`unit-section unit-section--${info.color}`}>
                  <div className="unit-header">
                    <div className="unit-info">
                      <div className="unit-badge">
                        <span className="unit-code">{info.code}</span>
                      </div>
                      <div className="unit-details">
                        <h3 className="unit-name">{info.name}</h3>
                        <p className="unit-description">{info.description}</p>
                      </div>
                    </div>
                    <div className="unit-progress">
                      <span className="unit-progress-text">
                        {completedCount}/{totalModules}
                      </span>
                      <div className="unit-progress-bar">
                        <div
                          className="unit-progress-fill"
                          style={{ width: `${unitStats.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compact Module Summary */}
                  <div className="module-groups-compact">
                    {/* Available Modules - Priority */}
                    {unitModules.unlocked.length > 0 && (
                      <div className="module-group-compact module-group-compact--available">
                        <div className="module-group-header-compact">
                          <Star className="text-blue-500" size={14} />
                          <span className="module-group-title-compact">
                            Available ({unitModules.unlocked.length})
                          </span>
                        </div>
                        <div className="module-list-compact">
                          {unitModules.unlocked.slice(0, 2).map(module => (
                            <div
                              key={module.id}
                              className="module-item-compact module-item-compact--available"
                            >
                              <span className="module-item-name-compact">{module.name}</span>
                              <span className="module-item-type-compact">
                                {module.learningMode}
                              </span>
                            </div>
                          ))}
                          {unitModules.unlocked.length > 2 && (
                            <div className="module-item-more-compact">
                              +{unitModules.unlocked.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Completed Summary */}
                    {unitModules.completed.length > 0 && (
                      <div className="module-group-compact module-group-compact--completed">
                        <div className="module-group-header-compact">
                          <CheckCircle className="text-green-500" size={14} />
                          <span className="module-group-title-compact">
                            {unitModules.completed.length} completed
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Locked Summary */}
                    {unitModules.locked.length > 0 && (
                      <div className="module-group-compact module-group-compact--locked">
                        <div className="module-group-header-compact">
                          <Lock className="text-gray-400" size={14} />
                          <span className="module-group-title-compact">
                            {unitModules.locked.length} locked
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
