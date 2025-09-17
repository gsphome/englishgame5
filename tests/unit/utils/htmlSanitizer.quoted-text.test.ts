import { describe, it, expect } from 'vitest';
import { createSanitizedHTML } from '../../../src/utils/htmlSanitizer';

describe('HTML Sanitizer - Legacy Compatibility', () => {
  describe('deprecated createSanitizedHTML', () => {
    it('should sanitize HTML without processing quotes (quotes now handled by ContentRenderer)', () => {
      const input = "What is the correct form of 'be' with 'I'?";
      const result = createSanitizedHTML(input);
      
      // Legacy sanitizer no longer processes quotes - that's handled by ContentRenderer
      expect(result.__html).toBe("What is the correct form of 'be' with 'I'?");
      expect(result.__html).not.toContain('<span class="quiz-quoted-text">');
    });

    it('should handle text without quotes normally', () => {
      const input = "Regular text without quotes";
      const result = createSanitizedHTML(input);
      
      expect(result.__html).toBe(input);
      expect(result.__html).not.toContain('quiz-quoted-text');
    });

    it('should handle empty or null input gracefully', () => {
      expect(createSanitizedHTML('').__html).toBe('');
      expect(createSanitizedHTML(null as any).__html).toBe('');
      expect(createSanitizedHTML(undefined as any).__html).toBe('');
    });

    it('should preserve quotes as plain text', () => {
      const input = "How do you say 'Hola' in English?";
      const result = createSanitizedHTML(input);
      
      expect(result.__html).toContain('\'Hola\'');
      expect(result.__html).toBe("How do you say 'Hola' in English?");
    });

    it('should work with simple text', () => {
      const input = "What is the plural of 'cat'?";
      const result = createSanitizedHTML(input);
      
      expect(result.__html).toBe("What is the plural of 'cat'?");
    });

    it('should handle nested quotes as plain text', () => {
      const input = "The word 'can't' contains an apostrophe";
      const result = createSanitizedHTML(input);
      
      expect(result.__html).toBe("The word 'can't' contains an apostrophe");
    });
  });

  describe('security functionality', () => {
    it('should sanitize malicious content', () => {
      const input = "What does 'hello' mean? <script>alert('xss')</script>";
      const result = createSanitizedHTML(input);
      
      expect(result.__html).toBe("What does 'hello' mean? ");
      expect(result.__html).not.toContain('<script>');
      expect(result.__html).not.toContain('alert');
    });

    it('should remove malicious classes', () => {
      const input = "Test 'word' with <span class=\"malicious-class\">content</span>";
      const result = createSanitizedHTML(input);
      
      expect(result.__html).not.toContain('malicious-class');
      expect(result.__html).toContain('content'); // content should remain
    });
  });
});