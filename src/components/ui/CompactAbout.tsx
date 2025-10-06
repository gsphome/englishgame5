import React, { useState } from 'react';
import { X, Heart, Info, Monitor } from 'lucide-react';
import { Github } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { FluentFlowLogo } from './FluentFlowLogo';
import '../../styles/components/compact-about.css';
import '../../styles/components/modal-buttons.css';

interface CompactAboutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompactAbout: React.FC<CompactAboutProps> = ({ isOpen, onClose }) => {
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);
  const [showScreenInfo, setShowScreenInfo] = useState(false);

  // Handle closing both modals
  const handleClose = () => {
    setShowScreenInfo(false);
    onClose();
  };

  // Handle escape key to close modal
  useEscapeKey(isOpen, handleClose);

  // Close screen info modal when About modal closes
  React.useEffect(() => {
    if (!isOpen && showScreenInfo) {
      setShowScreenInfo(false);
    }
  }, [isOpen, showScreenInfo]);

  // Get screen information
  const getScreenInfo = () => {
    return {
      resolution: `${window.screen.width} × ${window.screen.height}`,
      viewport: `${window.innerWidth} × ${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio || 1,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type || 'unknown',
    };
  };

  if (!isOpen) return null;

  return (
    <div className="compact-about">
      <div className="compact-about__container">
        <div className="compact-about__header">
          <div className="compact-about__title-section">
            <FluentFlowLogo size="sm" />
            <h2 className="compact-about__title">{t('about.title')}</h2>
          </div>
          <button onClick={handleClose} className="modal__close-btn" aria-label={t('common.close')}>
            <X className="modal__close-icon" />
          </button>
        </div>

        <div className="compact-about__content">
          {/* App Info */}
          <div className="compact-about__section">
            <div className="compact-about__info-grid">
              <div className="compact-about__info-item">
                <span className="compact-about__info-label">{t('about.version')}</span>
                <span className="compact-about__info-value">2.0.0</span>
              </div>
              <div className="compact-about__info-item">
                <span className="compact-about__info-label">{t('about.platform')}</span>
                <span className="compact-about__info-value">Web</span>
              </div>
              <div className="compact-about__info-item">
                <span className="compact-about__info-label">{t('about.build')}</span>
                <span className="compact-about__info-value">
                  {(() => {
                    const buildTime = (window as any).__BUILD_TIME__ || new Date().toISOString();
                    const buildDate = new Date(buildTime);
                    const month = String(buildDate.getMonth() + 1).padStart(2, '0');
                    const day = String(buildDate.getDate()).padStart(2, '0');
                    return `${month}/${day}`;
                  })()}
                </span>
                <span className="compact-about__info-time">
                  {(() => {
                    const buildTime = (window as any).__BUILD_TIME__ || new Date().toISOString();
                    const buildDate = new Date(buildTime);
                    const hours = String(buildDate.getHours()).padStart(2, '0');
                    const minutes = String(buildDate.getMinutes()).padStart(2, '0');
                    return `${hours}:${minutes}`;
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="compact-about__section">
            <h3 className="compact-about__section-title">
              <Info className="compact-about__section-icon" />
              {t('about.features')}
            </h3>
            <div className="compact-about__features">
              <div className="compact-about__feature">
                <span className="compact-about__feature-icon">📚</span>
                <span className="compact-about__feature-text">{t('about.feature1')}</span>
              </div>
              <div className="compact-about__feature">
                <span className="compact-about__feature-icon">🎯</span>
                <span className="compact-about__feature-text">{t('about.feature2')}</span>
              </div>
              <div className="compact-about__feature">
                <span className="compact-about__feature-icon">📊</span>
                <span className="compact-about__feature-text">{t('about.feature3')}</span>
              </div>
              <div className="compact-about__feature">
                <span className="compact-about__feature-icon">🌐</span>
                <span className="compact-about__feature-text">{t('about.feature4')}</span>
              </div>
            </div>
          </div>

          {/* Developer */}
          <div className="compact-about__section">
            <h3 className="compact-about__section-title">
              <Heart className="compact-about__section-icon compact-about__section-icon--heart" />
              {t('about.developer')}
            </h3>
            <div className="compact-about__developer">
              <div className="compact-about__developer-info">
                <span className="compact-about__developer-name">👨‍💻 Genil Suárez</span>
                <span className="compact-about__developer-title">{t('about.developerTitle')}</span>
              </div>
              <a
                href="https://github.com/genilsuarez"
                target="_blank"
                rel="noopener noreferrer"
                className="compact-about__developer-link"
                aria-label="GitHub Profile"
              >
                <Github className="compact-about__link-icon" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="compact-about__section">
            <div className="compact-about__tech-stack">
              <button
                className="compact-about__tech-item compact-about__tech-item--clickable"
                onClick={() => setShowScreenInfo(true)}
                title="Click to view screen information"
              >
                React
              </button>
              <span className="compact-about__tech-item">TypeScript</span>
              <span className="compact-about__tech-item">Pure CSS</span>
              <span className="compact-about__tech-item">Zustand</span>
              <span className="compact-about__tech-item">Vite</span>
            </div>
          </div>

          {/* Actions */}
          <div className="modal__actions modal__actions--single">
            <button onClick={handleClose} className="modal__btn modal__btn--primary">
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>

      {/* Screen Info Modal */}
      {showScreenInfo && (
        <div className="screen-info-modal">
          <div className="screen-info-modal__container">
            <div className="screen-info-modal__header">
              <div className="screen-info-modal__title-section">
                <Monitor className="screen-info-modal__icon" />
                <h3 className="screen-info-modal__title">Screen Information</h3>
              </div>
              <button
                onClick={() => setShowScreenInfo(false)}
                className="screen-info-modal__close-btn"
                aria-label="Close screen info"
              >
                <X className="screen-info-modal__close-icon" />
              </button>
            </div>
            <div className="screen-info-modal__content">
              {(() => {
                const screenInfo = getScreenInfo();
                return (
                  <div className="screen-info-modal__grid">
                    <div className="screen-info-modal__item">
                      <span className="screen-info-modal__label">Resolution:</span>
                      <span className="screen-info-modal__value">{screenInfo.resolution}</span>
                    </div>
                    <div className="screen-info-modal__item">
                      <span className="screen-info-modal__label">Viewport:</span>
                      <span className="screen-info-modal__value">{screenInfo.viewport}</span>
                    </div>
                    <div className="screen-info-modal__item">
                      <span className="screen-info-modal__label">Pixel Ratio:</span>
                      <span className="screen-info-modal__value">
                        {screenInfo.devicePixelRatio}x
                      </span>
                    </div>
                    <div className="screen-info-modal__item">
                      <span className="screen-info-modal__label">Color Depth:</span>
                      <span className="screen-info-modal__value">{screenInfo.colorDepth} bits</span>
                    </div>
                    <div className="screen-info-modal__item">
                      <span className="screen-info-modal__label">Orientation:</span>
                      <span className="screen-info-modal__value">{screenInfo.orientation}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
