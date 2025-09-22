/**
 * Mobile Theme Fix - Aggressive theme switching for mobile browsers
 * Addresses specific mobile browser behaviors that cause theme mixing
 * Updated for testing build:full workflow with deployment validation
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
 * Applies theme with mobile-specific optimizations and Safari override
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

  // Step 4: Apply new theme class with explicit light class for Safari
  if (theme === 'dark') {
    htmlElement.classList.add(THEME_CLASSES.dark);
    htmlElement.classList.remove('light');
  } else {
    htmlElement.classList.add(THEME_CLASSES.light, 'light');
    htmlElement.classList.remove(THEME_CLASSES.dark);
  }

  // Step 5: Safari-specific aggressive override
  if (isSafariMobile()) {
    // Force Safari to respect our theme choice with multiple methods
    htmlElement.style.setProperty('color-scheme', theme, 'important');
    htmlElement.style.setProperty('-webkit-color-scheme', theme, 'important');

    // Special handling for light mode (the problematic one)
    if (theme === 'light') {
      // Remove any dark mode artifacts
      htmlElement.classList.remove('dark');
      htmlElement.classList.add('light');

      // Force light mode immediately
      forceSafariLightMode();

      // Apply multiple times to ensure it sticks
      setTimeout(() => {
        forceSafariLightMode();
        // Force all elements to recalculate styles
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.colorScheme = 'light';
        });
      }, 50);

      setTimeout(() => {
        forceSafariLightMode();
      }, 200);
    } else {
      // Apply normal override for dark mode
      forceSafariThemeOverride();

      setTimeout(() => {
        forceSafariThemeOverride();
      }, 100);
    }
  }

  // Step 6: Force another recalculation
  requestAnimationFrame(() => {
    forceMobileStyleRecalculation();

    // Step 7: Update viewport meta tag for mobile browsers
    updateMobileViewportMeta(theme);

    // Step 8: Trigger CSS custom property change
    htmlElement.style.setProperty('--mobile-theme-update', Date.now().toString());

    // Step 9: Additional Safari fix - force repaint of problematic elements
    if (isSafariMobile()) {
      const problematicElements = document.querySelectorAll(
        '.header-redesigned, .compact-settings__container, .flashcard-component, .quiz-component'
      );
      problematicElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.transform = 'translateZ(0)';
        requestAnimationFrame(() => {
          htmlElement.style.transform = '';
        });
      });
    }
  });
}

/**
 * Detects if we're on Safari mobile specifically
 */
export function isSafariMobile(): boolean {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent;
  return (
    /Safari/.test(userAgent) &&
    /Mobile/.test(userAgent) &&
    !/Chrome/.test(userAgent) &&
    !/CriOS/.test(userAgent) &&
    !/FxiOS/.test(userAgent)
  );
}

/**
 * Specifically forces Safari to display light mode correctly
 */
