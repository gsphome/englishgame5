/**
 * Header Intelligent Breakpoints CSS Test
 * 
 * Tests the CSS breakpoint system for the header component
 * to ensure proper responsive behavior across all screen sizes.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read the header CSS file
const headerCssPath = resolve(__dirname, '../../../src/styles/components/header.css');
const headerCss = readFileSync(headerCssPath, 'utf-8');

describe('Header Intelligent Breakpoints CSS', () => {
  describe('Breakpoint System Validation', () => {
    it('should have 8 distinct breakpoint ranges defined', () => {
      // Count media queries for header breakpoints
      const mediaQueries = headerCss.match(/@media[^{]+\{[^}]*\}/g) || [];
      
      // Should have multiple breakpoints defined
      expect(mediaQueries.length).toBeGreaterThan(5);
      
      // Check for specific breakpoint ranges
      expect(headerCss).toContain('min-width: 1200px');
      expect(headerCss).toContain('min-width: 900px');
      expect(headerCss).toContain('min-width: 700px');
      expect(headerCss).toContain('min-width: 520px');
      expect(headerCss).toContain('min-width: 420px');
      expect(headerCss).toContain('min-width: 360px');
      expect(headerCss).toContain('min-width: 320px');
      expect(headerCss).toContain('max-width: 319px');
    });

    it('should have progressive element hiding rules', () => {
      // Check for display: none rules for progressive disclosure
      expect(headerCss).toContain('.header-redesigned__dev-text');
      expect(headerCss).toContain('.header-redesigned__username');
      expect(headerCss).toContain('.header-redesigned__login-text');
      expect(headerCss).toContain('.header-redesigned__title');
      expect(headerCss).toContain('.header-redesigned__logo');
      expect(headerCss).toContain('display: none');
    });

    it('should have proper container sizing for each breakpoint', () => {
      // Check for container sizing rules
      expect(headerCss).toContain('min-height: 68px'); // Desktop full
      expect(headerCss).toContain('min-height: 64px'); // Desktop standard
      expect(headerCss).toContain('min-height: 60px'); // Tablet landscape
      expect(headerCss).toContain('min-height: 56px'); // Tablet portrait
      expect(headerCss).toContain('min-height: 52px'); // Mobile large
      expect(headerCss).toContain('min-height: 48px'); // Mobile standard
      expect(headerCss).toContain('min-height: 44px'); // Mobile small
      expect(headerCss).toContain('min-height: 40px'); // Mobile tiny
    });

    it('should have proper button sizing for mobile breakpoints', () => {
      // Check for button sizing rules
      expect(headerCss).toContain('min-width: 40px');
      expect(headerCss).toContain('min-width: 36px');
      expect(headerCss).toContain('min-width: 32px');
      expect(headerCss).toContain('min-width: 28px');
      expect(headerCss).toContain('min-width: 24px');
      
      expect(headerCss).toContain('min-height: 40px');
      expect(headerCss).toContain('min-height: 36px');
      expect(headerCss).toContain('min-height: 32px');
      expect(headerCss).toContain('min-height: 28px');
      expect(headerCss).toContain('min-height: 24px');
    });
  });

  describe('Breakpoint Range Validation', () => {
    it('should have proper min-width and max-width combinations', () => {
      // Desktop Full (1200px+)
      expect(headerCss).toContain('min-width: 1200px');
      
      // Desktop Standard (900px - 1199px)
      expect(headerCss).toMatch(/min-width:\s*900px.*max-width:\s*1199px/s);
      
      // Tablet Landscape (700px - 899px)
      expect(headerCss).toMatch(/min-width:\s*700px.*max-width:\s*899px/s);
      
      // Tablet Portrait (520px - 699px)
      expect(headerCss).toMatch(/min-width:\s*520px.*max-width:\s*699px/s);
      
      // Mobile Large (420px - 519px)
      expect(headerCss).toMatch(/min-width:\s*420px.*max-width:\s*519px/s);
      
      // Mobile Standard (360px - 419px)
      expect(headerCss).toMatch(/min-width:\s*360px.*max-width:\s*419px/s);
      
      // Mobile Small (320px - 359px)
      expect(headerCss).toMatch(/min-width:\s*320px.*max-width:\s*359px/s);
      
      // Mobile Tiny (<320px)
      expect(headerCss).toContain('max-width: 319px');
    });

    it('should have proper gap and padding adjustments', () => {
      // Check for gap adjustments
      expect(headerCss).toContain('gap: 1rem');
      expect(headerCss).toContain('gap: 0.875rem');
      expect(headerCss).toContain('gap: 0.75rem');
      expect(headerCss).toContain('gap: 0.625rem');
      expect(headerCss).toContain('gap: 0.5rem');
      expect(headerCss).toContain('gap: 0.375rem');
      expect(headerCss).toContain('gap: 0.25rem');
      expect(headerCss).toContain('gap: 0.125rem');
      
      // Check for padding adjustments
      expect(headerCss).toContain('padding: 0.75rem 2rem');
      expect(headerCss).toContain('padding: 0.75rem 1.5rem');
      expect(headerCss).toContain('padding: 0.75rem 1.25rem');
      expect(headerCss).toContain('padding: 0.625rem 1rem');
      expect(headerCss).toContain('padding: 0.5rem 0.875rem');
      expect(headerCss).toContain('padding: 0.5rem 0.75rem');
      expect(headerCss).toContain('padding: 0.375rem 0.5rem');
      expect(headerCss).toContain('padding: 0.25rem 0.375rem');
    });

    it('should have icon size adjustments for mobile', () => {
      // Check for icon size rules
      expect(headerCss).toContain('width: 16px');
      expect(headerCss).toContain('height: 16px');
      expect(headerCss).toContain('width: 14px');
      expect(headerCss).toContain('height: 14px');
      expect(headerCss).toContain('width: 12px');
      expect(headerCss).toContain('height: 12px');
      expect(headerCss).toContain('width: 10px');
      expect(headerCss).toContain('height: 10px');
    });
  });

  describe('Progressive Element Hiding', () => {
    it('should hide dev text at appropriate breakpoint', () => {
      // Dev text should be hidden in desktop standard breakpoint
      expect(headerCss).toContain('min-width: 900px) and (max-width: 1199px)');
      expect(headerCss).toMatch(/\.header-redesigned__dev-text[^}]*display:\s*none/);
    });

    it('should hide username and login text at tablet landscape', () => {
      // Username and login text should be hidden at tablet landscape
      const tabletLandscapeSection = headerCss.match(/min-width:\s*700px.*max-width:\s*899px[^}]*{[^}]*}/s);
      expect(tabletLandscapeSection).toBeTruthy();
      
      expect(headerCss).toMatch(/\.header-redesigned__username[^}]*display:\s*none/);
      expect(headerCss).toMatch(/\.header-redesigned__login-text[^}]*display:\s*none/);
    });

    it('should hide app title at tablet portrait', () => {
      // App title should be hidden at tablet portrait
      expect(headerCss).toMatch(/\.header-redesigned__title[^}]*display:\s*none/);
    });

    it('should hide logo at mobile standard', () => {
      // Logo should be hidden at mobile standard
      expect(headerCss).toMatch(/\.header-redesigned__logo[^}]*display:\s*none/);
    });

    it('should hide dev indicator at mobile tiny', () => {
      // Dev indicator should be hidden at mobile tiny
      expect(headerCss).toMatch(/\.header-redesigned__dev-indicator[^}]*display:\s*none/);
    });
  });

  describe('CSS Structure Validation', () => {
    it('should have proper CSS variable usage', () => {
      // Check for CSS variables (with or without fallbacks)
      expect(headerCss).toMatch(/var\(--header-bg[^)]*\)/);
      expect(headerCss).toMatch(/var\(--header-border[^)]*\)/);
      expect(headerCss).toMatch(/var\(--header-text-primary[^)]*\)/);
      expect(headerCss).toMatch(/var\(--header-text-secondary[^)]*\)/);
    });

    it('should have proper BEM naming convention', () => {
      // Check for BEM class names
      expect(headerCss).toContain('.header-redesigned');
      expect(headerCss).toContain('.header-redesigned__container');
      expect(headerCss).toContain('.header-redesigned__left');
      expect(headerCss).toContain('.header-redesigned__center');
      expect(headerCss).toContain('.header-redesigned__right');
      expect(headerCss).toContain('.header-redesigned__menu-btn');
      expect(headerCss).toContain('.header-redesigned__user-btn');
      expect(headerCss).toContain('.header-redesigned__logo');
      expect(headerCss).toContain('.header-redesigned__title');
    });

    it('should have dark mode support', () => {
      // Check for dark mode rules
      expect(headerCss).toContain('html.dark');
      expect(headerCss).toContain('.dark .header-redesigned');
    });
  });
});