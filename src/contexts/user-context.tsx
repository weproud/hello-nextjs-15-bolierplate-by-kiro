'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'

// User interface
export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  createdAt?: Date
  updatedAt?: Date
}

// User preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'ko' | 'en'
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  dashboard: {
    layout: 'grid' | 'list'
    itemsPerPage: number
  }
}

// User context state
interface UserContextState {
  user: User | null
  preferences: UserPreferences
  isLoading: boolean
  error: string | null
}

// User context actions
interface UserContextActions {
  updateUser: (updates: Partial<User>) => Promise<void>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
  refreshUser: () => Promise<void>
}

// Combined context type
type UserContextType = UserContextState & UserContextActions

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'ko',
  notifications: {
    email: true,
    push: true,
    marketing: false,
  },
  dashboard: {
    layout: 'grid',
    itemsPerPage: 12,
  },
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider component
interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user data when session changes
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (status === 'unauthenticated') {
      setUser(null)
      setPreferences(defaultPreferences)
      setIsLoading(false)
      return
    }

    if (session?.user) {
      setUser({
        id: session.user.id || '',
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      })

      // Load user preferences from localStorage or API
      loadUserPreferences(session.user.id || '')
      setIsLoading(false)
    }
  }, [session, status])

  // Load user preferences
  const loadUserPreferences = async (userId: string) => {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem(`user-preferences-${userId}`)
      if (stored) {
        const parsedPreferences = JSON.parse(stored)
        setPreferences({ ...defaultPreferences, ...parsedPreferences })
      }

      // TODO: Load from API/database
      // const response = await fetch(`/api/users/${userId}/preferences`)
      // if (response.ok) {
      //   const apiPreferences = await response.json()
      //   setPreferences({ ...defaultPreferences, ...apiPreferences })
      // }
    } catch (error) {
      console.error('Failed to load user preferences:', error)
      setError('Failed to load user preferences')
    }
  }

  // Save user preferences
  const saveUserPreferences = async (
    userId: string,
    newPreferences: UserPreferences
  ) => {
    try {
      // Save to localStorage
      localStorage.setItem(
        `user-preferences-${userId}`,
        JSON.stringify(newPreferences)
      )

      // TODO: Save to API/database
      // await fetch(`/api/users/${userId}/preferences`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newPreferences),
      // })
    } catch (error) {
      console.error('Failed to save user preferences:', error)
      throw new Error('Failed to save preferences')
    }
  }

  // Update user information
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // TODO: Update user via API
      // const response = await fetch(`/api/users/${user.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates),
      // })

      // if (!response.ok) {
      //   throw new Error('Failed to update user')
      // }

      // const updatedUser = await response.json()
      // setUser(updatedUser)

      // For now, just update locally
      setUser({ ...user, ...updates })
    } catch (error) {
      console.error('Failed to update user:', error)
      setError(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setIsLoading(false)
    }
  }

  // Update user preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return

    try {
      setError(null)
      const newPreferences = { ...preferences, ...updates }

      await saveUserPreferences(user.id, newPreferences)
      setPreferences(newPreferences)
    } catch (error) {
      console.error('Failed to update preferences:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to update preferences'
      )
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // TODO: Refresh user data from API
      // const response = await fetch(`/api/users/${user.id}`)
      // if (response.ok) {
      //   const refreshedUser = await response.json()
      //   setUser(refreshedUser)
      // }

      await loadUserPreferences(user.id)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to refresh user data'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const value: UserContextType = {
    user,
    preferences,
    isLoading,
    error,
    updateUser,
    updatePreferences,
    refreshUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// Hook to use user context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Convenience hooks
export function useUserPreferences() {
  const { preferences, updatePreferences } = useUser()
  return [preferences, updatePreferences] as const
}

export function useUserProfile() {
  const { user, updateUser, refreshUser, isLoading, error } = useUser()
  return {
    user,
    updateUser,
    refreshUser,
    isLoading,
    error,
  }
}
