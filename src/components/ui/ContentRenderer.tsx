/**
 * Content Renderer - Renders structured content as React components
 * Replaces dangerouslySetInnerHTML with safe, semantic rendering
 */

import React from 'react';
import type { StructuredContent, ContentSegment } from '../../types/content';
import '../../styles/components/content-renderer.css';

interface ContentRendererProps {
  content: StructuredContent;
  className?: string;
}

interface ContentSegmentProps {
  segment: ContentSegment;
  format?: StructuredContent['format'];
}

const ContentSegmentComponent: React.FC<ContentSegmentProps> = ({ segment, format }) => {
  const { type, content, metadata } = segment;

  switch (type) {
    case 'term':
      return (
        <span 
          className={`content-segment content-segment--term ${format ? `content-segment--${format}` : ''}`}
          title={metadata?.definition}
        >
          {content}
        </span>
      );

    case 'emphasis':
      return (
        <strong className={`content-segment content-segment--emphasis ${format ? `content-segment--${format}` : ''}`}>
          {content}
        </strong>
      );

    case 'code':
      return (
        <code className={`content-segment content-segment--code ${format ? `content-segment--${format}` : ''}`}>
          {content}
        </code>
      );

    case 'variable':
      return (
        <span className={`content-segment content-segment--variable ${format ? `content-segment--${format}` : ''}`}>
          {content}
        </span>
      );

    case 'link':
      return (
        <span className={`content-segment content-segment--link ${format ? `content-segment--${format}` : ''}`}>
          {content}
        </span>
      );

    case 'text':
    default:
      return <span className="content-segment content-segment--text">{content}</span>;
  }
};

export const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  if (!content || !content.segments || content.segments.length === 0) {
    return <span className={`content-renderer ${className}`}>Loading...</span>;
  }

  return (
    <span className={`content-renderer ${className} ${content.format ? `content-renderer--${content.format}` : ''}`}>
      {content.segments.map((segment, index) => (
        <ContentSegmentComponent 
          key={index} 
          segment={segment} 
          format={content.format}
        />
      ))}
    </span>
  );
};

export default ContentRenderer;