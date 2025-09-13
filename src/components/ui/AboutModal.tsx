import React from 'react';
import { X, Github, Heart } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
import { FluentFlowLogo } from './FluentFlowLogo';
import '../../styles/components/about-modal.css';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);

  if (!isOpen) return null;

  return (
    <div className="about-modal">
      <div className="about-modal__container">
        <div className="about-modal__content">
          <div className="about-modal__header">
            <div className="about-modal__title-section">
              <div className="about-modal__icon-container">
                <FluentFlowLogo size="sm" />
              </div>
              <div>
                <h2 className="about-modal__title">{t('about.title', 'About FluentFlow')}</h2>
                <p className="about-modal__subtitle">
                  {t('about.subtitle', 'Advanced English Learning Platform')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="about-modal__close-btn"
              aria-label={t('common.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="about-modal__body">
            {/* Description Section */}
            <div className="about-modal__section about-modal__section--description">
              <h3 className="about-modal__section-title about-modal__section-title--description">
                <span className="about-modal__section-icon">📖</span>
                {t('about.description', 'Description')}
              </h3>

              <div className="about-modal__description">
                <p className="about-modal__description-text">
                  {t(
                    'about.descriptionText',
                    'FluentFlow is an advanced English learning platform designed to help you improve your vocabulary and comprehension through interactive exercises.'
                  )}
                </p>

                <div className="about-modal__features">
                  <ul className="about-modal__features-list">
                    <li className="about-modal__feature-item">
                      <span className="about-modal__feature-icon">📚</span>
                      {t('about.feature1', 'Interactive flashcards and quizzes')}
                    </li>
                    <li className="about-modal__feature-item">
                      <span className="about-modal__feature-icon">🎯</span>
                      {t('about.feature2', 'Adaptive difficulty levels (A1-C2)')}
                    </li>
                    <li className="about-modal__feature-item">
                      <span className="about-modal__feature-icon">📊</span>
                      {t('about.feature3', 'Progress tracking and analytics')}
                    </li>
                    <li className="about-modal__feature-item">
                      <span className="about-modal__feature-icon">🌐</span>
                      {t('about.feature4', 'Multilingual interface (English/Spanish)')}
                    </li>
                    <li className="about-modal__feature-item">
                      <span className="about-modal__feature-icon">🎮</span>
                      {t('about.feature5', 'Multiple learning modes and games')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Developer & Acknowledgments Combined Section */}
            <div className="about-modal__section about-modal__section--developer">
              <div className="about-modal__developer-compact">
                <div className="about-modal__developer-info-compact">
                  <span className="about-modal__developer-name-compact">👨‍💻 Genil Suárez</span>
                  <span className="about-modal__developer-title-compact">
                    {t('about.developerTitle', 'Cloud Expert passionate about GenAI')}
                  </span>
                  <a
                    href="https://github.com/genilsuarez"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-modal__developer-link-compact"
                    aria-label="GitHub Profile"
                  >
                    <Github className="about-modal__link-icon-compact" />
                    <span>GitHub</span>
                  </a>
                </div>

                <div className="about-modal__acknowledgments-compact">
                  <p className="about-modal__acknowledgments-text-compact">
                    <Heart className="about-modal__heart-icon-compact" />
                    {t(
                      'about.acknowledgementsText',
                      'Built with passion for language learning and education. Special thanks to the open-source community for the amazing tools and libraries that made this project possible.'
                    )}
                  </p>
                  <p className="about-modal__build-date">
                    <span className="about-modal__build-icon">🔨</span>
                    {language === 'es'
                      ? `${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
                      : `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="about-modal__actions">
            <button
              onClick={onClose}
              className="about-modal__btn about-modal__btn--close"
              aria-label={t('common.close')}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
