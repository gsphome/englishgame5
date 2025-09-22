import React, { useState } from 'react';
import { BarChart3, Route, Settings, Info, User } from 'lucide-react';
import { CompactProgressDashboard } from './CompactProgressDashboard';
import { CompactLearningPath } from './CompactLearningPath';
import { CompactAdvancedSettings } from './CompactAdvancedSettings';
import { CompactAbout } from './CompactAbout';
import { CompactProfile } from './CompactProfile';

/**
 * Demo component to showcase the new compact modals
 * This component can be used for testing or as a reference
 */
export const CompactModalsDemo: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modals = [
    {
      id: 'dashboard',
      title: 'Dashboard de Progreso',
      description: 'Vista compacta del progreso de aprendizaje',
      icon: BarChart3,
      component: CompactProgressDashboard,
    },
    {
      id: 'learning-path',
      title: 'Ruta de Aprendizaje',
      description: 'Progreso por niveles y módulos disponibles',
      icon: Route,
      component: CompactLearningPath,
    },
    {
      id: 'settings',
      title: 'Configuración Avanzada',
      description: 'Ajustes de tema, idioma y juegos',
      icon: Settings,
      component: CompactAdvancedSettings,
    },
    {
      id: 'about',
      title: 'Acerca de',
      description: 'Información de la aplicación y desarrollador',
      icon: Info,
      component: CompactAbout,
    },
    {
      id: 'profile',
      title: 'Perfil de Usuario',
      description: 'Configuración personal y preferencias',
      icon: User,
      component: CompactProfile,
    },
  ];

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="compact-modals-demo">
      <div className="compact-modals-demo__container">
        <h2 className="compact-modals-demo__title">Modales Compactos</h2>
        <p className="compact-modals-demo__subtitle">
          Versiones optimizadas y más pequeñas de los modales principales
        </p>

        <div className="compact-modals-demo__grid">
          {modals.map(modal => {
            const IconComponent = modal.icon;
            return (
              <button
                key={modal.id}
                onClick={() => openModal(modal.id)}
                className="compact-modals-demo__card"
              >
                <div className="compact-modals-demo__card-icon">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="compact-modals-demo__card-content">
                  <h3 className="compact-modals-demo__card-title">{modal.title}</h3>
                  <p className="compact-modals-demo__card-description">{modal.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Render active modal */}
        {modals.map(modal => {
          const ModalComponent = modal.component;
          return (
            <ModalComponent key={modal.id} isOpen={activeModal === modal.id} onClose={closeModal} />
          );
        })}
      </div>
    </div>
  );
};

// CSS styles for the demo component
const demoStyles = `
.compact-modals-demo {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900 p-8;
}

.compact-modals-demo__container {
  @apply max-w-4xl mx-auto;
}

.compact-modals-demo__title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
}

.compact-modals-demo__subtitle {
  @apply text-gray-600 dark:text-gray-400 mb-8;
}

.compact-modals-demo__grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.compact-modals-demo__card {
  @apply bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 text-left;
}

.compact-modals-demo__card:hover {
  @apply transform -translate-y-1;
}

.compact-modals-demo__card-icon {
  @apply w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400;
}

.compact-modals-demo__card-content {
  @apply space-y-2;
}

.compact-modals-demo__card-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.compact-modals-demo__card-description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('compact-modals-demo-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'compact-modals-demo-styles';
  styleElement.textContent = demoStyles;
  document.head.appendChild(styleElement);
}
