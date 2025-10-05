import React from 'react';
import {
  CreditCard,
  HelpCircle,
  PenTool,
  BarChart3,
  Link,
  Lock,
  LockOpen,
  CheckCircle,
} from 'lucide-react';
import { useModuleProgression } from '../../hooks/useProgression';
import { useTranslation } from '../../utils/i18n';
import { useSettingsStore } from '../../stores/settingsStore';
import type { LearningModule } from '../../types';

interface ModuleCardProps {
  module: LearningModule;
  onClick: (module: LearningModule) => void;
  tabIndex?: number;
  role?: string;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
}

const getIcon = (learningMode: string) => {
  const iconProps = { size: 20, strokeWidth: 2 };

  const icons: Record<string, React.ReactElement> = {
    flashcard: <CreditCard {...iconProps} />,
    quiz: <HelpCircle {...iconProps} />,
    completion: <PenTool {...iconProps} />,
    sorting: <BarChart3 {...iconProps} />,
    matching: <Link {...iconProps} />,
  };
  return icons[learningMode] || <CreditCard {...iconProps} />;
};

const getLearningModeLabel = (learningMode: string, t: any): string => {
  const labels: Record<string, string> = {
    flashcard: t('learning.flashcardMode'),
    quiz: t('learning.quizMode'),
    completion: t('learning.completionMode'),
    sorting: t('learning.sortingMode'),
    matching: t('learning.matchingMode'),
  };
  return labels[learningMode] || t('common.exercise');
};

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onClick,
  tabIndex,
  role,
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize,
}) => {
  const progression = useModuleProgression(module.id);
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);

  const difficultyLevel =
    module.level && Array.isArray(module.level) && module.level.length > 0
      ? module.level.map((l: string) => l.toUpperCase()).join('/')
      : 'B1';

  const learningModeLabel = getLearningModeLabel(module.learningMode, t);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (progression.canAccess) {
        onClick(module);
      }
    }
  };

  const handleClick = () => {
    if (progression.canAccess) {
      onClick(module);
    }
  };

  // Get status-specific styling and content
  const getStatusInfo = () => {
    if (progression.isLoading) {
      return {
        className: 'module-card--loading',
        statusIcon: null,
        statusText: t('common.loading'),
        disabled: true,
      };
    }

    switch (progression.status) {
      case 'completed':
        return {
          className: 'module-card--completed',
          statusIcon: <CheckCircle size={12} className="text-white" />,
          statusText: t('common.completed'),
          disabled: false,
        };
      case 'unlocked':
        return {
          className: 'module-card--unlocked',
          statusIcon: <LockOpen size={12} className="text-white" />,
          statusText: t('common.available'),
          disabled: false,
        };
      case 'locked':
        return {
          className: 'module-card--locked',
          statusIcon: <Lock size={12} className="text-white" />,
          statusText: t('learning.requiresPrerequisites', undefined, {
            count: progression.missingPrerequisites.length,
            plural: progression.missingPrerequisites.length !== 1 ? 's' : '',
          }),
          disabled: true,
        };
      default:
        return {
          className: 'module-card--locked',
          statusIcon: <Lock size={16} className="module-card__status-icon" />,
          statusText: t('common.locked'),
          disabled: true,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <button
      className={`module-card module-card--${module.learningMode} ${statusInfo.className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={statusInfo.disabled ? -1 : tabIndex}
      role={role}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
      aria-label={`${module.name} - ${learningModeLabel} - Difficulty level ${difficultyLevel} - ${statusInfo.statusText}`}
      title={
        statusInfo.disabled
          ? t('learning.exerciseIsLocked', undefined, {
              name: module.name,
              status: statusInfo.statusText,
            })
          : t('learning.startExercise', undefined, {
              mode: learningModeLabel.toLowerCase(),
              name: module.name,
              level: difficultyLevel,
            })
      }
      disabled={statusInfo.disabled}
      aria-disabled={statusInfo.disabled}
    >
      <div className="module-card__content">
        <div className="module-card__header">
          <div className="module-card__icon" aria-hidden="true">
            {getIcon(module.learningMode)}
          </div>
        </div>
        <h3 className="module-card__title">{module.name}</h3>
        <div className="module-card__type" aria-label={`Exercise type: ${learningModeLabel}`}>
          {learningModeLabel}
        </div>
        <div className="module-card__level" aria-label={`Difficulty level: ${difficultyLevel}`}>
          {difficultyLevel}
        </div>
        <div
          className="module-card__time"
          aria-label={`Estimated time: ${module.estimatedTime || 5} minutes`}
        >
          {module.estimatedTime || 5}min
        </div>

        {/* Status indicators - Consistent positioning for all states */}
        {statusInfo.statusIcon && (
          <div
            className={`module-card__status-indicator module-card__status-indicator--${progression.status}`}
            aria-hidden="true"
          >
            {statusInfo.statusIcon}
          </div>
        )}
        {/* Locked state already shows lock icon in main icon area - no duplicate needed */}
      </div>
    </button>
  );
};
