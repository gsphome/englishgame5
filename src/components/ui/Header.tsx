import React, { useState, useEffect } from 'react';
import { User, Settings, Menu, BarChart3 } from 'lucide-react';
import '../../styles/components/header.css';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
// import { toast } from '../../stores/toastStore';

import { UserProfileForm } from './UserProfileForm';
import { AdvancedSettingsModal } from './AdvancedSettingsModal';
import { AboutModal } from './AboutModal';
import { ScoreDisplay } from './ScoreDisplay';
import { FluentFlowLogo } from './FluentFlowLogo';

interface HeaderProps {
  onMenuToggle?: () => void;
  onDashboardToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDashboardToggle }) => {
  const { setCurrentView, currentView } = useAppStore();
  const { user } = useUserStore();
  const { theme } = useSettingsStore();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);

  // Determine header layout mode
  const isInGame = currentView !== 'menu';
  const headerMode = isInGame ? 'learning' : 'menu';

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleMenuToggle = () => {
    setShowSideMenu(!showSideMenu);
  };

  const handleGoToMenu = () => {
    setCurrentView('menu');
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
            className="header-redesigned__menu-btn header-redesigned__menu-btn--tertiary"
            title="Abrir menú de navegación y configuración"
            aria-label="Abrir menú de navegación y configuración"
            aria-expanded={showSideMenu}
            aria-controls="navigation-menu"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">
              {showSideMenu ? 'Cerrar menú' : 'Abrir menú'}
            </span>
          </button>
          <div className="header-redesigned__brand">
            <FluentFlowLogo size="md" className="header-redesigned__logo" />
            <h1 className="header-redesigned__title">FluentFlow</h1>
          </div>
        </div>

        {/* Center Section: Score Display */}
        <div className="header-redesigned__center">
          <ScoreDisplay />
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
                <div className="header-redesigned__avatar">
                  <User className="w-4 h-4" />
                </div>
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
                <User className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Login</span>
              </button>
            </div>
          )}

          {/* Quick Actions - Only Essential Controls */}
          <div className="header-redesigned__quick-actions">
            <button
              onClick={onDashboardToggle}
              className="header-redesigned__control-btn header-redesigned__control-btn--primary"
              title="Dashboard & Statistics"
              aria-label="Open dashboard and statistics"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Stats</span>
            </button>
          </div>
        </div>
      </div>

      {showProfileForm && (
        <UserProfileForm onClose={() => setShowProfileForm(false)} />
      )}

      <AdvancedSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
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
            onClick={(e) => e.stopPropagation()}
            role="navigation"
            aria-label="Main navigation and settings"
          >
            <div className="header-side-menu__header">
              <h2 className="header-side-menu__title">
                FluentFlow
              </h2>
              <p className="header-side-menu__subtitle">
                Navegación y Configuración
              </p>
            </div>
            
            <div className="header-side-menu__content">
              {/* Navigation Section */}
              <div className="header-side-menu__section">
                <h3 className="header-side-menu__section-title">
                  📱 Navegación Principal
                </h3>
                <button
                  onClick={handleGoToMenu}
                  className="header-side-menu__item"
                  aria-label="Ir al menú principal de módulos"
                >
                  <Menu className="header-side-menu__icon" aria-hidden="true" />
                  <span className="header-side-menu__text">Menú Principal</span>
                </button>
                <button
                  onClick={() => { onDashboardToggle?.(); setShowSideMenu(false); }}
                  className="header-side-menu__item"
                  aria-label="Ver dashboard y estadísticas"
                >
                  <BarChart3 className="header-side-menu__icon" aria-hidden="true" />
                  <span className="header-side-menu__text">Dashboard</span>
                </button>
              </div>

              {/* Settings Section */}
              <div className="header-side-menu__section">
                <h3 className="header-side-menu__section-title">
                  ⚙️ Configuración
                </h3>
                <button
                  onClick={() => { setShowSettings(true); setShowSideMenu(false); }}
                  className="header-side-menu__item"
                  aria-label="Abrir configuración avanzada"
                >
                  <Settings className="header-side-menu__icon" aria-hidden="true" />
                  <span className="header-side-menu__text">Configuración Avanzada</span>
                </button>
                <button
                  className="header-side-menu__item"
                  onClick={() => { setShowAbout(true); setShowSideMenu(false); }}
                  aria-label="Información sobre la aplicación"
                >
                  <User className="header-side-menu__icon" aria-hidden="true" />
                  <span className="header-side-menu__text">Acerca de FluentFlow</span>
                </button>
              </div>

              {/* User Profile Section */}
              {user && (
                <div className="header-side-menu__section">
                  <h3 className="header-side-menu__section-title">
                    👤 Perfil de Usuario
                  </h3>
                  <button
                    onClick={() => { setShowProfileForm(true); setShowSideMenu(false); }}
                    className="header-side-menu__item"
                    aria-label="Editar perfil de usuario"
                  >
                    <User className="header-side-menu__icon" aria-hidden="true" />
                    <span className="header-side-menu__text">Editar Perfil</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};