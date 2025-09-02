"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, MessageSquare, Edit, Trash2, Settings, LogIn, LogOut, User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { getConversations, deleteConversation, renameConversation } from "@/services/api"
import ImprovedRenameDialog from "./RenameDialog"
import ImprovedDeleteDialog from "./DeleteConfirmDialog"
import SettingsDialog from "./SettingsDialog"
import { stripPdfExtension } from "@/lib/utils"
import { useSession, signOut } from "@/lib/auth-client"
import Image from "next/image"
import { useWebSocket } from "@/hooks/useWebSocket"
import { toast } from "sonner"
import { countPdfPages, MAX_PDF_PAGES } from "@/lib/pdf"
import Spinner from "./Spinner"

// Temporary experiment flag to toggle dark sidebar theme quickly
// Set to false to revert to the previous light theme
const DARK_SIDEBAR_EXPERIMENT = true

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
const CollapsedUserSection = ({ session, isDark, onSettingsClick, onSignOut }: CollapsedUserSectionProps) => {
  if (!session?.user) {
    return (
      <div className="mt-auto flex flex-col items-center gap-2 pb-4 px-3 border-t border-white/10">
        {/* Sign In Icon for guests */}
        <button
          onClick={() => (window.location.href = "/sign-in")}
          className={
            isDark
              ? "p-2 rounded-lg hover:bg-white/10 transition-all duration-300 ease-out text-white transform hover:translate-y-[-1px] active:translate-y-0"
              : "p-2 rounded-lg hover:bg-black/5 transition-all duration-300 ease-out text-black transform hover:translate-y-[-1px] active:translate-y-0"
          }
          title="Sign in to chat with PDFs"
          aria-label="Sign In"
        >
          <LogIn className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={`mt-auto flex flex-col items-center gap-2 pb-4 px-3 pt-4 ${isDark ? 'border-t border-white/10' : 'border-t border-black/10'}`}>
      {/* Settings Icon */}
      <button
        onClick={onSettingsClick}
        className={
          isDark
            ? "p-2 rounded-lg hover:bg-white/10 transition-all duration-300 ease-out text-white/60 hover:text-white transform hover:translate-y-[-1px] active:translate-y-0"
            : "p-2 rounded-lg hover:bg-black/5 transition-all duration-300 ease-out text-black/40 hover:text-black/70 transform hover:translate-y-[-1px] active:translate-y-0"
        }
        title="Settings"
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </button>
      {/* Sign Out Icon */}
      <button
        onClick={onSignOut}
        className={
          isDark
            ? "p-2 rounded-lg hover:bg-white/10 transition-all duration-300 ease-out text-white/60 hover:text-white transform hover:translate-y-[-1px] active:translate-y-0"
            : "p-2 rounded-lg hover:bg-black/5 transition-all duration-300 ease-out text-black/40 hover:text-black/70 transform hover:translate-y-[-1px] active:translate-y-0"
        }
        title="Sign Out"
        aria-label="Sign Out"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  )
}

interface CollapsedUserSectionProps {
  session: any
  isDark: boolean
  onSettingsClick: () => void
  onSignOut: () => void
}

// User Section Component with Authentication
function UserSection({
  onSettingsClick,
  userName,
  userEmail,
  userImage,
  isDark = false,
}: {
  onSettingsClick: () => void
  userName: string
  userEmail: string
  userImage: string
  isDark?: boolean
}) {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex items-center gap-3">
        <div
          className={
            isDark
              ? "w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
              : "w-8 h-8 bg-black/10 rounded-full flex items-center justify-center"
          }
        >
          <Spinner size={12} color={isDark ? "#ffffff" : "#000000"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={isDark ? "text-sm font-medium text-white/70" : "text-sm font-medium text-black/60"}>
            Loading...
          </p>
        </div>
        <button
          onClick={onSettingsClick}
          className={
            isDark
              ? "p-1.5 rounded-md hover:bg-white/10 transition-all duration-200 ease-out text-white/60 hover:text-white"
              : "p-1.5 rounded-md hover:bg-black/5 transition-all duration-200 ease-out text-black/40 hover:text-black/70"
          }
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="space-y-3">
        {/* User Info Row */}
        <div className="flex items-center gap-3 min-h-10">
          <div
            className={
              isDark
                ? "w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0"
                : "w-8 h-8 rounded-full bg-black/5 flex items-center justify-center overflow-hidden flex-shrink-0"
            }
          >
            {userImage ? (
              <Image
                src={userImage || "/placeholder.svg"}
                alt={userName || "User"}
                width={32}
                height={32}
                className="w-full h-full object-cover rounded-full"
                unoptimized
              />
            ) : (
              <User
                className={isDark ? "h-4 w-4 text-white/70 flex-shrink-0" : "h-4 w-4 text-black/60 flex-shrink-0"}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={isDark ? "text-sm font-medium text-white truncate" : "text-sm font-medium text-black truncate"}
            >
              {userName || "User"}
            </p>
            <p className={isDark ? "text-xs text-white/60 truncate" : "text-xs text-black/50 truncate"}>{userEmail}</p>
          </div>
          <button
            onClick={onSettingsClick}
            className={
              isDark
                ? "p-1.5 rounded-md hover:bg-white/10 transition-all duration-200 ease-out text-white/60 hover:text-white"
                : "p-1.5 rounded-md hover:bg-black/5 transition-all duration-200 ease-out text-black/40 hover:text-black/70"
            }
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await signOut()
            window.location.href = "/"
          }}
          className={
            isDark
              ? "w-full flex items-center gap-2 h-8 text-xs border-white/20 bg-white text-black hover:bg-white/90 transition-all duration-200 ease-out"
              : "w-full flex items-center gap-2 h-8 text-xs border-black/20 bg-white text-black hover:bg-white/90 transition-all duration-200 ease-out"
          }
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Guest User Row */}
      <div className="flex items-center gap-3">
        <div
          className={
            isDark
              ? "w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
              : "w-8 h-8 bg-black/10 rounded-full flex items-center justify-center"
          }
        >
          <User className={isDark ? "h-4 w-4 text-white/70" : "h-4 w-4 text-black/60"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={isDark ? "text-sm font-medium text-white truncate" : "text-sm font-medium text-black truncate"}>
            Guest User
          </p>
          <p className={isDark ? "text-xs text-white/60 truncate" : "text-xs text-black/50 truncate"}>Not signed in</p>
        </div>
        <Button
          onClick={() => (window.location.href = "/sign-in")}
          size="sm"
          className={
            isDark
              ? "flex items-center gap-2 h-8 text-xs bg-white hover:bg-white/90 text-black transition-all duration-200 ease-out flex-shrink-0"
              : "flex items-center gap-2 h-8 text-xs bg-black hover:bg-black/90 text-white transition-all duration-200 ease-out flex-shrink-0"
          }
        >
          <LogIn className="h-3 w-3" />
          Sign In
        </Button>
      </div>
    </div>
  )
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
  const isDark = DARK_SIDEBAR_EXPERIMENT
  const [isExpanded, setIsExpanded] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { onConversationRenamed, onUserProfileUpdated } = useWebSocket()

  // Local state for user data to handle real-time updates
  const [currentUserName, setCurrentUserName] = useState<string>("")
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("")

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
  const { data: session, isPending } = useSession()

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Keep CSS var in sync so parent layout reserves space (desktop)
  useEffect(() => {
    const width = isExpanded ? "320px" : "64px"
    document.documentElement.style.setProperty("--sidebar-width", width)
    return () => {
      document.documentElement.style.removeProperty("--sidebar-width")
    }
  }, [isExpanded])

  // Sync session data to local state
  useEffect(() => {
    if (session?.user) {
      setCurrentUserName(session.user.name || "")
      // Prioritize custom avatar over OAuth profile picture
      setCurrentUserAvatar(session.user.image || "")
    }
  }, [session?.user])

  // Only set activeConversationId if the conversation actually exists in the user's conversation list
  const urlConversationId = pathname.startsWith("/conversation/") ? pathname.split("/")[2] : null
  const activeConversationId =
    selectedConversation ||
    (urlConversationId && conversations.some((conv) => conv.id === urlConversationId) ? urlConversationId : null)

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
      console.log("🔄 [Sidebar] Redirecting signed-out user to home from conversation page")
      router.push("/")
      return
    }

    // Only check after conversations have loaded (not during loading state) and user is signed in
    if (
      !loading &&
      session?.user &&
      urlConversationId &&
      !conversations.some((conv) => conv.id === urlConversationId)
    ) {
      console.log("🔄 [Sidebar] Conversation not found in list, checking if it exists on server:", urlConversationId)
      
      // Give newly created conversations a chance - check if it exists on the server
      const checkConversationExists = async () => {
        try {
          const { getConversationDetails } = await import("@/services/api")
          await getConversationDetails(urlConversationId)
          console.log("✅ [Sidebar] Conversation exists on server, reloading conversations list")
          // Conversation exists on server, reload the conversations list
          loadConversations()
        } catch (error) {
          console.log("❌ [Sidebar] Conversation doesn't exist on server, redirecting to home")
          router.push("/")
        }
      }
      
      checkConversationExists()
    }
  }, [loading, urlConversationId, conversations, router, session?.user])

  // Set up WebSocket listener for conversation renames
  useEffect(() => {
    if (onConversationRenamed) {
      const cleanup = onConversationRenamed((data) => {
        console.log("🔄 [Sidebar] Received conversation renamed:", data)
        setConversations((prev) =>
          prev.map((conv) => (conv.id === data.conversationId ? { ...conv, title: data.newTitle } : conv)),
        )

        // Also notify parent component
        if (onConversationUpdate) {
          onConversationUpdate(data.conversationId, data.newTitle)
        }
      })

      return cleanup
    }
  }, [onConversationRenamed, onConversationUpdate])

  // Set up WebSocket listener for user profile updates
  useEffect(() => {
    if (onUserProfileUpdated) {
      const cleanup = onUserProfileUpdated((data) => {
        console.log("🔄 [Sidebar] Received user profile update:", data)

        // Update local state based on the update type
        if (data.type === "username" && data.name) {
          setCurrentUserName(data.name)
          console.log("🔄 [Sidebar] Updated local username to:", data.name)
        }
        if (data.type === "avatar" && data.avatar) {
          setCurrentUserAvatar(data.avatar)
          console.log("🔄 [Sidebar] Updated local avatar to:", data.avatar)
        }
      })

      return cleanup
    }
  }, [onUserProfileUpdated])

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
      window.location.href = "/sign-in"
      return
    }

    // Create a hidden file input element
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".pdf"
    fileInput.style.display = "none"

    // Add event listener for file selection
    fileInput.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]

      if (file) {
        try {
          // Client-side page limit guard
          const pages = await countPdfPages(file)
          if (pages > MAX_PDF_PAGES) {
            toast.error(`Maximum ${MAX_PDF_PAGES} pages allowed. Your file has ${pages} pages.`)
            return
          }
          // Import the upload function dynamically to avoid SSR issues
          const { uploadPDF } = await import("@/services/api")

          // Upload the file - this now returns immediately with conversationId
          const response = await uploadPDF(file)

          // Navigate to the new conversation immediately
          // The conversation page will handle showing the processing status
          router.push(`/conversation/${response.conversationId}`)

          // Reload conversations list
          loadConversations()
        } catch (error) {
          console.error("Failed to upload PDF:", error)
          toast.error("Failed to upload PDF. Please try again.")
        }
      }

      // Clean up the file input
      document.body.removeChild(fileInput)
    })

    // Add to DOM and trigger click
    document.body.appendChild(fileInput)
    fileInput.click()
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

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
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
      className="relative"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: isMobile ? "100vw" : "320px",
        transform: isMobile ? "translateX(0)" : (isExpanded ? "translateX(0)" : "translateX(-256px)"),
        transition: isMobile ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: isMobile ? 50 : 100,
        backgroundColor: isDark ? "#1E1E1E" : "#F6F5F2",
        borderRight: isMobile ? "none" : (isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.15)"),
        boxShadow: isMobile ? "none" : "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="flex flex-col h-full"
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div className={isDark ? "border-b border-white/10 p-6 relative" : "border-b border-black/10 p-6 relative"}>
          {/* Expanded content */}
          <div
            className="flex items-center justify-between relative"
            style={{
              opacity: isExpanded ? 1 : 0,
              visibility: isExpanded ? "visible" : "hidden",
              transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
              transitionDelay: isExpanded ? "0.1s" : "0s",
            }}
          >
            {/* Mobile close button - centered with logo content */}
            {isMobile && onClose && (
              <div className="absolute top-1/2 right-0 -translate-y-1/2 z-10">
                <button
                  onClick={onClose}
                  className={
                    isDark
                      ? "p-3 rounded-lg hover:bg-white/10 transition-all duration-200 ease-out text-white touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                      : "p-3 rounded-lg hover:bg-black/10 transition-all duration-200 ease-out text-black touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                  }
                  aria-label="Close sidebar"
                  title="Close sidebar"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div
              className="cursor-pointer transition-all duration-200 ease-out hover:opacity-90"
              onClick={() => router.push("/")}
              style={{ transform: isMobile ? "translateX(0)" : "translateX(-15px)" }}
            >
              <Image
                src="/logos/new-rabbit-logo.png"
                alt="RabbitPDF - Document Intelligence"
                width={isMobile ? 200 : 240}
                height={isMobile ? 50 : 60}
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            {/* Toggle button for expanded state - desktop only */}
            {!isMobile && (
              <button
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 ease-out text-white"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Collapsed content - Toggle button for collapsed state */}
          <div
            className="absolute top-0 right-0 w-16 h-full flex items-center justify-center"
            style={{
              opacity: isExpanded ? 0 : 1,
              visibility: isExpanded ? "hidden" : "visible",
              transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
              transitionDelay: isExpanded ? "0s" : "0.1s",
            }}
          >
            {!isMobile && (
              <button
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 ease-out text-white"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
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
              <div className="px-6 pt-6 pb-4 flex-shrink-0">
                <Button
                  onClick={handleNewChat}
                  className={
                    isDark
                      ? "w-full h-11 rounded-xl font-medium transition-all duration-300 ease-out hover:shadow-lg transform hover:translate-y-[-1px] active:translate-y-0 bg-gradient-to-r from-white to-white/95 hover:from-white hover:to-white/90 text-black border border-white/20 hover:border-white/30 backdrop-blur-sm"
                      : "w-full h-11 rounded-xl font-medium transition-all duration-300 ease-out hover:shadow-lg transform hover:translate-y-[-1px] active:translate-y-0 bg-gradient-to-r from-black to-black/95 hover:from-black hover:to-black/90 text-white border border-black/20 hover:border-black/30 backdrop-blur-sm"
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
            )}

            {/* Recent Chats Header */}
            <div
              className={
                isDark
                  ? "px-6 pt-6 pb-6 flex-shrink-0 border-t border-white/10"
                  : "px-6 pt-6 pb-6 flex-shrink-0 border-t border-black/10"
              }
            >
              <h2 className={isDark ? "text-sm font-semibold text-white/80" : "text-sm font-semibold text-black/80"}>
                {session?.user ? "Recent Chats" : "Your Chats"}
              </h2>
            </div>

            {/* Conversations List - Fixed height with scroll */}
            <div className="flex-1 min-h-0 px-6 pb-6">
              <ScrollArea
                className={
                  isDark
                    ? "h-full [&_.scrollbar]:bg-white/10 [&_.scrollbar]:hover:bg-white/20 [&_.scrollbar-thumb]:bg-white/30 [&_.scrollbar-thumb]:hover:bg-white/50"
                    : "h-full [&_.scrollbar]:bg-black/10 [&_.scrollbar]:hover:bg-black/20 [&_.scrollbar-thumb]:bg-black/30 [&_.scrollbar-thumb]:hover:bg-black/50"
                }
              >
                <div className="space-y-1">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={isDark ? "p-4 rounded-xl animate-pulse" : "p-4 rounded-xl animate-pulse"}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={isDark ? "h-4 bg-white/15 rounded mb-2" : "h-4 bg-black/10 rounded mb-2"}></div>
                        <div className={isDark ? "h-3 bg-white/10 rounded w-20" : "h-3 bg-black/5 rounded w-20"}></div>
                      </div>
                    ))
                  ) : error ? (
                    <div className="p-6 text-center">
                      <p className={isDark ? "text-sm text-red-400 mb-4" : "text-sm text-red-600 mb-4"}>{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadConversations}
                        className={
                          isDark
                            ? "border-white/20 text-white hover:bg-white hover:text-black transition-all duration-200 ease-out bg-transparent"
                            : "border-black/20 hover:bg-black hover:text-white transition-all duration-200 ease-out bg-transparent"
                        }
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : conversations.length > 0 ? (
                    conversations.map((conversation) => {
                      const isActive = conversation.id === activeConversationId
                      return (
                        <div
                          key={conversation.id}
                          className={`w-full rounded-xl transition-all duration-200 ease-out group hover:translate-y-[-1px] active:translate-y-0 ${
                            isActive
                              ? "bg-[#C0C9EE] shadow-sm"
                              : isDark
                                ? "hover:bg-white/10 hover:shadow-sm"
                                : "hover:bg-black/5 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start gap-3 p-4">
                            <div className="mt-0.5 flex-shrink-0">
                              <MessageSquare
                                className={
                                  isActive
                                    ? "h-4 w-4 text-black/80 transition-colors duration-200"
                                    : isDark
                                      ? "h-4 w-4 text-white/70 transition-colors duration-200 group-hover:text-white"
                                      : "h-4 w-4 text-black/60 transition-colors duration-200 group-hover:text-black/80"
                                }
                              />
                            </div>
                            <button
                              className="flex-1 min-w-0 text-left pr-2"
                              onClick={() => handleConversationSelect(conversation.id)}
                            >
                              <h3
                                className={
                                  isActive
                                    ? "font-medium text-black text-sm truncate mb-1"
                                    : isDark
                                      ? "font-medium text-white text-sm truncate mb-1"
                                      : "font-medium text-black text-sm truncate mb-1"
                                }
                              >
                                {stripPdfExtension(conversation.title).length > 15
                                  ? stripPdfExtension(conversation.title).substring(0, 15) + "..."
                                  : stripPdfExtension(conversation.title)}
                              </h3>
                              <p
                                className={
                                  isActive
                                    ? "text-xs text-black/70"
                                    : isDark
                                      ? "text-xs text-white/60"
                                      : "text-xs text-black/60"
                                }
                              >
                                {formatDate(conversation.createdAt)}
                              </p>
                            </button>
                            <div className="flex items-center gap-0.5 flex-shrink-0 w-20 justify-end">
                              <button
                                className={
                                  isActive
                                    ? "p-1.5 rounded-md hover:bg-black/10 transition-all duration-200 ease-out text-black/70 hover:text-black"
                                    : isDark
                                      ? "p-1.5 rounded-md hover:bg-white/10 transition-all duration-200 ease-out text-white/70 hover:text-white"
                                      : "p-1.5 rounded-md hover:bg-black/10 transition-all duration-200 ease-out text-black/60 hover:text-black/90"
                                }
                                onClick={(e) => handleRenameClick(conversation, e)}
                                title="Rename conversation"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                className={
                                  isActive
                                    ? "p-1.5 rounded-md hover:bg-red-50 transition-all duration-200 ease-out text-black/70 hover:text-red-600"
                                    : isDark
                                      ? "p-1.5 rounded-md hover:bg-red-500/10 transition-all duration-200 ease-out text-white/70 hover:text-red-400"
                                      : "p-1.5 rounded-md hover:bg-red-50 transition-all duration-200 ease-out text-black/60 hover:text-red-600"
                                }
                                onClick={(e) => handleDeleteClick(conversation, e)}
                                title="Delete conversation"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <div
                        className={
                          isDark
                            ? "w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
                            : "w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4"
                        }
                      >
                        <MessageSquare className={isDark ? "h-6 w-6 text-white/60" : "h-6 w-6 text-black/30"} />
                      </div>
                      {session?.user ? (
                        <>
                          <p
                            className={
                              isDark
                                ? "text-sm font-medium text-white/70 mb-1"
                                : "text-sm font-medium text-black/60 mb-1"
                            }
                          >
                            No conversations yet
                          </p>
                          <p className={isDark ? "text-xs text-white/60" : "text-xs text-black/40"}>
                            Upload a PDF to get started
                          </p>
                        </>
                      ) : (
                        <>
                          <p
                            className={
                              isDark
                                ? "text-sm font-medium text-white/70 mb-1"
                                : "text-sm font-medium text-black/60 mb-1"
                            }
                          >
                            Sign in to view chats
                          </p>
                          <p className={isDark ? "text-xs text-white/60" : "text-xs text-black/40"}>
                            Your conversations will appear here
                          </p>
                          <Button
                            onClick={() => (window.location.href = "/sign-in")}
                            variant="outline"
                            size="sm"
                            className={
                              isDark
                                ? "mt-3 border-white/20 text-white hover:bg-white hover:text-black transition-all duration-200 ease-out bg-transparent"
                                : "mt-3 border-black/20 hover:bg-black hover:text-white transition-all duration-200 ease-out bg-transparent"
                            }
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
            {session?.user && (
              <div className="px-3 pt-6 pb-4 flex-shrink-0">
                <button
                  onClick={handleNewChat}
                  className={`w-10 h-10 rounded-xl transition-all duration-300 ease-out flex items-center justify-center transform hover:translate-y-[-1px] active:translate-y-0 mx-auto hover:shadow-lg ${
                    isDark
                      ? "bg-gradient-to-br from-white to-white/95 hover:from-white hover:to-white/90 text-black shadow-sm border border-white/20 hover:border-white/30 backdrop-blur-sm"
                      : "bg-gradient-to-br from-black to-black/95 hover:from-black hover:to-black/90 text-white shadow-sm border border-black/20 hover:border-black/30 backdrop-blur-sm"
                  }`}
                  title="New Chat"
                  aria-label="New Chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Collapsed Conversations - Fixed height with scroll */}
            <div className="flex-1 min-h-0 py-4 px-3">
              <ScrollArea
                className={
                  isDark
                    ? "h-full [&_.scrollbar]:bg-white/10 [&_.scrollbar]:hover:bg-white/20 [&_.scrollbar-thumb]:bg-white/30 [&_.scrollbar-thumb]:hover:bg-white/50"
                    : "h-full [&_.scrollbar]:bg-black/10 [&_.scrollbar]:hover:bg-black/20 [&_.scrollbar-thumb]:bg-black/30 [&_.scrollbar-thumb]:hover:bg-black/50"
                }
              >
                <div className="space-y-3">
                  {!session?.user ? // Guest user - no visual indicator in collapsed view
                  null : loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={
                          isDark
                            ? "w-10 h-10 bg-white/10 rounded-xl animate-pulse mx-auto"
                            : "w-10 h-10 bg-black/10 rounded-xl animate-pulse mx-auto"
                        }
                        style={{ animationDelay: `${index * 50}ms` }}
                      ></div>
                    ))
                  ) : error ? (
                    <div
                      className={
                        isDark
                          ? "w-10 h-10 bg-red-500/10 border border-red-400/30 rounded-xl flex items-center justify-center mx-auto"
                          : "w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center mx-auto"
                      }
                    >
                      <span className={isDark ? "text-red-400 text-xs font-bold" : "text-red-500 text-xs font-bold"}>
                        !
                      </span>
                    </div>
                  ) : conversations.length > 0 ? (
                    conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        className={`w-10 h-10 rounded-xl transition-all duration-200 ease-out flex items-center justify-center transform hover:translate-y-[-1px] active:translate-y-0 mx-auto ${
                          conversation.id === activeConversationId
                            ? "bg-[#C0C9EE] text-black shadow-sm"
                            : isDark
                              ? "bg-white/10 hover:bg-white/15 text-white/80 hover:shadow-sm"
                              : "bg-black/5 hover:bg-black/10 text-black/70 hover:shadow-sm"
                        }`}
                        onClick={() => handleConversationSelect(conversation.id)}
                        title={stripPdfExtension(conversation.title)}
                      >
                        <FileText
                          className={
                            isDark ? "h-4 w-4 transition-colors duration-200" : "h-4 w-4 transition-colors duration-200"
                          }
                        />
                      </button>
                    ))
                  ) : // Empty state - no visual indicator needed in collapsed view
                  null}
                </div>
              </ScrollArea>
            </div>

            <CollapsedUserSection
              session={session}
              isDark={isDark}
              onSettingsClick={handleSettingsClick}
              onSignOut={handleSignOut}
            />
          </div>
        </div>

        {/* User Details Section - Expanded State (do not render when collapsed to avoid reserving space) */}
        {isExpanded && (
          <div className={isDark ? "border-t border-white/10 p-4 flex-shrink-0" : "border-t border-black/10 p-4 flex-shrink-0"}>
            <UserSection
              onSettingsClick={handleSettingsClick}
              userName={currentUserName}
              userEmail={session?.user?.email || ""}
              userImage={currentUserAvatar}
              isDark={isDark}
            />
          </div>
        )}
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
      <SettingsDialog open={settingsDialog.open} onOpenChange={(open) => setSettingsDialog({ open })} />
    </div>
  )
}