export function forceSafariLightMode(): void {
  if (!isSafariMobile()) return;

  // Nuclear approach for light mode
  let safariLightOverride = document.getElementById('safari-light-override');
  if (!safariLightOverride) {
    safariLightOverride = document.createElement('style');
    safariLightOverride.id = 'safari-light-override';
    document.head.appendChild(safariLightOverride);
  }

  const lightOverrideCSS = `
    /* SAFARI LIGHT MODE NUCLEAR OVERRIDE */
    
    /* Force light mode regardless of system preference */
    html:not(.dark),
    html.light {
      background: #ffffff !important;
      color: #111827 !important;
      color-scheme: light !important;
      -webkit-color-scheme: light !important;
    }
    
    /* Override ALL elements to light mode */
    html:not(.dark) *,
    html.light * {
      background-color: transparent !important;
      color: #111827 !important;
      border-color: #e5e7eb !important;
      color-scheme: light !important;
      -webkit-color-scheme: light !important;
    }
    
    /* Specific component overrides for light mode */
    html:not(.dark) .header-redesigned,
    html:not(.dark) .main-menu,
    html:not(.dark) .module-card,
    html:not(.dark) .compact-settings__container,
    html:not(.dark) .compact-settings__header,
    html:not(.dark) .compact-settings__content,
    html:not(.dark) .compact-settings__footer,
    html:not(.dark) .flashcard-component,
    html:not(.dark) .quiz-component,
    html:not(.dark) .sorting-component,
    html:not(.dark) .matching-component,
    html.light .header-redesigned,
    html.light .main-menu,
    html.light .module-card,
    html.light .compact-settings__container,
    html.light .compact-settings__header,
    html.light .compact-settings__content,
    html.light .compact-settings__footer,
    html.light .flashcard-component,
    html.light .quiz-component,
    html.light .sorting-component,
    html.light .matching-component {
      background-color: #ffffff !important;
      background: #ffffff !important;
      color: #111827 !important;
      border-color: #e5e7eb !important;
    }
    
    /* Force light mode on text elements */
    html:not(.dark) h1, html:not(.dark) h2, html:not(.dark) h3, html:not(.dark) h4, html:not(.dark) h5, html:not(.dark) h6,
    html:not(.dark) p, html:not(.dark) span, html:not(.dark) div, html:not(.dark) button, html:not(.dark) input, html:not(.dark) select,
    html.light h1, html.light h2, html.light h3, html.light h4, html.light h5, html.light h6,
    html.light p, html.light span, html.light div, html.light button, html.light input, html.light select {
      color: #111827 !important;
    }
    
    /* Force light mode on SVG icons */
    html:not(.dark) svg,
    html:not(.dark) [data-lucide],
    html:not(.dark) .lucide,
    html.light svg,
    html.light [data-lucide],
    html.light .lucide {
      color: #111827 !important;
      stroke: #111827 !important;
      fill: none !important;
    }
    
    /* Override system dark mode media query */
    @media (prefers-color-scheme: dark) {
      html:not(.dark),
      html.light {
        background: #ffffff !important;
        color: #111827 !important;
        color-scheme: light !important;
        -webkit-color-scheme: light !important;
      }
      
      html:not(.dark) *,
      html.light * {
        color: #111827 !important;
        color-scheme: light !important;
        -webkit-color-scheme: light !important;
      }
    }
    
    /* Safari-specific webkit overrides for light mode */
    @supports (-webkit-touch-callout: none) {
      html:not(.dark),
      html.light {
        -webkit-appearance: none !important;
        -webkit-color-scheme: light !important;
        -webkit-text-fill-color: #111827 !important;
      }
      
      html:not(.dark) *,
      html.light * {
        -webkit-text-fill-color: #111827 !important;
        -webkit-color-scheme: light !important;
      }
    }
  `;

  safariLightOverride.textContent = lightOverrideCSS;
}

/**
 * Forces Safari to respect app theme over system preference
 */
export function forceSafariThemeOverride(): void {
  if (!isSafariMobile()) return;

  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';

  // If we're in light mode, apply the nuclear light mode fix
  if (currentTheme === 'light') {
    forceSafariLightMode();
  }

  // Step 1: Add aggressive CSS override
  let safariOverrideStyle = document.getElementById('safari-theme-override');
  if (!safariOverrideStyle) {
    safariOverrideStyle = document.createElement('style');
    safariOverrideStyle.id = 'safari-theme-override';
    document.head.appendChild(safariOverrideStyle);
  }

  // Step 2: Create CSS that overrides Safari's automatic dark mode based on current theme
  const lightBg = '#ffffff';
  const lightText = '#111827';
  const darkBg = '#111827';
  const darkText = '#ffffff';

  const overrideCSS = `
    /* Safari Mobile Theme Override - Ultra Aggressive Mode */
    
    /* Override system dark mode when app is in light mode */
    @media (prefers-color-scheme: dark) {
      html:not(.dark), 
      html.light {
        color-scheme: light !important;
        background-color: ${lightBg} !important;
        color: ${lightText} !important;
      }
      
      html:not(.dark) *,
      html.light * {
        color-scheme: light !important;
        background-color: inherit !important;
        color: inherit !important;
      }
      
      /* Force specific components */
      html:not(.dark) .header-redesigned,
      html:not(.dark) .compact-settings__container,
      html:not(.dark) .compact-settings__header,
      html:not(.dark) .compact-settings__content,
      html:not(.dark) .compact-settings__footer,
      html:not(.dark) .main-menu,
      html:not(.dark) .module-card,
      html:not(.dark) .flashcard-component,
      html:not(.dark) .quiz-component,
      html.light .header-redesigned,
      html.light .compact-settings__container,
      html.light .compact-settings__header,
      html.light .compact-settings__content,
      html.light .compact-settings__footer,
      html.light .main-menu,
      html.light .module-card,
      html.light .flashcard-component,
      html.light .quiz-component {
        background-color: ${lightBg} !important;
        color: ${lightText} !important;
        border-color: #e5e7eb !important;
      }
    }
    
    /* Override system light mode when app is in dark mode */
    @media (prefers-color-scheme: light) {
      html.dark {
        color-scheme: dark !important;
        background-color: ${darkBg} !important;
        color: ${darkText} !important;
      }
      
      html.dark * {
        color-scheme: dark !important;
        background-color: inherit !important;
        color: inherit !important;
      }
      
      /* Force specific components */
      html.dark .header-redesigned,
      html.dark .compact-settings__container,
      html.dark .compact-settings__header,
      html.dark .compact-settings__content,
      html.dark .compact-settings__footer,
      html.dark .main-menu,
      html.dark .module-card,
      html.dark .flashcard-component,
      html.dark .quiz-component {
        background-color: ${darkBg} !important;
        color: ${darkText} !important;
        border-color: #374151 !important;
      }
    }
    
    /* Universal overrides - regardless of system preference */
    html.light,
    html:not(.dark) {
      color-scheme: light !important;
      background-color: ${lightBg} !important;
      color: ${lightText} !important;
    }
    
    html.dark {
      color-scheme: dark !important;
      background-color: ${darkBg} !important;
      color: ${darkText} !important;
    }
    
    /* Safari-specific webkit overrides */
    @supports (-webkit-appearance: none) {
      html.light,
      html:not(.dark) {
        -webkit-color-scheme: light !important;
      }
      
      html.dark {
        -webkit-color-scheme: dark !important;
      }
    }
  `;

  safariOverrideStyle.textContent = overrideCSS;

  // Step 3: Force immediate style recalculation with multiple methods
  htmlElement.style.setProperty('--safari-theme-override', Date.now().toString());

  // Step 4: Additional Safari-specific fixes
  setTimeout(() => {
    // Force repaint by temporarily changing a property
    const originalTransform = htmlElement.style.transform;
    htmlElement.style.transform = 'translateZ(0)';

    requestAnimationFrame(() => {
      htmlElement.style.transform = originalTransform;

      // Force color-scheme meta tag update
      updateSafariColorSchemeMeta(currentTheme);
    });
  }, 50);
}

