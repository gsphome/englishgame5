/**
 * Mobile Theme Fix - Aggressive theme switching for mobile browsers
 * Addresses specific mobile browser behaviors that cause theme mixing
 */

import { THEME_CLASSES, THEME_COLORS, type ThemeMode } from './themeConstants';

/**
 * Detects if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  );
}

/**
 * Forces a complete style recalculation on mobile devices
 */
export function forceMobileStyleRecalculation(): void {
  if (typeof document === 'undefined') return;

  // Force reflow by temporarily changing display
  const body = document.body;
  const originalDisplay = body.style.display;

  body.style.display = 'none';
  // Force reflow
  body.offsetHeight;
  body.style.display = originalDisplay || '';
}

/**
 * Removes all cached styles that might interfere with theme switching
 */
export function clearMobileCachedStyles(): void {
  if (typeof document === 'undefined') return;

  // Remove all style attributes from problematic elements
  const elementsWithStyles = document.querySelectorAll('[style]');
  elementsWithStyles.forEach(element => {
    const htmlElement = element as HTMLElement;
    const style = htmlElement.getAttribute('style');

    if (style) {
      // Remove only color-related styles, preserve layout styles
      const cleanedStyle = style
        .split(';')
        .filter(rule => {
          const trimmed = rule.trim().toLowerCase();
          return (
            !trimmed.startsWith('color:') &&
            !trimmed.startsWith('background-color:') &&
            !trimmed.startsWith('stroke:') &&
            !trimmed.startsWith('fill:') &&
            !trimmed.startsWith('border-color:')
          );
        })
        .join(';');

      if (cleanedStyle.trim()) {
        htmlElement.setAttribute('style', cleanedStyle);
      } else {
        htmlElement.removeAttribute('style');
      }
    }
  });
}

/**
 * Applies theme with mobile-specific optimizations
 */
export function applyMobileTheme(theme: ThemeMode): void {
  if (!isMobileDevice()) return;

  const htmlElement = document.documentElement;

  // Step 1: Clear existing theme classes
  htmlElement.classList.remove(THEME_CLASSES.light, THEME_CLASSES.dark);

  // Step 2: Force style recalculation
  forceMobileStyleRecalculation();

  // Step 3: Clear cached styles
  clearMobileCachedStyles();

  // Step 4: Apply new theme class
  htmlElement.classList.add(theme === 'dark' ? THEME_CLASSES.dark : THEME_CLASSES.light);

  // Step 5: Force another recalculation
  requestAnimationFrame(() => {
    forceMobileStyleRecalculation();

    // Step 6: Update viewport meta tag for mobile browsers
    updateMobileViewportMeta(theme);

    // Step 7: Trigger CSS custom property change
    htmlElement.style.setProperty('--mobile-theme-update', Date.now().toString());
  });
}

/**
 * Updates mobile-specific meta tags
 */
export function updateMobileViewportMeta(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;

  // Update theme-color meta tag
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }

  const color = THEME_COLORS[theme].metaThemeColor;
  metaThemeColor.setAttribute('content', color);

  // Update status bar style for iOS
  let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!metaStatusBar) {
    metaStatusBar = document.createElement('meta');
    metaStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
    document.head.appendChild(metaStatusBar);
  }

  metaStatusBar.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');

  // Update color scheme meta tag
  let metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (!metaColorScheme) {
    metaColorScheme = document.createElement('meta');
    metaColorScheme.setAttribute('name', 'color-scheme');
    document.head.appendChild(metaColorScheme);
  }

  metaColorScheme.setAttribute('content', theme === 'dark' ? 'dark' : 'light');
}

/**
 * Sets up mobile-specific theme change handlers
 */
export function setupMobileThemeHandlers(): void {
  if (!isMobileDevice()) return;

  // Listen for orientation changes that might affect theme
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const currentTheme = document.documentElement.classList.contains(THEME_CLASSES.dark)
        ? 'dark'
        : 'light';
      applyMobileTheme(currentTheme as ThemeMode);
    }, 100);
  });

  // Listen for resize events
  window.addEventListener('resize', () => {
    const currentTheme = document.documentElement.classList.contains(THEME_CLASSES.dark)
      ? 'dark'
      : 'light';
    setTimeout(() => applyMobileTheme(currentTheme as ThemeMode), 50);
  });

  // Listen for visibility changes (app switching)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const currentTheme = document.documentElement.classList.contains(THEME_CLASSES.dark)
        ? 'dark'
        : 'light';
      setTimeout(() => applyMobileTheme(currentTheme as ThemeMode), 100);
    }
  });
}

/**
 * Initializes mobile theme system
 */
export function initializeMobileTheme(): void {
  if (!isMobileDevice()) return;

  // Set up handlers
  setupMobileThemeHandlers();

  // Apply initial theme
  const currentTheme = document.documentElement.classList.contains(THEME_CLASSES.dark)
    ? 'dark'
    : 'light';
  applyMobileTheme(currentTheme as ThemeMode);
}
