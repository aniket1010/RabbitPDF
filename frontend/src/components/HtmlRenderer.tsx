'use client';

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface HtmlRendererProps {
  content: string;
  className?: string;
  isUserMessage?: boolean;
  contentType?: 'text' | 'html' | 'markdown';
  onReferenceClick?: (pageNumber: number) => void;
  isMobileView?: boolean;
}

export default function HtmlRenderer({
  content,
  className = '',
  isUserMessage = false,
  contentType = 'text',
  onReferenceClick,
  isMobileView = false
}: HtmlRendererProps) {

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Handle citation button clicks, but not in mobile view
    if (target.classList.contains('citation-button') && onReferenceClick && !isMobileView) {
      e.preventDefault();
      e.stopPropagation();
      
      const pageStr = target.dataset.page;
      if (pageStr) {
        const pageNumber = parseInt(pageStr);
        if (!isNaN(pageNumber) && pageNumber > 0) {
          console.log(`🔗 [HtmlRenderer] Citation clicked: Page ${pageNumber} - calling onReferenceClick`);
          onReferenceClick(pageNumber);
          console.log(`🔗 [HtmlRenderer] onReferenceClick called successfully`);
        } else {
          console.error(`🔗 [HtmlRenderer] Invalid page number: ${pageStr}`);
        }
      }
    }
  };
  
  if (contentType === 'text') {
    return (
      <div className={`${className} whitespace-pre-wrap`}>
        {content}
      </div>
    );
  }

  // Sanitize HTML and ensure citation buttons are preserved
  const sanitizedHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li',
      'blockquote',
      'code', 'pre',
      'a',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'hr',
      'button'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title',
      'class', 'id', 'start',
      'data-page', 'type', 'style'
    ],
  });

  return (
    <div 
      className={`html-content ${className} ${isUserMessage ? 'user-message' : 'ai-message'} ${isMobileView ? 'mobile-citations' : ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      onClick={handleClick}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
    />
  );
}