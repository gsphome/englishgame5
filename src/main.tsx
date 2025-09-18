import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeTheme } from './utils/themeInitializer';

try {
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
  document.body.innerHTML =
    '<div style="padding: 20px; color: red;">Failed to load application. Please refresh the page.</div>';
}
