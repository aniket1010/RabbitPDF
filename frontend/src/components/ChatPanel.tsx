"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Send, Bot, User, Menu, File } from "lucide-react"

import { getConversationMessages, sendChatMessage, getConversationDetails } from "@/services/api"
import HtmlRenderer from "./HtmlRenderer"
import { stripPdfExtension } from "@/lib/utils"
import { useWebSocket } from "@/hooks/useWebSocket"

interface Message {
  id: string
  text: string
  formattedText?: string
  originalText?: string
  contentType?: "text" | "html" | "markdown"
  isUser: boolean
  timestamp: Date
  processedAt?: Date
  status?: "pending" | "processing" | "completed" | "failed"
}

interface ChatPanelProps {
  conversationId: string
  pdfTitle?: string
  onToggleSidebar?: () => void
  onViewPDF?: () => void
  onReferenceClick?: (pageNumber: number) => void
  showMobileControls?: boolean
  onTitleUpdate?: (newTitle: string) => void
}

export default function ChatPanel({
  conversationId,
  pdfTitle,
  onToggleSidebar,
  onViewPDF,
  onReferenceClick,
  showMobileControls,
  onTitleUpdate,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTitle, setCurrentTitle] = useState(pdfTitle)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const httpAssistantFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasPending = messages.some(m => m.isUser && m.status === 'pending')
  const [isPdfProcessing, setIsPdfProcessing] = useState<boolean>(false)
  const [hasUserSentDuringProcessing, setHasUserSentDuringProcessing] = useState<boolean>(false)

  console.log('💬 [ChatPanel] Rendering with conversationId:', conversationId, 'pdfTitle:', pdfTitle);

  // Consistent subtle dotted circular spinner
  const Spinner = ({ size = 'md', color = '#111827' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) => {
    const px = size === 'sm' ? 16 : size === 'lg' ? 28 : 20
    return (
      <div
        className="rounded-full animate-spin"
        style={{
          width: px,
          height: px,
          borderWidth: 2,
          borderStyle: 'dotted',
          borderColor: color,
          borderTopColor: 'transparent',
        }}
      />
    )
  }

  // WebSocket hook
  const { socket, isConnected, joinConversation, leaveConversation, onConversationRenamed } = useWebSocket()

  // Update title when prop changes
  useEffect(() => {
    setCurrentTitle(pdfTitle)
  }, [pdfTitle])

  // Initial processing status check per conversation
  useEffect(() => {
    const loadStatus = async () => {
      try {
        if (!conversationId) return
        const details = await getConversationDetails(conversationId)
        const status = String(details?.processingStatus || '').toLowerCase()
        setIsPdfProcessing(status === 'pending' || status === 'processing')
        setHasUserSentDuringProcessing(false)
      } catch {}
    }
    loadStatus()
  }, [conversationId])

  // Listen for conversation rename events
  useEffect(() => {
    if (onConversationRenamed) {
      const cleanup = onConversationRenamed((data) => {
        if (data.conversationId === conversationId) {
          console.log('🔄 [ChatPanel] Conversation title updated:', data.newTitle);
          setCurrentTitle(data.newTitle);
          if (onTitleUpdate) {
            onTitleUpdate(data.newTitle);
          }
        }
      });

      return cleanup;
    }
  }, [onConversationRenamed, conversationId, onTitleUpdate]);

  // WebSocket event handlers
  useEffect(() => {
    if (!socket || !conversationId) return

    console.log(`🔌 [WebSocket] Setting up event listeners for conversation ${conversationId}`)

    // Wait for socket to be connected before joining conversation
    const setupConversation = () => {
      if (socket.connected) {
        console.log(`🔌 [WebSocket] Socket connected, joining conversation ${conversationId}`)
        joinConversation(conversationId)
      } else {
        console.log(`🔌 [WebSocket] Socket not connected yet, waiting...`)
        socket.once('connect', () => {
          console.log(`🔌 [WebSocket] Socket connected, now joining conversation ${conversationId}`)
          joinConversation(conversationId)
        })
      }
    }

    setupConversation()

    // Listen for processing events
    const handleProcessingStarted = (data: any) => {
      console.log('📤 [WebSocket] Message processing started:', data)
      setIsAnalyzing(true)
    }

    const handleAIThinking = (data: any) => {
      console.log('🤔 [WebSocket] AI is thinking:', data)
      setIsAnalyzing(true)
    }

    const handleAIResponseComplete = (data: any) => {
      console.log('✅ [WebSocket] AI response complete:', data)
      
      // Cancel any HTTP fallback timer if it exists
      if (httpAssistantFallbackRef.current) {
        clearTimeout(httpAssistantFallbackRef.current)
        httpAssistantFallbackRef.current = null
      }
      
      // Add the AI response to messages
      const assistantMessage = {
        ...data.assistantMessage,
        timestamp: new Date(data.assistantMessage.timestamp),
        processedAt: data.assistantMessage.processedAt ? new Date(data.assistantMessage.processedAt) : undefined
      }
      
      setMessages(prev => {
        const exists = prev.some(m => m.id === assistantMessage.id)
        if (exists) return prev
        
        // Prefer exact mapping using messageId provided by backend
        const updatedMessages = (data.messageId
          ? prev.map(msg => {
              if (msg.id === data.messageId && msg.status === 'pending') {
                console.log(`🔄 [WebSocket] Updating user message ${msg.id} from pending to completed`)
                return { ...msg, status: 'completed' as const }
              }
              return msg
            })
          : prev
        ).map(msg => {
          // Fallback: if any pending messages remain and no messageId matched, mark the oldest pending as completed
          if (data.messageId) return msg
          if (msg.status === 'pending' && msg.isUser) {
            console.log(`🔄 [WebSocket] Fallback update pending user message ${msg.id} to completed`)
            return { ...msg, status: 'completed' as const }
          }
          return msg
        })
        
        const newMessages = [...updatedMessages, assistantMessage]
        
        // Only stop analyzing if there are no more pending messages
        const stillHasPending = newMessages.some(msg => msg.status === 'pending')
        if (!stillHasPending) {
          console.log('🔄 [WebSocket] No more pending messages, stopping analysis indicator')
          setIsAnalyzing(false)
        } else {
          console.log(`🔄 [WebSocket] Still have ${newMessages.filter(msg => msg.status === 'pending').length} pending messages, keeping analysis indicator`)
        }
        
        return newMessages
      })
    }

    const handleMessageError = (data: any) => {
      console.error('❌ [WebSocket] Message error:', data)
      setIsAnalyzing(false)
      setError(`Error processing message: ${data.error}`)
    }

    const handleUserMessageUpdate = (data: any) => {
      console.log('📝 [WebSocket] User message update:', data)
      // Update user message with server data if needed
      setMessages(prev => 
        prev.map(msg => 
          msg.id.startsWith('user-temp-') && msg.text === data.userMessage.originalText
            ? {
                ...data.userMessage,
                timestamp: new Date(data.userMessage.timestamp),
                processedAt: data.userMessage.processedAt ? new Date(data.userMessage.processedAt) : undefined
              }
            : msg
        )
      )
    }

    const handlePDFProcessingProgress = (data: any) => {
      console.log('📄 [WebSocket] PDF processing progress:', data.progress)
    }

    const handlePDFProcessingComplete = (data: any) => {
      console.log('✅ [WebSocket] PDF processing complete')
      
      setIsPdfProcessing(false)
      setHasUserSentDuringProcessing(false)
      
      // Check if we have pending messages that will now be processed
      const pendingCount = messages.filter(m => m.status === 'pending').length
      if (pendingCount > 0) {
        console.log(`🔄 [WebSocket] PDF processing complete, ${pendingCount} pending messages will be processed`)
        setIsAnalyzing(true) // Keep the loader going for pending message processing
      }
      
      // Refresh messages to get any newly processed pending messages
      loadMessages()

      // Do not trigger server-side processing from client; server will handle it.
    }

    const handlePendingMessagesProcessed = (data: any) => {
      console.log('✅ [WebSocket] Pending messages processed:', data)
      // Individual ai-response-complete events should handle the updates
    }

    const handleJoinedConversation = (data: any) => {
      console.log('🏠 [WebSocket] Successfully joined conversation:', data.conversationId)
      // Load messages when we successfully join the conversation
      loadMessages()
    }

    // Attach event listeners
    socket.on('joined-conversation', handleJoinedConversation)
    socket.on('message-processing-started', handleProcessingStarted)
    socket.on('ai-thinking', handleAIThinking)
    socket.on('ai-response-complete', handleAIResponseComplete)
    socket.on('message-error', handleMessageError)
    socket.on('user-message-update', handleUserMessageUpdate)
    socket.on('pdf-processing-progress', handlePDFProcessingProgress)
    socket.on('pdf-processing-complete', handlePDFProcessingComplete)
    socket.on('pending-messages-processed', handlePendingMessagesProcessed)

    // Cleanup function
    return () => {
      console.log(`🔌 [WebSocket] Cleaning up event listeners for conversation ${conversationId}`)
      leaveConversation(conversationId)
      
      socket.off('joined-conversation', handleJoinedConversation)
      socket.off('message-processing-started', handleProcessingStarted)
      socket.off('ai-thinking', handleAIThinking)  
      socket.off('ai-response-complete', handleAIResponseComplete)
      socket.off('message-error', handleMessageError)
      socket.off('user-message-update', handleUserMessageUpdate)
      socket.off('pdf-processing-progress', handlePDFProcessingProgress)
      socket.off('pdf-processing-complete', handlePDFProcessingComplete)
      socket.off('pending-messages-processed', handlePendingMessagesProcessed)
      if (httpAssistantFallbackRef.current) {
        clearTimeout(httpAssistantFallbackRef.current)
        httpAssistantFallbackRef.current = null
      }
    }
  }, [socket, conversationId, joinConversation, leaveConversation])

  // Connection status indicator
  useEffect(() => {
    if (isConnected) {
      console.log('🔌 [WebSocket] Connected - real-time updates enabled')
    } else {
      console.log('🔌 [WebSocket] Disconnected - falling back to manual refresh')
    }
  }, [isConnected])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Poll messages while there are pending user messages (read-only refresh)
  useEffect(() => {
    if (!conversationId) return
    if (!hasPending) return
    const interval = setInterval(async () => {
      try {
        const details = await getConversationDetails(conversationId)
        const status = String(details?.processingStatus || '').toLowerCase()
        const processing = status === 'pending' || status === 'processing'
        setIsPdfProcessing(processing)
        await loadMessages()
      } catch {
        // ignore transient errors
      }
    }, 1800)
    return () => clearInterval(interval as unknown as number)
  }, [conversationId, hasPending])

  const loadMessages = useCallback(async () => {
    if (!conversationId) return
    console.log('Loading messages for conversation:', conversationId)
    setIsLoading(true)
    setError(null)
    try {
      const fetchedMessagesRaw = await getConversationMessages(conversationId)
      console.log('Raw messages received:', fetchedMessagesRaw)
      if (Array.isArray(fetchedMessagesRaw)) {
        const fetchedMessages = fetchedMessagesRaw.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          processedAt: msg.processedAt ? new Date(msg.processedAt) : undefined,
        }))
        console.log('Processed messages:', fetchedMessages)
        setMessages(fetchedMessages)
      } else {
        console.error("API did not return an array of messages:", fetchedMessagesRaw)
        setError("Failed to load conversation due to invalid data.")
      }
    } catch (err) {
      console.error("Failed to load messages:", err)
      setError("Failed to load messages. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    // Reset state for new conversation
    setIsAnalyzing(false)
    setError(null)
    
    if (conversationId) {
      loadMessages()
    }
  }, [conversationId, loadMessages]) // Include loadMessages in dependencies

  const handleSendMessage = async (messageText?: string) => {
    const text = (messageText || inputMessage).trim()
    if (text && !isLoading) {
      if (isPdfProcessing) setHasUserSentDuringProcessing(true)
      setInputMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
      const tempId = `user-temp-${Date.now()}`
      const userMessage: Message = {
        id: tempId,
        text,
        isUser: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setIsAnalyzing(true) // Will be managed by WebSocket events
      try {
        // Send the message via HTTP API
        const response = await sendChatMessage(conversationId, text)
        
        // Only update the user message with server data
        // Prefer WebSocket for assistant responses; but add robust HTTP fallback
        if (response.isUser) {
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === tempId 
                ? { 
                    ...response, 
                    timestamp: new Date(response.timestamp),
                    processedAt: response.processedAt ? new Date(response.processedAt) : undefined
                  }
                : msg
            )
          )
          console.log('📤 [ChatPanel] User message updated, waiting for WebSocket AI response...')
          
          // Set up HTTP fallback timer if WebSocket fails
          httpAssistantFallbackRef.current = setTimeout(async () => {
            console.log('⏰ [ChatPanel] WebSocket timeout, trying HTTP fallback...')
            try {
              // Reload messages to get any assistant response via HTTP
              await loadMessages()
              setIsAnalyzing(false)
              console.log('📤 [ChatPanel] HTTP fallback completed')
            } catch (error) {
              console.error('❌ [ChatPanel] HTTP fallback failed:', error)
              setError('Failed to get response. Please try again.')
              setIsAnalyzing(false)
            }
          }, isConnected ? 15000 : 5000) // Longer timeout if WebSocket is connected
        } else {
          // Assistant message was returned via HTTP (synchronous path).
          // Immediately render it to avoid waiting for WebSocket delivery.
          const addAssistantFromHttp = () => {
            const assistantFromHttp = {
              ...response,
              timestamp: new Date(response.timestamp),
              processedAt: response.processedAt ? new Date(response.processedAt) : undefined,
            }
            setMessages((prev) => {
              const exists = prev.some(m => m.id === assistantFromHttp.id)
              return exists ? prev : [...prev, assistantFromHttp]
            })
            setIsAnalyzing(false)
            console.log('📤 [ChatPanel] Used HTTP fallback for assistant message')
          }

          // Always add immediately; if the WS event also arrives later, the duplicate guard above prevents double-add.
          addAssistantFromHttp()
          // Ensure the temp user message has a stable id
          setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, id: `user-${Date.now()}` } : msg)))
        }
      } catch (err) {
        console.error("Failed to send message:", err)
        setError("Failed to send message. Please try again.")
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
        setIsAnalyzing(false)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
  }

  // Subtle accent shimmer bar (used in processing notice)
  const ShimmerBar = () => {
    return (
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
        <div
          className="absolute inset-y-0 left-0 w-1/2"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(192,201,238,0.15), rgba(192,201,238,0.7), rgba(192,201,238,0.15))",
            animation: "shimmer 1.4s ease-in-out infinite",
          }}
        />
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @media (prefers-reduced-motion: reduce) {
            div[style] { animation: none !important; }
          }
        `}</style>
      </div>
    )
  }

  // Refined three-dot typing loader for analyzing state
  const TypingDotsLoader = ({ size = 'md', color = '#000000' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) => {
    const dot = size === 'sm' ? 6 : size === 'lg' ? 10 : 8
    const gap = size === 'sm' ? 4 : size === 'lg' ? 6 : 5
    return (
      <div className="flex items-center" style={{ gap }} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: dot,
              height: dot,
              backgroundColor: color,
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'td-bounce 1.3s ease-in-out infinite',
              animationDelay: `${i * 120}ms`,
              opacity: 0.9,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes td-bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: .55; }
            40% { transform: translateY(-3px); opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            span[style] { animation: none !important; opacity: .7; }
          }
        `}</style>
      </div>
    )
  }

  // Inline processing notice (non-overlay), professional styling
  const ProcessingNotice = () => {
    return (
      <div className="flex items-start gap-3 bg-white px-3 py-2 rounded-2xl rounded-tl-md shadow-sm border border-black/5">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md"
          style={{ backgroundColor: "#C0C9EE" }}
        >
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-black/80">Preparing your document</div>
          <div className="mt-0.5 text-xs text-black/60">
            We’re extracting and indexing it. You can ask now — we’ll reply as soon as it’s ready.
          </div>
          <div className="mt-2">
            <ShimmerBar />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full h-screen flex flex-col bg-white"
      style={{
        contain: "layout style paint size",
        isolation: "isolate",
      }}
    >
      {/* Enhanced Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white/80 backdrop-blur-sm border-b border-black/10 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {showMobileControls && onToggleSidebar && (
              <button 
                onClick={onToggleSidebar} 
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open sidebar"
                title="Open sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="relative">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "#C0C9EE" }}
              >
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-black/60 uppercase tracking-wider">AI Assistant</h3>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-black truncate">
                {currentTitle ? stripPdfExtension(currentTitle) : "Document Analysis"}
              </h2>
            </div>
          </div>
          {showMobileControls && onViewPDF && (
            <button
              onClick={onViewPDF}
              className="flex items-center gap-2 px-4 py-3 btn-secondary rounded-xl hover:shadow-md transition-all duration-200 group touch-manipulation min-h-[44px]"
              aria-label="View PDF document"
              title="View PDF document"
            >
              <File className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-sm font-medium hidden xs:inline">View PDF</span>
              <span className="text-sm font-medium xs:hidden">PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {isPdfProcessing && (
          <div className="animate-fade-in">
            <ProcessingNotice />
          </div>
        )}
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className="flex items-center justify-center mb-4">
                <Spinner size="lg" />
              </div>
              <p className="text-black/70 font-medium">Loading conversation...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-red-500 text-2xl">⚠</span>
              </div>
              <p className="text-red-600 mb-6 font-semibold text-lg">{error}</p>
              <button
                onClick={loadMessages}
                className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-black/90 transition-colors shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.isUser ? "items-end" : "items-start"} animate-slide-up w-full`}
              >
                <div
                  className={`flex items-start gap-2 sm:gap-3 ${message.isUser ? "flex-row-reverse" : "flex-row"} w-full max-w-full`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                      message.isUser ? "bg-black" : ""
                    }`}
                    style={!message.isUser ? { backgroundColor: "#C0C9EE" } : {}}
                  >
                    {message.isUser ? (
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                    )}
                  </div>
                  <div
                    className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl shadow-sm min-w-0 ${
                      message.isUser ? "bg-black text-white rounded-tr-md" : "rounded-tl-md border border-black/5"
                    }`}
                    style={{
                      maxWidth: "min(calc(100vw - 120px), 600px)",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      overflow: "hidden",
                      ...(!message.isUser ? { backgroundColor: "#F6F5F2", color: "black" } : {}),
                    }}
                  >
                    <div
                      className="text-sm leading-relaxed font-medium w-full"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        overflow: "hidden",
                        hyphens: "auto",
                      }}
                    >
                      {message.isUser ? (
                        <HtmlRenderer
                          content={message.text}
                          contentType={message.contentType || "text"}
                          isUserMessage={message.isUser}
                          isMobileView={showMobileControls}
                        />
                      ) : (
                        <HtmlRenderer
                          content={message.formattedText || message.text}
                          contentType={message.contentType === "markdown" ? "html" : (message.contentType || "html")}
                          onReferenceClick={onReferenceClick}
                          isMobileView={showMobileControls}
                        />
                      )}
                    </div>
                  </div>
                  {message.isUser && message.status === 'pending' && (
                    <span className="ml-2 px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 self-center">
                      Queued
                    </span>
                  )}
                </div>
                <div className={`text-xs text-black/50 mt-1 ${message.isUser ? "mr-8 sm:mr-11" : "ml-8 sm:ml-11"}`}>
                  {message.timestamp instanceof Date
                    ? message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
            {isAnalyzing && messages.length > 0 && messages[messages.length - 1]?.isUser && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: "#C0C9EE" }}
                  >
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                  <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-md shadow-lg border border-black/5">
                    <div className="flex items-center gap-3" role="status" aria-live="polite" aria-label="Analyzing">
                      <TypingDotsLoader size="md" />
                      <span className="text-sm text-black/70 font-medium">Analyzing…</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
        {/* Removed overlay; inline notice above replaces it */}
      </div>

      {/* Enhanced Input Area */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white/80 backdrop-blur-sm border-t border-black/10 flex-shrink-0">
        <div className="flex items-end space-x-3 sm:space-x-4">
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your document..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-black/10 rounded-2xl bg-white text-black placeholder-black/50 focus:outline-none focus:border-black/30 resize-none text-sm transition-all duration-200 font-medium shadow-sm"
              rows={1}
              disabled={false}
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-black text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group shadow-lg hover:bg-black/90 transition-all duration-200 flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
