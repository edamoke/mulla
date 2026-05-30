'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      let resolvedEmail = email.trim()
      
      // If it's a handle (like "edamoke") rather than a full email, resolve it
      if (!resolvedEmail.includes('@')) {
        if (resolvedEmail.toLowerCase() === 'edamoke') {
          resolvedEmail = 'edamoke@gmail.com'
        } else {
          // General lookup from profiles table for username or email prefix
          const { data } = await supabase
            .from('profiles')
            .select('email')
            .or(`email.ilike.${resolvedEmail}@%,first_name.ilike.${resolvedEmail},last_name.ilike.${resolvedEmail}`)
            .limit(1)
            .maybeSingle()
            
          if (data?.email) {
            resolvedEmail = data.email
          }
        }
      }

      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      })
      if (error) throw error

      let role = signInData?.user?.user_metadata?.role || 'customer'
      if (signInData?.user && !signInData.user.user_metadata?.role) {
        // Fall back to profiles table only if role is not in user_metadata to avoid RLS policy recursion errors
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .maybeSingle()
        role = profile?.role || 'customer'
      }

      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const redirectUrl = searchParams?.get('redirect')

      if (redirectUrl) {
        router.push(redirectUrl)
      } else if (role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-4xl tracking-wider text-foreground">Mulla</h1>
          </Link>
          <p className="text-muted-foreground mt-2">Welcome back</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={onSubmit => handleLogin(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="your@email.com or username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/sign-up"
              className="text-foreground font-medium hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Back to shop */}
        <div className="text-center mt-6">
          <Link 
            href="/shop" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue shopping as guest
          </Link>
        </div>
      </div>
    </div>
  )
}
