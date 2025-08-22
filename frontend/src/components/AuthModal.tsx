'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn, signUp } from '@/lib/auth-client'
import { Github, Mail, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMethod, setAuthMethod] = useState<'social' | 'email'>('social')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Welcome to ChatPDF</h2>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>

          {authMethod === 'social' ? (
            <SocialAuth onEmailAuth={() => setAuthMethod('email')} />
          ) : (
            <EmailAuth 
              onSuccess={onClose} 
              onBackToSocial={() => setAuthMethod('social')} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SocialAuth({ onEmailAuth }: { onEmailAuth: () => void }) {
  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    try {
      await signIn.social({ 
        provider,
        callbackURL: window.location.origin,
      })
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`)
      console.error(`${provider} sign in error:`, error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Social Login Buttons */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={() => handleSocialSignIn('google')}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
        
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={() => handleSocialSignIn('github')}
        >
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        variant="ghost"
        className="w-full h-11"
        onClick={onEmailAuth}
      >
        <Mail className="mr-2 h-4 w-4" />
        Continue with Email
      </Button>
    </div>
  )
}

function EmailAuth({ 
  onSuccess, 
  onBackToSocial 
}: { 
  onSuccess: () => void
  onBackToSocial: () => void 
}) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
    const normalizedEmail = formData.email.trim().toLowerCase()
    if (isSignUp) {
        const result = await signUp.email({
      email: normalizedEmail,
          password: formData.password,
          name: formData.name,
        })
        
        if (result.error) {
          throw new Error(result.error.message || 'Account creation failed')
        }
        
        // Trigger verification email (generic response for privacy)
        await fetch('/api/auth/email/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail }),
        })
        
        toast.success('Account created! Check your email to verify before signing in.')
        onSuccess()
        return
      } else {
  const result = await signIn.email({
          email: normalizedEmail,
          password: formData.password,
        })
        
        if (result.error) {
          if (result.error.message?.toLowerCase().includes('not found')) {
            setIsSignUp(true)
            toast.info('Account not found. Let\'s create one for you!')
            return
          }
          if (result.error.message?.toLowerCase().includes('verify')) {
            // Resend verification email silently
            fetch('/api/auth/email/send-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: normalizedEmail }),
            })
            toast.info('Please verify your email. We\'ve re-sent the link.')
            return
          }
          throw new Error(result.error.message || 'Sign in failed')
        }
  toast.success('Signed in successfully!')
  // Redirect to homepage after successful sign-in
  window.location.href = '/'
      }
      
      onSuccess()
    } catch (error: any) {
      console.error('Auth error:', error)
      
      if (error.message?.includes('User already exists')) {
        setIsSignUp(false)
        toast.info('Account exists. Please sign in instead.')
      } else {
        toast.error(error.message || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toggle Tabs */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          type="button"
          className={`flex-1 py-2 text-sm rounded-md transition-colors font-medium ${
            !isSignUp 
              ? 'bg-background shadow-sm text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setIsSignUp(false)}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-sm rounded-md transition-colors font-medium ${
            isSignUp 
              ? 'bg-background shadow-sm text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setIsSignUp(true)}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {isSignUp && (
            <p className="text-xs text-muted-foreground">
              Password should be at least 8 characters long
            </p>
          )}
        </div>
        
        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </div>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </Button>
      </form>
      
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToSocial}
          disabled={loading}
        >
          ← Back to social login
        </Button>
      </div>
    </div>
  )
}
