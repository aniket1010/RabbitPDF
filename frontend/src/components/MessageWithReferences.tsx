'use client';

import { useMemo } from 'react';

interface MessageWithReferencesProps {
  content: string;
  contentType?: 'html' | 'text' | 'markdown';
  onReferenceClick?: (pageNumber: number, text: string) => void;
  className?: string;
}

export default function MessageWithReferences({
  content,
  contentType = 'html',
  onReferenceClick,
  className = ""
}: MessageWithReferencesProps) {
  
  const { contentWithLinks } = useMemo(() => {
    if (!content) return { contentWithLinks: '' };
    
    console.log('🔍 MessageWithReferences: Processing content...');
    console.log('🔍 Content length:', content.length);
    console.log('🔍 Content preview (first 500 chars):', content.substring(0, 500));
    console.log('🔍 Content ending (last 500 chars):', content.slice(-500));
    
    // Step 1: Find References section and extract page numbers + text snippets
    const referencesMatch = content.match(/(?:##\s)?References\s*([\s\S]*?)$/i);
    const pageMapping: { [key: string]: { pageNumber: number; text: string } } = {};
    
    if (referencesMatch) {
      const referencesText = referencesMatch[1];
      console.log('✅ Found References section:', referencesText);
      
      // Parse each reference line: [^ref-1]: Page 26 - "text snippet"
      const referenceLines = referencesText.split('\n').filter(line => line.trim());
      
      referenceLines.forEach(line => {
        // Try to match format with text snippet first: [^ref-1]: Page 26 - "text snippet"
        let match = line.match(/\[\^ref-(\d+)\]:\s*Page\s*(\d+)\s*-\s*"([^"]+)"/i);
        if (match) {
          const refId = match[1];
          const pageNum = parseInt(match[2]);
          const textSnippet = match[3];
          pageMapping[refId] = { pageNumber: pageNum, text: textSnippet };
          console.log(`✅ Mapped ref-${refId} → Page ${pageNum} with text: "${textSnippet}"`);
        } else {
          // Fallback: try to match without text snippet: [^ref-1]: Page 26
          match = line.match(/\[\^ref-(\d+)\]:\s*Page\s*(\d+)/i);
          if (match) {
            const refId = match[1];
            const pageNum = parseInt(match[2]);
            pageMapping[refId] = { pageNumber: pageNum, text: '' };
            console.log(`✅ Mapped ref-${refId} → Page ${pageNum} (no text snippet)`);
          }
        }
      });
    } else {
      console.error('❌ NO References section found!');
      console.error('❌ Looking for patterns: "References", "## References"');
      console.error('❌ Citations will remain as plain text');
    }
    
    console.log('📋 Final page mapping:', pageMapping);
    
    // Step 2: Remove References section from content
    let processedContent = content.replace(/(?:##\s)?References\s*[\s\S]*$/i, '').trim();
    
    // Step 3: Replace citations with clickable page links
    processedContent = processedContent.replace(/\[\^ref-(\d+)\]/g, (match, refId) => {
      const pageInfo = pageMapping[refId];
      
      if (pageInfo) {
        const { pageNumber, text } = pageInfo;
        const encodedText = encodeURIComponent(text);
        console.log(`✅ Replacing ${match} with clickable Page ${pageNumber} link (text: "${text}")`);
        return `<button type="button" class="reference-link" data-page="${pageNumber}" data-position="0" data-ref="${refId}" data-text="${encodedText}" data-click-handler="reference" style="background:none;border:none;color:#2563eb;text-decoration:underline;cursor:pointer;padding:0;font:inherit;" title="Click to go to page ${pageNumber}">[Page ${pageNumber}]</button>`;
      } else {
        console.warn(`❌ No page mapping found for ${match}`);
        return match; // Keep original if no mapping found
      }
    });
    
    return {
      contentWithLinks: processedContent
    };
  }, [content]);

  // Handle clicks on reference links
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('reference-link')) {
      e.preventDefault();
      
      const pageStr = target.dataset.page;
      const encodedText = target.dataset.text || '';

      if (pageStr && onReferenceClick) {
        const pageNumber = parseInt(pageStr);
        const text = encodedText ? decodeURIComponent(encodedText) : '';
        console.log(`🔗 Reference clicked: Page ${pageNumber}, Text: "${text}"`);
        
        if (!isNaN(pageNumber) && pageNumber > 0) {
          onReferenceClick(pageNumber, text);
        }
      }
    }
  };

  return (
    <div className={className} onClick={handleClick}>
      <style jsx>{`
        .reference-link {
          background: none;
          border: none;
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
          font: inherit;
        }
      `}</style>
      {contentType === 'html' ? (
        <div dangerouslySetInnerHTML={{ __html: contentWithLinks }} />
      ) : (
        <div>{contentWithLinks}</div>
      )}
    </div>
  );
} 