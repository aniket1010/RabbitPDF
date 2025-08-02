'use client';

import React from 'react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { searchPlugin } from '@react-pdf-viewer/search';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';

interface PdfViewerCoreProps {
  pdfUrl: string;
  currentPage?: number;
  onPageChange: (e: { currentPage: number }) => void;
  onDocumentLoadSuccess?: (e: any) => void;
  isNavigationAction?: boolean;
  onSearchReady?: (searchFunctions: { searchFn: (text: string, targetPage?: number) => void; clearFn: () => void }) => void;
}

// Helper function to escape special characters for use in a regular expression
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};


const PdfViewerCore: React.FC<PdfViewerCoreProps> = ({
  pdfUrl,
  currentPage = 1,
  onPageChange,
  onDocumentLoadSuccess,
  isNavigationAction = false,
  onSearchReady,
}) => {
  // Create page navigation plugin
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // Create search plugin with configuration to disable auto-jumping
  const searchPluginInstance = searchPlugin({
    // Disable automatic jumping to first match
    onHighlightKeyword: () => {
      // Do nothing - this prevents auto-jumping
    }
  });
  const { highlight, clearHighlights } = searchPluginInstance;

  // Handle document load
  const handleDocumentLoad = React.useCallback((e: any) => {
    console.log('📄 PDF loaded with', e.doc.numPages, 'pages');
    if (onDocumentLoadSuccess) {
      onDocumentLoadSuccess(e);
    }
    
    // Expose search functions to parent component
    if (onSearchReady) {
      console.log('📄 Exposing search functions to parent component');
      onSearchReady({
        searchFn: (text: string, targetPage?: number) => {
          console.log('📄 Search function called with text:', text, 'targetPage:', targetPage);

          // Use the provided target page or fall back to current page
          const pageToSearch = targetPage || currentPage;
          
          console.log('📄 Searching for:', text, 'on page:', pageToSearch);
          
          // Set target pages at the point of use for the specific search
          if (searchPluginInstance.setTargetPages) {
            console.log('📄 Restricting search to page:', pageToSearch);
            searchPluginInstance.setTargetPages((targetPageInfo) => {
              return targetPageInfo.pageIndex === pageToSearch - 1; // Convert to 0-based
            });
          }
          
          // Perform the search with the shortened text
          console.log('🔍 [PdfViewerCore] About to call highlight() with text:', text);
          const searchPromise = highlight(text);
          
          if (searchPromise && typeof searchPromise.then === 'function') {
            console.log('🔍 [PdfViewerCore] highlight() returned a promise, waiting for results...');
            searchPromise.then((matches) => {
              console.log('🔍 [PdfViewerCore] Search completed successfully');
              console.log('📊 [PdfViewerCore] Number of matches found:', matches ? matches.length : 0);
              
              if (matches && matches.length > 0) {
                console.log('✅ [PdfViewerCore] Matches found! Details:', matches.map(match => ({
                  pageIndex: match.pageIndex,
                  startIndex: match.startIndex,
                  endIndex: match.endIndex,
                  textPreview: match.pageText?.substring(match.startIndex, Math.min(match.endIndex + 20, match.pageText.length))
                })));
                
                // Check if DOM elements are actually created
                setTimeout(() => {
                  const highlightElements = document.querySelectorAll('.rpv-search__highlight');
                  console.log('🎨 [PdfViewerCore] Highlight DOM elements found:', highlightElements.length);
                  if (highlightElements.length > 0) {
                    console.log('🎨 [PdfViewerCore] First highlight element:', highlightElements[0]);
                    console.log('🎨 [PdfViewerCore] Element styles:', window.getComputedStyle(highlightElements[0]));
                  } else {
                    console.warn('⚠️ [PdfViewerCore] No highlight DOM elements found despite matches!');
                  }
                }, 100);
              } else {
                console.warn('⚠️ [PdfViewerCore] No matches found for text:', text);
                console.log('🔍 [PdfViewerCore] Trying to debug - checking if text exists in any form...');
                
                // Try a super simple search to see if anything works
                setTimeout(() => {
                  console.log('🧪 [PdfViewerCore] Testing with single letter search...');
                  const testPromise = highlight(text.charAt(0));
                  if (testPromise && typeof testPromise.then === 'function') {
                    testPromise.then((testMatches) => {
                      console.log('🧪 [PdfViewerCore] Single letter test found:', testMatches ? testMatches.length : 0, 'matches');
                    });
                  }
                }, 200);
              }
            }).catch((error) => {
              console.error('❌ [PdfViewerCore] Search error:', error);
              console.error('❌ [PdfViewerCore] Error details:', {
                message: error.message,
                stack: error.stack,
                searchText: text,
                targetPage: pageToSearch
              });
            });
          } else {
            console.warn('⚠️ [PdfViewerCore] highlight() did not return a promise!');
            console.log('🔍 [PdfViewerCore] highlight() returned:', searchPromise);
          }
        },
        clearFn: () => {
          console.log('🧹 [PdfViewerCore] Clear highlights function called');
          const existingHighlights = document.querySelectorAll('.rpv-search__highlight');
          console.log('🧹 [PdfViewerCore] Found', existingHighlights.length, 'existing highlights to clear');
          
          clearHighlights();
          
          // Verify highlights were cleared
          setTimeout(() => {
            const remainingHighlights = document.querySelectorAll('.rpv-search__highlight');
            console.log('🧹 [PdfViewerCore] After clearing:', remainingHighlights.length, 'highlights remain');
          }, 50);
        }
      });
    }
  }, [onDocumentLoadSuccess, onSearchReady, highlight, clearHighlights]);

  // Handle page changes from scrolling
  const handlePageChange = React.useCallback((e: { currentPage: number }) => {
    // Prevent feedback loop if navigation was triggered by a button click
    if (!isNavigationAction) {
        console.log('📄 Page changed by scrolling to:', e.currentPage + 1); // Convert from 0-based to 1-based
        onPageChange({ currentPage: e.currentPage + 1 });
    }
  }, [onPageChange, isNavigationAction]);

  // Handle navigation button clicks
  React.useEffect(() => {
    if (isNavigationAction && jumpToPage) {
      console.log('🎯 Jumping to page:', currentPage);
      jumpToPage(currentPage - 1); // Convert from 1-based to 0-based
    }
  }, [currentPage, isNavigationAction, jumpToPage]);

  return (
    <div className="w-full h-full">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={pdfUrl}
          onDocumentLoad={handleDocumentLoad}
          onPageChange={handlePageChange}
          defaultScale={SpecialZoomLevel.PageFit}
          initialPage={currentPage - 1}
          plugins={[pageNavigationPluginInstance, searchPluginInstance]}
        />
      </Worker>
    </div>
  );
};

export default PdfViewerCore;