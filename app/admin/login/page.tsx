'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminLoginForm } from './admin-login-form'

export default function AdminLoginPage() {
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Check if user is admin via JWT metadata first to avoid RLS policy loops, with profiles table fallback
          if (user.user_metadata?.role === 'admin') {
            router.push('/admin')
            return
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (profile?.role === 'admin') {
            router.push('/admin')
            return
          }
        }
      } catch (error) {
        // Supabase not configured, continue to login form
        console.log('[v0] Supabase auth check skipped:', error)
      }
      setIsChecking(false)
    }
    
    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif tracking-wide text-foreground">MULLA</h1>
          <p className="text-sm text-muted-foreground mt-2">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-medium text-foreground mb-6">Admin Sign In</h2>
          <AdminLoginForm />
        </div>

        {/* Back to Store */}
        <div className="text-center mt-6">
          <a 
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Store
          </a>
        </div>
      </div>
    </div>
  )
}
