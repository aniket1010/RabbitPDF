'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ResizableLayout from './ResizableLayout';
import MobileLayout from './MobileLayout';
import SeamlessDocumentViewer from './SeamlessDocumentViewer';
import ChatPanel from './ChatPanel';
import { getConversationDetails } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { stripPdfExtension } from '@/lib/utils';

interface ResponsiveLayoutProps {
  conversationId: string;
}

export default function ResponsiveLayout({ conversationId }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastKnownStatus, setLastKnownStatus] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket (for processing-complete signal)
  const { socket, isConnected } = useWebSocket();

  console.log('🚀 [ResponsiveLayout] Rendering with conversationId:', conversationId);

  // Reference click handler - updated for new citation system
  const handleReferenceClick = useCallback((pageNumber: number, coordinates?: any[]) => {
    console.log('📄 [ResponsiveLayout] Reference clicked - Page:', pageNumber, 'Coordinates:', coordinates || 'none');
    
    // Validate pageNumber
    if (!pageNumber || isNaN(pageNumber) || pageNumber < 1) {
      console.error('❌ [ResponsiveLayout] Invalid pageNumber:', pageNumber);
      return;
    }
    
    console.log('📄 [ResponsiveLayout] Setting referenceClick state with page:', pageNumber);
    // Store the reference click data to pass to SeamlessDocumentViewer
    // For new citation system, coordinates will be undefined/empty
    setReferenceClick({ pageNumber, coordinates: coordinates || [] });
  }, []);

  // State to pass reference clicks to SeamlessDocumentViewer
  const [referenceClick, setReferenceClick] = useState<{pageNumber: number, coordinates: any[]} | null>(null);

  // Callback to clear reference click after processing
  const handleReferenceProcessed = useCallback(() => {
    setReferenceClick(null);
  }, []);

  useEffect(() => {
    setIsClient(true);
    
    const checkMobile = () => {
      // Check both screen width and touch capability
      const isMobileScreen = window.innerWidth < 768; // md breakpoint
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileScreen || (isTouchDevice && window.innerWidth < 1024));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const loadConversationDetails = async () => {
      try {
        const details = await getConversationDetails(conversationId);
        setPdfTitle(details.title || details.fileName || '');
        if (details.processingStatus) {
          setLastKnownStatus(details.processingStatus);
          setIsProcessing(details.processingStatus === 'pending' || details.processingStatus === 'processing');
        }
      } catch (error) {
        console.error('Failed to load conversation details:', error);
      }
    };

    if (conversationId) {
      loadConversationDetails();
    }
  }, [conversationId]);

  // Poll processing status until complete (WS optional optimization)
  useEffect(() => {
    if (!conversationId) return;

    // Start polling whenever we're in a processing state
    if (isProcessing && !pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        try {
          const details = await getConversationDetails(conversationId);
          if (details?.processingStatus && details.processingStatus !== lastKnownStatus) {
            setLastKnownStatus(details.processingStatus);
            const active = details.processingStatus === 'pending' || details.processingStatus === 'processing';
            setIsProcessing(active);
            if (!active && pollingRef.current) {
              clearInterval(pollingRef.current as unknown as number);
              pollingRef.current = null;
            }
          }
        } catch (e) {
          // Ignore transient errors during polling
        }
      }, 2500) as unknown as NodeJS.Timeout;
    }

    return () => {
      if (pollingRef.current && !isProcessing) {
        clearInterval(pollingRef.current as unknown as number);
        pollingRef.current = null;
      }
    };
  }, [conversationId, isProcessing, lastKnownStatus]);

  // WebSocket listener for processing completion
  useEffect(() => {
    if (!socket) return;

    const handleComplete = () => {
      setIsProcessing(false);
      setLastKnownStatus('completed');
      if (pollingRef.current) {
        clearInterval(pollingRef.current as unknown as number);
        pollingRef.current = null;
      }
    };

    socket.on('pdf-processing-complete', handleComplete);

    return () => {
      socket.off('pdf-processing-complete', handleComplete);
    };
  }, [socket]);

  const handleConversationUpdate = (updatedConversationId: string, newTitle: string) => {
    if (updatedConversationId === conversationId) {
      setPdfTitle(newTitle);
    }
  };

  const handleConversationDelete = (deletedConversationId: string) => {
    if (deletedConversationId === conversationId) {
      // This will be handled by the sidebar redirecting to home
      setPdfTitle('');
    }
  };

  // Show loading state during hydration to prevent mismatch
  if (!isClient) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isMobile) {
    return <MobileLayout 
      conversationId={conversationId} 
      pdfTitle={stripPdfExtension(pdfTitle)} 
      onConversationUpdate={handleConversationUpdate}
      onConversationDelete={handleConversationDelete}
    />;
  }

  // Desktop layout with resizable panels
  return (
    <div 
      className="w-full h-screen"
      style={{
        willChange: 'contents',
        transform: 'translate3d(0, 0, 0)',
        contain: 'layout style size',
        isolation: 'isolate',
      }}
    >
      <ResizableLayout
        leftPanel={
          <SeamlessDocumentViewer 
            conversationId={conversationId} 
            pdfTitle={stripPdfExtension(pdfTitle)}
            referenceClick={referenceClick}
            onReferenceProcessed={handleReferenceProcessed}
          />
        }
        rightPanel={
          <ChatPanel 
            conversationId={conversationId} 
            pdfTitle={stripPdfExtension(pdfTitle)}
            onReferenceClick={handleReferenceClick}
          />
        }
        initialLeftWidth={55}
        minLeftWidth={25}
        maxLeftWidth={75}
      />
    </div>
  );
} 