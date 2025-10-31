import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface User {
  id: string
  email: string
  name: string
  specialty: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, specialty: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  )

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session && !error) {
        setAccessToken(session.access_token)
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          specialty: session.user.user_metadata?.specialty || ''
        })
      }
    } catch (error) {
      console.error('Session check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.session) {
      setAccessToken(data.session.access_token)
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
        specialty: data.user.user_metadata?.specialty || ''
      })
    }
  }

  const signup = async (email: string, password: string, name: string, specialty: string) => {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1cc3a412/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name, specialty })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Signup failed')
    }

    // Auto login after signup
    await login(email, password)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
