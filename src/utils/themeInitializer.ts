/**
 * Theme Initializer - Detects and applies system theme preference
 * This utility ensures the correct theme is applied before React renders
 * to prevent FOUC (Flash of Unstyled Content) and mixed theme states
 */

import {
  THEME_COLORS,
  THEME_CLASSES,
  THEME_CSS_VARS,
  THEME_SELECTORS,
  type ThemeMode,
} from './themeConstants';
import { isMobileDevice, applyMobileTheme, initializeMobileTheme } from './mobileThemeFix';

export interface ThemeState {
  theme: ThemeMode;
  isSystemPreference: boolean;
}

/**
 * Detects the user's system theme preference
 */
export function detectSystemTheme(): ThemeMode {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'light';
  }

  // Check for system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Gets the stored theme preference or falls back to system preference
 */
export function getInitialTheme(): ThemeState {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return { theme: 'light', isSystemPreference: false };
  }

  try {
    // Try to get stored preference from localStorage
    const storedSettings = localStorage.getItem('settings-storage');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      if (parsed.state && parsed.state.theme) {
        return {
          theme: parsed.state.theme,
          isSystemPreference: false,
        };
      }
    }
  } catch (error) {
    console.warn('Failed to parse stored theme preference:', error);
  }

  // Fall back to system preference
  const systemTheme = detectSystemTheme();
  return {
    theme: systemTheme,
    isSystemPreference: true,
  };
}

/**
 * Applies theme to DOM immediately (before React renders)
 */
export function applyThemeToDOM(theme: ThemeMode): void {
  if (typeof document === 'undefined') {
    return;
  }

  const htmlElement = document.documentElement;

  // Apply theme classes
  if (theme === 'dark') {
    htmlElement.classList.add(THEME_CLASSES.dark);
    htmlElement.classList.remove(THEME_CLASSES.light);
  } else {
    htmlElement.classList.remove(THEME_CLASSES.dark);
    htmlElement.classList.add(THEME_CLASSES.light);
  }

  // Apply mobile-specific theme fixes if on mobile
  if (isMobileDevice()) {
    applyMobileTheme(theme);
  } else {
    // Force re-render of problematic elements for desktop
    forceThemeRerender(theme);
    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(theme);
  }
}

/**
 * Forces re-render of elements that might have cached styles
 */
function forceThemeRerender(theme: ThemeMode): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Force recalculation of CSS by temporarily changing a CSS custom property
  const root = document.documentElement;
  root.style.setProperty(THEME_CSS_VARS.themeForceUpdate, theme === 'dark' ? '1' : '0');

  // Use requestAnimationFrame to ensure the change is processed
  requestAnimationFrame(() => {
    // Clean up problematic inline styles that might persist
    const elementsWithInlineStyles = document.querySelectorAll(THEME_SELECTORS.inlineColorElements);
    elementsWithInlineStyles.forEach(element => {
      const htmlElement = element as HTMLElement;
      // Only remove color-related inline styles, preserve others
      const style = htmlElement.getAttribute('style');
      if (style) {
        const cleanedStyle = style
          .split(';')
          .filter(rule => {
            const trimmed = rule.trim();
            return (
              !trimmed.startsWith('color:') &&
              !trimmed.startsWith('stroke:') &&
              !trimmed.startsWith('fill:')
            );
          })
          .join(';');

        if (cleanedStyle !== style) {
          if (cleanedStyle.trim()) {
            htmlElement.setAttribute('style', cleanedStyle);
          } else {
            htmlElement.removeAttribute('style');
          }
        }
      }
    });

    // Force repaint by temporarily hiding and showing elements with problematic styles
    const problematicElements = document.querySelectorAll(THEME_SELECTORS.svgElements);
    problematicElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      const originalDisplay = htmlElement.style.display;
      htmlElement.style.display = 'none';
      // Force reflow
      htmlElement.offsetHeight;
      htmlElement.style.display = originalDisplay;
    });

    // Add theme-component class to elements that need it
    const themeComponents = document.querySelectorAll(THEME_SELECTORS.themeComponents);
    themeComponents.forEach(element => {
      element.classList.add(THEME_CLASSES.themeComponent);
    });
  });
}

/**
 * Updates the meta theme-color tag for mobile browsers
 */
export function updateMetaThemeColor(theme: ThemeMode): void {
  if (typeof document === 'undefined') {
    return;
  }

  const metaThemeColor = document.querySelector(THEME_SELECTORS.metaThemeColor);
  if (metaThemeColor) {
    // Use design system color tokens
    const color = THEME_COLORS[theme].metaThemeColor;
    metaThemeColor.setAttribute('content', color);
  }
}

/**
 * Sets up system theme change listener
 */
export function setupSystemThemeListener(callback: (theme: ThemeMode) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // Return empty cleanup function
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent) => {
    const newTheme: ThemeMode = e.matches ? 'dark' : 'light';
    callback(newTheme);
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }

  // Legacy browsers
  if (mediaQuery.addListener) {
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }

  return () => {}; // Return empty cleanup function
}

/**
 * Initialize theme immediately when this module is imported
 * This ensures theme is applied before React renders
 */
export function initializeTheme(): ThemeState {
  const themeState = getInitialTheme();
  applyThemeToDOM(themeState.theme);

  // Initialize mobile theme system if on mobile
  if (isMobileDevice()) {
    initializeMobileTheme();
  }

  return themeState;
}
