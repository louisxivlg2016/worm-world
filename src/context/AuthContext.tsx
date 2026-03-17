import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { usePlatform } from '@/platform/usePlatform'

interface AuthState {
  userId: string | null
  username: string | null
  loading: boolean
  signIn: (username: string, platform?: string) => Promise<void>
  signOut: () => Promise<void>
  updateUsername: (name: string) => Promise<void>
}

const AuthCtx = createContext<AuthState>({
  userId: null,
  username: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateUsername: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { loading: platformLoading } = usePlatform()
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (platformLoading) return

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        setUsername(session.user.user_metadata?.username ?? null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        setUsername(session.user.user_metadata?.username ?? null)
      } else {
        setUserId(null)
        setUsername(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [platformLoading])

  const signIn = useCallback(async (name: string, platform = 'web') => {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: { username: name, platform } },
    })
    if (error) throw error
    if (data.user) {
      setUserId(data.user.id)
      setUsername(name)
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUserId(null)
    setUsername(null)
  }, [])

  const updateUsername = useCallback(async (name: string) => {
    if (!userId) return
    await supabase.from('profiles').update({ username: name }).eq('id', userId)
    await supabase.auth.updateUser({ data: { username: name } })
    setUsername(name)
  }, [userId])

  return (
    <AuthCtx.Provider value={{ userId, username, loading, signIn, signOut, updateUsername }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
