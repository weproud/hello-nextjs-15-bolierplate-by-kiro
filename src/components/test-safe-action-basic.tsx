'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import {
  basicTestPublicAction,
  basicTestAuthAction,
} from '@/lib/actions/test-safe-action-basic'

export default function TestSafeActionBasic() {
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const {
    execute: executePublic,
    result: publicResult,
    isExecuting: isPublicExecuting,
  } = useAction(basicTestPublicAction)

  const {
    execute: executeAuth,
    result: authResult,
    isExecuting: isAuthExecuting,
  } = useAction(basicTestAuthAction)

  const handlePublicTest = () => {
    executePublic({ message, priority })
  }

  const handleAuthTest = () => {
    executeAuth({ message, priority })
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Test Safe Actions</h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            Message
          </label>
          <input
            id="message"
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter a message"
          />
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700"
          >
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={e =>
              setPriority(e.target.value as 'low' | 'medium' | 'high')
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="space-y-2">
          <button
            onClick={handlePublicTest}
            disabled={isPublicExecuting || !message}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isPublicExecuting ? 'Testing Public...' : 'Test Public Action'}
          </button>

          <button
            onClick={handleAuthTest}
            disabled={isAuthExecuting || !message}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isAuthExecuting ? 'Testing Auth...' : 'Test Auth Action'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {publicResult && (
          <div className="p-3 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800">
              Public Action Result:
            </h3>
            <pre className="mt-1 text-xs text-blue-700 overflow-auto">
              {JSON.stringify(publicResult, null, 2)}
            </pre>
          </div>
        )}

        {authResult && (
          <div className="p-3 bg-green-50 rounded-md">
            <h3 className="text-sm font-medium text-green-800">
              Auth Action Result:
            </h3>
            <pre className="mt-1 text-xs text-green-700 overflow-auto">
              {JSON.stringify(authResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
