import React from 'react';
import { X, CheckCircle, Lock, Star, ArrowRight } from 'lucide-react';
import { useProgression } from '../../hooks/useProgression';
import { useProgressStore } from '../../stores/progressStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
import '../../styles/components/compact-learning-path.css';

interface CompactLearningPathProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompactLearningPath: React.FC<CompactLearningPathProps> = ({ isOpen, onClose }) => {
  const progression = useProgression();
  const { isModuleCompleted } = useProgressStore();
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);

  if (!isOpen) return null;

  const { stats, unlockedModules } = progression;
  const nextRecommended = progression.getNextRecommendedModule();

  // Get next 3 available modules
  const availableModules = unlockedModules
    .filter(module => !isModuleCompleted(module.id))
    .slice(0, 3);

  const unitInfo = {
    1: { name: 'Foundation', code: 'A1', color: 'emerald' },
    2: { name: 'Elementary', code: 'A2', color: 'blue' },
    3: { name: 'Intermediate', code: 'B1', color: 'purple' },
    4: { name: 'Upper-Intermediate', code: 'B2', color: 'orange' },
    5: { name: 'Advanced', code: 'C1', color: 'red' },
    6: { name: 'Mastery', code: 'C2', color: 'indigo' },
  };

  return (
    <div className="compact-learning-path">
      <div className="compact-learning-path__container">
        <div className="compact-learning-path__header">
          <h2 className="compact-learning-path__title">
            {t('learningPath.title', 'Ruta de Aprendizaje')}
          </h2>
          <button
            onClick={onClose}
            className="compact-learning-path__close-btn"
            aria-label={t('common.close')}
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <div className="compact-learning-path__content">
          {/* Progress Overview */}
          <div className="compact-learning-path__overview">
            <div className="compact-learning-path__progress-ring">
              <svg className="compact-learning-path__progress-svg" viewBox="0 0 36 36">
                <path
                  className="compact-learning-path__progress-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="compact-learning-path__progress-fill"
                  strokeDasharray={`${stats.completionPercentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="compact-learning-path__progress-text">
                <span className="compact-learning-path__progress-value">
                  {stats.completionPercentage}%
                </span>
                <span className="compact-learning-path__progress-label">
                  {t('learningPath.complete', 'Completo')}
                </span>
              </div>
            </div>

            <div className="compact-learning-path__stats">
              <div className="compact-learning-path__stat">
                <CheckCircle className="compact-learning-path__stat-icon compact-learning-path__stat-icon--completed" />
                <span className="compact-learning-path__stat-value">{stats.completedModules}</span>
                <span className="compact-learning-path__stat-label">
                  {t('learningPath.completed', 'Completados')}
                </span>
              </div>
              <div className="compact-learning-path__stat">
                <Star className="compact-learning-path__stat-icon compact-learning-path__stat-icon--available" />
                <span className="compact-learning-path__stat-value">{stats.unlockedModules}</span>
                <span className="compact-learning-path__stat-label">
                  {t('learningPath.available', 'Disponibles')}
                </span>
              </div>
              <div className="compact-learning-path__stat">
                <Lock className="compact-learning-path__stat-icon compact-learning-path__stat-icon--locked" />
                <span className="compact-learning-path__stat-value">{stats.lockedModules}</span>
                <span className="compact-learning-path__stat-label">
                  {t('learningPath.locked', 'Bloqueados')}
                </span>
              </div>
            </div>
          </div>

          {/* Next Recommended */}
          {nextRecommended && (
            <div className="compact-learning-path__next">
              <h3 className="compact-learning-path__section-title">
                <ArrowRight className="compact-learning-path__section-icon" />
                {t('learningPath.nextRecommended', 'Siguiente Recomendado')}
              </h3>
              <div className="compact-learning-path__module compact-learning-path__module--recommended">
                <div className="compact-learning-path__module-info">
                  <div className="compact-learning-path__module-header">
                    <span
                      className={`compact-learning-path__module-level compact-learning-path__module-level--${unitInfo[nextRecommended.unit as keyof typeof unitInfo]?.color}`}
                    >
                      {unitInfo[nextRecommended.unit as keyof typeof unitInfo]?.code}
                    </span>
                    <span className="compact-learning-path__module-type">
                      {nextRecommended.learningMode}
                    </span>
                  </div>
                  <h4 className="compact-learning-path__module-name">{nextRecommended.name}</h4>
                  {nextRecommended.description && (
                    <p className="compact-learning-path__module-description">
                      {nextRecommended.description}
                    </p>
                  )}
                </div>
                <Star className="compact-learning-path__module-star" />
              </div>
            </div>
          )}

          {/* Available Modules */}
          {availableModules.length > 0 && (
            <div className="compact-learning-path__available">
              <h3 className="compact-learning-path__section-title">
                {t('learningPath.availableModules', 'Módulos Disponibles')}
              </h3>
              <div className="compact-learning-path__modules">
                {availableModules.map(module => (
                  <div key={module.id} className="compact-learning-path__module">
                    <div className="compact-learning-path__module-info">
                      <div className="compact-learning-path__module-header">
                        <span
                          className={`compact-learning-path__module-level compact-learning-path__module-level--${unitInfo[module.unit as keyof typeof unitInfo]?.color}`}
                        >
                          {unitInfo[module.unit as keyof typeof unitInfo]?.code}
                        </span>
                        <span className="compact-learning-path__module-type">
                          {module.learningMode}
                        </span>
                      </div>
                      <h4 className="compact-learning-path__module-name">{module.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unit Progress Summary */}
          <div className="compact-learning-path__units">
            <h3 className="compact-learning-path__section-title">
              {t('learningPath.unitProgress', 'Progreso por Nivel')}
            </h3>
            <div className="compact-learning-path__unit-list">
              {stats.unitStats.map(unitStat => {
                const info = unitInfo[unitStat.unit as keyof typeof unitInfo];
                return (
                  <div key={unitStat.unit} className="compact-learning-path__unit">
                    <div className="compact-learning-path__unit-info">
                      <span
                        className={`compact-learning-path__unit-badge compact-learning-path__unit-badge--${info?.color}`}
                      >
                        {info?.code}
                      </span>
                      <span className="compact-learning-path__unit-name">{info?.name}</span>
                    </div>
                    <div className="compact-learning-path__unit-progress">
                      <div className="compact-learning-path__unit-progress-bar">
                        <div
                          className="compact-learning-path__unit-progress-fill"
                          style={{ width: `${unitStat.percentage}%` }}
                        />
                      </div>
                      <span className="compact-learning-path__unit-progress-text">
                        {unitStat.completed}/{unitStat.total}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="compact-learning-path__actions">
            <button
              onClick={onClose}
              className="compact-learning-path__btn compact-learning-path__btn--primary"
            >
              {t('common.continue', 'Continuar Aprendiendo')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
