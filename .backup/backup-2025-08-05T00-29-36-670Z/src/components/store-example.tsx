'use client'

import { useAppStore } from '@/stores'
import { memo, useCallback } from 'react'

export const StoreExample = memo(function StoreExample() {
  const sidebarOpen = useAppStore(state => state.sidebarOpen)
  const theme = useAppStore(state => state.theme)
  const preferences = useAppStore(state => state.preferences)
  const setSidebarOpen = useAppStore(state => state.setSidebarOpen)
  const setTheme = useAppStore(state => state.setTheme)
  const updatePreferences = useAppStore(state => state.updatePreferences)
  const resetState = useAppStore(state => state.resetState)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen)
  }, [sidebarOpen, setSidebarOpen])

  const setLightTheme = useCallback(() => {
    setTheme('light')
  }, [setTheme])

  const setDarkTheme = useCallback(() => {
    setTheme('dark')
  }, [setTheme])

  const setSystemTheme = useCallback(() => {
    setTheme('system')
  }, [setTheme])

  const toggleNotifications = useCallback(() => {
    updatePreferences({ notifications: !preferences.notifications })
  }, [preferences.notifications, updatePreferences])

  const toggleAutoSave = useCallback(() => {
    updatePreferences({ autoSave: !preferences.autoSave })
  }, [preferences.autoSave, updatePreferences])

  return (
    <div className='p-4 space-y-4'>
      <h2 className='text-xl font-bold'>Zustand Store Example</h2>

      <div className='space-y-2'>
        <p>Sidebar Open: {sidebarOpen ? 'Yes' : 'No'}</p>
        <button
          onClick={toggleSidebar}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Toggle Sidebar
        </button>
      </div>

      <div className='space-y-2'>
        <p>Theme: {theme}</p>
        <div className='space-x-2'>
          <button
            onClick={setLightTheme}
            className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
          >
            Light
          </button>
          <button
            onClick={setDarkTheme}
            className='px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700'
          >
            Dark
          </button>
          <button
            onClick={setSystemTheme}
            className='px-3 py-1 bg-blue-200 rounded hover:bg-blue-300'
          >
            System
          </button>
        </div>
      </div>

      <div className='space-y-2'>
        <p>Preferences:</p>
        <ul className='ml-4'>
          <li>Notifications: {preferences.notifications ? 'On' : 'Off'}</li>
          <li>Auto Save: {preferences.autoSave ? 'On' : 'Off'}</li>
        </ul>
        <div className='space-x-2'>
          <button
            onClick={toggleNotifications}
            className='px-3 py-1 bg-green-200 rounded hover:bg-green-300'
          >
            Toggle Notifications
          </button>
          <button
            onClick={toggleAutoSave}
            className='px-3 py-1 bg-yellow-200 rounded hover:bg-yellow-300'
          >
            Toggle Auto Save
          </button>
        </div>
      </div>

      <button
        onClick={resetState}
        className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
      >
        Reset State
      </button>
    </div>
  )
})
