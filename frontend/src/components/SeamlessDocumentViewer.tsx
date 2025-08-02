'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PreviewPDF from './PreviewPDF';

interface SeamlessDocumentViewerProps {
  conversationId: string;
  pdfTitle?: string;
  onReferenceClick?: (pageNumber: number, textToHighlight: string) => void;
  referenceClick?: {pageNumber: number, textToHighlight: string} | null;
  onReferenceProcessed?: () => void;
}

export default function SeamlessDocumentViewer({ 
  conversationId, 
  pdfTitle, 
  onReferenceClick,
  referenceClick,
  onReferenceProcessed
}: SeamlessDocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPdfPages, setTotalPdfPages] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [mouseInside, setMouseInside] = useState(false);
  const [isNavigationAction, setIsNavigationAction] = useState(false);
  const [inputValue, setInputValue] = useState('1');
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [prevConversationId, setPrevConversationId] = useState<string | null>(null);

  // Ref to store search functions from PDF viewer
  const searchFunctionsRef = useRef<{ searchFn: (text: string, targetPage?: number) => void; clearFn: () => void } | null>(null);

  // Debug currentPage changes
  useEffect(() => {
    console.log('🔄 [SeamlessDocumentViewer] currentPage changed to:', currentPage);
  }, [currentPage]);
  
  // Debug isNavigationAction changes
  useEffect(() => {
    console.log('🔄 [SeamlessDocumentViewer] isNavigationAction changed to:', isNavigationAction);
  }, [isNavigationAction]);

  // Handle conversation switching
  useEffect(() => {
    if (conversationId !== prevConversationId) {
      console.log('SeamlessDocumentViewer: Conversation changed from', prevConversationId, 'to', conversationId);
      setIsLoadingConversation(true);
      setCurrentPage(1);
      setInputValue('1');
      setPrevConversationId(conversationId);
      
      // Clear any existing highlights when switching conversations
      if (searchFunctionsRef.current?.clearFn) {
        searchFunctionsRef.current.clearFn();
      }
    }
  }, [conversationId, prevConversationId]);

  // Mouse event handlers
  const handleMouseEnter = useCallback(() => {
    setMouseInside(true);
    setShowControls(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseInside(false);
    setTimeout(() => {
      if (!mouseInside) {
        setShowControls(false);
      }
    }, 1000);
  }, [mouseInside]);

  // Navigation functions
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setInputValue(newPage.toString());
      setIsNavigationAction(true);
      setTimeout(() => setIsNavigationAction(false), 100);
    }
  }, [currentPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPdfPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setInputValue(newPage.toString());
      setIsNavigationAction(true);
      setTimeout(() => setIsNavigationAction(false), 100);
    }
  }, [currentPage, totalPdfPages]);

  // Input handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(inputValue, 10);
      if (pageNum >= 1 && pageNum <= totalPdfPages) {
        setCurrentPage(pageNum);
        setIsNavigationAction(true);
        setTimeout(() => setIsNavigationAction(false), 100);
      } else {
        setInputValue(currentPage.toString());
      }
    }
  }, [inputValue, totalPdfPages, currentPage]);

  const handleInputBlur = useCallback(() => {
    const pageNum = parseInt(inputValue, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPdfPages) {
      setInputValue(currentPage.toString());
    }
  }, [inputValue, totalPdfPages, currentPage]);

  // Handle search ready callback from PDF viewer
  const handleSearchReady = useCallback((searchFunctions: { searchFn: (text: string, targetPage?: number) => void; clearFn: () => void }) => {
    console.log('📄 [SeamlessDocumentViewer] Search functions ready');
    searchFunctionsRef.current = searchFunctions;
  }, []);

  // Handle reference clicks and highlighting
  useEffect(() => {
    let highlightTimer: NodeJS.Timeout | null = null;
    
    if (referenceClick && totalPdfPages > 0) {
      const { pageNumber, textToHighlight } = referenceClick;
      console.log('📄 [SeamlessDocumentViewer] === REFERENCE CLICK START ===');
      console.log('📄 [SeamlessDocumentViewer] Target page:', pageNumber);
      console.log('📄 [SeamlessDocumentViewer] Text to highlight:', textToHighlight);
      console.log('📄 [SeamlessDocumentViewer] Current PDF pages:', totalPdfPages);
      console.log('📄 [SeamlessDocumentViewer] Search functions available:', !!searchFunctionsRef.current);
      
      if (pageNumber >= 1 && pageNumber <= totalPdfPages) {
        // 1. Navigate to the correct page
        console.log('🎯 [SeamlessDocumentViewer] Navigating to page:', pageNumber);
        setCurrentPage(pageNumber);
        setInputValue(pageNumber.toString());
        setIsNavigationAction(true);

        // 2. Use a delay to allow the page to render before highlighting
        console.log('⏱️ [SeamlessDocumentViewer] Setting 300ms timer for highlighting...');
        highlightTimer = setTimeout(() => {
          console.log('⏱️ [SeamlessDocumentViewer] 🔥 TIMER FIRED! Starting highlighting process');
          console.log('⏱️ [SeamlessDocumentViewer] Timer ID was:', highlightTimer);
          
          if (searchFunctionsRef.current) {
            const { searchFn, clearFn } = searchFunctionsRef.current;
            
            // First, clear any previous highlights
            console.log('🧹 [SeamlessDocumentViewer] Clearing existing highlights');
            clearFn();
            
            // Helper function to select meaningful text for highlighting
            const selectSearchText = (text: string) => {
              const cleanText = text.trim();
              console.log('✂️ [SeamlessDocumentViewer] Original reference text:', cleanText);
              console.log('✂️ [SeamlessDocumentViewer] Text length:', cleanText.length);
              
              // Strategy 1: If text is short (< 50 chars), use it as-is
              if (cleanText.length <= 50) {
                console.log('✂️ [SeamlessDocumentViewer] Strategy: Using full text (short)');
                return cleanText;
              }
              
              // Strategy 2: Look for a meaningful sentence
              const sentences = cleanText.split(/[.!?]+/);
              if (sentences[0] && sentences[0].trim().length > 10 && sentences[0].trim().length <= 100) {
                const firstSentence = sentences[0].trim();
                console.log('✂️ [SeamlessDocumentViewer] Strategy: Using first sentence');
                console.log('✂️ [SeamlessDocumentViewer] Selected sentence:', firstSentence);
                return firstSentence;
              }
              
              // Strategy 3: Take first 6-8 meaningful words (more than the previous 2)
              const words = cleanText.split(/\s+/);
              const meaningfulWords = words.filter(word => word.length > 2); // Filter out very short words like "a", "is", "to"
              const selectedWords = meaningfulWords.slice(0, 8); // Take up to 8 meaningful words
              const result = selectedWords.join(' ');
              
              console.log('✂️ [SeamlessDocumentViewer] Strategy: Using 8 meaningful words');
              console.log('✂️ [SeamlessDocumentViewer] All words:', words);
              console.log('✂️ [SeamlessDocumentViewer] Meaningful words:', meaningfulWords);
              console.log('✂️ [SeamlessDocumentViewer] Selected words:', selectedWords);
              return result;
            };
            
            const searchText = selectSearchText(textToHighlight);
            console.log(`🔍 [SeamlessDocumentViewer] === HIGHLIGHTING START ===`);
            console.log(`🔍 [SeamlessDocumentViewer] Original text: "${textToHighlight}"`);
            console.log(`🔍 [SeamlessDocumentViewer] Selected search text: "${searchText}"`);
            console.log(`🔍 [SeamlessDocumentViewer] Target page: ${pageNumber}`);
            
            // Pass both the search text and current page number
            searchFn(searchText, pageNumber);
            
            // Add a follow-up check after highlighting
            setTimeout(() => {
              const highlights = document.querySelectorAll('.rpv-search__highlight');
              console.log('🎨 [SeamlessDocumentViewer] Post-highlight check: found', highlights.length, 'highlight elements');
              if (highlights.length > 0) {
                console.log('✅ [SeamlessDocumentViewer] === HIGHLIGHTING SUCCESS ===');
                highlights.forEach((el, index) => {
                  console.log(`🎨 [SeamlessDocumentViewer] Highlight ${index + 1}:`, el.textContent);
                });
              } else {
                console.warn('❌ [SeamlessDocumentViewer] === HIGHLIGHTING FAILED ===');
                console.warn('❌ [SeamlessDocumentViewer] No highlights found in DOM after search');
              }
            }, 500);
            
          } else {
            console.error('❌ [SeamlessDocumentViewer] Search functions not available for highlighting!');
            console.error('❌ [SeamlessDocumentViewer] searchFunctionsRef.current is:', searchFunctionsRef.current);
          }
          
          // 3. Signal that the reference has been processed (after highlighting attempt)
          console.log('📄 [SeamlessDocumentViewer] === REFERENCE CLICK END ===');
          if (onReferenceProcessed) {
            console.log('📄 [SeamlessDocumentViewer] Calling onReferenceProcessed to clear reference state');
            onReferenceProcessed();
          } else {
            console.log('📄 [SeamlessDocumentViewer] No onReferenceProcessed callback provided');
          }
          
          setIsNavigationAction(false);
        }, 300); // Increased to 300ms for better PDF rendering
        
        console.log('⏱️ [SeamlessDocumentViewer] Timer created with ID:', highlightTimer);
      } else {
        console.error('❌ Invalid page number for reference click:', pageNumber, 'Total pages:', totalPdfPages);
      }

      // Note: We'll call onReferenceProcessed after highlighting completes, not here
    }
    
    // Cleanup timer if the component re-renders before it fires
    return () => {
      if (highlightTimer) {
        console.log('🧹 [SeamlessDocumentViewer] ⚠️ CLEANUP: Clearing highlight timer', highlightTimer, 'before it fired!');
        clearTimeout(highlightTimer);
      } else {
        console.log('🧹 [SeamlessDocumentViewer] Cleanup called, no timer to clear');
      }
    };
  }, [referenceClick, totalPdfPages, onReferenceProcessed]);

  return (
    <div 
      className="relative w-full h-full bg-gray-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-full">
        <PreviewPDF 
          conversationId={conversationId}
          currentPage={currentPage}
          isNavigationAction={isNavigationAction}
          onPdfLoad={(totalPages) => {
            setTotalPdfPages(totalPages);
            setIsLoadingConversation(false);
            console.log('SeamlessDocumentViewer: PDF loaded with', totalPages, 'pages');
          }}
          onPageChange={(page) => {
            console.log('SeamlessDocumentViewer: onPageChange called with page:', page, 'currentPage:', currentPage);
            console.log('SeamlessDocumentViewer: Updating currentPage to:', page);
            setCurrentPage(page);
            setInputValue(page.toString());
            console.log('SeamlessDocumentViewer: setCurrentPage called with:', page);
          }}
          onError={() => {
            setIsLoadingConversation(false);
          }}
          onSearchReady={handleSearchReady}
        />
      </div>

      {/* Navigation Controls */}
      {showControls && totalPdfPages > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center space-x-3 transition-opacity duration-200">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <FiChevronLeft size={20} />
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleInputKeyPress}
              onBlur={handleInputBlur}
              className="w-12 text-center text-sm border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">of {totalPdfPages}</span>
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPdfPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      )}

      {/* PDF Title */}
      {pdfTitle && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 px-3 py-1">
          <span className="text-sm font-medium text-gray-700 truncate max-w-xs block">
            {pdfTitle}
          </span>
        </div>
      )}
    </div>
  );
}