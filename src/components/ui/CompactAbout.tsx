import React from 'react';
import { X, Heart, Info } from 'lucide-react';
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

  // Handle escape key to close modal
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="compact-about">
      <div className="compact-about__container">
        <div className="compact-about__header">
          <div className="compact-about__title-section">
            <FluentFlowLogo size="sm" />
            <div>
              <h2 className="compact-about__title">FluentFlow</h2>
              <p className="compact-about__subtitle">
                {t('about.subtitle')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal__close-btn" aria-label={t('common.close')}>
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
                <span className="compact-about__info-label">
                  {t('about.platform')}
                </span>
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
                <span className="compact-about__feature-text">
                  {t('about.feature1')}
                </span>
              </div>
              <div className="compact-about__feature">
                <span className="compact-about__feature-icon">🎯</span>
                <span className="compact-about__feature-text">
                  {t('about.feature2')}
                </span>
              </div>
              <div className="compact-about__feature">
                <span className="compact-about__feature-icon">📊</span>
                <span className="compact-about__feature-text">
                  {t('about.feature3')}
                </span>
              </div>
              <div className="compact-about__feature">
                <span className="compact-about__feature-icon">🌐</span>
                <span className="compact-about__feature-text">
                  {t('about.feature4')}
                </span>
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
                <span className="compact-about__developer-title">
                  {t('about.developerTitle')}
                </span>
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
              <span className="compact-about__tech-item">React</span>
              <span className="compact-about__tech-item">TypeScript</span>
              <span className="compact-about__tech-item">Pure CSS</span>
              <span className="compact-about__tech-item">Zustand</span>
              <span className="compact-about__tech-item">Vite</span>
            </div>
          </div>

          {/* Actions */}
          <div className="modal__actions modal__actions--single">
            <button onClick={onClose} className="modal__btn modal__btn--primary">
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
