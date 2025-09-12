import React from 'react';

interface NavigationButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  onClick,
  children,
  className = '',
  title,
}) => {
  return (
    <button onClick={onClick} className={`nav-btn nav-btn--back ${className}`} title={title}>
      <svg
        className="nav-btn__icon nav-btn__icon--arrow"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span className="nav-btn__text">{children}</span>
    </button>
  );
};

export default NavigationButton;
