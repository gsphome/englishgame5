import React, { useState } from 'react';
import { User, Settings, Menu, BarChart3, BookOpen, LogOut } from 'lucide-react';
import '../../styles/components/header.css';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useMenuNavigation } from '../../hooks/useMenuNavigation';
import { useTranslation } from '../../utils/i18n';
import { useEscapeKey } from '../../hooks/useEscapeKey';
// import { toast } from '../../stores/toastStore';

// Compact modals - optimized versions
import { CompactProfile } from './CompactProfile';
import { CompactAdvancedSettings } from './CompactAdvancedSettings';
import { CompactAbout } from './CompactAbout';
import { CompactProgressDashboard } from './CompactProgressDashboard';
import { CompactLearningPath } from './CompactLearningPath';
import { ScoreDisplay } from './ScoreDisplay';
import { FluentFlowLogo } from './FluentFlowLogo';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { currentView } = useAppStore();
  const { user } = useUserStore();
  const { developmentMode, language } = useSettingsStore();
  const { returnToMenu } = useMenuNavigation();
  const { t } = useTranslation(language);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [showModuleProgression, setShowModuleProgression] = useState(false);

  // Determine header layout mode
  const isInGame = currentView !== 'menu';
  const headerMode = isInGame ? 'learning' : 'menu';

  // Theme is now handled by themeInitializer and settingsStore
  // This effect is kept for consistency but theme should already be applied

  // Handle escape key for hamburger menu
  useEscapeKey(showSideMenu, () => setShowSideMenu(false));

  const handleMenuToggle = () => {
    setShowSideMenu(!showSideMenu);
  };

  const handleGoToMenu = () => {
    returnToMenu();
    setShowSideMenu(false);
  };

  // const handleSettings = () => {
  //   setShowSettings(!showSettings);
  //   if (!showSettings) {
  //     toast.info('Configuración', 'Panel de configuración abierto');
  //   }
  // };

  return (
    <header className={`header-redesigned header-redesigned--${headerMode}`}>
      <div className={`header-redesigned__container header-redesigned__container--${headerMode}`}>
        {/* Left Section: Menu + Brand */}
        <div className="header-redesigned__left">
          <button
            onClick={handleMenuToggle}
            className="header-redesigned__menu-btn header-redesigned__menu-btn--primary"
            title="Abrir menú de navegación y configuración"
            aria-label="Abrir menú de navegación y configuración"
            aria-expanded={showSideMenu}
            aria-controls="navigation-menu"
          >
            <Menu className="header-redesigned__menu-icon" />
            <span className="sr-only">{showSideMenu ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
          <div className="header-redesigned__brand">
            <FluentFlowLogo size="md" className="header-redesigned__logo" />
            <h1 className="header-redesigned__title">FluentFlow</h1>
          </div>
        </div>

        {/* Center Section: Score Display */}
        <div className="header-redesigned__center">
          <ScoreDisplay />
          {developmentMode && (
            <div className="header-redesigned__dev-indicator" title="Development Mode Active">
              <span className="header-redesigned__dev-icon">🔧</span>
              <span className="header-redesigned__dev-text">DEV</span>
            </div>
          )}
        </div>

        {/* Right Section: Primary Actions Only */}
        <div className="header-redesigned__right">
          {/* User Profile Section - Primary Action */}
          {user ? (
            <div className="header-redesigned__user-section">
              <button
                onClick={() => setShowProfileForm(true)}
                className="header-redesigned__user-btn header-redesigned__user-btn--primary"
                title={`${user.name} - Profile`}
                aria-label={`User profile: ${user.name}. Click to open profile`}
              >
                <User className="header-redesigned__user-icon" />
                <div className="header-redesigned__user-info">
                  <span className="header-redesigned__username">{user.name}</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="header-redesigned__user-section">
              <button
                onClick={() => setShowProfileForm(true)}
                className="header-redesigned__login-btn header-redesigned__login-btn--primary"
                aria-label="Login to your account"
              >
                <User className="header-redesigned__user-icon" />
                <span className="header-redesigned__login-text">Login</span>
              </button>
            </div>
          )}

          {/* Quick Actions - Only Essential Controls */}
          <div className="header-redesigned__quick-actions">
            {/* Progress dashboard moved to hamburger menu for better UX */}
          </div>
        </div>
      </div>

      {/* Compact Modals - Optimized versions */}
      {showProfileForm && (
        <CompactProfile isOpen={showProfileForm} onClose={() => setShowProfileForm(false)} />
      )}

      <CompactAdvancedSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <CompactAbout isOpen={showAbout} onClose={() => setShowAbout(false)} />

      <CompactProgressDashboard
        isOpen={showProgressDashboard}
        onClose={() => setShowProgressDashboard(false)}
      />

      <CompactLearningPath
        isOpen={showModuleProgression}
        onClose={() => setShowModuleProgression(false)}
      />

      {showSideMenu && (
        <div
          className="header-side-menu-overlay"
          onClick={() => setShowSideMenu(false)}
          role="presentation"
        >
          <nav
            id="navigation-menu"
            className="header-side-menu"
            onClick={e => e.stopPropagation()}
            role="navigation"
            aria-label="Main navigation and settings"
          >
            <div className="header-side-menu__header">
              <h2 className="header-side-menu__title">FluentFlow</h2>
              <p className="header-side-menu__subtitle">Navegación y Configuración</p>
            </div>

            <div className="header-side-menu__content">
              {/* Navigation Section */}
              <div className="header-side-menu__section">
                <h3 className="header-side-menu__section-title">📱 Navegación Principal</h3>
                <button
                  onClick={handleGoToMenu}
                  className="header-side-menu__item"
                  aria-label="Ir al menú principal de módulos"
                >
                  <Menu className="header-side-menu__icon" aria-hidden="true" />
                  <span className="header-side-menu__text">{t('navigation.mainMenu')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowProgressDashboard(true);
                    setShowSideMenu(false);
                  }}
                  className="header-side-menu__item"
                  aria-label="Ver dashboard completo de progreso y estadísticas"
                >
                  <BarChart3 className="header-side-menu__icon" aria-hidden="true" />
                  <span className="header-side-menu__text">{t('modals.progressDashboard')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowModuleProgression(true);
                    setShowSideMenu(false);
                  }}
                  className="header-side-menu__item"
                  aria-label="Ver progresión de módulos y ruta de aprendizaje"
                >
                  <BookOpen className="header-side-menu__icon" aria-hidden="true" />
                  <span className="header-side-menu__text">{t('modals.learningPath')}</span>
                </button>
              </div>

              {/* Settings Section */}
              <div className="header-side-menu__section">
                <h3 className="header-side-menu__section-title">
                  ⚙️ {t('navigation.configuration')}
                </h3>
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowSideMenu(false);
                  }}
                  className="header-side-menu__item"
                  aria-label={t('modals.advancedSettings', 'Advanced Settings')}
                >
                  <Settings className="header-side-menu__icon" aria-hidden="true" />
                  <span className="header-side-menu__text">{t('modals.advancedSettings')}</span>
                </button>
                <button
                  className="header-side-menu__item"
                  onClick={() => {
                    setShowAbout(true);
                    setShowSideMenu(false);
                  }}
                  aria-label="Información sobre la aplicación"
                >
                  <User className="header-side-menu__icon" aria-hidden="true" />
                  <span className="header-side-menu__text">{t('modals.aboutFluentFlow')}</span>
                </button>
              </div>

              {/* User Profile Section - Always visible for consistency */}
              <div className="header-side-menu__section">
                <h3 className="header-side-menu__section-title">
                  👤 {user ? t('modals.userProfile') : t('auth.userAccount', 'User Account')}
                </h3>
                
                {user ? (
                  // Logged in user options
                  <>
                    <button
                      onClick={() => {
                        setShowProfileForm(true);
                        setShowSideMenu(false);
                      }}
                      className="header-side-menu__item"
                      aria-label="Editar perfil de usuario"
                    >
                      <User className="header-side-menu__icon" aria-hidden="true" />
                      <span className="header-side-menu__text">{t('modals.editProfile')}</span>
                    </button>

                    <button
                      onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }}
                      className="header-side-menu__item header-side-menu__item--logout"
                      aria-label={t('auth.logout', 'Logout')}
                    >
                      <LogOut className="header-side-menu__icon" aria-hidden="true" />
                      <span className="header-side-menu__text">{t('auth.logout', 'Logout')}</span>
                    </button>
                  </>
                ) : (
                  // Not logged in - show login option
                  <button
                    onClick={() => {
                      setShowProfileForm(true);
                      setShowSideMenu(false);
                    }}
                    className="header-side-menu__item header-side-menu__item--login"
                    aria-label={t('auth.login', 'Login to your account')}
                  >
                    <User className="header-side-menu__icon" aria-hidden="true" />
                    <span className="header-side-menu__text">{t('auth.login', 'Login')}</span>
                  </button>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
