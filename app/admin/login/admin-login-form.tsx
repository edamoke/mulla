'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log('[v0] User signed in successfully:', data.user.id)
        
        // Small delay to ensure session is established for RLS
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if user is admin with retry
        let profile = null
        let profileError = null
        
        for (let i = 0; i < 3; i++) {
          console.log('[v0] Attempt', i + 1, 'to fetch profile for user:', data.user.id)
          const result = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()
          
          profile = result.data
          profileError = result.error
          
          console.log('[v0] Profile result:', { profile, profileError })
          
          if (profile) break
          await new Promise(resolve => setTimeout(resolve, 300))
        }

        console.log('[v0] Final profile check:', { profile, profileError, role: profile?.role })

        // Check if user is admin either via metadata (bypassing RLS loop) or profiles table
        const isUserAdmin = data.user.user_metadata?.role === 'admin' || profile?.role === 'admin'

        if (!isUserAdmin) {
          console.log('[v0] Access denied - profileError:', profileError, 'role:', profile?.role, 'metadata role:', data.user.user_metadata?.role)
          // Sign out non-admin users
          await supabase.auth.signOut()
          setError('Access denied. Admin privileges required.')
          setIsLoading(false)
          return
        }

        // Redirect to admin dashboard
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          placeholder="admin@mulla.co.ke"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors pr-12"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}
