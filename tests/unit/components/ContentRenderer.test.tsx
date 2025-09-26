import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContentRenderer from '../../../src/components/ui/ContentRenderer';
import { ContentAdapter } from '../../../src/utils/contentAdapter';

describe('ContentRenderer', () => {
  describe('term rendering', () => {
    it('should render quoted text with proper styling classes', () => {
      const content = ContentAdapter.ensureStructured("What is the correct form of 'be' with 'I'?", 'quiz');
      
      render(<ContentRenderer content={content} />);
      
      // Check that the terms are rendered with the correct class
      const termElements = screen.getAllByText((content, element) => {
        return element?.classList.contains('content-renderer__segment--term') || false;
      });
      
      expect(termElements).toHaveLength(2); // 'be' and 'I'
    });

    it('should render different content types correctly', () => {
      const content = ContentAdapter.ensureStructured("The word 'hello' is **important** in `code`", 'quiz');
      
      render(<ContentRenderer content={content} />);
      
      // Check for term
      expect(screen.getByText('hello')).toHaveClass('content-renderer__segment--term');
      
      // Check for emphasis
      expect(screen.getByText('important')).toHaveClass('content-renderer__segment--emphasis');
      
      // Check for code
      expect(screen.getByText('code')).toHaveClass('content-renderer__segment--code');
    });

    it('should handle plain text without formatting', () => {
      const content = ContentAdapter.ensureStructured("Regular text without quotes", 'quiz');
      
      render(<ContentRenderer content={content} />);
      
      expect(screen.getByText('Regular text without quotes')).toBeInTheDocument();
    });

    it('should apply format-specific classes', () => {
      const quizContent = ContentAdapter.ensureStructured("Quiz 'term'", 'quiz');
      const flashcardContent = ContentAdapter.ensureStructured("Flashcard 'term'", 'flashcard');
      
      const { container, rerender } = render(<ContentRenderer content={quizContent} />);
      expect(container.querySelector('.content-renderer--quiz')).toBeInTheDocument();
      
      rerender(<ContentRenderer content={flashcardContent} />);
      expect(container.querySelector('.content-renderer--flashcard')).toBeInTheDocument();
    });

    it('should handle empty content gracefully', () => {
      const content = ContentAdapter.ensureStructured('', 'quiz');
      
      const { container } = render(<ContentRenderer content={content} />);
      
      // Empty content creates an empty text segment
      expect(container.querySelector('.content-renderer__segment--text')).toBeInTheDocument();
    });
  });

  describe('integration with ContentAdapter', () => {
    it('should work seamlessly with ContentAdapter for quiz questions', () => {
      const legacyQuestion = "Which article goes before 'apple'?";
      const content = ContentAdapter.ensureStructured(legacyQuestion, 'quiz');
      
      render(<ContentRenderer content={content} />);
      
      expect(screen.getByText('Which article goes before')).toBeInTheDocument();
      expect(screen.getByText('apple')).toHaveClass('content-renderer__segment--term');
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should work with flashcard content', () => {
      const flashcardText = "Hello - a greeting word";
      const content = ContentAdapter.ensureStructured(flashcardText, 'flashcard');
      
      render(<ContentRenderer content={content} />);
      
      expect(screen.getByText('Hello - a greeting word')).toBeInTheDocument();
    });
  });
});