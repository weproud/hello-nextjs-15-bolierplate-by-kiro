# Zustand Store Configuration

This directory contains the global state management setup using Zustand with TypeScript support.

## Structure

- `app-store.ts` - Core store definition with vanilla Zustand (SSR-friendly)
- `provider.tsx` - React context provider for the store
- `index.ts` - Main exports and store interface

## Features

- **TypeScript Support** - Fully typed store with proper inference
- **Persistence** - State persists to localStorage (theme and preferences)
- **DevTools** - Redux DevTools integration for debugging
- **Immer Integration** - Immutable state updates with mutable syntax
- **SSR Ready** - Provider-based approach works with Next.js SSR

## Usage

### Basic Usage with Provider (Recommended)

1. Wrap your app with the provider in `layout.tsx`:

```tsx
import { AppStoreProvider } from '@/store'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  )
}
```

2. Use the store in components:

```tsx
'use client'
import { useAppStore } from '@/store'

export function MyComponent() {
  const sidebarOpen = useAppStore(state => state.sidebarOpen)
  const setSidebarOpen = useAppStore(state => state.setSidebarOpen)

  return (
    <button onClick={() => setSidebarOpen(!sidebarOpen)}>Toggle Sidebar</button>
  )
}
```

## Store State

The store includes:

### UI State

- `sidebarOpen: boolean` - Controls sidebar visibility
- `theme: 'light' | 'dark' | 'system'` - Theme preference

### User Preferences

- `preferences.notifications: boolean` - Notification settings
- `preferences.autoSave: boolean` - Auto-save preference

### Actions

- `setSidebarOpen(open: boolean)` - Toggle sidebar
- `setTheme(theme)` - Change theme
- `updatePreferences(preferences)` - Update user preferences
- `resetState()` - Reset to initial state

## Persistence

The following state is automatically persisted to localStorage:

- Theme preference
- User preferences

UI state (like sidebar) is not persisted and resets on page reload.

## Development

The store includes Redux DevTools integration. Install the browser extension to debug state changes during development.
