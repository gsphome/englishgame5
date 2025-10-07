import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeTheme } from './utils/themeInitializer';
import './utils/safariDetection';

try {
  // Debug: Check if React is properly loaded
  if (!React || !React.createContext) {
    throw new Error('React is not properly loaded - createContext is undefined');
  }

  // Ensure React is available globally (fix for createContext issues)
  if (typeof window !== 'undefined') {
    (window as any).React = React;
  }

  // Initialize theme before React renders to prevent FOUC
  initializeTheme();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  // Use basic console.error for critical initialization errors
  console.error('Failed to initialize React app:', error);

  // More detailed error information
  if (error instanceof Error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      reactAvailable: !!React,
      createContextAvailable: !!(React && React.createContext),
    });
  }

  document.body.innerHTML =
    '<div style="padding: 20px; color: red;">Failed to load application. Please refresh the page.<br><small>Check console for details.</small></div>';
}
