'use client';

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PreviewPDF from './PreviewPDF';

interface Coordinate {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface SeamlessDocumentViewerProps {
  conversationId: string;
  pdfTitle?: string;
  onReferenceClick?: (pageNumber: number, coordinates: Coordinate[]) => void;
  referenceClick?: { pageNumber: number, coordinates: Coordinate[] } | null;
  onReferenceProcessed?: () => void;
  isMobileView?: boolean;
}

// New component to render highlights as an overlay
const HighlightLayer: React.FC<{ highlights: { pageNumber: number; coordinates: Coordinate[] } | null; currentPage: number }> = ({ highlights, currentPage }) => {
    if (!highlights || highlights.pageNumber !== currentPage) {
        return null;
    }

    // Handle case where coordinates is undefined, null, or empty
    if (!highlights.coordinates || !Array.isArray(highlights.coordinates) || highlights.coordinates.length === 0) {
        return null;
    }

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {highlights.coordinates.map((coord, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        left: `${coord.x}%`,
                        top: `${coord.y}%`,
                        width: `${coord.width}%`,
                        height: `${coord.height}%`,
                        backgroundColor: 'rgba(255, 255, 0, 0.3)',
                        border: '1px solid #ff0'
                    }}
                />
            ))}
        </div>
    );
};

const SeamlessDocumentViewer = memo(function SeamlessDocumentViewer({ 
  conversationId, 
  pdfTitle, 
  referenceClick,
  onReferenceProcessed,
  isMobileView = false
}: SeamlessDocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPdfPages, setTotalPdfPages] = useState(0);
  const [highlights, setHighlights] = useState<{ pageNumber: number; coordinates: Coordinate[] } | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [mouseInside, setMouseInside] = useState(false);
  const [isNavigationAction, setIsNavigationAction] = useState(false);
  const [inputValue, setInputValue] = useState('1');
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [prevConversationId, setPrevConversationId] = useState<string | null>(null);




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
    }
  }, [conversationId, prevConversationId]);

  // Jump request state specifically for reference clicks
  const [deferredJump, setDeferredJump] = useState<number | null>(null);

  const handleJumpComplete = useCallback(() => {
    console.log('✅ [SeamlessDocumentViewer] Jump complete signal received.');
    setDeferredJump(null);
    if (onReferenceProcessed) {
      onReferenceProcessed();
    }
  }, [onReferenceProcessed]);

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

  // Handle reference clicks from chat
  useEffect(() => {
    if (referenceClick && totalPdfPages > 0) {
      const { pageNumber, coordinates } = referenceClick;
      
      if (pageNumber >= 1 && pageNumber <= totalPdfPages) {
        // Add a slight delay to ensure PDF viewer is ready
        setTimeout(() => {
          // Navigate to the correct page
          setCurrentPage(pageNumber);
          setInputValue(pageNumber.toString());
          
          // Use the dedicated state to trigger a deferred jump in the viewer
          setDeferredJump(pageNumber);
          
          // Set highlights
          setHighlights({ pageNumber, coordinates });

          // Signal that the reference has been processed
          if (onReferenceProcessed) {
            onReferenceProcessed();
          }
        }, 300); // Small delay to ensure PDF is fully ready
      } else {
        console.error(`Invalid page number for reference click: ${pageNumber} (total pages: ${totalPdfPages})`);
      }
    }
  }, [referenceClick, totalPdfPages, onReferenceProcessed]);

  return (
    <div 
      className="relative w-full h-full bg-gray-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-full min-h-[600px]">
        <PreviewPDF 
          conversationId={conversationId}
          currentPage={currentPage}
          isNavigationAction={isNavigationAction}
          deferredJumpPage={deferredJump}
          initialPageIndex={currentPage > 0 ? currentPage - 1 : null}
          onPdfLoad={(totalPages) => {
            setTotalPdfPages(totalPages);
            setIsLoadingConversation(false);
          }}
          onPageChange={(page) => {
            setCurrentPage(page);
            setInputValue(page.toString());
          }}
          onError={() => setIsLoadingConversation(false)}
          onJumpComplete={handleJumpComplete}
        />
        <HighlightLayer highlights={highlights} currentPage={currentPage} />
      </div>

      {/* Navigation Controls - Enhanced for Mobile */}
      {(showControls || isMobileView) && totalPdfPages > 0 && (
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center transition-opacity duration-200 ${
          isMobileView ? 'px-6 py-3 space-x-4' : 'px-4 py-2 space-x-3'
        }`}>
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className={`rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isMobileView ? 'p-2 touch-manipulation' : 'p-1'
            }`}
            title="Previous page"
          >
            <FiChevronLeft size={isMobileView ? 24 : 20} />
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleInputKeyPress}
              onBlur={handleInputBlur}
              className={`text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isMobileView 
                  ? 'w-16 h-10 text-base px-2 py-1' 
                  : 'w-12 text-sm px-1 py-0.5'
              }`}
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <span className={`text-gray-600 ${isMobileView ? 'text-base' : 'text-sm'}`}>
              of {totalPdfPages}
            </span>
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPdfPages}
            className={`rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isMobileView ? 'p-2 touch-manipulation' : 'p-1'
            }`}
            title="Next page"
          >
            <FiChevronRight size={isMobileView ? 24 : 20} />
          </button>
        </div>
      )}


    </div>
  );
});

export default SeamlessDocumentViewer;