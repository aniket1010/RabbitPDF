"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, X, Settings, Check, Edit3 } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from '@/lib/auth-client'
import { updateUsername, updateUserAvatar } from "@/services/api"
import { useWebSocket } from "@/hooks/useWebSocket"
import Spinner from "./Spinner"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: session } = useSession()
  const { onUserProfileUpdated } = useWebSocket()

  console.log("🔍 [SettingsDialog] Render:", {
    open,
    hasSession: !!session,
    sessionStatus: session ? "loaded" : "none",
  })

  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [currentUsername, setCurrentUsername] = useState("")
  const [tempUsername, setTempUsername] = useState("")
  const [currentAvatar, setCurrentAvatar] = useState("/avatars/Horse.png")
  const [tempAvatar, setTempAvatar] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Array of available avatars
  const availableAvatars = [
    "/avatars/Horse.png",
    "/avatars/Meercat.png",
    "/avatars/Panda.png",
    "/avatars/Penguin.png",
    "/avatars/Rabbit.png",
    "/avatars/Sloth.png",
  ]

  // Load user data when dialog opens
  useEffect(() => {
    if (open && session?.user) {
      console.log("🔍 [Settings] Loading user data from session:", session.user)
      // Only set initial state if we don't already have current data (to prevent overwriting WebSocket updates)
      setCurrentUsername(prev => prev || session.user.name || "")
      setCurrentAvatar(prev => prev || session.user.image || "/avatars/Horse.png")
    } else if (open) {
      console.log("🔍 [Settings] No session data available:", { open, session })
    }
  }, [open, session])

  // Also update when session data changes (e.g., after refresh), but don't override WebSocket updates
  useEffect(() => {
    if (session?.user && !currentUsername && !currentAvatar) {
      // Only update if we don't have current data (initial load)
      setCurrentUsername(session.user.name || "")
      setCurrentAvatar(session.user.image || "/avatars/Horse.png")
    }
  }, [session?.user?.name, session?.user?.image, currentUsername, currentAvatar])

  // Listen for real-time profile updates
  useEffect(() => {
    if (onUserProfileUpdated) {
      const cleanup = onUserProfileUpdated((data) => {
        console.log("🔄 [Settings] Received profile update:", data)
        if (data.type === "username" && data.name) {
          setCurrentUsername(data.name)
        }
        if (data.type === "avatar" && data.avatar) {
          setCurrentAvatar(data.avatar)
        }
      })

      return cleanup
    }
  }, [onUserProfileUpdated])

  const handleEditUsername = () => {
    console.log("🔄 [Settings] Edit username clicked:", { currentUsername })
    setTempUsername(currentUsername)
    setIsEditingUsername(true)
  }

  const handleSaveUsername = async () => {
    if (!tempUsername.trim() || tempUsername === currentUsername) return

    console.log("🔄 [Settings] Starting username save:", { tempUsername, currentUsername })
    setLoading(true)
    setError(null)

    try {
      console.log("📡 [Settings] Making API call to update username...")
      const result = await updateUsername(tempUsername.trim())
      console.log("✅ [Settings] API response:", result)

      // Update local state first
      setCurrentUsername(tempUsername.trim())
      setIsEditingUsername(false)
      console.log("✅ Username saved successfully:", tempUsername.trim())

      // The WebSocket listener will handle updating the UI everywhere else
      console.log("🔄 [Settings] Username update complete, WebSocket will handle real-time updates")
    } catch (err) {
      console.error("❌ Failed to update username:", err)
      setError("Failed to update username. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSaveUsername()
  }

  const handleCancelEdit = () => {
    setTempUsername("")
    setIsEditingUsername(false)
    setError(null)
  }

  const handleEditAvatar = () => {
    setTempAvatar(currentAvatar)
    setIsEditingAvatar(true)
  }

  const handleSaveAvatar = async () => {
    if (!tempAvatar || tempAvatar === currentAvatar) return

    console.log("🔄 [Settings] Starting avatar save:", { tempAvatar, currentAvatar })
    setLoading(true)
    setError(null)

    try {
      console.log("📡 [Settings] Making API call to update avatar...")
      const result = await updateUserAvatar(tempAvatar)
      console.log("✅ [Settings] API response:", result)

      // Update local state first
      setCurrentAvatar(tempAvatar)
      setIsEditingAvatar(false)
      console.log("✅ Avatar saved successfully:", tempAvatar)

      // The WebSocket listener will handle updating the UI everywhere else
      console.log("🔄 [Settings] Avatar update complete, WebSocket will handle real-time updates")
    } catch (err) {
      console.error("❌ Failed to update avatar:", err)
      setError("Failed to update avatar. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAvatarEdit = () => {
    setTempAvatar("")
    setIsEditingAvatar(false)
    setError(null)
  }

  const handleAvatarSelect = (avatarPath: string) => {
    setTempAvatar(avatarPath)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#F6F5F2] border-black/10">
        <DialogHeader className="pb-4 border-b border-black/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-black">Settings</DialogTitle>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4 text-red-500 hover:text-red-600" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Edit Username Option */}
            {!isEditingUsername ? (
              <button
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-white border border-black/10 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                onClick={handleEditUsername}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Edit3 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-black group-hover:text-blue-700 mb-1">Edit Username</div>
                  <div className="text-xs text-gray-500 truncate">{currentUsername}</div>
                </div>
              </button>
            ) : (
              <div className="p-4 rounded-lg bg-white border border-blue-300 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Edit3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-black">Edit Username</span>
                </div>

                <form onSubmit={handleUsernameSubmit} className="space-y-4">
                  <Input
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="w-full border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 h-10"
                    autoFocus
                  />

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9"
                      disabled={!tempUsername.trim() || tempUsername === currentUsername || loading}
                    >
                      {loading ? (
                        <Spinner size={16} color="#ffffff" className="mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 bg-transparent"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Avatar Option */}
            {!isEditingAvatar ? (
              <button
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-white border border-black/10 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 group"
                onClick={handleEditAvatar}
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Camera className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-black group-hover:text-green-700 mb-1">Edit Avatar</div>
                  <div className="text-xs text-gray-500">Choose your profile picture</div>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  <Image
                    src={currentAvatar || "/placeholder.svg?height=40&width=40&query=avatar"}
                    alt="Current avatar"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
            ) : (
              <div className="p-4 rounded-lg bg-white border border-green-300 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Camera className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-black">Choose Avatar</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 justify-items-center">
                    {availableAvatars.map((avatarPath, index) => {
                      // Extract animal name from path (e.g., "/avatars/Horse.png" -> "Horse")
                      const animalName = avatarPath.split("/").pop()?.replace(".png", "") || `Avatar ${index + 1}`

                      return (
                        <button
                          key={avatarPath}
                          onClick={() => handleAvatarSelect(avatarPath)}
                          className={`relative w-16 h-16 rounded-full overflow-hidden transition-all duration-200 ${
                            tempAvatar === avatarPath
                              ? "border-2 border-green-500 ring-2 ring-green-200 scale-105"
                              : "hover:scale-105"
                          }`}
                          title={animalName}
                        >
                          <Image
                            src={avatarPath || `/placeholder.svg?height=64&width=64&query=${animalName} avatar`}
                            alt={animalName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                          {tempAvatar === avatarPath && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <Check className="h-6 w-6 text-green-600" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSaveAvatar}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9"
                      disabled={!tempAvatar || tempAvatar === currentAvatar || loading}
                    >
                      {loading ? (
                        <Spinner size={16} color="#ffffff" className="mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancelAvatarEdit}
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 bg-transparent"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
