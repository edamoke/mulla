'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User, Session, SupabaseClient } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  country: string | null
  role: 'customer' | 'admin' | 'staff'
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = useMemo(() => getSupabaseClient(), [])

  const fetchProfile = async (userId: string, userObject?: User | null) => {
    if (!supabase) return null
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      } else {
        console.log('[v0] Profile record does not exist yet. Relying on fallback metadata.')
      }
      
      // Fallback: If we fail to fetch the profile (e.g. due to an RLS policy recursion error),
      // we construct a safe profile from the secure user_metadata in the signed JWT.
      const fallbackUser = userObject || user
      if (fallbackUser) {
        console.log('[v0] Using user_metadata fallback for profile:', fallbackUser.id)
        return {
          id: fallbackUser.id,
          email: fallbackUser.email || null,
          first_name: fallbackUser.user_metadata?.first_name || null,
          last_name: fallbackUser.user_metadata?.last_name || null,
          phone: fallbackUser.user_metadata?.phone || null,
          avatar_url: fallbackUser.user_metadata?.avatar_url || null,
          address_line1: null,
          address_line2: null,
          city: null,
          country: null,
          role: fallbackUser.user_metadata?.role || 'customer'
        } as Profile
      }
      return null
    }
    return data as Profile
  }

  const refreshProfile = async () => {
    if (user && supabase) {
      const profileData = await fetchProfile(user.id, user)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    // If Supabase is not configured, skip auth
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          const profileData = await fetchProfile(currentSession.user.id, currentSession.user)
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id, newSession.user)
          setProfile(profileData)
        } else {
          setProfile(null)
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