/**
 * Updates Safari-specific color scheme meta tag
 */
function updateSafariColorSchemeMeta(theme: ThemeMode): void {
  // Remove existing color-scheme meta tags
  const existingMetas = document.querySelectorAll('meta[name="color-scheme"]');
  existingMetas.forEach(meta => meta.remove());

  // Add new color-scheme meta tag
  const metaColorScheme = document.createElement('meta');
  metaColorScheme.setAttribute('name', 'color-scheme');
  metaColorScheme.setAttribute('content', theme);
  document.head.appendChild(metaColorScheme);

  // Also add webkit-specific meta
  const existingWebkitMetas = document.querySelectorAll('meta[name="-webkit-color-scheme"]');
  existingWebkitMetas.forEach(meta => meta.remove());

  const metaWebkitColorScheme = document.createElement('meta');
  metaWebkitColorScheme.setAttribute('name', '-webkit-color-scheme');
  metaWebkitColorScheme.setAttribute('content', theme);
  document.head.appendChild(metaWebkitColorScheme);
}

/**
 * Updates mobile-specific meta tags with Safari override
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

  // CRITICAL: Override color-scheme to force Safari compliance
  let metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (!metaColorScheme) {
    metaColorScheme = document.createElement('meta');
    metaColorScheme.setAttribute('name', 'color-scheme');
    document.head.appendChild(metaColorScheme);
  }

  // Force the app theme regardless of system preference
  metaColorScheme.setAttribute('content', theme);

  // Apply Safari-specific override
  if (isSafariMobile()) {
    forceSafariThemeOverride();
  }
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

  // Safari-specific: Listen for system theme changes
  if (isSafariMobile() && window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = () => {
      console.log('System theme changed, enforcing app theme...');
      const currentTheme = document.documentElement.classList.contains(THEME_CLASSES.dark)
        ? 'dark'
        : 'light';

      // Immediately reapply our theme to override system change
      setTimeout(() => {
        applyMobileTheme(currentTheme as ThemeMode);
        detectAndFixSafariThemeConflict();
      }, 50);
    };

    // Listen for system theme changes
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      darkModeQuery.addListener(handleSystemThemeChange);
    }

    // Safari-specific: Listen for focus events (when returning to app)
    window.addEventListener('focus', () => {
      setTimeout(() => {
        const currentTheme = document.documentElement.classList.contains(THEME_CLASSES.dark)
          ? 'dark'
          : 'light';
        applyMobileTheme(currentTheme as ThemeMode);
        detectAndFixSafariThemeConflict();
      }, 100);
    });

    // Safari-specific: Listen for page show events (back/forward navigation)
    window.addEventListener('pageshow', () => {
      setTimeout(() => {
        const currentTheme = document.documentElement.classList.contains(THEME_CLASSES.dark)
          ? 'dark'
          : 'light';
        applyMobileTheme(currentTheme as ThemeMode);
        detectAndFixSafariThemeConflict();
      }, 100);
    });
  }
}

/**
 * Detects and fixes Safari theme conflicts
 */
