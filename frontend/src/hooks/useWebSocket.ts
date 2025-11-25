import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  formattedText?: string;
  originalText?: string;
  contentType?: "text" | "html" | "markdown";
  isUser: boolean;
  timestamp: Date;
  processedAt?: Date;
  status?: "pending" | "processing" | "completed" | "failed";
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, message: string) => void;
  onConversationRenamed?: (callback: (data: { conversationId: string; newTitle: string }) => void) => void;
  onUserProfileUpdated?: (callback: (data: { userId: string; name?: string; avatar?: string; type: 'username' | 'avatar' }) => void) => void;
}

interface WebSocketEvents {
  'joined-conversation': (data: { conversationId: string }) => void;
  'message-processing-started': (data: { messageId: string; status: string }) => void;
  'ai-thinking': (data: { messageId: string; status: string }) => void;
  'ai-response-complete': (data: { messageId: string; assistantMessage: Message }) => void;
  'message-error': (data: { messageId: string; error: string }) => void;
  'pdf-processing-progress': (data: { progress: number }) => void;
  'pdf-processing-complete': (data: { status: string }) => void;
  'conversationRenamed': (data: { conversationId: string; newTitle: string }) => void;
  'userProfileUpdated': (data: { userId: string; name?: string; avatar?: string; type: 'username' | 'avatar' }) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    // Socket.IO connects directly to the domain (not /api) because nginx routes /socket.io directly
    const serverUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      (process.env.NEXT_PUBLIC_API_BASE ? 
                        process.env.NEXT_PUBLIC_API_BASE.replace('/api', '') : 
                        'http://localhost:5000');
    console.log('🔌 [WebSocket] Connecting to:', serverUrl);
    console.log('🔌 [WebSocket] Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      API_BASE: process.env.NEXT_PUBLIC_API_BASE
    });
    
    const newSocket = io(serverUrl, {
      withCredentials: true,
      autoConnect: true,
      transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
      upgrade: true,
      rememberUpgrade: false, // Don't remember upgrade to allow fallback
      timeout: 20000, // Increased timeout
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 10, // Increased attempts
      reconnectionDelay: 2000, // Increased delay
      reconnectionDelayMax: 10000, // Increased max delay
      path: '/socket.io/', // Explicit path
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 [WebSocket] Connected to server successfully!');
      console.log('🔌 [WebSocket] Socket ID:', newSocket.id);
      console.log('🔌 [WebSocket] Transport:', newSocket.io.engine.transport.name);
      setIsConnected(true);
      
      // Test event to verify connection
      newSocket.emit('test-connection', { message: 'Frontend connected' });
    });

    // Test response handler
    newSocket.on('test-response', (data) => {
      console.log('🧪 [WebSocket] Test response from backend:', data);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 [WebSocket] Disconnected from server:', reason);
      setIsConnected(false);
    });

    // Additional debugging events
    newSocket.on('connect_error', (error) => {
      console.error('❌ [WebSocket] Connection error:', error);
      console.error('❌ [WebSocket] Error details:', {
        message: error.message,
        description: (error as any).description,
        context: (error as any).context,
        type: (error as any).type,
        transport: (error as any).transport
      });
      setIsConnected(false);
      
      // Emit a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('websocket-error', { 
        detail: { error, timestamp: new Date() }
      }));
    });

    newSocket.io.on('error', (error) => {
      console.error('❌ [WebSocket] IO error:', error);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 [WebSocket] Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 [WebSocket] Reconnection attempt ${attemptNumber}`);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('❌ [WebSocket] Reconnection error:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 [WebSocket] Cleaning up socket connection');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      console.log(`🏠 [WebSocket] Joining conversation: ${conversationId}`);
      socketRef.current.emit('join-conversation', conversationId);
    } else {
      console.warn('⚠️ [WebSocket] Cannot join conversation - socket not connected');
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      console.log(`🚪 [WebSocket] Leaving conversation: ${conversationId}`);
      socketRef.current.emit('leave-conversation', conversationId);
    }
  }, []);

  const sendMessage = useCallback((conversationId: string, message: string) => {
    // We still use HTTP for sending messages to maintain existing flow
    // WebSocket will be used for receiving real-time updates
    console.log(`📤 [WebSocket] Message will be sent via HTTP API`);
  }, []);

  const onConversationRenamed = useCallback((callback: (data: { conversationId: string; newTitle: string }) => void) => {
    if (socketRef.current) {
      console.log('🎧 [WebSocket] Setting up conversationRenamed listener');
      
      // Remove any existing listeners to avoid duplicates
      socketRef.current.off('conversationRenamed');
      
      // Add the new listener directly to the socket
      const handleRename = (data: any) => {
        console.log('📨 [WebSocket] Received conversationRenamed event:', data);
        callback(data);
      };
      
      socketRef.current.on('conversationRenamed', handleRename);
      
      // Return cleanup function
      return () => {
        if (socketRef.current) {
          console.log('🧹 [WebSocket] Cleaning up conversationRenamed listener');
          socketRef.current.off('conversationRenamed', handleRename);
        }
      };
    } else {
      console.warn('⚠️ [WebSocket] Socket not available for conversationRenamed listener');
      
      // If socket isn't ready, set up the listener when it connects
      const setupListener = () => {
        if (socketRef.current) {
          console.log('🎧 [WebSocket] Setting up delayed conversationRenamed listener');
          const handleRename = (data: any) => {
            console.log('📨 [WebSocket] Received conversationRenamed event (delayed):', data);
            callback(data);
          };
          socketRef.current.on('conversationRenamed', handleRename);
        }
      };
      
      // Try again in a short delay
      setTimeout(setupListener, 1000);
    }
  }, []);

  const onUserProfileUpdated = useCallback((callback: (data: { userId: string; name?: string; avatar?: string; type: 'username' | 'avatar' }) => void) => {
    if (socketRef.current) {
      console.log('🎧 [WebSocket] Setting up userProfileUpdated listener');
      
      // Remove any existing listeners to avoid duplicates
      socketRef.current.off('userProfileUpdated');
      
      // Add the new listener directly to the socket
      const handleProfileUpdate = (data: any) => {
        console.log('📨 [WebSocket] Received userProfileUpdated event:', data);
        callback(data);
      };
      
      socketRef.current.on('userProfileUpdated', handleProfileUpdate);
      
      // Return cleanup function
      return () => {
        if (socketRef.current) {
          console.log('🧹 [WebSocket] Cleaning up userProfileUpdated listener');
          socketRef.current.off('userProfileUpdated', handleProfileUpdate);
        }
      };
    } else {
      console.warn('⚠️ [WebSocket] Socket not available for userProfileUpdated listener');
      
      // If socket isn't ready, set up the listener when it connects
      const setupListener = () => {
        if (socketRef.current) {
          console.log('🎧 [WebSocket] Setting up delayed userProfileUpdated listener');
          const handleProfileUpdate = (data: any) => {
            console.log('📨 [WebSocket] Received userProfileUpdated event (delayed):', data);
            callback(data);
          };
          socketRef.current.on('userProfileUpdated', handleProfileUpdate);
        }
      };
      
      // Try again in a short delay
      setTimeout(setupListener, 1000);
    }
  }, []);

  return {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    onConversationRenamed,
    onUserProfileUpdated,
  };
}