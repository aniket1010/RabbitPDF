"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PanelLeft, PanelRight, Plus, FileText, MessageSquare, Edit, Trash2, Settings, LogIn, LogOut, User } from 'lucide-react'
import { useRouter, usePathname } from "next/navigation"
import { getConversations, deleteConversation, renameConversation } from "@/services/api"
import ImprovedRenameDialog from "./RenameDialog"
import ImprovedDeleteDialog from "./DeleteConfirmDialog"
import SettingsDialog from "./SettingsDialog"
import { stripPdfExtension } from '@/lib/utils';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Conversation {
  id: string
  title: string
  fileName: string
  filePath: string
  createdAt: string
}

interface MinimalistSidebarProps {
  selectedConversation?: string | null
  onSelectConversation?: (id: string) => void
  onClose?: () => void
  isMobile?: boolean
  onConversationUpdate?: (conversationId: string, newTitle: string) => void
  onConversationDelete?: (conversationId: string) => void
}

// Collapsed User Section Component
function CollapsedUserSection({ 
  onSettingsClick, 
  userName 
}: { 
  onSettingsClick: () => void;
  userName?: string;
}) {
  const { data: session, status } = useSession();

  console.log('🔍 [Sidebar] Session check:', { status, hasSession: !!session, user: session?.user });

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-2">
        <button 
          className="p-1.5 rounded-md text-black/40"
          disabled
          title="Loading..."
        >
          <div className="animate-spin h-3.5 w-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        </button>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-2">
        {/* Settings Icon */}
        <button 
          onClick={onSettingsClick}
          className="p-1.5 rounded-md hover:bg-black/5 transition-all duration-200 ease-out text-black/40 hover:text-black/70"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
        {/* Sign Out Icon */}
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="p-1.5 rounded-md hover:bg-black/5 transition-all duration-200 ease-out text-black/40 hover:text-black/70"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Sign In Icon for guests */}
      <button 
        onClick={() => window.location.href = '/'}
        className="p-1.5 rounded-md hover:bg-black/5 transition-all duration-200 ease-out text-black"
        title="Sign in to chat with PDFs"
        aria-label="Sign In"
      >
        <LogIn className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// User Section Component with Authentication
function UserSection({ 
  onSettingsClick, 
  userName, 
  userEmail, 
  userImage 
}: { 
  onSettingsClick: () => void;
  userName: string;
  userEmail: string;
  userImage: string;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
          <div className="animate-spin h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-black/60">Loading...</p>
        </div>
        <button 
          onClick={onSettingsClick}
          className="p-1.5 rounded-md hover:bg-black/5 transition-all duration-200 ease-out text-black/40 hover:text-black/70"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="space-y-3">
        {/* User Info Row */}
        <div className="flex items-center gap-3 min-h-10">
          <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName || 'User'}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <User className="h-4 w-4 text-black/60 flex-shrink-0" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black truncate">{userName || 'User'}</p>
            <p className="text-xs text-black/50 truncate">{userEmail}</p>
          </div>
          <button 
            onClick={onSettingsClick}
            className="p-1.5 rounded-md hover:bg-black/5 transition-all duration-200 ease-out text-black/40 hover:text-black/70"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
        
        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 h-8 text-xs border-black/20 hover:bg-black hover:text-white transition-all duration-200 ease-out"
        >
          <LogOut className="h-3 w-3" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Guest User Row */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-black/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-black truncate">Guest User</p>
          <p className="text-xs text-black/50 truncate">Not signed in</p>
        </div>
        <Button
          onClick={() => signIn()}
          size="sm"
          className="flex items-center gap-2 h-8 text-xs bg-black hover:bg-black/90 text-white transition-all duration-200 ease-out flex-shrink-0"
        >
          <LogIn className="h-3 w-3" />
          Sign In
        </Button>
      </div>
    </div>
  );
}