export function detectAndFixSafariThemeConflict(): void {
  if (!isSafariMobile()) return;

  const htmlElement = document.documentElement;
  const hasDarkClass = htmlElement.classList.contains('dark');
  const currentTheme = hasDarkClass ? 'dark' : 'light';

  // Check if computed styles match our intended theme
  const computedStyle = window.getComputedStyle(htmlElement);
  const computedBg = computedStyle.backgroundColor;
  const computedColor = computedStyle.color;

  // Expected colors for each theme
  const expectedLight = { bg: 'rgb(255, 255, 255)', color: 'rgb(17, 24, 39)' };
  const expectedDark = { bg: 'rgb(17, 24, 39)', color: 'rgb(255, 255, 255)' };

  let conflictDetected = false;

  if (currentTheme === 'light') {
    if (computedBg !== expectedLight.bg || computedColor !== expectedLight.color) {
      conflictDetected = true;
    }
  } else {
    if (computedBg !== expectedDark.bg || computedColor !== expectedDark.color) {
      conflictDetected = true;
    }
  }

  if (conflictDetected) {
    console.warn(
      `Safari theme conflict detected in ${currentTheme} mode, applying aggressive fix...`
    );
    console.warn(
      `Expected: bg=${currentTheme === 'light' ? expectedLight.bg : expectedDark.bg}, color=${currentTheme === 'light' ? expectedLight.color : expectedDark.color}`
    );
    console.warn(`Actual: bg=${computedBg}, color=${computedColor}`);

    // Nuclear option: completely reset and reapply theme
    htmlElement.classList.remove('light', 'dark');

    // Force a reflow
    htmlElement.offsetHeight;

    // Reapply theme with aggressive override
    htmlElement.classList.add(currentTheme);

    if (currentTheme === 'light') {
      // Special nuclear option for light mode
      forceSafariLightMode();

      // Force every element to light mode
      setTimeout(() => {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.colorScheme = 'light';
          htmlEl.style.setProperty('-webkit-color-scheme', 'light', 'important');
        });
        forceSafariLightMode();
      }, 100);
    } else {
      forceSafariThemeOverride();
    }

    // Apply theme again after a short delay
    setTimeout(() => {
      applyMobileTheme(currentTheme as ThemeMode);
    }, 200);
  }
}

/**
 * Emergency light mode fix for Safari Mobile
 */
export function emergencyLightModeFix(): void {
  if (!isSafariMobile()) return;

  console.log('Applying emergency light mode fix for Safari Mobile...');

  const htmlElement = document.documentElement;

  // Remove all theme classes and start fresh
  htmlElement.classList.remove('dark', 'light');

  // Force light mode class
  htmlElement.classList.add('light');

  // Apply nuclear light mode CSS
  forceSafariLightMode();

  // Force all elements to light mode
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.colorScheme = 'light';
    htmlEl.style.setProperty('-webkit-color-scheme', 'light', 'important');
    htmlEl.style.setProperty('color', '#111827', 'important');
  });

  // Force meta tags
  updateSafariColorSchemeMeta('light');

  // Force body background
  document.body.style.setProperty('background-color', '#ffffff', 'important');
  document.body.style.setProperty('color', '#111827', 'important');

  // Apply multiple times to ensure it sticks
  setTimeout(() => {
    forceSafariLightMode();
    htmlElement.style.setProperty('background-color', '#ffffff', 'important');
    htmlElement.style.setProperty('color', '#111827', 'important');
  }, 100);

  setTimeout(() => {
    forceSafariLightMode();
  }, 500);
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

  // For Safari, set up periodic conflict detection
  if (isSafariMobile()) {
    // Check for conflicts after initial load
    setTimeout(() => {
      detectAndFixSafariThemeConflict();
    }, 1000);

    // Set up periodic checks for Safari
    setInterval(() => {
      detectAndFixSafariThemeConflict();
    }, 5000);
  }
}
