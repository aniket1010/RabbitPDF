'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, MessageCircle, Menu, X, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SeamlessDocumentViewer from './SeamlessDocumentViewer';
import ChatPanel from './ChatPanel';
import Sidebar from './Sidebar';
import { getConversationDetails } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';

interface MobileLayoutProps {
  conversationId: string;
  pdfTitle?: string;
  onConversationUpdate?: (conversationId: string, newTitle: string) => void;
  onConversationDelete?: (conversationId: string) => void;
}

type MobileView = 'chat' | 'pdf';

export default function MobileLayout({ conversationId, pdfTitle, onConversationUpdate, onConversationDelete }: MobileLayoutProps) {
  const [currentView, setCurrentView] = useState<MobileView>('chat');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isClosingSidebar, setIsClosingSidebar] = useState(false);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastKnownStatus, setLastKnownStatus] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { socket } = useWebSocket();

  useEffect(() => {
    const loadConversationDetails = async () => {
      try {
        const details = await getConversationDetails(conversationId);
        if (details?.processingStatus) {
          setLastKnownStatus(details.processingStatus);
          setIsProcessing(details.processingStatus === 'pending' || details.processingStatus === 'processing');
        }
      } catch (e) {
        // ignore
      }
    };
    if (conversationId) loadConversationDetails();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
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
          // ignore
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

  const handleViewPDF = () => {
    setCurrentView('pdf');
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
  };

  const handleToggleSidebar = () => {
    if (showSidebar) {
      // Start closing animation
      setIsClosingSidebar(true);
      setTimeout(() => {
        setShowSidebar(false);
        setIsClosingSidebar(false);
      }, 300); // Match animation duration
    } else {
      setShowSidebar(true);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (currentView === 'pdf') {
    return (
      <>
        <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50">
          {/* PDF Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#C0C9EE" }}>
                  <FileText className="w-4 h-4 text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Document</h2>
              </div>
            </div>
            <button
              onClick={handleBackToChat}
              className="flex items-center gap-2 px-4 py-2 btn-primary rounded-xl hover:shadow-md transition-all duration-200 group"
            >
              <MessageCircle size={18} className="transition-transform duration-200 group-hover:scale-110" />
              <span className="text-sm font-medium">Chat</span>
            </button>
          </div>

          {/* Seamless Document Viewer */}
          <div className="flex-1 overflow-hidden">
            <SeamlessDocumentViewer conversationId={conversationId} pdfTitle={pdfTitle} />
          </div>
        </div>

                  {/* Mobile Sidebar Full Screen */}
          {showSidebar && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                onClick={handleToggleSidebar}
                style={{
                  animation: isClosingSidebar 
                    ? 'fade-out 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards'
                    : 'fade-in 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                }}
              />
              <div 
                className="fixed inset-0 z-50 bg-white"
                style={{
                  animation: isClosingSidebar 
                    ? 'slideOutSmooth 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards'
                    : 'slideInSmooth 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards',
                  transform: 'translate3d(0, 0, 0)',
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                }}
              >
                <Sidebar 
                  onClose={handleToggleSidebar} 
                  isMobile={true} 
                  onConversationUpdate={onConversationUpdate}
                  onConversationDelete={onConversationDelete}
                />
              </div>
            </>
          )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50">
        {/* Chat Panel with integrated header */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel 
            conversationId={conversationId} 
            pdfTitle={pdfTitle}
            onToggleSidebar={handleToggleSidebar}
            onViewPDF={handleViewPDF}
            showMobileControls={true}
          />
        </div>
      </div>

              {/* Mobile Sidebar Full Screen */}
        {showSidebar && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={handleToggleSidebar}
              style={{
                animation: isClosingSidebar 
                  ? 'fade-out 0.3s ease-out forwards'
                  : 'fade-in 0.3s ease-out forwards',
              }}
            />
            <div 
              className="fixed inset-0 z-50 bg-white"
              style={{
                animation: isClosingSidebar 
                  ? 'slideOutSmooth 0.3s ease-out forwards'
                  : 'slideInSmooth 0.3s ease-out forwards',
              }}
            >
              <Sidebar 
                onClose={handleToggleSidebar} 
                isMobile={true} 
                onConversationUpdate={onConversationUpdate}
                onConversationDelete={onConversationDelete}
              />
            </div>
          </>
        )}
    </>
  );
} 