export default function Sidebar({
  selectedConversation,
  onSelectConversation,
  onClose,
  isMobile,
  onConversationUpdate,
  onConversationDelete,
}: MinimalistSidebarProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { onConversationRenamed, onUserProfileUpdated } = useWebSocket()
  
  // Local state for user data to handle real-time updates
  const [currentUserName, setCurrentUserName] = useState<string>('')
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>('')
  
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; conversationId: string; title: string }>({
    open: false,
    conversationId: "",
    title: "",
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; conversationId: string; title: string }>({
    open: false,
    conversationId: "",
    title: "",
  })
  const [settingsDialog, setSettingsDialog] = useState<{ open: boolean }>({
    open: false,
  })
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})
  const [isClient, setIsClient] = useState(false)
  
  // Get session data
  const { data: session, status } = useSession()

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Sync session data to local state
  useEffect(() => {
    if (session?.user) {
      setCurrentUserName(session.user.name || '')
      // Prioritize custom avatar over OAuth profile picture
      setCurrentUserAvatar(session.user.avatar || session.user.image || '')
    }
  }, [session?.user])

  // Simple sidebar width management
  useEffect(() => {
    const sidebarWidth = isMobile ? "0px" : isExpanded ? "320px" : "64px"
    document.documentElement.style.setProperty("--sidebar-width", sidebarWidth)
  }, [isExpanded, isMobile])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty("--sidebar-width")
    }
  }, [])

  // Only set activeConversationId if the conversation actually exists in the user's conversation list
  const urlConversationId = pathname.startsWith("/conversation/") ? pathname.split("/")[2] : null
  const activeConversationId = selectedConversation || 
    (urlConversationId && conversations.some(conv => conv.id === urlConversationId) ? urlConversationId : null)

  useEffect(() => {
    // Only load conversations if user is signed in
    if (session?.user) {
      loadConversations()
    } else {
      // For guest users, clear conversations and set loading to false
      setConversations([])
      setLoading(false)
    }
  }, [session?.user])

  // Redirect to home if user is on an invalid conversation URL or if signed out
  useEffect(() => {
    // If user is signed out and on a conversation page, redirect to home
    if (!session?.user && urlConversationId) {
      console.log('🔄 [Sidebar] Redirecting signed-out user to home from conversation page');
      router.push('/');
      return;
    }
    
    // Only check after conversations have loaded (not during loading state) and user is signed in
    if (!loading && session?.user && urlConversationId && !conversations.some(conv => conv.id === urlConversationId)) {
      console.log('🔄 [Sidebar] Redirecting to home - conversation not found:', urlConversationId);
      router.push('/');
    }
  }, [loading, urlConversationId, conversations, router, session?.user]);

  // Set up WebSocket listener for conversation renames
  useEffect(() => {
    if (onConversationRenamed) {
      const cleanup = onConversationRenamed((data) => {
        console.log('🔄 [Sidebar] Received conversation renamed:', data);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === data.conversationId ? { ...conv, title: data.newTitle } : conv
          )
        );
        
        // Also notify parent component
        if (onConversationUpdate) {
          onConversationUpdate(data.conversationId, data.newTitle);
        }
      });

      return cleanup;
    }
  }, [onConversationRenamed, onConversationUpdate]);

  // Set up WebSocket listener for user profile updates
  useEffect(() => {
    if (onUserProfileUpdated) {
      const cleanup = onUserProfileUpdated((data) => {
        console.log('🔄 [Sidebar] Received user profile update:', data);
        
        // Update local state based on the update type
        if (data.type === 'username' && data.name) {
          setCurrentUserName(data.name);
          console.log('🔄 [Sidebar] Updated local username to:', data.name);
        }
        if (data.type === 'avatar' && data.avatar) {
          setCurrentUserAvatar(data.avatar);
          console.log('🔄 [Sidebar] Updated local avatar to:', data.avatar);
        }
      });

      return cleanup;
    }
  }, [onUserProfileUpdated]);

  const loadConversations = async () => {
    // Don't load conversations if user is not signed in
    if (!session?.user) {
      setConversations([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getConversations()
      setConversations(data)
    } catch (err) {
      console.error("Failed to load conversations:", err)
      setError("Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }

  const handleConversationSelect = (conversationId: string) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId)
    } else {
      router.push(`/conversation/${conversationId}`)
    }
  }

  const handleNewChat = () => {
    // If user is not signed in, redirect to sign in
    if (!session?.user) {
      signIn()
      return
    }

    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.style.display = 'none';
    
    // Add event listener for file selection
    fileInput.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        try {
          // Import the upload function dynamically to avoid SSR issues
          const { uploadPDF } = await import('@/services/api');
          
          // Upload the file - this now returns immediately with conversationId
          const response = await uploadPDF(file);
          
          // Navigate to the new conversation immediately
          // The conversation page will handle showing the processing status
          router.push(`/conversation/${response.conversationId}`);
          
          // Reload conversations list
          loadConversations();
          
        } catch (error) {
          console.error('Failed to upload PDF:', error);
          // You could add a toast notification here
          alert('Failed to upload PDF. Please try again.');
        }
      }
      
      // Clean up the file input
      document.body.removeChild(fileInput);
    });
    
    // Add to DOM and trigger click
    document.body.appendChild(fileInput);
    fileInput.click();
  }

  const handleRenameClick = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setRenameDialog({
      open: true,
      conversationId: conversation.id,
      title: stripPdfExtension(conversation.title),
    })
  }

  const handleDeleteClick = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteDialog({
      open: true,
      conversationId: conversation.id,
      title: stripPdfExtension(conversation.title),
    })
  }

  const handleRename = async (newTitle: string) => {
    if (!renameDialog.conversationId) return

    setActionLoading((prev) => ({ ...prev, [renameDialog.conversationId]: true }))

    try {
      await renameConversation(renameDialog.conversationId, newTitle)

      // Remove local state update - WebSocket will handle it
      // setConversations((prev) =>
      //   prev.map((conv) => (conv.id === renameDialog.conversationId ? { ...conv, title: newTitle } : conv)),
      // )

      // Notify parent component - this will be handled by WebSocket listener
      // if (onConversationUpdate) {
      //   onConversationUpdate(renameDialog.conversationId, newTitle)
      // }

      setRenameDialog({ open: false, conversationId: "", title: "" })
    } catch (err) {
      console.error("Failed to rename conversation:", err)
      setError("Failed to rename conversation. Please try again.")
    } finally {
      setActionLoading((prev) => ({ ...prev, [renameDialog.conversationId]: false }))
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.conversationId) return

    setActionLoading((prev) => ({ ...prev, [deleteDialog.conversationId]: true }))

    try {
      await deleteConversation(deleteDialog.conversationId)

      // Update local state
      setConversations((prev) => prev.filter((conv) => conv.id !== deleteDialog.conversationId))

      // Notify parent component
      if (onConversationDelete) {
        onConversationDelete(deleteDialog.conversationId)
      }

      setDeleteDialog({ open: false, conversationId: "", title: "" })

      // If we deleted the currently selected conversation, redirect to home
      if (deleteDialog.conversationId === activeConversationId) {
        router.push("/")
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err)
      setError("Failed to delete conversation. Please try again.")
    } finally {
      setActionLoading((prev) => ({ ...prev, [deleteDialog.conversationId]: false }))
    }
  }

  const handleSettingsClick = () => {
    setSettingsDialog({ open: true })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    
    // Use a stable format to prevent hydration mismatches
    // Only calculate relative dates on client side after hydration
    if (!isClient) {
      // Server-side or before hydration: use stable format
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
    
    // Client-side after hydration: can use relative dates
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div
      className="bg-[#F6F5F2] border-r border-black/10 flex flex-col h-full shadow-sm"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: isMobile ? "100%" : "320px",
        transform: isMobile ? "translateX(0)" : isExpanded ? "translateX(0)" : "translateX(-256px)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: isMobile ? 50 : 40,
        overflow: "hidden",
        willChange: "transform",
      }}
    >
      {/* Header */}
      <div className="border-b border-black/10 p-6 relative">
        {/* Expanded content */}
        <div
          className="flex items-center justify-between"
          style={{
            opacity: isExpanded ? 1 : 0,
            visibility: isExpanded ? "visible" : "hidden",
            transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
            transitionDelay: isExpanded ? "0.1s" : "0s",
          }}
        >
          <div
            className="cursor-pointer transition-all duration-200 ease-out hover:opacity-90"
            onClick={() => router.push("/")}
          >
            <h1 className="text-2xl font-bold text-black mb-1 tracking-tight">ChatPDF</h1>
            <p className="text-xs text-black/60 font-medium">Document Intelligence</p>
          </div>
          <button
            className="w-10 h-10 rounded-lg hover:bg-black/5 transition-all duration-200 ease-out flex items-center justify-center text-black/70 hover:text-black"
            onClick={isMobile && onClose ? onClose : () => setIsExpanded(!isExpanded)}
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="h-5 w-5 transition-transform duration-200 ease-out" />
          </button>
        </div>

        {/* Collapsed content */}
        <div
          className="absolute top-6 flex items-center justify-center w-10 h-10"
          style={{
            right: "12px",
            opacity: isExpanded ? 0 : 1,
            visibility: isExpanded ? "hidden" : "visible",
            transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
            transitionDelay: isExpanded ? "0s" : "0.1s",
          }}
        >
          <button
            className="w-10 h-10 rounded-lg hover:bg-black/5 transition-all duration-200 ease-out flex items-center justify-center text-black/70 hover:text-black"
            onClick={isMobile && onClose ? onClose : () => setIsExpanded(!isExpanded)}
            aria-label="Expand sidebar"
          >
            <PanelRight className="h-5 w-5 transition-transform duration-200 ease-out" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-h-0">
        {/* Expanded Content */}
        <div
          className="flex flex-col h-full"
          style={{
            opacity: isExpanded ? 1 : 0,
            visibility: isExpanded ? "visible" : "hidden",
            transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
            transitionDelay: isExpanded ? "0.1s" : "0s",
          }}
        >
          {/* New Chat Button - Only for signed-in users */}
          {session?.user && (
            <div className="p-6 pb-4 flex-shrink-0">
              <Button
                onClick={handleNewChat}
                className="w-full h-11 rounded-xl font-medium transition-all duration-200 ease-out hover:shadow-md transform hover:translate-y-[-1px] active:translate-y-0 bg-black hover:bg-black/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          )}

          {/* Recent Chats Header */}
          <div className="px-6 pt-6 pb-6 flex-shrink-0 border-t border-black/10">
            <h2 className="text-sm font-semibold text-black/80">
              {session?.user ? "Recent Chats" : "Your Chats"}
            </h2>
          </div>

          {/* Conversations List - Fixed height with scroll */}
          <div className="flex-1 min-h-0 px-6 pb-6">
            <ScrollArea className="h-full [&_.scrollbar]:bg-black/10 [&_.scrollbar]:hover:bg-black/20 [&_.scrollbar-thumb]:bg-black/30 [&_.scrollbar-thumb]:hover:bg-black/50">
              <div className="space-y-1">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl animate-pulse"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="h-4 bg-black/10 rounded mb-2"></div>
                      <div className="h-3 bg-black/5 rounded w-20"></div>
                    </div>
                  ))
                ) : error ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadConversations}
                      className="border-black/20 hover:bg-black hover:text-white transition-all duration-200 ease-out bg-transparent"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`w-full rounded-xl transition-all duration-200 ease-out group hover:translate-y-[-1px] active:translate-y-0 ${
                        conversation.id === activeConversationId
                          ? "bg-[#C0C9EE] shadow-sm"
                          : "hover:bg-black/5 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3 p-4">
                        <div className="mt-0.5 flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-black/60 transition-colors duration-200 group-hover:text-black/80" />
                        </div>
                        <button
                          className="flex-1 min-w-0 text-left"
                          onClick={() => handleConversationSelect(conversation.id)}
                        >
                          <h3 className="font-medium text-black text-sm truncate mb-1">{stripPdfExtension(conversation.title)}</h3>
                          <p className="text-xs text-black/60">{formatDate(conversation.createdAt)}</p>
                        </button>
                       <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            className="p-1.5 rounded-md hover:bg-black/10 transition-all duration-200 ease-out text-black/60 hover:text-black/90"
                            onClick={(e) => handleRenameClick(conversation, e)}
                            title="Rename conversation"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-md hover:bg-red-50 transition-all duration-200 ease-out text-black/60 hover:text-red-600"
                            onClick={(e) => handleDeleteClick(conversation, e)}
                            title="Delete conversation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-6 w-6 text-black/30" />
                    </div>
                    {session?.user ? (
                      <>
                        <p className="text-sm font-medium text-black/60 mb-1">No conversations yet</p>
                        <p className="text-xs text-black/40">Upload a PDF to get started</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-black/60 mb-1">Sign in to view chats</p>
                        <p className="text-xs text-black/40">Your conversations will appear here</p>
                        <Button
                          onClick={() => signIn()}
                          variant="outline"
                          size="sm"
                          className="mt-3 border-black/20 hover:bg-black hover:text-white transition-all duration-200 ease-out bg-transparent"
                        >
                          Sign In to Start
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Collapsed Content */}
        <div
          className="absolute top-0 right-0 w-16 h-full flex flex-col"
          style={{
            opacity: isExpanded ? 0 : 1,
            visibility: isExpanded ? "hidden" : "visible",
            transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
            transitionDelay: isExpanded ? "0s" : "0.1s",
          }}
        >
          {/* Collapsed Conversations - Fixed height with scroll */}
          <div className="flex-1 min-h-0 p-3 pt-6">
            <ScrollArea className="h-full [&_.scrollbar]:bg-black/10 [&_.scrollbar]:hover:bg-black/20 [&_.scrollbar-thumb]:bg-black/30 [&_.scrollbar-thumb]:hover:bg-black/50">
              <div className="space-y-2">
                {!session?.user ? (
                  // Guest user - no visual indicator in collapsed view
                  null
                ) : loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 bg-black/10 rounded-lg animate-pulse"
                      style={{ animationDelay: `${index * 50}ms` }}
                    ></div>
                  ))
                ) : error ? (
                  <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                    <span className="text-red-500 text-xs font-bold">!</span>
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={`w-10 h-10 rounded-lg transition-all duration-200 ease-out flex items-center justify-center transform hover:translate-y-[-1px] active:translate-y-0 ${
                        conversation.id === activeConversationId
                          ? "bg-[#C0C9EE] text-black shadow-sm"
                          : "bg-black/5 hover:bg-black/10 text-black/70 hover:shadow-sm"
                      }`}
                      onClick={() => handleConversationSelect(conversation.id)}
                      title={stripPdfExtension(conversation.title)}
                    >
                      <FileText className="h-4 w-4 transition-colors duration-200" />
                    </button>
                  ))
                ) : (
                  // Empty state - no visual indicator needed in collapsed view
                  null
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* User Details Section - Expanded State */}
      <div 
        className="border-t border-black/10 p-4 flex-shrink-0"
        style={{
          opacity: isExpanded ? 1 : 0,
          visibility: isExpanded ? "visible" : "hidden",
          transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
          transitionDelay: isExpanded ? "0.1s" : "0s",
        }}
      >
        <UserSection 
          onSettingsClick={handleSettingsClick}
          userName={currentUserName}
          userEmail={session?.user?.email || ''}
          userImage={currentUserAvatar}
        />
      </div>

      {/* Collapsed Settings Icon - Fixed positioning to match expanded state */}
      <div 
        className="absolute bottom-0 right-0 w-16 border-t border-black/10 p-4 flex-shrink-0"
        style={{
          opacity: isExpanded ? 0 : 1,
          visibility: isExpanded ? "hidden" : "visible",
          transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
          transitionDelay: isExpanded ? "0s" : "0.1s",
        }}
      >
        <CollapsedUserSection 
          onSettingsClick={handleSettingsClick}
          userName={currentUserName}
        />
      </div>

      {/* Rename Dialog */}
      <ImprovedRenameDialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog((prev) => ({ ...prev, open }))}
        currentTitle={renameDialog.title}
        onRename={handleRename}
        isLoading={actionLoading[renameDialog.conversationId]}
      />

      {/* Delete Confirmation Dialog */}
      <ImprovedDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        title={deleteDialog.title}
        onConfirm={handleDelete}
        isLoading={actionLoading[deleteDialog.conversationId]}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsDialog.open}
        onOpenChange={(open) => setSettingsDialog({ open })}
      />
    </div>
  )
}