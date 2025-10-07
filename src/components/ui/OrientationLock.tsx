import React from 'react';
import { RotateCcw } from 'lucide-react';
import '../../styles/components/orientation-lock.css';

interface OrientationLockProps {
  /** Optional custom message for the orientation lock */
  message?: string;
  /** Optional custom subtitle */
  subtitle?: string;
}

/**
 * OrientationLock Component
 * 
 * Displays a user-friendly message when the device is in landscape orientation
 * on mobile devices, encouraging users to rotate to portrait mode for optimal
 * learning experience.
 * 
 * Features:
 * - Only shows on mobile devices in landscape mode
 * - Elegant design consistent with app theme
 * - Animated rotation icon
 * - Theme-aware styling (light/dark mode)
 * - Accessibility compliant
 */
export const OrientationLock: React.FC<OrientationLockProps> = ({
  message = "Para una mejor experiencia de aprendizaje",
  subtitle = "Por favor gira tu dispositivo a modo vertical"
}) => {
  return (
    <div className="orientation-lock">
      <div className="orientation-lock__container">
        <div className="orientation-lock__icon-wrapper">
          <RotateCcw 
            className="orientation-lock__icon" 
            size={48}
            aria-hidden="true"
          />
        </div>
        
        <div className="orientation-lock__content">
          <h2 className="orientation-lock__title">
            {message}
          </h2>
          <p className="orientation-lock__subtitle">
            {subtitle}
          </p>
          <p className="orientation-lock__explanation">
            Nuestros ejercicios están optimizados para pantalla vertical
          </p>
        </div>
      </div>
    </div>
  );
};